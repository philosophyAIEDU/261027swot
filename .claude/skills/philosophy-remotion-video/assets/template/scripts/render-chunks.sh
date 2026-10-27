#!/usr/bin/env bash
# 긴 영상을 1분(1800프레임)씩 나눠 렌더링하고 마지막에 이어 붙인다.
# 중간에 멈춰도 다시 실행하면 이미 만든 조각은 건너뛰고 이어서 만든다.
# 사용법: bash scripts/render-chunks.sh [결과파일=out/video.mp4] [컴포지션 id=첫 번째] [remotion render 추가 옵션...]
#   예) bash scripts/render-chunks.sh out/sub.mp4 Main --props='{"showSubtitles":true}'
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${1:-out/video.mp4}"
COMP="${2:-}"
EXTRA=("${@:3}")
CHUNK=1800
mkdir -p out/chunks

INFO=$(npx remotion compositions 2>/dev/null | grep -E '^\S+\s+[0-9]+\s+[0-9]+x[0-9]+\s+[0-9]+' | head -50)
if [ -z "$COMP" ]; then COMP=$(echo "$INFO" | head -1 | awk '{print $1}'); fi
TOTAL=$(echo "$INFO" | awk -v id="$COMP" '$1==id {print $4}')
[ -n "$TOTAL" ] || { echo "컴포지션 $COMP 의 길이를 찾지 못했어요"; exit 1; }
echo "컴포지션 $COMP: 총 $TOTAL 프레임"

# 소스·그림·녹음·옵션이 바뀌면 예전 조각을 쓰면 안 되므로, 그때는 조각을 지우고 새로 만든다.
KEY="$COMP:$TOTAL:${EXTRA[*]:-}:$(find src public -type f \( -name "*.ts*" -o -name "*.png" -o -name "*.jpg" -o -name "*.mp4" -o -name "*.m4a" -o -name "*.mp3" \) -print0 | sort -z | xargs -0 md5sum | md5sum | cut -c1-12)"
if [ -f out/chunks/.key ] && [ "$(cat out/chunks/.key)" != "$KEY" ]; then rm -f out/chunks/*.mp4; fi
echo "$KEY" > out/chunks/.key

: > out/chunks/list.txt
for ((start=0; start<TOTAL; start+=CHUNK)); do
  end=$((start + CHUNK - 1)); [ $end -ge $TOTAL ] && end=$((TOTAL - 1))
  part=$(printf "out/chunks/part_%06d.mp4" $start)
  if [ ! -s "$part" ]; then
    npx remotion render "$COMP" "$part.tmp.mp4" --frames=$start-$end --log=error "${EXTRA[@]}"
    mv "$part.tmp.mp4" "$part"
  fi
  echo "file '$(basename "$part")'" >> out/chunks/list.txt
  echo "조각 완료: $start-$end / $TOTAL"
done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i out/chunks/list.txt -c copy "$OUT"
echo "완성: $OUT"
