"""원본 소리를 쓰는 화면 녹화 장면(clip, withSound: true)에 SRT 자막을 붙인다.

녹화하면서 말한 영상 + 그 영상의 자막 파일(SRT)을 받았을 때 쓴다.
각 장면의 from~to 구간에 들어가는 자막만 골라, 장면 시작 기준 시각으로 바꿔 src/data/captions.ts 에 쓴다.
(다른 장면의 자막—예: align-voice.py --srt 로 만든 것—은 그대로 둔다)

사용법: python3 scripts/captions-from-srt.py 자막.srt [영상파일이름.mp4]
        영상파일이름을 주면 그 영상을 쓰는 장면에만 적용한다.
"""
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from srt import load_captions, read_srt, write_captions  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
VOICE_DELAY_SECONDS = 0  # 영상 장면은 장면 시작과 동시에 소리가 나온다


def load_scenes():
    code = "import('./src/data/scenes.ts').then(m => console.log(JSON.stringify(m.SCENES)))"
    out = subprocess.run(["node", "-e", code], cwd=ROOT, capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def main():
    if len(sys.argv) < 2:
        raise SystemExit("사용법: python3 scripts/captions-from-srt.py 자막.srt [영상파일이름]")
    cues = read_srt(sys.argv[1])
    only = sys.argv[2] if len(sys.argv) > 2 else None
    captions = load_captions()
    count = 0
    for scene in load_scenes():
        if scene["kind"] != "clip" or not scene.get("withSound"):
            continue
        if only and scene["video"] != only:
            continue
        start = scene.get("from", 0)
        end = scene.get("to", float("inf"))
        rate = scene.get("rate", 1)
        inside = []
        for cue_start, cue_end, text in cues:
            if cue_end <= start or cue_start >= end:
                continue
            a = (max(cue_start, start) - start) / rate + VOICE_DELAY_SECONDS
            b = (min(cue_end, end) - start) / rate + VOICE_DELAY_SECONDS
            inside.append({"start": round(a, 3), "end": round(b, 3), "text": text})
        captions[scene["id"]] = inside
        count += 1
    write_captions(captions)
    print(f"자막을 붙인 영상 장면: {count}개 → src/data/captions.ts")


if __name__ == "__main__":
    main()
