/**
 * Scenario 1 — The Conflict Catch
 *
 * Split-pane terminal: Dev 1 (Claude Code) on the left types a Prisma UUID
 * schema. Groundwork extracts the decision. Dev 2 (Cursor) on the right starts
 * typing INTEGER — Groundwork fires a conflict warning before the line is done.
 * The wrong line gets struck through; the correct version appears automatically.
 *
 * Duration: ~45 seconds
 * Run:  npm run demo:conflict   (or ts-node scenarios/01-conflict-catch.ts)
 * Record: asciinema rec --cols 200 --rows 50 -t "Groundwork — Conflict Catch" output/01-conflict-catch.cast -- ts-node scenarios/01-conflict-catch.ts
 */

import {
  sleep, write, writeln, typeAt, typeInline,
  move, clearLine, CLEAR, HIDE_CURSOR, SHOW_CURSOR,
  c, STRIKETHROUGH, RESET_ATTRS, BOLD,
} from './utils';

// ── Layout constants ──────────────────────────────────────────────────────────

const COLS     = 200;
const ROWS     = 50;
const HALF     = Math.floor((COLS - 1) / 2);   // ~99
const DIV      = HALF + 1;                       // divider column
const R_START  = HALF + 2;                       // right panel start column

// Base rows for content inside each panel
const PANEL_TOP = 4;

function leftCol(offset = 0)  { return 2 + offset; }
function rightCol(offset = 0) { return R_START + 1 + offset; }

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Draw the full split-pane chrome. */
function drawChrome(): void {
  write(CLEAR + HIDE_CURSOR);

  // Top banner
  const banner = ' GROUNDWORK — Real-time decision enforcement ';
  const pad = Math.floor((COLS - banner.length) / 2);
  write(move(1, 1) + ' '.repeat(COLS));
  write(move(1, pad) + c.bold(c.success(banner)));

  // Divider (vertical bar down the middle)
  for (let r = 2; r <= ROWS - 1; r++) {
    write(move(r, DIV) + c.muted('│'));
  }

  // Panel headers
  const leftHeader  = ' Dev 1 — Claude Code ';
  const rightHeader = ' Dev 2 — Cursor ';

  write(move(2, 2)               + c.bold(c.info('┌─' + leftHeader  + '─'.repeat(HALF - leftHeader.length  - 3) + '┐')));
  write(move(2, R_START)         + c.bold(c.info('┌─' + rightHeader + '─'.repeat(HALF - rightHeader.length - 3) + '┐')));

  // Bottom bar
  write(move(ROWS, 1) + c.muted('─'.repeat(COLS)));
  write(move(ROWS, 2) + c.muted(' groundwork.dev '));
}

/** Print a line in the LEFT panel. */
function leftLine(row: number, text: string, col = 0) {
  write(move(PANEL_TOP + row, leftCol(col)) + text);
}

