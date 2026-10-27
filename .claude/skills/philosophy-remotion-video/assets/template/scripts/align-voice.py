"""한 번에 녹음한 파일을 장면별로 잘라 영상에 연결한다.

사용법:  python3 scripts/align-voice.py 녹음파일.m4a
         자막 파일(SRT)이 있으면:  ... 녹음파일.m4a --srt 자막.srt   (가장 정확, 자막도 함께 들어감)
         경계 하나가 어긋나면:      ... 녹음파일.m4a --start s12=3:41   (s12 장면이 3분 41초에 시작)

원본 소리를 쓰는 화면 녹화 장면(clip, withSound: true)은 녹음에 없다고 보고 건너뛴다.

하는 일
1) ffmpeg로 소리가 없는 구간(쉼)을 모두 찾는다.
2) 장면이 49개면 쉼 48곳을 골라야 한다. 대본 글자 수로 각 장면의 "예상 길이"를 구하고,
   잘린 길이가 예상과 가장 비슷하면서 긴 쉼을 경계로 쓰는 조합을 동적 계획법으로 찾는다.
   (장면 사이에는 길게, 장면 안에서는 짧게 쉰다는 점을 이용한다)
3) 장면마다 public/voice/<장면id>.m4a 로 잘라 저장하고 src/data/voice.ts 를 다시 쓴다.
4) 예상과 많이 다른 장면은 "확인 필요"로 표시한다.

--srt 를 주면 1)~2) 대신, 자막 줄들을 장면 대본과 글자가 가장 많이 겹치도록 차례로 묶는다
(쉼 길이에 기대지 않아서 훨씬 정확하다). 자막은 장면 기준 시각으로 바꿔 captions.ts 에도 쓴다.
"""

import json
import math
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from srt import load_captions, read_srt, write_captions  # noqa: E402

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
LENGTH_W = 0.3         # --srt: 자막 글자 수가 대본 글자 수와 다를 때의 벌점 크기


