#!/usr/bin/env bash
# 새 영상 프로젝트를 템플릿에서 만든다.
# 사용법: bash <스킬 폴더>/scripts/new-project.sh <만들 폴더>
#   예)   bash .claude/skills/philosophy-remotion-video/scripts/new-project.sh video-ep3
set -euo pipefail
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:?만들 폴더를 알려 주세요}"
if [ -e "$DEST" ] && [ -n "$(ls -A "$DEST" 2>/dev/null)" ]; then
  echo "이미 내용이 있는 폴더예요: $DEST (다른 이름을 쓰거나 비워 주세요)"; exit 1
fi
mkdir -p "$DEST"
cp -R "$SKILL_DIR/assets/template/." "$DEST/"
cd "$DEST"
mkdir -p public/shots public/clips public/voice out
bash scripts/fetch-fonts.sh >/dev/null
bash scripts/make-samples.sh >/dev/null
npm install --no-audit --no-fund --loglevel=error
python3 scripts/media-sizes.py
npx tsc --noEmit && echo "준비 완료: $DEST  (npm run studio 로 미리 보기)"
