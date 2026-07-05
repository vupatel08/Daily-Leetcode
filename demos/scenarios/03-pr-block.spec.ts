/**
 * Scenario 3 — The PR Block
 *
 * Playwright browser recording. Opens a self-contained mock GitHub PR page,
 * animates the Groundwork status check failing, shows a detailed bot comment
 * with a violation table, grays out the merge button, then simulates a fix
 * and shows the check passing and the merge button activating.
 *
 * Duration: ~50 seconds
 * Run:  npm run demo:pr
 * Record: saves a video automatically to output/03-pr-block.webm via Playwright
 */

import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// ── Playwright config ─────────────────────────────────────────────────────────

test.use({
  viewport: { width: 1440, height: 900 },
  video: 'on',
  screenshot: 'on',
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function delay(ms: number) {
  await new Promise<void>(r => setTimeout(r, ms));
}

// ── The mock GitHub PR page HTML ──────────────────────────────────────────────

const MOCK_PR_HTML = String.raw`
<!DOCTYPE html>
<html lang="en" data-color-mode="dark" data-dark-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Add billing schema by devuser · Pull Request #47 · acme-inc/acme-app</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:          #0d1117;
      --bg-overlay:  #161b22;
      --bg-inset:    #010409;
      --border:      #30363d;
      --border-muted:#21262d;
      --text:        #c9d1d9;
      --text-muted:  #8b949e;
      --accent:      #58a6ff;
      --success:     #3fb950;
      --error:       #f85149;
      --warn:        #d29922;
      --merge:       #238636;
      --merge-hover: #2ea043;
      --radius:      6px;
      --font:        -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      --mono:        "SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace;
    }
    body { background: var(--bg); color: var(--text); font: 14px/1.5 var(--font); }
    a    { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* ── Nav bar ───────────────────────────────────────────────────────── */
    .navbar {
      background: var(--bg-overlay); border-bottom: 1px solid var(--border);
      padding: 16px 32px; display: flex; align-items: center; gap: 16px;
    }
    .navbar .logo { font-size: 24px; color: var(--text); font-weight: 700; }
    .navbar .breadcrumb { color: var(--text-muted); font-size: 13px; }
    .navbar .breadcrumb a { color: var(--text-muted); }
    .navbar .breadcrumb a:hover { color: var(--accent); }

    /* ── PR header ─────────────────────────────────────────────────────── */
    .pr-header {
      max-width: 1200px; margin: 24px auto; padding: 0 32px;
    }
    .pr-title-row { display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px; }
    .pr-title { font-size: 26px; font-weight: 400; }
    .pr-number { color: var(--text-muted); font-size: 24px; }
    .pr-meta { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted); }
    .badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
    }
    .badge-open { background: #1f6feb33; color: #58a6ff; border: 1px solid #1f6feb; }
    .badge-branch {
      background: var(--bg-overlay); border: 1px solid var(--border);
      border-radius: 6px; padding: 1px 6px; font-family: var(--mono); font-size: 12px;
    }

    /* ── Layout ────────────────────────────────────────────────────────── */
    .pr-body {
      max-width: 1200px; margin: 0 auto; padding: 0 32px 60px;
      display: grid; grid-template-columns: 1fr 296px; gap: 24px;
    }
    .pr-main {}
    .pr-sidebar {}

    /* ── Status checks ─────────────────────────────────────────────────── */
    .checks-box {
      border: 1px solid var(--border); border-radius: var(--radius);
      margin-bottom: 16px; overflow: hidden;
    }
    .checks-header {
      padding: 12px 16px; background: var(--bg-overlay);
      display: flex; align-items: center; gap: 10px; font-weight: 600;
      border-bottom: 1px solid var(--border);
    }
    .check-row {
      padding: 10px 16px; display: flex; align-items: center; gap: 10px;
      border-bottom: 1px solid var(--border-muted);
    }
    .check-row:last-child { border-bottom: none; }
    .check-icon { width: 20px; text-align: center; font-size: 16px; }
    .check-name { flex: 1; font-weight: 500; }
    .check-detail { color: var(--text-muted); font-size: 12px; }
    .icon-pass  { color: var(--success); }
    .icon-fail  { color: var(--error);   }
    .icon-pending { color: var(--warn);  animation: spin 1s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Groundwork comment ────────────────────────────────────────────── */
    .comment {
      border: 1px solid var(--border); border-radius: var(--radius);
      margin-bottom: 16px; overflow: hidden;
    }
    .comment-header {
      background: var(--bg-overlay); padding: 10px 16px;
      display: flex; align-items: center; gap: 10px; font-size: 13px;
      border-bottom: 1px solid var(--border);
    }
    .comment-header .avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: linear-gradient(135deg,#00ff88,#5b8cff); display: flex;
      align-items: center; justify-content: center; font-weight: 700;
      font-size: 12px; color: #0d0d0d;
    }
    .comment-body { padding: 16px; font-size: 13px; line-height: 1.6; }
    .comment-body table {
      width: 100%; border-collapse: collapse; margin: 12px 0;
      font-size: 12px; font-family: var(--mono);
    }
    .comment-body th {
      background: var(--bg-overlay); padding: 8px 12px;
      border: 1px solid var(--border); text-align: left; font-weight: 600;
    }
    .comment-body td {
      padding: 8px 12px; border: 1px solid var(--border); vertical-align: top;
    }
    .comment-body tr:nth-child(even) td { background: var(--bg-inset); }
    .p0-badge { color: var(--error); font-weight: 700; }
    .p1-badge { color: var(--warn);  font-weight: 700; }
    .gw-link { color: var(--accent); }

    /* ── Merge section ─────────────────────────────────────────────────── */
    .merge-box {
      border: 1px solid var(--border); border-radius: var(--radius);
      margin-bottom: 16px; overflow: hidden;
    }
    .merge-header {
      background: var(--bg-overlay); padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 10px; font-weight: 600;
    }
    .merge-body { padding: 16px; }
    .merge-btn {
      padding: 9px 20px; border-radius: var(--radius); border: none; cursor: pointer;
      font-size: 14px; font-weight: 600; font-family: var(--font);
      transition: background .15s, opacity .15s;
    }
    .merge-btn.enabled {
      background: var(--merge); color: #fff;
    }
    .merge-btn.enabled:hover { background: var(--merge-hover); }
    .merge-btn.disabled {
      background: var(--bg-overlay); color: var(--text-muted);
      border: 1px solid var(--border); cursor: not-allowed; opacity: 0.6;
    }
    .merge-blocked-msg {
      color: var(--error); font-size: 13px; margin-top: 10px; font-weight: 600;
    }
    .merge-ok-msg {
      color: var(--success); font-size: 13px; margin-top: 10px; font-weight: 600;
    }

    /* ── Code diff ─────────────────────────────────────────────────────── */
    .diff-box {
      border: 1px solid var(--border); border-radius: var(--radius);
      font-family: var(--mono); font-size: 12px; overflow: hidden;
      margin-bottom: 16px;
    }
    .diff-header {
      background: var(--bg-overlay); padding: 8px 16px;
      border-bottom: 1px solid var(--border); color: var(--text-muted);
    }
    .diff-line { padding: 2px 16px; display: flex; gap: 16px; line-height: 1.6; }
    .diff-line.remove { background: rgba(248,81,73,.12); color: #ffa198; }
    .diff-line.add    { background: rgba(63,185,80,.12);  color: #7ee787; }
    .diff-line.ctx    { color: var(--text-muted); }
    .diff-line .ln    { color: var(--text-muted); user-select: none; width: 40px; }

    /* ── Sidebar ───────────────────────────────────────────────────────── */
    .sidebar-section { margin-bottom: 24px; }
    .sidebar-section h3 {
      font-size: 12px; font-weight: 600; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px;
    }
    .sidebar-user { display: flex; align-items: center; gap: 8px; font-size: 13px; }

    /* ── Flash animations ──────────────────────────────────────────────── */
    @keyframes highlight {
      0%,100% { background: transparent; }
      50%      { background: rgba(248,81,73,.2); }
    }
    .flash-err { animation: highlight 0.5s ease; }
    @keyframes highlight-ok {
      0%,100% { background: transparent; }
      50%      { background: rgba(63,185,80,.2); }
    }
    .flash-ok { animation: highlight-ok 0.5s ease; }
  </style>
</head>
<body>

  <!-- ── Nav ─────────────────────────────────────────────────────────── -->
  <div class="navbar">
    <div class="logo">⬡ GitHub</div>
    <div class="breadcrumb">
      <a href="#">acme-inc</a> / <a href="#">acme-app</a> / <strong>Pull requests</strong>
    </div>
  </div>

  <!-- ── PR header ────────────────────────────────────────────────────── -->
  <div class="pr-header">
    <div class="pr-title-row">
      <span class="pr-title">Add billing schema</span>
      <span class="pr-number">#47</span>
    </div>
    <div class="pr-meta">
      <span class="badge badge-open">⬤ Open</span>
      <span>devuser wants to merge 3 commits into</span>
      <span class="badge-branch">main</span>
      <span>from</span>
      <span class="badge-branch">feature/billing-schema</span>
      <span>· 12 minutes ago</span>
    </div>
  </div>

  <!-- ── Body ─────────────────────────────────────────────────────────── -->
  <div class="pr-body">
    <div class="pr-main">

      <!-- Status checks -->
      <div class="checks-box" id="checks-box">
        <div class="checks-header" id="checks-header">
          <span id="checks-summary-icon">⏳</span>
          <span id="checks-summary-text">Some checks are still pending</span>
        </div>

        <div class="check-row">
          <div class="check-icon icon-pass">✓</div>
          <div class="check-name">test / unit</div>
          <div class="check-detail">All 142 tests passed — 8s</div>
        </div>
        <div class="check-row">
          <div class="check-icon icon-pass">✓</div>
          <div class="check-name">lint / eslint</div>
          <div class="check-detail">No issues found — 4s</div>
        </div>
        <div class="check-row">
          <div class="check-icon icon-pass">✓</div>
          <div class="check-name">build / tsc</div>
          <div class="check-detail">Build succeeded — 12s</div>
        </div>
        <div class="check-row" id="gw-check-row">
          <div class="check-icon" id="gw-check-icon">
            <span class="icon-pending">⟳</span>
          </div>
          <div class="check-name">Groundwork Decision Check</div>
          <div class="check-detail" id="gw-check-detail">Running — 3s</div>
        </div>
      </div>

      <!-- Diff -->
      <div class="diff-box">
        <div class="diff-header">billing/schema.ts</div>
        <div class="diff-line ctx"><span class="ln">19</span> interface BillingRecord {</div>
        <div class="diff-line remove" id="bad-line">
          <span class="ln">20</span> <span id="bad-code">  user_id: <strong>INTEGER</strong>;</span>
        </div>
        <div class="diff-line add" id="good-line" style="display:none">
          <span class="ln">20</span>   userId: <strong>String</strong>; // @default(uuid())
        </div>
        <div class="diff-line ctx"><span class="ln">21</span>   amount: number;</div>
        <div class="diff-line ctx"><span class="ln">22</span> }</div>
        <div class="diff-line ctx" style="margin-top:8px;color:#666">
          <span class="ln">47</span>
          <span id="sql-line">  const res = await db.query(<span style="color:#ff4444">'SELECT * FROM billing WHERE user_id = ?'</span>, [id]);</span>
        </div>
      </div>

      <!-- Groundwork comment (initially hidden) -->
      <div class="comment" id="gw-comment" style="display:none">
        <div class="comment-header">
          <div class="avatar">G</div>
          <strong>groundwork-bot</strong>
          <span style="color:var(--text-muted)">commented just now</span>
          <span style="margin-left:auto;background:#f8514933;color:#f85149;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700">BLOCKING</span>
        </div>
        <div class="comment-body">
          <p><strong>⚠️ Groundwork: Decision Violations Found</strong></p>
          <br>
          <table>
            <thead>
              <tr>
                <th>Priority</th>
                <th>Decision</th>
                <th>File</th>
                <th>Violation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="p0-badge">🚫 P0</span></td>
                <td>D004: UUID IDs</td>
                <td>billing/schema.ts:20</td>
                <td>INTEGER type used</td>
              </tr>
              <tr>
                <td><span class="p1-badge">⚠️ P1</span></td>
                <td>D005: Prisma ORM</td>
                <td>billing/db.ts:47</td>
                <td>Raw SQL found</td>
              </tr>
            </tbody>
          </table>
          <p><strong style="color:var(--error)">P0 violations block this PR from merging.</strong></p>
          <br>
          <p>Decision <strong>D004</strong> was made by <strong>Sarah Chen</strong> on Monday Jan 13.</p>
          <p style="color:var(--text-muted)">Rationale: portable IDs across microservices.</p>
          <br>
          <p>To fix: change <code style="background:var(--bg-inset);padding:1px 5px;border-radius:3px">user_id: INTEGER</code> to <code style="background:var(--bg-inset);padding:1px 5px;border-radius:3px">userId: String @default(uuid())</code></p>
          <p style="margin-top:8px">To discuss the decision: <a class="gw-link" href="#">groundwork.dev/decisions/D004</a></p>
        </div>
      </div>

      <!-- Merge box -->
      <div class="merge-box" id="merge-box">
        <div class="merge-header" id="merge-header">
          <span id="merge-header-icon">⊘</span>
          <span id="merge-header-text">Merging is blocked</span>
        </div>
        <div class="merge-body">
          <button class="merge-btn disabled" id="merge-btn" disabled>Merge pull request</button>
          <div id="merge-status-msg" class="merge-blocked-msg">
            ✗ Groundwork check failed — fix P0 violations first
          </div>
        </div>
      </div>

    </div><!-- /.pr-main -->

    <!-- Sidebar -->
    <div class="pr-sidebar">
      <div class="sidebar-section">
        <h3>Reviewers</h3>
        <div class="sidebar-user">
          <div style="width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#5b8cff,#c77dff)"></div>
          Sarah Chen
          <span style="margin-left:auto;color:var(--text-muted)">✓</span>
        </div>
      </div>
      <div class="sidebar-section">
        <h3>Labels</h3>
        <span style="background:#1f6feb33;color:#58a6ff;padding:2px 8px;border-radius:12px;font-size:12px">billing</span>
      </div>
      <div class="sidebar-section">
        <h3>Projects</h3>
        <span style="color:var(--text-muted);font-size:13px">Acme Roadmap</span>
      </div>
    </div>
  </div><!-- /.pr-body -->

  <script>
    // Exposed for Playwright to drive
    window.gwDemo = {
      /** Step 1: check fails */
      failCheck() {
        const icon   = document.getElementById('gw-check-icon');
        const detail = document.getElementById('gw-check-detail');
        const sum    = document.getElementById('checks-summary-text');
        const sumI   = document.getElementById('checks-summary-icon');
        const box    = document.getElementById('checks-box');
        const comment = document.getElementById('gw-comment');

        icon.innerHTML   = '<span class="icon-fail">✗</span>';
        detail.textContent = 'Failed — 2 violations — 8s';
        sum.textContent    = '1 failing check';
        sumI.textContent   = '✗';
        sumI.style.color   = 'var(--error)';
        box.style.borderColor = 'var(--error)';

        // Show comment
        comment.style.display = 'block';
        comment.classList.add('flash-err');

        // Merge stays blocked
        document.getElementById('gw-check-row').style.background = 'rgba(248,81,73,.06)';
      },

      /** Step 2: developer fixes the diff */
      fixDiff() {
        document.getElementById('bad-line').style.display  = 'none';
        document.getElementById('good-line').style.display = 'flex';
        document.getElementById('sql-line').innerHTML =
          '  const record = await prisma.billing.findFirst({ where: { userId: id } });';
        document.getElementById('sql-line').style.color = '#7ee787';
      },

      /** Step 3: check re-runs then passes */
      passCheck() {
        const icon    = document.getElementById('gw-check-icon');
        const detail  = document.getElementById('gw-check-detail');
        const sum     = document.getElementById('checks-summary-text');
        const sumI    = document.getElementById('checks-summary-icon');
        const box     = document.getElementById('checks-box');
        const mergeBtn  = document.getElementById('merge-btn');
        const mergeMsg  = document.getElementById('merge-status-msg');
        const mergeHeader = document.getElementById('merge-header-text');
        const mergeHeaderIcon = document.getElementById('merge-header-icon');
        const mergeBox  = document.getElementById('merge-box');
        const gwRow     = document.getElementById('gw-check-row');
        const comment   = document.getElementById('gw-comment');

        // Pending spinner
        icon.innerHTML   = '<span class="icon-pending">⟳</span>';
        detail.textContent = 'Re-running — checking fix...';
        sum.textContent    = 'Checks are running';
        sumI.textContent   = '⏳';
        sumI.style.color   = '';
        box.style.borderColor = '';
        gwRow.style.background = '';
        comment.style.display  = 'none';

        setTimeout(() => {
          icon.innerHTML      = '<span class="icon-pass">✓</span>';
          detail.textContent  = 'Passed — all decisions respected — 6s';
          sum.textContent     = 'All checks have passed';
          sumI.textContent    = '✓';
          sumI.style.color    = 'var(--success)';
          box.style.borderColor = 'var(--success)';
          gwRow.style.background = 'rgba(63,185,80,.04)';

          // Enable merge
          mergeBtn.className   = 'merge-btn enabled';
          mergeBtn.disabled    = false;
          mergeMsg.textContent = '✓ All Groundwork checks passed';
          mergeMsg.className   = 'merge-ok-msg';
          mergeHeader.textContent = 'This branch has no conflicts with the base branch';
          mergeHeaderIcon.textContent = '✓';
          mergeBox.style.borderColor = 'var(--success)';
          mergeBox.classList.add('flash-ok');
        }, 3000);
      },
    };
  </script>
</body>
</html>
`;

// ── Test ──────────────────────────────────────────────────────────────────────

test('PR Block — Groundwork fails, developer fixes, check passes', async ({ page }) => {
  // Write the mock HTML to a temp file and navigate to it
  const htmlPath = path.join(__dirname, '../output/pr-mock.html');
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, MOCK_PR_HTML);

  await page.goto(`file://${htmlPath}`);
  await page.waitForLoadState('networkidle');
  await delay(1500);

  // ── Step 1: Groundwork check fails ────────────────────────────────────────
  await page.evaluate(() => (window as any).gwDemo.failCheck());
  await delay(1800);

  // Scroll to the comment
  await page.locator('#gw-comment').scrollIntoViewIfNeeded();
  await delay(2500);

  // Screenshot: blocked state
  await page.screenshot({ path: path.join(__dirname, '../output/03-pr-blocked.png'), fullPage: false });
  await delay(1000);

  // ── Step 2: Developer fixes the diff ──────────────────────────────────────
  await page.locator('.diff-box').scrollIntoViewIfNeeded();
  await delay(800);

  // Highlight the bad line briefly
  await page.locator('#bad-line').evaluate((el: any) => el.style.outline = '2px solid #f85149');
  await delay(700);

  await page.evaluate(() => (window as any).gwDemo.fixDiff());
  await delay(1000);

  // ── Step 3: Groundwork re-runs and passes ─────────────────────────────────
  await page.locator('#checks-box').scrollIntoViewIfNeeded();
  await delay(500);

  await page.evaluate(() => (window as any).gwDemo.passCheck());
  // Wait for the setTimeout inside passCheck (3s) to complete
  await delay(3800);

  // Scroll to the merge button
  await page.locator('#merge-btn').scrollIntoViewIfNeeded();
  await delay(1200);

  // Screenshot: passing state
  await page.screenshot({ path: path.join(__dirname, '../output/03-pr-passing.png'), fullPage: false });
  await delay(1000);

  // Verify the merge button is now enabled
  await expect(page.locator('#merge-btn')).not.toBeDisabled();
  await expect(page.locator('#merge-btn')).toHaveClass(/enabled/);

  // Hover the merge button to show it's live
  await page.locator('#merge-btn').hover();
  await delay(1500);

  // Full-page screenshot of the resolved state
  await page.screenshot({ path: path.join(__dirname, '../output/03-pr-resolved.png'), fullPage: true });
});
