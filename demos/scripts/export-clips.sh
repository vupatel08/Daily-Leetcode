#!/usr/bin/env bash
# export-clips.sh — Convert recordings to GIF, MP4, and key-frame screenshots.
#
# Requires:
#   agg (asciinema gif generator): https://github.com/asciinema/agg
#     Install: cargo install --git https://github.com/asciinema/agg
#   ffmpeg (GIF → MP4):            sudo apt install ffmpeg   (or brew install ffmpeg)
#
# Usage: bash scripts/export-clips.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."
OUT="$ROOT/output"
THEME="$ROOT/assets/terminal-theme.json"

mkdir -p "$OUT"

check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    echo "  ⚠  $1 not found — skipping steps that require it"
    return 1
  fi
  return 0
}

HAS_AGG=0;   check_cmd agg   && HAS_AGG=1   || true
HAS_FFMPEG=0; check_cmd ffmpeg && HAS_FFMPEG=1 || true

echo ""
echo "  ░░  Groundwork Export Pipeline  ░░"
echo ""

# ── Helper: cast → GIF → MP4 ─────────────────────────────────────────────────

export_cast() {
  local name="$1"
  local cols="$2"
  local cast="$OUT/${name}.cast"
  local gif="$OUT/${name}.gif"
  local mp4="$OUT/${name}.mp4"

  if [ ! -f "$cast" ]; then
    echo "  ⚠  $cast not found — run record-all.sh first"
    return
  fi

  echo "  Exporting: $name"

  # GIF
  if [ "$HAS_AGG" -eq 1 ]; then
    agg \
      --theme "$(cat "$THEME")" \
      --cols "$cols" \
      --font-size 14 \
      --speed 1.0 \
      "$cast" "$gif"
    echo "    ✓ GIF  → output/${name}.gif"
  else
    echo "    ⚠  Skipping GIF (agg not installed)"
  fi

  # MP4 from GIF
  if [ "$HAS_FFMPEG" -eq 1 ] && [ -f "$gif" ]; then
    ffmpeg -y -loglevel error \
      -i "$gif" \
      -vf "fps=24,scale=trunc(iw/2)*2:trunc(ih/2)*2" \
      -c:v libx264 -pix_fmt yuv420p \
      "$mp4"
    echo "    ✓ MP4  → output/${name}.mp4"
  else
    echo "    ⚠  Skipping MP4 (ffmpeg not installed or GIF missing)"
  fi

  # Key-frame screenshots (start, middle, near-end)
  if [ "$HAS_FFMPEG" -eq 1 ] && [ -f "$mp4" ]; then
    local dur
    dur=$(ffprobe -v error -show_entries format=duration \
      -of default=noprint_wrappers=1:nokey=1 "$mp4" 2>/dev/null || echo 20)
    local mid
    mid=$(python3 -c "print(int($dur / 2))" 2>/dev/null || echo 10)
    local end
    end=$(python3 -c "print(int($dur * 0.85))" 2>/dev/null || echo 17)

    ffmpeg -y -loglevel error -ss 1      -i "$mp4" -vframes 1 "$OUT/${name}-frame-start.png"
    ffmpeg -y -loglevel error -ss "$mid" -i "$mp4" -vframes 1 "$OUT/${name}-frame-mid.png"
    ffmpeg -y -loglevel error -ss "$end" -i "$mp4" -vframes 1 "$OUT/${name}-frame-end.png"
    echo "    ✓ Screenshots → output/${name}-frame-{start,mid,end}.png"
  fi

  echo ""
}

# ── Terminal scenarios ────────────────────────────────────────────────────────
export_cast "01-conflict-catch"  200
export_cast "02-onboarding-scan" 120
export_cast "04-propagation"     160

# ── Playwright outputs ────────────────────────────────────────────────────────
# Playwright already saves a .webm video. Convert to MP4 if ffmpeg available.
echo "  Exporting: 03-pr-block"
PR_WEBM=$(find "$OUT" -name "*.webm" | head -1 || true)
if [ -n "$PR_WEBM" ] && [ "$HAS_FFMPEG" -eq 1 ]; then
  ffmpeg -y -loglevel error \
    -i "$PR_WEBM" \
    -c:v libx264 -pix_fmt yuv420p \
    "$OUT/03-pr-block.mp4"
  echo "    ✓ MP4  → output/03-pr-block.mp4"
else
  echo "    ⚠  No .webm found or ffmpeg missing — raw .webm in output/"
fi

# Key-frame screenshots from Playwright are already saved
for ss in blocked passing resolved; do
  if [ -f "$OUT/03-pr-${ss}.png" ]; then
    echo "    ✓ Screenshot (${ss}) → output/03-pr-${ss}.png"
  fi
done
echo ""

echo "  ✓ Export complete. All output is in demos/output/"
echo ""
echo "  Files:"
ls "$OUT/" | sed 's/^/    /'
echo ""
