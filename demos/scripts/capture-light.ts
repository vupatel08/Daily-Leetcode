/**
 * capture-light.ts
 *
 * Light-theme static screenshots — white background, black text, minimal accent
 * colors. Covers 6 scenarios (01–06) and saves PNGs to demos/output/light/.
 */

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const { chromium } = require('@playwright/test') as typeof import('@playwright/test');

const OUT = path.join(__dirname, '../output/light');
fs.mkdirSync(OUT, { recursive: true });

// ─────────────────────────────────────────────────────────────────────────────
// Theme tokens
// ─────────────────────────────────────────────────────────────────────────────

const THEME_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #ffffff; font-family: 'JetBrains Mono','Fira Code','Cascadia Code','SF Mono',Consolas,monospace; }
  body { padding: 24px; }

  .win {
    background: #ffffff;
    border-radius: 0;
    overflow: hidden;
    border: 2px solid #000000;
  }
  .bar {
    background: #000000;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 2px solid #000000;
  }
  .dot { width: 10px; height: 10px; border-radius: 0; border: 1px solid #fff; }
  .dr  { background: #ffffff; }
  .dy  { background: #ffffff; }
  .dg  { background: #ffffff; }
  .lbl { margin: 0 auto; font-size: 11px; color: #ffffff; letter-spacing: .15em; font-weight: 500; text-transform: uppercase; }
  .term { background: #ffffff; padding: 20px 24px; font-size: 13px; line-height: 1.65; color: #000000; }

  .green  { color: #059669; }
  .red    { color: #dc2626; }
  .amber  { color: #d97706; }
  .blue   { color: #000000; font-weight: 600; }
  .purple { color: #000000; }
  .muted  { color: #525252; }
  .bold   { font-weight: 700; }
  .dim    { opacity: .55; }
  .u      { text-decoration: underline; }
  .del    { text-decoration: line-through; color: #dc2626; }

  .box-red    { border: 2px solid #dc2626; background: #fef2f2; border-radius: 0; padding: 10px 14px; }
  .box-green  { border: 2px solid #059669; background: #ecfdf5; border-radius: 0; padding: 10px 14px; }
  .box-amber  { border: 2px solid #d97706; background: #fffbeb; border-radius: 0; padding: 10px 14px; }
  .box-blue   { border: 2px solid #000000; background: #f5f5f5; border-radius: 0; padding: 10px 14px; }
  .box-gray   { border: 2px solid #000000; background: #f5f5f5; border-radius: 0; padding: 10px 14px; }

  hr.sec { border: none; border-top: 2px solid #000000; margin: 14px 0; }

  .split { display: grid; grid-template-columns: 1fr 2px 1fr; gap: 0 20px; }
  .vdiv  { background: #000000; }
`;

function page(title: string, body: string, width = 900): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>${THEME_CSS}html,body{width:${width}px;}</style></head>
<body><div class="win">
  <div class="bar">
    <span class="dot dr"></span><span class="dot dy"></span><span class="dot dg"></span>
    <span class="lbl">${title}</span>
  </div>
  <div class="term">${body}</div>
</div></body></html>`;
}

async function shot(html: string, slug: string, w: number, h: number): Promise<void> {
  const pngFile = path.join(OUT, `${slug}.png`);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: w + 48, height: h + 48 } });
    await page.setContent(html, { waitUntil: 'load' });
    await page.locator('.win').screenshot({ path: pngFile });
    console.log(`  ✓ ${slug}.png`);
  } catch {
    console.log(`  ✗ ${slug}.png`);
  } finally {
    await browser.close();
  }
}

const DOCS_IMAGES = path.join(__dirname, '../../docs/images');
const SCREENSHOT_SLUGS = [
  'demo-01-conflict',
  'demo-02-onboard',
  'demo-03-pr-check',
  'demo-04-propagation',
  'demo-05-dashboard',
  'demo-06-context-injection',
];

async function main(): Promise<void> {

// ─────────────────────────────────────────────────────────────────────────────
// S1 — Conflict Catch
// ─────────────────────────────────────────────────────────────────────────────

await shot(page('Groundwork — 01: Conflict Catch', `
<div class="split">
  <pre>
<span class="muted">// prisma/schema.prisma</span>

<span class="blue bold">model</span> <span class="purple">User</span> {
  id        <span class="blue">String</span>   <span class="green">@id</span> <span class="muted">@default(uuid())</span>
  email     <span class="blue">String</span>   <span class="green">@unique</span>
  createdAt <span class="blue">DateTime</span> <span class="muted">@default(now())</span>
}

<div class="box-green" style="margin-top:10px">
<span class="green bold">✓ Decision extracted (D004)</span>
  User IDs are UUID v4 strings
  <span class="muted">confidence: 0.97 · Schema</span>
</div>
</pre>
  <div class="vdiv"></div>
  <pre>
<span class="muted">// billing/schema.ts  (Dev 2's file)</span>

<span class="blue bold">interface</span> <span class="purple">BillingRecord</span> {
  <span class="del">user_id: INTEGER;</span>
</pre>
</div>
<div style="margin-top:12px">
<div class="box-red">
  <div style="margin-bottom:6px"><span class="red bold">⚠  Groundwork — Conflict Detected</span></div>
  <span class="muted">Decision D004:</span> <span class="bold">User IDs are UUID v4 strings</span><br/>
  <span class="muted">Decided by: Dev 1 · today at 10:32am</span><br/>
  <span class="amber">Your code uses INTEGER — violates D004</span><br/>
  <br/>
  <span class="muted">Suggested fix: </span><code class="blue">String @id @default(uuid())</code>
</div>
</div>
<hr class="sec"/>
<div style="text-align:center" class="muted">Conflict stopped before a single wrong line was committed.</div>
`, 1060), 'demo-01-conflict', 1060, 520);

// ─────────────────────────────────────────────────────────────────────────────
// S2 — Onboarding Scan
// ─────────────────────────────────────────────────────────────────────────────

await shot(page('Groundwork — 02: Onboarding Scan', `<pre>
<span class="blue bold">~/acme-app</span> <span class="bold">$</span> groundwork init

<div class="box-blue" style="margin:8px 0 12px">
  <span class="blue bold">Groundwork</span> <span class="muted">— Architectural decisions, enforced.</span>
</div>

<span class="green">✓</span>  Found <span class="bold">CLAUDE.md</span>           <span class="muted">reading team instructions</span>
<span class="green">✓</span>  Found <span class="bold">package.json</span>        <span class="muted">scanning 47 dependencies</span>
<span class="green">✓</span>  Found <span class="bold">prisma/schema.prisma</span> <span class="muted">analyzing schema</span>
<span class="blue">↻</span>  Scanning repository AST  <span class="muted">(50 files)…</span>
<span class="green">✓</span>  Reading git history       <span class="muted">(last 90 days)</span>
<span class="green">✓</span>  Reading .github/workflows/ci.yml

  Classifying 51 findings…  <span class="blue">████████████████████</span>  <span class="bold">100%</span>

</pre>
<div class="box-green" style="margin-bottom:8px">
  <span class="green bold">Auto-approved — 31 decisions</span> <span class="muted">(confidence ≥ 0.85)</span>
</div>
<pre>
  <span class="green">✓</span>  <span class="red bold">[P0]</span>  <span class="muted">Schema:</span>    User IDs are UUID v4 strings
  <span class="green">✓</span>  <span class="red bold">[P0]</span>  <span class="muted">Auth:</span>      JWT tokens, Bearer scheme, 24h expiry
  <span class="green">✓</span>  <span class="red bold">[P0]</span>  <span class="muted">ORM:</span>       Prisma — no raw SQL permitted
  <span class="green">✓</span>  <span class="red bold">[P0]</span>  <span class="muted">Payments:</span>  Stripe Payment Intents API
  <span class="green">✓</span>  <span class="amber bold">[P1]</span>  <span class="muted">Testing:</span>   Vitest with co-located test files
  <span class="green">✓</span>  <span class="amber bold">[P1]</span>  <span class="muted">State:</span>     Zustand — no Redux or Context
  <span class="green">✓</span>  <span class="amber bold">[P1]</span>  <span class="muted">Styling:</span>   Tailwind CSS only, no CSS-in-JS
  <span class="muted">    … 24 more</span>

</pre>
<div class="box-amber" style="margin-bottom:12px">
  <span class="amber bold">Needs review — 8 decisions</span> <span class="muted">(confidence &lt; 0.85, approve with [a])</span>
</div>
<pre>
<span class="green">✓</span>  39 decisions loaded into your decision graph
<span class="green">✓</span>  Your AI tools will now respect these constraints
<span class="green">✓</span>  Run: <span class="blue bold">groundwork connect --all</span> to activate
   <span class="muted">Setup complete in 38 seconds.</span>
</pre>
`, 820), 'demo-02-onboard', 820, 680);

// ─────────────────────────────────────────────────────────────────────────────
// S3 — PR Block
// ─────────────────────────────────────────────────────────────────────────────

await shot(page('Groundwork — 03: PR Enforcement', `
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
  <!-- BLOCKED -->
  <div>
    <div style="font-size:11px;color:#57606a;margin-bottom:6px;font-weight:600">BEFORE FIX — PR blocked</div>
    <div class="box-red">
      <div style="margin-bottom:6px"><span class="red bold">✗ groundwork/check</span></div>
      <div class="muted" style="margin-bottom:4px">2 P0 violations found</div>
      <div style="font-size:12px">
        <span class="red">✗</span> D004: user_id should be String UUID, not INTEGER<br/>
        <span class="red">✗</span> D007: Stripe Payment Intents required — Checkout deprecated
      </div>
    </div>
    <div class="box-gray" style="margin-top:10px">
      <div style="margin-bottom:4px"><span class="muted bold">Merge pull request</span></div>
      <div style="background:#d0d7de;color:#57606a;padding:8px 12px;border-radius:4px;text-align:center;font-size:12px">
        Merge blocked — fix P0 violations
      </div>
    </div>
  </div>
  <!-- PASSING -->
  <div>
    <div style="font-size:11px;color:#57606a;margin-bottom:6px;font-weight:600">AFTER FIX — PR passes</div>
    <div class="box-green">
      <div style="margin-bottom:6px"><span class="green bold">✓ groundwork/check</span></div>
      <div class="muted" style="margin-bottom:4px">All decisions satisfied</div>
      <div style="font-size:12px">
        <span class="green">✓</span> D004: UUID v4 string ID confirmed<br/>
        <span class="green">✓</span> D007: Payment Intents API confirmed
      </div>
    </div>
    <div class="box-gray" style="margin-top:10px">
      <div style="margin-bottom:4px"><span class="bold">Merge pull request</span></div>
      <div style="background:#1a7f37;color:#fff;padding:8px 12px;border-radius:4px;text-align:center;font-size:12px;cursor:pointer">
        ✓ Merge pull request
      </div>
    </div>
  </div>
</div>
<hr class="sec"/>
<div class="box-gray" style="font-size:12px">
  <span class="bold">Groundwork GitHub Action</span> <span class="muted">— add to .github/workflows/groundwork.yml — blocks merges automatically</span>
</div>
`, 960), 'demo-03-pr-check', 960, 420);

// ─────────────────────────────────────────────────────────────────────────────
// S4 — Propagation
// ─────────────────────────────────────────────────────────────────────────────

await shot(page('Groundwork — 04: Decision Propagation', `
<div class="split">
  <pre>
<span class="blue bold">▌ Dev 1 — Claude Code session</span>

<span class="muted">[session ended — 10:47am]</span>

<div class="box-green" style="margin:8px 0">
<span class="green bold">✓ Groundwork — 3 decisions extracted</span>
  D012: WebSocket for real-time notifications
  D013: Redis for notification read state
  D014: BullMQ for failed notification retries
<span class="muted">  Propagating to team graph… done</span>
<span class="muted">  4 teammates will receive these constraints</span>
</div>
</pre>
  <div class="vdiv"></div>
  <pre>
<span class="blue bold">▌ Dev 2 — Cursor (30 min later)</span>

<span class="muted">&gt;</span> Build the notification delivery system.
  What approach should I use?

<div class="box-blue" style="margin:8px 0">
<span class="blue bold">Based on your team's decisions:</span>

<span class="green">•</span> Transport: <span class="bold">WebSocket</span>
  <span class="muted">(D012 — real-time, decided today)</span>

<span class="green">•</span> Read state: <span class="bold">Redis</span>
  <span class="muted">(D013 — fast reads, no DB load)</span>

<span class="green">•</span> Failures: <span class="bold">BullMQ retry queue</span>
  <span class="muted">(D014 — exponential backoff)</span>
</div>
</pre>
</div>
<hr class="sec"/>
<div style="text-align:center" class="muted">Dev 1 decided. Dev 2's AI already knew. Zero communication required.</div>
`, 1060), 'demo-04-propagation', 1060, 520);

// ─────────────────────────────────────────────────────────────────────────────
// S5 — Dashboard Walkthrough
// ─────────────────────────────────────────────────────────────────────────────

await shot(page('Groundwork — 05: Decision Dashboard', `
<div style="display:grid;grid-template-columns:200px 1fr;gap:16px">
  <!-- Sidebar -->
  <div style="border-right:1px solid #d0d7de;padding-right:16px">
    <div style="font-size:11px;font-weight:700;color:#57606a;margin-bottom:10px;letter-spacing:.5px">GROUNDWORK</div>
    <div style="padding:6px 10px;background:#f0f7ff;border-radius:4px;color:#0969da;font-size:12px;margin-bottom:4px;border-left:3px solid #0969da">
      Decisions
    </div>
    <div style="padding:6px 10px;font-size:12px;color:#57606a;margin-bottom:4px">Graph</div>
    <div style="padding:6px 10px;font-size:12px;color:#57606a;margin-bottom:4px">Timeline</div>
    <div style="padding:6px 10px;font-size:12px;color:#57606a;margin-bottom:4px">Conflicts</div>
    <hr class="sec" style="margin:8px 0"/>
    <div style="font-size:11px;color:#57606a;margin-bottom:8px">STATS</div>
    <div style="font-size:12px;margin-bottom:4px"><span class="green bold">39</span> <span class="muted">decisions</span></div>
    <div style="font-size:12px;margin-bottom:4px"><span class="blue bold">12</span> <span class="muted">relationships</span></div>
    <div style="font-size:12px;margin-bottom:4px"><span class="red bold">2</span> <span class="muted">conflicts</span></div>
  </div>
  <!-- Main panel -->
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <span class="bold">All Decisions</span>
      <span style="font-size:11px" class="muted">acme-app · last scan 2m ago</span>
    </div>
    <!-- Decision rows -->
    <div style="border:1px solid #d0d7de;border-radius:6px;overflow:hidden">
      <div style="display:grid;grid-template-columns:50px 1fr 80px 80px 80px;font-size:11px;font-weight:700;color:#57606a;padding:8px 12px;background:#f6f8fa;border-bottom:1px solid #d0d7de;letter-spacing:.3px">
        <span>PRI</span><span>DECISION</span><span>SOURCE</span><span>CONF</span><span>STATUS</span>
      </div>
      <div style="display:grid;grid-template-columns:50px 1fr 80px 80px 80px;padding:8px 12px;border-bottom:1px solid #eaecef;font-size:12px;align-items:center">
        <span class="red bold">P0</span><span>User IDs are UUID v4 strings</span><span class="muted">Schema</span><span class="green">0.97</span><span style="background:#d4edda;color:#1a7f37;padding:2px 6px;border-radius:3px;font-size:10px">active</span>
      </div>
      <div style="display:grid;grid-template-columns:50px 1fr 80px 80px 80px;padding:8px 12px;border-bottom:1px solid #eaecef;font-size:12px;align-items:center">
        <span class="red bold">P0</span><span>JWT Bearer tokens, 24h expiry</span><span class="muted">CLAUDE.md</span><span class="green">0.93</span><span style="background:#d4edda;color:#1a7f37;padding:2px 6px;border-radius:3px;font-size:10px">active</span>
      </div>
      <div style="display:grid;grid-template-columns:50px 1fr 80px 80px 80px;padding:8px 12px;border-bottom:1px solid #eaecef;font-size:12px;align-items:center">
        <span class="red bold">P0</span><span>Prisma ORM — no raw SQL</span><span class="muted">package.json</span><span class="green">0.91</span><span style="background:#d4edda;color:#1a7f37;padding:2px 6px;border-radius:3px;font-size:10px">active</span>
      </div>
      <div style="display:grid;grid-template-columns:50px 1fr 80px 80px 80px;padding:8px 12px;border-bottom:1px solid #eaecef;font-size:12px;align-items:center">
        <span class="amber bold">P1</span><span>Tailwind CSS only — no CSS-in-JS</span><span class="muted">package.json</span><span class="green">0.88</span><span style="background:#d4edda;color:#1a7f37;padding:2px 6px;border-radius:3px;font-size:10px">active</span>
      </div>
      <div style="display:grid;grid-template-columns:50px 1fr 80px 80px 80px;padding:8px 12px;border-bottom:1px solid #eaecef;font-size:12px;align-items:center;background:#fff5f5">
        <span class="red bold">P0</span><span>Stripe Payment Intents API</span><span class="muted">CLAUDE.md</span><span class="amber">0.71</span><span style="background:#ffcdd3;color:#d1242f;padding:2px 6px;border-radius:3px;font-size:10px">conflict</span>
      </div>
      <div style="display:grid;grid-template-columns:50px 1fr 80px 80px 80px;padding:8px 12px;font-size:12px;align-items:center">
        <span class="muted bold">P2</span><span class="muted">… 34 more decisions</span><span></span><span></span><span></span>
      </div>
    </div>
  </div>
</div>
`, 1060), 'demo-05-dashboard', 1060, 520);

// ─────────────────────────────────────────────────────────────────────────────
// S6 — Context Injection (what the AI actually sees)
// ─────────────────────────────────────────────────────────────────────────────

await shot(page('Groundwork — 06: AI Context Injection', `
<div class="split">
  <pre>
<span class="muted">// Developer's prompt to Claude Code</span>

<span class="blue bold">&gt;</span> <span class="bold">Build a user profile update endpoint</span>

</pre>
  <div class="vdiv"></div>
  <pre>
<span class="muted">// What Claude Code actually receives</span>
<span class="muted">// (injected automatically by Groundwork MCP)</span>
</pre>
</div>

<div style="margin-top:12px">
<div class="box-blue">
  <div style="margin-bottom:8px"><span class="blue bold">⚡ Groundwork MCP — injecting 6 relevant decisions</span></div>
  <div style="font-size:12px;display:grid;gap:6px">
    <div><span class="red bold">[P0]</span> D004: User IDs are UUID v4 strings <span class="muted">(Prisma schema · conf 0.97)</span></div>
    <div><span class="red bold">[P0]</span> D002: JWT Bearer auth on all protected routes <span class="muted">(CLAUDE.md · conf 0.93)</span></div>
    <div><span class="red bold">[P0]</span> D003: Prisma ORM for all DB access — no raw SQL <span class="muted">(package.json · conf 0.91)</span></div>
    <div><span class="amber bold">[P1]</span> D009: Input validated with Zod before DB write <span class="muted">(git history · conf 0.89)</span></div>
    <div><span class="amber bold">[P1]</span> D015: Response shape <code>{ data, error }</code> <span class="muted">(git history · conf 0.84)</span></div>
    <div><span class="muted bold">[P2]</span> D021: Pino for structured logging <span class="muted">(ci.yml · conf 0.78)</span></div>
  </div>
</div>
</div>
<hr class="sec"/>
<div class="box-gray" style="font-size:12px">
  <span class="blue bold">↳ Claude Code's response</span> will use UUIDs, JWT middleware, Prisma, Zod validation, and
  <code>{ data, error }</code> shape — <span class="green bold">automatically</span>, without the developer having to specify.
</div>
`, 1060), 'demo-06-context-injection', 1060, 500);

console.log('\n  ✓ All light-theme screenshots done → demos/output/light/\n');

fs.mkdirSync(DOCS_IMAGES, { recursive: true });
for (const slug of SCREENSHOT_SLUGS) {
  const src = path.join(OUT, `${slug}.png`);
  const dest = path.join(DOCS_IMAGES, `${slug}.png`);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  ✓ copied → docs/images/${slug}.png`);
  }
}
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