def load_scenes():
    """녹음에 들어 있어야 하는 장면만(원본 소리를 쓰는 영상 장면은 뺀다)"""
    code = (
        "import('./src/data/scenes.ts').then(m => console.log(JSON.stringify("
        "m.SCENES.filter(s => !(s.kind === 'clip' && s.withSound)).map(s => ({ id: s.id, "
        "chars: s.script.replace(/\\s+/g, '').length, text: s.script, first: s.script.split('\\n')[0] })))))"
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


def normalize(text):
    return re.sub(r"[^0-9A-Za-z가-힣]", "", text).lower()


def bigrams(text):
    return Counter(text[i:i + 2] for i in range(len(text) - 1))


def dice(a, b):
    if not a or not b:
        return 0.0
    overlap = sum((a & b).values())
    return 2 * overlap / (sum(a.values()) + sum(b.values()))


def align_srt(scenes, cues, max_cues_per_scene=40):
    """자막 줄(cues)을 장면 순서대로 묶는다. 각 장면 대본과 글자 두 개씩 묶음이 가장 많이 겹치게.
    반환: 장면마다 (첫 자막 번호, 마지막 자막 번호)"""
    n, m = len(scenes), len(cues)
    if m < n:
        raise SystemExit(f"자막 줄이 {m}개라 장면 {n}개로 나눌 수 없어요.")
    scripts = [bigrams(normalize(scene["text"])) for scene in scenes]
    cue_text = [normalize(text) for _, _, text in cues]
    INF = float("inf")
    # dp[i][j]: 장면 0..i 를 자막 0..j 로 채웠을 때 최소 비용
    dp = [[INF] * m for _ in range(n)]
    back = [[-1] * m for _ in range(n)]

    script_len = [max(len(normalize(scene["text"])), 1) for scene in scenes]

    def cost(i, a, j):
        joined = "".join(cue_text[a:j + 1])
        # 글자 겹침이 주된 기준이고, 자막 글자 수가 대본 글자 수와 비슷한지도 조금 본다
        # (짧은 장면끼리 같은 낱말을 쓰면 겹침만으로는 헷갈리기 때문).
        length_term = math.log(max(len(joined), 1) / script_len[i]) ** 2
        return 1.0 - dice(scripts[i], bigrams(joined)) + LENGTH_W * length_term

    for j in range(min(m, max_cues_per_scene)):
        dp[0][j] = cost(0, 0, j)
    for i in range(1, n):
        for j in range(i, m):
            best, arg = INF, -1
            for a in range(max(i, j - max_cues_per_scene + 1), j + 1):
                prev = dp[i - 1][a - 1]
                if prev == INF:
                    continue
                value = prev + cost(i, a, j)
                if value < best:
                    best, arg = value, a
            dp[i][j], back[i][j] = best, arg
    if dp[n - 1][m - 1] == INF:
        raise SystemExit("자막과 대본을 맞추지 못했어요. 장면 순서대로 녹음했는지 확인해 주세요.")
    ranges = [None] * n
    j = m - 1
    for i in range(n - 1, -1, -1):
        a = back[i][j] if i > 0 else 0
        ranges[i] = (a, j)
        j = a - 1
    scores = [dice(scripts[i], bigrams("".join(cue_text[a:b + 1]))) for i, (a, b) in enumerate(ranges)]
    return ranges, scores


def main():
    args = sys.argv[1:]
    takes_value = {"--start", "--srt"}
    files = [a for i, a in enumerate(args) if not a.startswith("--") and (i == 0 or args[i - 1] not in takes_value)]
    if len(files) != 1:
        raise SystemExit("사용법: python3 scripts/align-voice.py 녹음파일 [--srt 자막.srt] [--start 장면id=분:초 ...]")
    source = Path(files[0]).resolve()
    scenes = load_scenes()
    ids = [scene["id"] for scene in scenes]
    forced = {}
    srt_path = None
    for index, arg in enumerate(args):
        if arg == "--start":
            scene_id, stamp = args[index + 1].split("=")
            minutes, _, secs = stamp.rpartition(":")
            forced[ids.index(scene_id)] = (int(minutes) * 60 if minutes else 0) + float(secs)
        if arg == "--srt":
            srt_path = args[index + 1]
    total = probe_duration(source)

    scene_cues = None
    if srt_path:
        cues = read_srt(srt_path)
        ranges, scores = align_srt(scenes, cues)
        segments = [(cues[a][0], cues[b][1]) for a, b in ranges]
        scene_cues = [cues[a:b + 1] for a, b in ranges]
        # 표에서 "예상대비" 대신 대본과 자막이 얼마나 겹치는지(0~1)를 보여 준다.
        expected = None
        method = f"자막 {len(cues)}줄"
    else:
        silences = detect_silences(source)
        segments, expected = align(scenes, silences, total, forced)
        method = f"쉼 {len(silences)}곳"

    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    for old in VOICE_DIR.glob("*.m4a"):
        old.unlink()

    captions = load_captions()
    rows = []
    for index, (scene, (start, end)) in enumerate(zip(scenes, segments)):
        a = max(0.0, start - PAD)
        b = min(total, end + PAD)
        target = VOICE_DIR / f"{scene['id']}.m4a"
        subprocess.run(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{a:.3f}", "-to", f"{b:.3f}",
             "-i", str(source), "-vn", "-ac", "1", "-c:a", "aac", "-b:a", "160k", str(target)],
            check=True,
        )
        if scene_cues is not None:
            captions[scene["id"]] = [
                {"start": round(cs - a, 3), "end": round(ce - a, 3), "text": text} for cs, ce, text in scene_cues[index]
            ]
            measure = scores[index]
            flag = "  ⚠ 확인 필요" if measure < 0.45 else ""
        else:
            measure = (end - start) / expected[index]
            flag = "  ⚠ 확인 필요" if measure < 0.55 or measure > 1.8 else ""
        rows.append((scene, a, b, measure, flag))
    if scene_cues is not None:
        write_captions(captions)

    lines = ["// align-voice.py 가 자동으로 만든 파일이에요(녹음: " + source.name + ").",
             "export const VOICE_FILES: Record<string, string> = {"]
    lines += [f"  {json.dumps(scene['id'])}: 'voice/{scene['id']}.m4a'," for scene, *_ in rows]
    lines.append("};")
    VOICE_TS.write_text("\n".join(lines) + "\n", encoding="utf-8")

    label = "겹침" if scene_cues is not None else "예상대비"
    print(f"녹음 길이 {total:.1f}초, {method} → 장면 {len(rows)}개로 나눴어요.\n")
    print(f"{'장면':<8}{'시작':>8}{'끝':>8}{label:>8}  첫 문장")
    for scene, a, b, measure, flag in rows:
        stamp = f"{int(a // 60)}:{a % 60:04.1f}"
        print(f"{scene['id']:<8}{stamp:>8}{b:8.1f}{measure:8.2f}  {scene['first'][:28]}{flag}")


if __name__ == "__main__":
    main()
