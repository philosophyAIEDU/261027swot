"""PPT(.pptx)에서 슬라이드 순서대로 그림을 꺼내 public/shots/ 에 저장하고,
슬라이드 글자·발표자 노트를 slides.json 으로 남긴다(노트에 하고 싶은 말이 적혀 있는 경우가 많다).

사용법: python3 scripts/extract-pptx.py 발표자료.pptx
결과:   public/shots/s01.png, s02.png ... (한 슬라이드에 그림이 여럿이면 s03_1.png 처럼)
        slides.json  [{ "slide": 1, "images": [...], "text": "...", "notes": "..." }]
"""
import json
import posixpath
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "public" / "shots"


def rels_map(z, part):
    rels_path = posixpath.join(posixpath.dirname(part), "_rels", posixpath.basename(part) + ".rels")
    if rels_path not in z.namelist():
        return {}
    xml = z.read(rels_path).decode("utf-8")
    result = {}
    for tag in re.findall(r"<Relationship [^>]+>", xml):
        rid = re.search(r'Id="([^"]+)"', tag)
        target = re.search(r'Target="([^"]+)"', tag)
        if rid and target:
            result[rid.group(1)] = posixpath.normpath(posixpath.join(posixpath.dirname(part), target.group(1)))
    return result


def texts(xml):
    return " ".join(t.strip() for t in re.findall(r"<a:t>([^<]*)</a:t>", xml) if t.strip())


def main():
    if len(sys.argv) != 2:
        raise SystemExit("사용법: python3 scripts/extract-pptx.py 발표자료.pptx")
    z = zipfile.ZipFile(sys.argv[1])
    pres = "ppt/presentation.xml"
    order = re.findall(r'<p:sldId [^>]*r:id="([^"]+)"', z.read(pres).decode("utf-8"))
    pres_rels = rels_map(z, pres)
    SHOTS.mkdir(parents=True, exist_ok=True)
    slides = []
    width = max(2, len(str(len(order))))
    for number, rid in enumerate(order, 1):
        part = pres_rels[rid]
        xml = z.read(part).decode("utf-8")
        rels = rels_map(z, part)
        images = []
        for index, embed in enumerate(re.findall(r'r:embed="([^"]+)"', xml)):
            target = rels.get(embed)
            if not target or target not in z.namelist():
                continue
            ext = Path(target).suffix.lower() or ".png"
            name = f"s{number:0{width}d}{'' if index == 0 else '_' + str(index)}{ext}"
            (SHOTS / name).write_bytes(z.read(target))
            images.append(name)
        notes = ""
        for target in rels.values():
            if "notesSlide" in target and target in z.namelist():
                notes = texts(z.read(target).decode("utf-8"))
        slides.append({"slide": number, "images": images, "text": texts(xml), "notes": notes})
    (ROOT / "slides.json").write_text(json.dumps(slides, ensure_ascii=False, indent=2), encoding="utf-8")
    total = sum(len(s["images"]) for s in slides)
    print(f"슬라이드 {len(slides)}장, 그림 {total}개 → public/shots/, 글자·노트 → slides.json")


if __name__ == "__main__":
    main()
