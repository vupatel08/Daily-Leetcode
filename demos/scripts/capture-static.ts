/**
 * capture-static.ts
 *
 * Generates static HTML snapshots of the key moments from each demo scenario —
 * no script execution needed, no timeouts. Each snapshot is the single most
 * impactful frame from that scenario, hand-composed from the actual output.
 * Chrome headless screenshots these into PNGs for the README.
 */

const { spawnSync } = require('child_process') as typeof import('child_process');
const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const OUT = path.join(__dirname, '../output');
fs.mkdirSync(OUT, { recursive: true });

// ─────────────────────────────────────────────────────────────────────────────
// Terminal window wrapper
// ─────────────────────────────────────────────────────────────────────────────

function terminalPage(title: string, bodyHtml: string, width = 960): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #0a0a0a; width: ${width}px; }
  body { padding: 20px; font-family: 'JetBrains Mono','Fira Code','Cascadia Code','SF Mono',Consolas,monospace; }
  .win  { background: #111; border-radius: 10px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.8); border: 1px solid #222; }
  .bar  { background: #1c1c1e; padding: 10px 16px; display:flex; align-items:center; gap:8px; border-bottom: 1px solid #222; }
  .dot  { width:12px; height:12px; border-radius:50%; }
  .r    { background:#ff5f57; } .y { background:#ffbd2e; } .g { background:#28c840; }
  .lbl  { margin: 0 auto; font-size: 12px; color: #666; letter-spacing:.3px; }
  .term { background: #0d0d0d; padding: 18px 22px; font-size: 13px; line-height: 1.6; }
  /* colours */
  .G { color: #00ff88; } .R { color: #ff4444; } .Y { color: #ffcc00; }
  .B { color: #5b8cff; } .M { color: #c77dff; } .C { color: #3ddc84; }
  .W { color: #e0e0e0; } .D { color: #555;    }
  b  { font-weight: 700; }
  .dim { opacity: .55; }
</style>
</head>
<body>
<div class="win">
  <div class="bar">
    <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
    <span class="lbl">${title}</span>
  </div>
  <div class="term">${bodyHtml}</div>
</div>
</body>
</html>`;
}

function screenshot(html: string, slug: string, w: number, h: number): void {
  const htmlFile = path.join(OUT, `${slug}.html`);
  const pngFile  = path.join(OUT, `${slug}.png`);
  fs.writeFileSync(htmlFile, html);
  spawnSync('google-chrome', [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    `--window-size=${w},${h}`,
    '--virtual-time-budget=2000',
    `--screenshot=${pngFile}`,
    `file://${htmlFile}`,
  ], { stdio: 'pipe' });
  console.log(`  ✓ ${slug}.png`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Snapshot 1 — Conflict Catch (the moment the red warning fires)
// ─────────────────────────────────────────────────────────────────────────────

const S1 = terminalPage('Groundwork — Conflict Catch', `
<pre style="display:grid;grid-template-columns:1fr 2px 1fr;gap:0 12px">
<!-- LEFT panel -->
<span>
<span class="D">// prisma/schema.prisma</span>

<span class="B">model</span> <span class="Y">User</span> {
  <span class="B">id</span>        <span class="Y">String</span>    <span class="G">@id</span> <span class="D">@default(uuid())</span>
  <span class="B">email</span>     <span class="Y">String</span>    <span class="G">@unique</span>
  <span class="B">createdAt</span> <span class="Y">DateTime</span>  <span class="D">@default(now())</span>
<span class="B">}</span>

<span class="D">┌─────────────────────────────────────────────┐</span>
<span class="D">│</span> <span class="G"><b>✓ Groundwork</b></span> Decision extracted             <span class="D">│</span>
<span class="D">│</span>   <span class="W">User IDs are UUID v4 strings</span>             <span class="D">│</span>
<span class="D">│</span>   <span class="D">confidence: </span><span class="G">0.97</span> <span class="D">· D004 · Schema          │</span>
<span class="D">└─────────────────────────────────────────────┘</span>
</span>
<!-- Divider -->
<span style="border-left:1px solid #333;display:inline-block;height:100%"></span>
<!-- RIGHT panel -->
<span>
<span class="D">// billing/schema.ts</span>

<span class="B">interface</span> <span class="Y">BillingRecord</span> {
  <span class="R"><s>user_id: INTEGER;</s></span>

<span class="R"><b>╔══════════════════════════════════════════════════╗</b>
<b>║  ⚠  GROUNDWORK CONFLICT DETECTED                ║</b>
<b>╠══════════════════════════════════════════════════╣</b></span>
<span class="R">║</span> <span class="W">  Decision D004: User IDs are UUID v4 strings  </span> <span class="R">║</span>
<span class="R">║</span> <span class="D">  Decided by: Dev 1 — today at 10:32am         </span> <span class="R">║</span>
<span class="R">║</span> <span class="Y">  Your code uses INTEGER — violates D004        </span> <span class="R">║</span>
<span class="R">║</span>                                                  <span class="R">║</span>
<span class="R">║</span> <span class="D">  Fix: </span><span class="G">String @id @default(uuid())</span><span class="D">           </span>  <span class="R">║</span>
<span class="R"><b>╚══════════════════════════════════════════════════╝</b></span>
</span>
</pre>
<pre style="margin-top:16px;border-top:1px solid #1a1a1a;padding-top:12px;text-align:center">
  <span class="G"><b>✓  Conflict resolved before a single wrong line was committed.</b></span>
</pre>
`, 1100);

// ─────────────────────────────────────────────────────────────────────────────
// Snapshot 2 — Onboarding Scan (decisions loading + completion)
// ─────────────────────────────────────────────────────────────────────────────

const S2 = terminalPage('Groundwork — Onboarding Scan', `<pre>
<span class="G">~/acme-app</span> <span class="W">$ groundwork init</span>

<span class="G">  ╔═══════════════════════════════════════╗
  ║   ░░  Groundwork  ░░                  ║
  ║   Architectural decisions, enforced.  ║
  ╚═══════════════════════════════════════╝</span>

  <b><span class="W">Groundwork — initializing project scan</span></b>

  <span class="G">✓</span>  Found CLAUDE.md — reading team instructions
  <span class="G">✓</span>  Found package.json — scanning 47 dependencies
  <span class="G">✓</span>  Found prisma/schema.prisma — analyzing schema
  <span class="B">↻</span>  Scanning repository AST (50 files)...
  <span class="G">✓</span>  Reading git history (last 90 days)
  <span class="G">✓</span>  Reading .github/workflows/ci.yml

  Classifying 51 findings...  <span class="G">████████████████████</span>  100%

  <b><span class="G">AUTO-APPROVED</span></b><span class="D"> (confidence ≥ 0.85) </span><b><span class="W">— 31 decisions</span></b>

  <span class="G">✓</span>  <span class="R"><b>[P0]</b></span>  <span class="D">Schema:</span>      User IDs are UUID v4 strings
  <span class="G">✓</span>  <span class="R"><b>[P0]</b></span>  <span class="D">Auth:</span>        JWT tokens, Bearer scheme, 24h expiry
  <span class="G">✓</span>  <span class="R"><b>[P0]</b></span>  <span class="D">ORM:</span>         Prisma — no raw SQL permitted
  <span class="G">✓</span>  <span class="R"><b>[P0]</b></span>  <span class="D">Payments:</span>    Stripe Payment Intents API
  <span class="G">✓</span>  <span class="Y"><b>[P1]</b></span>  <span class="D">Testing:</span>     Vitest with co-located test files
  <span class="G">✓</span>  <span class="Y"><b>[P1]</b></span>  <span class="D">State:</span>       Zustand — no Redux or Context for state
  <span class="G">✓</span>  <span class="Y"><b>[P1]</b></span>  <span class="D">Styling:</span>     Tailwind CSS only — no CSS-in-JS
  <span class="D">  ... 24 more</span>

  <b><span class="Y">NEEDS REVIEW</span></b><span class="D"> (confidence &lt; 0.85) </span><b><span class="W">— 8 decisions</span></b>

  <span class="Y">?</span>  API response shape: { data, error }    <span class="D">[conf: 0.78]  [a]ll approved</span>

  <span class="G">✓</span>  39 decisions loaded into your Groundwork graph
  <span class="G">✓</span>  Your AI tools will now respect these constraints
  <span class="G">✓</span>  Run: <span class="B">groundwork connect --all</span> to activate

  <span class="D">Setup complete in 38 seconds.</span>
</pre>`, 820);

// ─────────────────────────────────────────────────────────────────────────────
// Snapshot 4 — Propagation (the AI response citing team decisions)
// ─────────────────────────────────────────────────────────────────────────────

const S4 = terminalPage('Groundwork — Propagation', `<pre>
<span style="border-bottom:1px solid #1e1e1e;display:block;padding-bottom:12px;margin-bottom:12px">
<b><span class="B">▌ Dev 1 — Claude Code session</span></b>

<span class="D">[Claude Code session ended — 10:47am]</span>

<span class="G">  ✓</span>  Groundwork processing session complete

<span class="G">  ✓</span>  3 decisions extracted:
       <span class="G">✓</span>  <span class="D">D012:</span>  WebSocket for real-time notifications
       <span class="G">✓</span>  <span class="D">D013:</span>  Store notification read state in Redis
       <span class="G">✓</span>  <span class="D">D014:</span>  Retry failed notifications via BullMQ queue

<span class="G">  ✓</span>  Propagating to team graph... <span class="G">done</span>
<span class="G">  ✓</span>  4 teammates will receive these constraints
</span>
<b><span class="B">▌ Dev 2 — Cursor session</span></b>

<span class="G">~/acme-app</span> <span class="W">$ claude</span>
<span class="D">&gt;</span> I need to build the notification delivery system. What approach should I use?

<span class="W">  Based on your team's established decisions, here's
  the approach for the notification delivery system:</span>

  <span class="G">•</span> Transport: <b>WebSocket</b> <span class="D">(your team decided this today,
    D012 — chosen for real-time delivery without polling)</span>

  <span class="G">•</span> Read state storage: <b>Redis</b> <span class="D">(D013 — fast reads,
    no DB load for notification status)</span>

  <span class="G">•</span> Failed delivery: <b>BullMQ retry queue</b> <span class="D">(D014 — ensures
    delivery guarantees with exponential backoff)</span>

  <span class="W">Here's the implementation following these constraints...</span>
</pre>
<pre style="margin-top:12px;border-top:1px solid #1a1a1a;padding-top:10px;text-align:center">
  <span class="G"><b>Dev 1 decided. Dev 2's AI already knew. Zero communication required.</b></span>
</pre>
`, 900);

// ─────────────────────────────────────────────────────────────────────────────
// Render all
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n  Rendering demo screenshots…\n');
screenshot(S1, 'demo-01-conflict',  1100, 680);
screenshot(S2, 'demo-02-onboard',    820, 820);
screenshot(S4, 'demo-04-propagation', 900, 740);
console.log('\n  ✓ Done — check demos/output/\n');
