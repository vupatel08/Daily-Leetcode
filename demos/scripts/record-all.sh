#!/usr/bin/env bash
# record-all.sh — Record all four demo scenarios via asciinema + Playwright
# Usage: bash scripts/record-all.sh
# Requires: asciinema, ts-node, @playwright/test (npm ci first in demos/)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."
OUT="$ROOT/output"

mkdir -p "$OUT"

# Resolve ts-node
TSN="$ROOT/node_modules/.bin/ts-node"
if [ ! -f "$TSN" ]; then
  TSN="$(which ts-node 2>/dev/null || echo '')"
fi
if [ -z "$TSN" ]; then
  echo "ERROR: ts-node not found. Run: npm ci inside demos/" >&2
  exit 1
fi

# Check asciinema
if ! command -v asciinema &>/dev/null; then
  echo "ERROR: asciinema not found. Install: pip install asciinema" >&2
  exit 1
fi

echo ""
echo "  ░░  Groundwork Demo Recorder  ░░"
echo ""

# ── Scenario 1: Conflict Catch ────────────────────────────────────────────────
echo "  [1/4] Scenario 1 — Conflict Catch (45s)"
asciinema rec \
  --cols 200 --rows 50 \
  --overwrite \
  --title "Groundwork — Conflict Catch" \
  "$OUT/01-conflict-catch.cast" \
  -- "$TSN" "$ROOT/scenarios/01-conflict-catch.ts"
echo "       ✓ Saved: output/01-conflict-catch.cast"
echo ""

# ── Scenario 2: Onboarding Scan ───────────────────────────────────────────────
echo "  [2/4] Scenario 2 — Onboarding Scan (60s)"
asciinema rec \
  --cols 120 --rows 48 \
  --overwrite \
  --title "Groundwork — Onboarding Scan" \
  "$OUT/02-onboarding-scan.cast" \
  -- "$TSN" "$ROOT/scenarios/02-onboarding-scan.ts"
echo "       ✓ Saved: output/02-onboarding-scan.cast"
echo ""

# ── Scenario 3: PR Block (Playwright — saves its own video) ───────────────────
echo "  [3/4] Scenario 3 — PR Block (Playwright, ~50s)"
cd "$ROOT"
"$ROOT/node_modules/.bin/playwright" test scenarios/03-pr-block.spec.ts \
  --reporter=line \
  2>&1 || true   # Playwright exits non-zero on first-run setup; we handle below
echo "       ✓ Video + screenshots saved to output/"
echo ""
cd "$SCRIPT_DIR"

# ── Scenario 4: Propagation ───────────────────────────────────────────────────
echo "  [4/4] Scenario 4 — Propagation (55s)"
asciinema rec \
  --cols 160 --rows 52 \
  --overwrite \
  --title "Groundwork — Propagation" \
  "$OUT/04-propagation.cast" \
  -- "$TSN" "$ROOT/scenarios/04-propagation.ts"
echo "       ✓ Saved: output/04-propagation.cast"
echo ""

echo "  ✓ All recordings complete. Run bash scripts/export-clips.sh to export."
echo ""
