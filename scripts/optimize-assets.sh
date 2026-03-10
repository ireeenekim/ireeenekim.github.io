#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

need_cmd ffmpeg
need_cmd cwebp

mkdir -p "$ROOT_DIR/images/optimized"
mkdir -p "$ROOT_DIR/s1fp/images/optimized"

echo "Optimizing homepage assets..."
ffmpeg -y -i "$ROOT_DIR/images/wear-1.png" -vf "scale='min(1200,iw)':-2" -q:v 3 "$ROOT_DIR/images/optimized/wear-1-1200.webp" >/dev/null 2>&1
ffmpeg -y -i "$ROOT_DIR/images/wear-2.png" -vf "scale='min(1200,iw)':-2" -q:v 3 "$ROOT_DIR/images/optimized/wear-2-1200.webp" >/dev/null 2>&1

# Higher-quality propaganda WebP (use cwebp for better control)
cwebp -quiet -q 90 "$ROOT_DIR/images/propaganda.png" -resize 1600 0 -o "$ROOT_DIR/images/optimized/propaganda-1600.webp"
cwebp -quiet -q 90 "$ROOT_DIR/images/propaganda.png" -resize 960 0  -o "$ROOT_DIR/images/optimized/propaganda-960.webp"
cwebp -quiet -q 90 "$ROOT_DIR/images/propaganda.png" -resize 480 0  -o "$ROOT_DIR/images/optimized/propaganda-480.webp"

cwebp -quiet -q 88 "$ROOT_DIR/images/twins.png" -resize 1200 0 -o "$ROOT_DIR/images/optimized/twin-1200.webp"
cwebp -quiet -q 88 "$ROOT_DIR/images/twins.png" -resize 800 0  -o "$ROOT_DIR/images/optimized/twin-800.webp"

ffmpeg -y -i "$ROOT_DIR/images/wear-video.mp4" \
  -c:v libx264 -preset veryfast -crf 28 -pix_fmt yuv420p -movflags +faststart -an \
  -vf "scale='min(960,iw)':-2,fps=30" \
  "$ROOT_DIR/images/optimized/wear-video-960.mp4" >/dev/null 2>&1

echo "Optimizing s1fp pantry images..."
shopt -s nullglob
for f in "$ROOT_DIR/s1fp/images/"*.png; do
  base="$(basename "$f" .png)"
  out="$ROOT_DIR/s1fp/images/optimized/${base}.webp"
  cwebp -quiet -q 80 "$f" -o "$out"
done

echo "Done."
echo
echo "Outputs:"
echo "  - $ROOT_DIR/images/optimized/"
echo "  - $ROOT_DIR/s1fp/images/optimized/"
