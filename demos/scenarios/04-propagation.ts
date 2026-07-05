/**
 * Scenario 4 — The Propagation
 *
 * Split terminal (top/bottom). Dev 1 ends a Claude Code session — Groundwork
 * extracts 3 new decisions and propagates them. Dev 2 immediately starts a new
 * session and asks about the notification system. Their AI responds citing the
 * team decisions Dev 1 just made — without Dev 2 having mentioned any of them.
 *
 * Duration: ~55 seconds
 * Run:  npm run demo:propagate
 * Record: asciinema rec --cols 160 --rows 52 -t "Groundwork — Propagation" output/04-propagation.cast -- ts-node scenarios/04-propagation.ts
 */

import {
  sleep, write, writeln, typeAt, typeInline,
  move, CLEAR, HIDE_CURSOR, SHOW_CURSOR,
  c, BOLD, RESET_ATTRS,
} from './utils';

// ── Layout ────────────────────────────────────────────────────────────────────

const COLS = 160;
const ROWS = 52;
const DIVIDER_ROW = Math.floor(ROWS / 2) + 1;   // row that splits top/bottom

// Content areas: top panel rows 3..DIVIDER_ROW-2, bottom rows DIVIDER_ROW+2..ROWS-2
function topRow(offset: number)    { return 3  + offset; }
function bottomRow(offset: number) { return DIVIDER_ROW + 2 + offset; }

// ── Chrome ────────────────────────────────────────────────────────────────────

function drawChrome(): void {
  write(CLEAR + HIDE_CURSOR);

  // Title bar
  const title = '  Groundwork — Decision Propagation  ';
  const pad   = Math.floor((COLS - title.length) / 2);
  write(move(1, 1) + ' '.repeat(COLS));
  write(move(1, pad) + c.bold(c.success(title)));

  // Divider line
  write(move(DIVIDER_ROW, 1) + c.muted('─'.repeat(COLS)));

  // Panel labels
  write(move(2, 2) + c.bold(c.info('▌ Dev 1 — Claude Code session')));
  write(move(DIVIDER_ROW + 1, 2) + c.bold(c.info('▌ Dev 2 — Cursor session')));

  // Bottom bar
  write(move(ROWS, 1) + c.muted('─'.repeat(COLS)));
  write(move(ROWS, 2) + c.muted(' groundwork.dev — zero-latency decision propagation '));
}

// ── Dev 1 — session end + extraction ─────────────────────────────────────────

async function dev1(): Promise<void> {
  const r = (offset: number) => topRow(offset);

  write(move(r(0), 2) + c.muted('[Claude Code session ended — 10:47am]'));
  await sleep(800);

  write(move(r(2), 2) + c.info('  ↻ ') + c.white('Groundwork processing session...'));
  await sleep(1200);

  // Spinner effect
  const spinChars = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
  for (let i = 0; i < 14; i++) {
    write(move(r(2), 2) + c.info('  ' + spinChars[i % spinChars.length] + ' ') + c.white('Groundwork processing session...'));
    await sleep(100);
  }

  write(move(r(2), 2) + c.success('  ✓ ') + c.white('Groundwork processing session complete'));
  await sleep(400);

  // Decisions extracted
  write(move(r(4), 2) + c.success('  ✓ ') + c.white('3 decisions extracted:'));
  await sleep(300);

  const decisions = [
    { id: 'D012', text: 'WebSocket for real-time notifications' },
    { id: 'D013', text: 'Store notification read state in Redis' },
    { id: 'D014', text: 'Retry failed notifications via BullMQ queue' },
  ];

  for (let i = 0; i < decisions.length; i++) {
    await sleep(350);
    write(move(r(5 + i), 5));
    write(c.success('✓') + '  ' + c.muted(decisions[i].id + ':') + '  ' + c.white(decisions[i].text));
  }

  await sleep(600);
  write(move(r(9), 2) + c.success('  ✓ ') + c.white('Propagating to team graph...'));
  await sleep(500);

  // Propagation animation
  const teammates = 4;
  for (let i = 0; i < teammates; i++) {
    write(move(r(9), 2) + c.success('  ✓ ') + c.white(`Propagating to team graph (${i + 1}/${teammates} teammates)...`));
    await sleep(180);
  }

  write(move(r(9), 2) + c.success('  ✓ ') + c.white('Propagating to team graph... ') + c.success('done'));
  await sleep(300);
  write(move(r(10), 2) + c.success('  ✓ ') + c.white('4 teammates will receive these constraints'));

  await sleep(800);
}

