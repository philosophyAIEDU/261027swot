#!/usr/bin/env bash
# 예시 장면용 그림·영상(sample.png, sample.mp4)을 만든다. 실제 자료를 넣으면 지워도 된다.
set -euo pipefail
cd "$(dirname "$0")/../public"
mkdir -p shots clips
[ -s shots/sample.png ] || ffmpeg -hide_banner -loglevel error -y -f lavfi -i "color=c=0xF3EEFF:s=1280x800,drawbox=x=120:y=280:w=1040:h=240:color=0x8B7BE0@0.6:t=fill" -frames:v 1 shots/sample.png
[ -s clips/sample.mp4 ] || ffmpeg -hide_banner -loglevel error -y -f lavfi -i "testsrc2=s=1280x720:d=6:r=30" -pix_fmt yuv420p -c:v libx264 clips/sample.mp4
ls shots clips
