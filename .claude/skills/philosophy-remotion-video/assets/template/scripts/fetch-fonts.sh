#!/usr/bin/env bash
# 제목용 Jua, 본문용 Noto Sans KR 글꼴을 받아 public/fonts 에 둔다(SIL Open Font License).
# 렌더할 때마다 인터넷에서 글꼴 조각 수백 개를 받지 않도록 파일로 넣어 두는 것이다.
set -euo pipefail
cd "$(dirname "$0")/../public/fonts"
BASE=https://raw.githubusercontent.com/google/fonts/main/ofl
[ -s Jua-Regular.ttf ] || curl -fsSL -o Jua-Regular.ttf "$BASE/jua/Jua-Regular.ttf"
[ -s NotoSansKR.ttf ] || curl -fsSL -o NotoSansKR.ttf "$BASE/notosanskr/NotoSansKR%5Bwght%5D.ttf"
ls -la *.ttf
