"""SRT 자막 파일 읽기와 src/data/captions.ts 읽기·쓰기(다른 스크립트에서 함께 쓴다)."""
import json
import re
from pathlib import Path

CAPTIONS_TS = Path(__file__).resolve().parent.parent / "src" / "data" / "captions.ts"

TIME = re.compile(r"(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)")


def _seconds(h, m, s, ms):
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms.ljust(3, "0")[:3]) / 1000


def read_srt(path):
    """[(start, end, text), ...] — 시간은 초"""
    raw = Path(path).read_bytes()
    for encoding in ("utf-8-sig", "cp949", "utf-16"):
        try:
            text = raw.decode(encoding)
            break
        except UnicodeDecodeError:
            continue
    cues = []
    for block in re.split(r"\r?\n\s*\r?\n", text.strip()):
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        for index, line in enumerate(lines):
            match = TIME.search(line)
            if match:
                g = match.groups()
                body = " ".join(lines[index + 1:])
                body = re.sub(r"<[^>]+>", "", body).strip()
                if body:
                    cues.append((_seconds(*g[:4]), _seconds(*g[4:]), body))
                break
    cues.sort(key=lambda cue: cue[0])
    return cues


def load_captions():
    if not CAPTIONS_TS.exists():
        return {}
    match = re.search(r"CAPTIONS: Record<string, Cue\[\]> = (\{.*\});", CAPTIONS_TS.read_text(encoding="utf-8"), re.S)
    return json.loads(match.group(1)) if match else {}


def write_captions(captions):
    body = json.dumps(captions, ensure_ascii=False, indent=2)
    CAPTIONS_TS.write_text(
        "// 장면별 자막(초 단위, 그 장면 소리의 시작 기준). 자동 생성 — scripts/captions-from-srt.py, align-voice.py --srt\n"
        "export type Cue = { start: number; end: number; text: string };\n"
        f"export const CAPTIONS: Record<string, Cue[]> = {body};\n",
        encoding="utf-8",
    )
