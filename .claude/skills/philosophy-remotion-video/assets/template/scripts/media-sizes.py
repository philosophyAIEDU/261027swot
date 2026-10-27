"""public/shots(이미지)와 public/clips(영상)의 크기·길이를 읽어 src/data/media.ts 를 만든다.
확대 위치 계산과 영상 장면 길이에 쓰인다. 캡처나 영상을 넣거나 바꾼 뒤에는 꼭 다시 실행한다.

사용법: python3 scripts/media-sizes.py
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
VIDEO_EXT = {".mp4", ".mov", ".webm", ".m4v", ".mkv"}


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration",
         "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    )
    data = json.loads(out.stdout)
    stream = data["streams"][0]
    duration = float(data.get("format", {}).get("duration") or 0)
    return stream["width"], stream["height"], duration


entries = []
for folder in ("shots", "clips"):
    for path in sorted((PUBLIC / folder).glob("*")):
        ext = path.suffix.lower()
        if ext not in IMAGE_EXT | VIDEO_EXT:
            continue
        w, h, duration = probe(path)
        item = {"w": w, "h": h}
        if ext in VIDEO_EXT:
            item["duration"] = round(duration, 3)
        entries.append((f"{folder}/{path.name}", item))

lines = [
    "// 자동 생성(scripts/media-sizes.py): 캡처·영상의 실제 크기(px)와 영상 길이(초).",
    "export const MEDIA: Record<string, { w: number; h: number; duration?: number }> = {",
]
lines += [f"  {json.dumps(key, ensure_ascii=False)}: {json.dumps(item)}," for key, item in entries]
lines.append("};")
(ROOT / "src" / "data" / "media.ts").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"media.ts: 이미지·영상 {len(entries)}개")