// ── Dev 2 — new session picks up propagated decisions ────────────────────────

async function dev2(): Promise<void> {
  const r = (offset: number) => bottomRow(offset);

  // Prompt
  write(move(r(0), 2));
  await typeInline(c.success('~/acme-app') + c.white(' $ '), (s) => s, { jitter: false });
  await typeInline('claude', c.white, { jitter: true });
  write(move(r(1), 2));
  await sleep(400);

  // Dev 2 types question
  write(move(r(1), 2) + c.muted('> '));
  await typeInline(
    'I need to build the notification delivery system. What approach should I use?',
    c.white,
    { jitter: true }
  );
  await sleep(300);
  write('\n');
  await sleep(800);

  // AI "thinking" spinner
  const spinChars = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
  for (let i = 0; i < 10; i++) {
    write(move(r(2), 2) + c.muted(spinChars[i % spinChars.length] + ' Claude is thinking...'));
    await sleep(120);
  }
  write(move(r(2), 2) + ' '.repeat(40));

  // AI responds with team decisions embedded
  await sleep(200);

  const RESPONSE_LINES = [
    { text: 'Based on your team\'s established decisions, here\'s', color: c.white },
    { text: 'the approach for the notification delivery system:', color: c.white },
    { text: '', color: c.white },
    { text: '• Transport: WebSocket', color: c.success,
      tail: c.muted(' (your team decided this today,') },
    { text: '  D012 — chosen for real-time delivery without polling)', color: c.muted },
    { text: '', color: c.white },
    { text: '• Read state storage: Redis', color: c.success,
      tail: c.muted(' (D013 — fast reads,') },
    { text: '  no DB load for notification status)', color: c.muted },
    { text: '', color: c.white },
    { text: '• Failed delivery: BullMQ retry queue', color: c.success,
      tail: c.muted(' (D014 — ensures') },
    { text: '  delivery guarantees with exponential backoff)', color: c.muted },
    { text: '', color: c.white },
    { text: 'Here\'s the implementation following these constraints...', color: c.white },
  ] as const;

  for (let i = 0; i < RESPONSE_LINES.length; i++) {
    const line = RESPONSE_LINES[i];
    write(move(r(3 + i), 2));
    write(line.color(line.text));
    if ('tail' in line && line.tail) write(line.tail);
    await sleep(i === 0 ? 200 : 120 + Math.random() * 80);
  }

  await sleep(1200);
}

// ── Caption ───────────────────────────────────────────────────────────────────

async function caption(): Promise<void> {
  const captionRow = ROWS - 1;
  const msg = 'Dev 1 decided. Dev 2\'s AI already knew. Zero communication required.';
  const pad = Math.floor((COLS - msg.length) / 2);
  write(move(captionRow, 1) + ' '.repeat(COLS));
  write(move(captionRow, pad) + c.bold(c.success(msg)));
  await sleep(2500);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  process.stdout.write('\x1b[8;' + ROWS + ';' + COLS + 't');
  await sleep(300);

  drawChrome();
  await sleep(600);

  await dev1();
  await sleep(1500); // brief pause before Dev 2 starts
  await dev2();
  await caption();

  write(SHOW_CURSOR + '\n');
}

main().catch(err => {
  write(SHOW_CURSOR);
  console.error(err);
  process.exit(1);
});
