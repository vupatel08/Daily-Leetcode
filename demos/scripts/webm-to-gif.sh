#!/usr/bin/env bash
# webm-to-gif.sh — converts Playwright .webm videos to GIF for README embedding
set -e

VIDEOS_DIR="$(dirname "$0")/../output/videos"
GIFS_DIR="$(dirname "$0")/../output/gifs"
mkdir -p "$GIFS_DIR"

for f in "$VIDEOS_DIR"/*.webm; do
  [ -f "$f" ] || continue
  slug=$(basename "$f" .webm)
  echo "  Converting $slug.webm → $slug.gif …"
  # Generate optimized palette, then apply
  ffmpeg -y -i "$f" -vf "fps=12,scale=900:-1:flags=lanczos,palettegen" "/tmp/${slug}-palette.png" 2>/dev/null
  ffmpeg -y -i "$f" -i "/tmp/${slug}-palette.png" -filter_complex "fps=12,scale=900:-1:flags=lanczos[x];[x][1:v]paletteuse" "$GIFS_DIR/${slug}.gif" 2>/dev/null
  echo "  ✓ $slug.gif"
done

echo ""
echo "  GIFs written to: $GIFS_DIR"
