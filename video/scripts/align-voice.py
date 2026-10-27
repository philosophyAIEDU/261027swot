"""한 번에 녹음한 파일을 장면별로 잘라 영상에 연결한다.

사용법:  python3 scripts/align-voice.py 녹음파일.m4a
         경계 하나가 어긋나면:  ... 녹음파일.m4a --start s12=3:41   (s12 장면이 3분 41초에 시작)

하는 일
1) ffmpeg로 소리가 없는 구간(쉼)을 모두 찾는다.
2) 장면이 49개면 쉼 48곳을 골라야 한다. 대본 글자 수로 각 장면의 "예상 길이"를 구하고,
   잘린 길이가 예상과 가장 비슷하면서 긴 쉼을 경계로 쓰는 조합을 동적 계획법으로 찾는다.
   (장면 사이에는 길게, 장면 안에서는 짧게 쉰다는 점을 이용한다)
3) 장면마다 public/voice/<장면id>.m4a 로 잘라 저장하고 src/data/voice.ts 를 다시 쓴다.
4) 예상과 많이 다른 장면은 "확인 필요"로 표시한다.
"""

import json
import math
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICE_DIR = ROOT / "public" / "voice"
VOICE_TS = ROOT / "src" / "data" / "voice.ts"

SILENCE_DB = "-35dB"   # 이보다 작은 소리는 쉼으로 본다
MIN_SILENCE = 0.45     # 이보다 짧은 멈춤은 무시(초)
PAD = 0.12             # 자를 때 말 앞뒤로 남겨 둘 여유(초)
# 아래 두 값은 가짜 녹음(장면 사이 1.2~2.2초 쉼, 장면 안 0.3~0.8초 숨, 읽는 속도 ±30%)으로
# 시험해서 고른 값이다. 그 조건에서는 49개 경계를 모두 맞혔다.
GAP_W = 2.5            # 긴 쉼을 경계로 고를수록 주는 가산점의 크기
USE_LOG = True         # 길이 차이를 로그 비율로 본다(두 배 길 때와 절반일 때를 같은 무게로)


def load_scenes():
    code = (
        "import('./src/data/scenes.ts').then(m => console.log(JSON.stringify("
        "m.SCENES.map(s => ({ id: s.id, chars: s.script.replace(/\\s+/g, '').length, "
        "first: s.script.split('\\n')[0] })))))"
    )
    out = subprocess.run(["node", "-e", code], cwd=ROOT, capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def probe_duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def detect_silences(path):
    out = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af",
         f"silencedetect=noise={SILENCE_DB}:d={MIN_SILENCE}", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out.stderr)]
    silences = []
    for index, start in enumerate(starts):
        end = ends[index] if index < len(ends) else None
        silences.append((start, end))
    return silences


