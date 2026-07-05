/**
 * capture-screenshots.ts
 * Runs each demo scenario, captures ANSI output partway through,
 * renders it in a browser terminal, and saves a PNG via Chrome headless.
 */
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const AnsiToHtml = require('ansi-to-html');

const OUT = path.join(__dirname, '../output');
fs.mkdirSync(OUT, { recursive: true });

const convert = new AnsiToHtml({
  fg: '#e0e0e0',
  bg: '#0d0d0d',
  newline: true,
  escapeXML: true,
  stream: false,
  colors: {
    0: '#0d0d0d', 1: '#ff4444', 2: '#00ff88', 3: '#ffcc00',
    4: '#5b8cff', 5: '#c77dff', 6: '#3ddc84', 7: '#e0e0e0',
    8: '#333333', 9: '#ff6666', 10: '#44ffaa', 11: '#ffdd44',
    12: '#7ba8ff', 13: '#d99fff', 14: '#66ffaa', 15: '#ffffff',
  }
});

function wrapInTerminal(ansiContent: string, title: string): string {
  const html = convert.toHtml(ansiContent);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>${title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0a0a0a;
    padding: 0;
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Consolas, monospace;
  }
  .window {
    background: #111;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,.8);
    margin: 24px;
    border: 1px solid #222;
  }
  .titlebar {
    background: #1c1c1e;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #222;
  }
  .dot { width: 12px; height: 12px; border-radius: 50%; }
  .dot.r { background: #ff5f57; }
  .dot.y { background: #ffbd2e; }
  .dot.g { background: #28c840; }
  .titlebar .name { margin-left: auto; margin-right: auto; font-size: 12px; color: #666; }
  .terminal {
    background: #0d0d0d;
    padding: 20px 24px;
    font-size: 13px;
    line-height: 1.55;
    overflow: hidden;
    min-height: 400px;
  }
  .terminal pre { white-space: pre-wrap; word-break: break-word; }
  /* colour overrides */
  .ansi-bright-green  { color: #00ff88 !important; }
  .ansi-green         { color: #00ff88 !important; }
  .ansi-bright-red    { color: #ff4444 !important; }
  .ansi-red           { color: #ff4444 !important; }
  .ansi-bright-yellow { color: #ffcc00 !important; }
  .ansi-yellow        { color: #ffcc00 !important; }
  .ansi-bright-blue   { color: #5b8cff !important; }
  .ansi-blue          { color: #5b8cff !important; }
  .ansi-magenta, .ansi-bright-magenta { color: #c77dff !important; }
  .ansi-white, .ansi-bright-white { color: #e0e0e0 !important; }
  .ansi-bright-black  { color: #555 !important; }
  .ansi-bold          { font-weight: 700; }
</style>
</head>
<body>
<div class="window">
  <div class="titlebar">
    <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
    <span class="name">${title}</span>
  </div>
  <div class="terminal"><pre>${html}</pre></div>
</div>
</body>
</html>`;
}

function screenshot(htmlFile: string, outFile: string, width = 1200, height = 750): void {
  console.log(`  → Screenshotting ${path.basename(htmlFile)}…`);
  spawnSync('google-chrome', [
    '--headless=new', '--disable-gpu', '--no-sandbox',
    '--hide-scrollbars',
    `--window-size=${width},${height}`,
    '--virtual-time-budget=3000',
    `--screenshot=${outFile}`,
    `file://${htmlFile}`,
  ], { stdio: 'pipe' });
  console.log(`  ✓ Saved ${path.basename(outFile)}`);
}

interface Scenario {
  label: string;
  script: string;
  timeout: number;
  width?: number;
  height?: number;
  // Strip cursor-positioning ANSI so it reads as plain text in the terminal render
  stripPositional?: boolean;
}

const SCENARIOS: Scenario[] = [
  { label: 'Scenario 1 — Conflict Catch',  script: '01-conflict-catch.ts',  timeout: 35000, width: 1400, height: 780, stripPositional: true },
  { label: 'Scenario 2 — Onboarding Scan', script: '02-onboarding-scan.ts', timeout: 20000, width: 1000, height: 900, stripPositional: false },
  { label: 'Scenario 4 — Propagation',     script: '04-propagation.ts',     timeout: 35000, width: 1200, height: 780, stripPositional: true },
];

const TSN = path.join(__dirname, '../node_modules/.bin/ts-node');

// Strip cursor-positioning escape sequences (\x1b[Y;XH) and screen-clear codes
// so the output flows naturally as a terminal snapshot (linear, not positional).
function stripPositionalCodes(raw: string): string {
  return raw
    .replace(/\x1b\[\d+;\d+H/g, '')   // cursor move
    .replace(/\x1b\[2J/g, '')          // clear screen
    .replace(/\x1b\[H/g, '')           // cursor home
    .replace(/\x1b\[s/g, '')           // save cursor
    .replace(/\x1b\[u/g, '')           // restore cursor
    .replace(/\x1b\[2K/g, '')          // clear line
    .replace(/\x1b\[\?25[lh]/g, '')    // hide/show cursor
    .replace(/\x1b\[8;\d+;\d+t/g, ''); // resize hint
}

for (const s of SCENARIOS) {
  console.log(`\n  Running: ${s.label}`);
  const result = spawnSync(TSN, [path.join(__dirname, s.script)], {
    timeout: s.timeout,
    encoding: 'buffer',
    env: { ...process.env, FORCE_COLOR: '1', NO_COLOR: undefined as any },
  });

  let raw = result.stdout?.toString('utf8') || '';
  if (s.stripPositional) raw = stripPositionalCodes(raw);

  // Trim to a reasonable length so the screenshot fits in one viewport
  const lines = raw.split('\n');
  const trimmed = lines.slice(0, 60).join('\n');

  const slug = s.script.replace('.ts', '');
  const htmlPath = path.join(OUT, `${slug}-snapshot.html`);
  const pngPath  = path.join(OUT, `${slug}-screenshot.png`);

  fs.writeFileSync(htmlPath, wrapInTerminal(trimmed, s.label));
  screenshot(htmlPath, pngPath, s.width || 1200, s.height || 750);
}

console.log('\n  ✓ All terminal screenshots saved to demos/output/\n');
