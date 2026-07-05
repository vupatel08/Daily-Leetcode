# Groundwork — Demo Recording Scripts

Production-quality demo recordings for marketing. Four scenarios, each
showcasing a different Groundwork capability.

---

## Scenarios

| # | Name | Tool | Duration | What it shows |
|---|------|------|----------|---------------|
| 1 | **Conflict Catch** | asciinema | ~45s | Two developers, split-pane. Dev 1 creates a UUID schema. Dev 2 starts typing INTEGER. Groundwork fires a conflict warning mid-keystroke and auto-corrects. |
| 2 | **Onboarding Scan** | asciinema | ~60s | `groundwork init` in a real-looking project — file discovery, progress bar, 39 decisions auto-loaded, team constraints active from day one. |
| 3 | **PR Block** | Playwright | ~50s | Mock GitHub PR page. Groundwork check fails with a detailed violation table. Merge button grayed out. Developer fixes the diff. Groundwork passes. Merge button activates. |
| 4 | **Propagation** | asciinema | ~55s | Dev 1 ends a session — 3 new decisions extracted, propagated to the team graph. Dev 2 starts immediately, asks about the notification system. Their AI already cites WebSocket, Redis, and BullMQ — without being told. |

---

## Quickstart

```bash
# Install dependencies
cd demos/
npm ci

# Install Playwright browsers (for scenario 3)
npx playwright install chromium

# Run a specific scenario (just plays in your terminal)
npm run demo:conflict
npm run demo:onboard
npm run demo:pr
npm run demo:propagate

# Record all four at once (requires asciinema)
npm run demo:all

# Export GIF + MP4 + screenshots (requires agg + ffmpeg)
npm run export
```

---

## External dependencies

### Asciinema (terminal recording)
```bash
pip install asciinema
```

### agg (asciinema → GIF)
```bash
# macOS
brew install agg

# Linux (cargo required)
cargo install --git https://github.com/asciinema/agg
```

### ffmpeg (GIF → MP4, screenshots)
```bash
# macOS
brew install ffmpeg

# Ubuntu / Debian
sudo apt install ffmpeg
```

---

## Terminal theme

`assets/terminal-theme.json` — Groundwork brand colours:

| Purpose | Hex |
|---------|-----|
| Background | `#0d0d0d` |
| Success / green | `#00ff88` |
| Error / red | `#ff4444` |
| Warning / yellow | `#ffcc00` |
| Info / blue | `#5b8cff` |
| Foreground | `#e0e0e0` |

The theme file is used by `agg` when converting `.cast` → `.gif`. It is also
used as the reference when choosing chalk colours in the scenario scripts.

---

## Output structure

After recording and exporting, `output/` contains:

```
output/
  01-conflict-catch.cast          — asciinema recording
  01-conflict-catch.gif           — GIF (Twitter, Discord, Reddit)
  01-conflict-catch.mp4           — MP4 (YouTube, LinkedIn, TikTok)
  01-conflict-catch-frame-start.png
  01-conflict-catch-frame-mid.png
  01-conflict-catch-frame-end.png

  02-onboarding-scan.cast
  02-onboarding-scan.gif
  02-onboarding-scan.mp4
  02-onboarding-scan-frame-*.png

  03-pr-block.mp4                 — converted from Playwright .webm
  03-pr-blocked.png               — screenshot: blocked state
  03-pr-passing.png               — screenshot: passing state
  03-pr-resolved.png              — screenshot: full-page resolved state

  04-propagation.cast
  04-propagation.gif
  04-propagation.mp4
  04-propagation-frame-*.png
```

---

## Customisation

### Typing speed
Edit `scenarios/utils.ts` → `typingDelay()`. The defaults are 30–60 ms per
character with a 5 % chance of a 300–800 ms "thinking pause".

### Decisions / text
All copy in the scenarios is in the `const` blocks near the top of each file.
Change the decision text, confidence scores, developer names, timestamps, etc.
to match your actual product data before recording a final version.

### Playwright viewport
Edit the `test.use({ viewport })` block at the top of `03-pr-block.spec.ts`.
`1440 × 900` is the default (good for 1080p exports).

---

## Scenario 3 note — offline mock

Scenario 3 uses a fully self-contained HTML file written to `output/pr-mock.html`
at runtime. It does not hit GitHub's servers. All the UI (checks, comment,
merge button) is driven by JavaScript injected from the spec. This means the
demo works without internet and without any GitHub credentials.