def align(scenes, silences, total, forced=None):
    forced = forced or {}
    # 처음과 끝의 쉼은 장면 경계 후보에서 뺀다.
    speech_start = 0.0
    speech_end = total
    inner = []
    for start, end in silences:
        if start <= 0.05 and end is not None:
            speech_start = end
        elif end is None or end >= total - 0.05:
            speech_end = start
        else:
            inner.append((start, end))

    n = len(scenes)
    need = n - 1
    if len(inner) < need:
        raise SystemExit(
            f"쉼이 {len(inner)}곳밖에 없어요. 장면 {n}개로 나누려면 {need}곳이 필요해요. "
            "장면 사이를 1~2초씩 쉬어 녹음하셨는지 확인해 주세요."
        )

    weights = [max(s["chars"], 4) for s in scenes]
    gaps_total = sum(end - start for start, end in inner)
    speech_total = (speech_end - speech_start) - gaps_total * 0.5
    expected = [speech_total * w / sum(weights) for w in weights]

    # 경계 후보: 각 쉼. 경계 k(0..m-1)를 고르면 앞 장면은 쉼 시작에서 끝나고, 다음 장면은 쉼 끝에서 시작한다.
    m = len(inner)
    longest = max(end - start for start, end in inner)
    INF = float("inf")

    def seg_cost(i, start_time, end_time):
        length = end_time - start_time
        if length <= 0.3:
            return INF
        ratio = length / expected[i]
        if USE_LOG:
            return math.log(ratio) ** 2
        return (ratio - 1.0) ** 2

    def gap_bonus(k):
        start, end = inner[k]
        return GAP_W * (end - start) / longest

    # 사용자가 "이 장면은 몇 분 몇 초에 시작"이라고 정해 준 곳은 그 시각에 가장 가까운 쉼만 경계로 허용한다.
    pinned = {}
    for scene_index, seconds in forced.items():
        if scene_index == 0:
            continue
        pinned[scene_index - 1] = min(range(m), key=lambda k: abs(inner[k][1] - seconds))

    def allowed(i, k):
        return i not in pinned or pinned[i] == k

    # dp[i][k]: 장면 0..i 를 배치했고 장면 i 가 쉼 k 앞에서 끝날 때의 최소 비용
    dp = [[INF] * m for _ in range(need)]
    back = [[-1] * m for _ in range(need)]
    for k in range(m):
        if allowed(0, k):
            dp[0][k] = seg_cost(0, speech_start, inner[k][0]) - gap_bonus(k)
    for i in range(1, need):
        for k in range(i, m):
            if not allowed(i, k):
                continue
            best, arg = INF, -1
            for j in range(i - 1, k):
                if dp[i - 1][j] == INF:
                    continue
                cost = dp[i - 1][j] + seg_cost(i, inner[j][1], inner[k][0])
                if cost < best:
                    best, arg = cost, j
            if arg >= 0:
                dp[i][k] = best - gap_bonus(k)
                back[i][k] = arg

    best, last = INF, -1
    for k in range(need - 1, m):
        if dp[need - 1][k] == INF:
            continue
        cost = dp[need - 1][k] + seg_cost(n - 1, inner[k][1], speech_end)
        if cost < best:
            best, last = cost, k
    if last < 0:
        raise SystemExit("장면 경계를 찾지 못했어요.")

    cuts = [0] * need
    k = last
    for i in range(need - 1, -1, -1):
        cuts[i] = k
        k = back[i][k]

    segments = []
    start = speech_start
    for i in range(n):
        end = inner[cuts[i]][0] if i < need else speech_end
        segments.append((start, end))
        if i < need:
            start = inner[cuts[i]][1]
    return segments, expected


def main():
    args = sys.argv[1:]
    files = [a for i, a in enumerate(args) if not a.startswith("--") and (i == 0 or args[i - 1] != "--start")]
    if len(files) != 1:
        raise SystemExit("사용법: python3 scripts/align-voice.py 녹음파일 [--start 장면id=분:초 ...]")
    source = Path(files[0]).resolve()
    scenes = load_scenes()
    ids = [scene["id"] for scene in scenes]
    forced = {}
    for index, arg in enumerate(args):
        if arg == "--start":
            scene_id, stamp = args[index + 1].split("=")
            minutes, _, secs = stamp.rpartition(":")
            forced[ids.index(scene_id)] = (int(minutes) * 60 if minutes else 0) + float(secs)
    total = probe_duration(source)
    silences = detect_silences(source)
    segments, expected = align(scenes, silences, total, forced)

    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    for old in VOICE_DIR.glob("*.m4a"):
        old.unlink()

    rows = []
    for scene, (start, end), guess in zip(scenes, segments, expected):
        a = max(0.0, start - PAD)
        b = min(total, end + PAD)
        target = VOICE_DIR / f"{scene['id']}.m4a"
        subprocess.run(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{a:.3f}", "-to", f"{b:.3f}",
             "-i", str(source), "-ac", "1", "-c:a", "aac", "-b:a", "160k", str(target)],
            check=True,
        )
        ratio = (end - start) / guess
        rows.append((scene, a, b, ratio))

    lines = ["// align-voice.py 가 자동으로 만든 파일이에요(녹음: " + source.name + ").",
             "export const VOICE_FILES: Record<string, string> = {"]
    lines += [f"  {json.dumps(scene['id'])}: 'voice/{scene['id']}.m4a'," for scene, *_ in rows]
    lines.append("};")
    VOICE_TS.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"녹음 길이 {total:.1f}초, 쉼 {len(silences)}곳 → 장면 {len(rows)}개로 나눴어요.\n")
    print(f"{'장면':<8}{'시작':>8}{'끝':>8}{'예상대비':>8}  첫 문장")
    for scene, a, b, ratio in rows:
        flag = "  ⚠ 확인 필요" if ratio < 0.55 or ratio > 1.8 else ""
        stamp = f"{int(a // 60)}:{a % 60:04.1f}"
        print(f"{scene['id']:<8}{stamp:>8}{b:8.1f}{ratio:8.2f}  {scene['first'][:28]}{flag}")


if __name__ == "__main__":
    main()