/** Print a line in the RIGHT panel. */
function rightLine(row: number, text: string, col = 0) {
  write(move(PANEL_TOP + row, rightCol(col)) + text);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  process.stdout.write('\x1b[8;' + ROWS + ';' + COLS + 't'); // resize terminal hint
  await sleep(300);

  drawChrome();
  await sleep(800);

  // ── Left panel: Dev 1 Claude Code session ─────────────────────────────────

  // Show a simplified Prisma schema file in progress
  leftLine(0, c.muted('// prisma/schema.prisma'));
  leftLine(1, '');
  leftLine(2, c.info('model') + ' ' + c.warn('User') + ' {');
  await sleep(600);

  // Dev 1 types the id field — UUID
  leftLine(3, '  ');
  await typeAt(PANEL_TOP + 3, leftCol(2), 'id', c.info);
  await sleep(200);
  await typeAt(PANEL_TOP + 3, leftCol(4), '  String', c.warn);
  await sleep(150);
  await typeAt(PANEL_TOP + 3, leftCol(12), '  @id', c.success);
  await sleep(200);
  await typeAt(PANEL_TOP + 3, leftCol(17), '  @default(uuid())', c.muted);
  await sleep(400);

  // Next field
  leftLine(4, '  ');
  await typeAt(PANEL_TOP + 4, leftCol(2), 'email', c.info);
  await typeAt(PANEL_TOP + 4, leftCol(7), '  String  @unique', c.warn);
  await sleep(200);

  leftLine(5, '  ');
  await typeAt(PANEL_TOP + 5, leftCol(2), 'createdAt', c.info);
  await typeAt(PANEL_TOP + 5, leftCol(11), '  DateTime  @default(now())', c.warn);
  await sleep(300);

  leftLine(6, c.info('}'));
  await sleep(500);

  // ── Groundwork extraction notification (left panel) ───────────────────────

  await sleep(400);
  const notifRow = PANEL_TOP + 9;

  write(move(notifRow, leftCol()));
  write(c.muted('┌─────────────────────────────────────────────────┐'));
  write(move(notifRow + 1, leftCol()));
  write(c.muted('│ ') + c.success('✓ Groundwork') + c.muted(' Decision extracted               │'));
  write(move(notifRow + 2, leftCol()));
  write(c.muted('│   ') + c.white('User IDs are UUID v4 strings') + c.muted('             │'));
  write(move(notifRow + 3, leftCol()));
  write(c.muted('│   ') + c.dim('confidence: ') + c.success('0.97') + c.muted(' · D004 · Schema      │'));
  write(move(notifRow + 4, leftCol()));
  write(c.muted('└─────────────────────────────────────────────────┘'));

  await sleep(1200);

  // ── Right panel: Dev 2 Cursor session ─────────────────────────────────────

  rightLine(0, c.muted('// billing/schema.ts'));
  rightLine(1, '');
  rightLine(2, c.muted('// Billing schema — user reference'));
  await sleep(500);

  rightLine(3, '');
  rightLine(4, c.info('interface') + ' ' + c.warn('BillingRecord') + ' {');
  await sleep(300);

  // Dev 2 starts typing user_id INTEGER — this violates D004
  rightLine(5, '  ');
  await typeAt(PANEL_TOP + 5, rightCol(2), 'user_id', c.info);
  await sleep(300);
  await typeAt(PANEL_TOP + 5, rightCol(9), ': ', c.muted);
  // Typing "INTEG..." — conflict fires before "ER" is typed
  await typeAt(PANEL_TOP + 5, rightCol(11), 'INTEG', c.warn);
  await sleep(180);

  // ── CONFLICT FIRES mid-typing ─────────────────────────────────────────────

  const alertStart = PANEL_TOP + 13;

  write(move(alertStart,     rightCol()) + c.error('╔══════════════════════════════════════════════════╗'));
  write(move(alertStart + 1, rightCol()) + c.error('║') + c.error(BOLD + '  ⚠  GROUNDWORK CONFLICT DETECTED' + RESET_ATTRS) + c.error('               ║'));
  write(move(alertStart + 2, rightCol()) + c.error('╠══════════════════════════════════════════════════╣'));
  write(move(alertStart + 3, rightCol()) + c.error('║') + c.white('  Decision D004: User IDs are UUID v4 strings   ') + c.error('║'));
  write(move(alertStart + 4, rightCol()) + c.error('║') + c.muted('  Decided by: Dev 1 — today at 10:32am          ') + c.error('║'));
  write(move(alertStart + 5, rightCol()) + c.error('║') + c.warn('  Your code uses INTEGER — violates D004         ') + c.error('║'));
  write(move(alertStart + 6, rightCol()) + c.error('║') + '                                                  ' + c.error('║'));
  write(move(alertStart + 7, rightCol()) + c.error('║') + c.muted('  Fix: ') + c.success('String @id @default(uuid())') + c.muted('           ') + c.error('║'));
  write(move(alertStart + 8, rightCol()) + c.error('╚══════════════════════════════════════════════════╝'));

  await sleep(1500);

  // ── Strike through wrong line and replace ─────────────────────────────────

  // Overwrite wrong line with strikethrough styling
  write(move(PANEL_TOP + 5, rightCol(2)));
  write(c.error(STRIKETHROUGH + 'user_id: INTEGER' + RESET_ATTRS));
  await sleep(900);

  // Clear the struck line, type the correct one
  write(move(PANEL_TOP + 5, rightCol(2)) + ' '.repeat(40));
  await sleep(300);
  await typeAt(PANEL_TOP + 5, rightCol(2), 'userId', c.info);
  await typeAt(PANEL_TOP + 5, rightCol(8), '  String  ', c.warn);
  await typeAt(PANEL_TOP + 5, rightCol(18), '@default(uuid())', c.success);
  await sleep(600);

  // Close the box
  rightLine(6, c.info('}'));

  // ── Resolution banner ─────────────────────────────────────────────────────

  await sleep(600);
  const resolveRow = PANEL_TOP + 22;
  write(move(resolveRow, 2));
  write(c.success('─'.repeat(COLS - 3)));
  write(move(resolveRow + 1, 2));

  const msg = '  ✓  Conflict resolved before a single wrong line was committed.  ';
  const resolveMsg = c.bold(c.success(msg));
  const msgPad = Math.floor((COLS - msg.length) / 2);
  write(move(resolveRow + 1, msgPad) + resolveMsg);
  write(move(resolveRow + 2, 2));
  write(c.success('─'.repeat(COLS - 3)));

  await sleep(2000);
  write(SHOW_CURSOR + '\n');
}

main().catch(err => {
  write(SHOW_CURSOR);
  console.error(err);
  process.exit(1);
});
