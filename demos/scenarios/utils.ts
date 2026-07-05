/**
 * Shared terminal animation utilities for Groundwork demo scenarios.
 * All scenarios import from here to keep typing/color behaviour consistent.
 */
import chalk from 'chalk';

// ─── ANSI helpers ─────────────────────────────────────────────────────────────

export const ESC = '\x1b';
export const CLEAR         = `${ESC}[2J${ESC}[H`;
export const HIDE_CURSOR   = `${ESC}[?25l`;
export const SHOW_CURSOR   = `${ESC}[?25h`;
export const RESET_ATTRS   = `${ESC}[0m`;
export const BOLD          = `${ESC}[1m`;
export const DIM           = `${ESC}[2m`;
export const STRIKETHROUGH = `${ESC}[9m`;
export const NO_STRIKE     = `${ESC}[29m`;

export const move = (row: number, col: number) => `${ESC}[${row};${col}H`;
export const clearLine = () => `${ESC}[2K`;
export const saveCursor   = () => `${ESC}[s`;
export const restoreCursor = () => `${ESC}[u`;

// ─── Brand colours ────────────────────────────────────────────────────────────

export const c = {
  success:  (s: string) => chalk.hex('#00ff88')(s),
  error:    (s: string) => chalk.hex('#ff4444')(s),
  warn:     (s: string) => chalk.hex('#ffcc00')(s),
  info:     (s: string) => chalk.hex('#5b8cff')(s),
  muted:    (s: string) => chalk.hex('#555555')(s),
  white:    (s: string) => chalk.hex('#e0e0e0')(s),
  bold:     (s: string) => chalk.bold(s),
  dim:      (s: string) => chalk.dim(s),
  strike:   (s: string) => chalk.strikethrough(s),
  p0:       (s: string) => chalk.hex('#ff4444').bold(s),
  p1:       (s: string) => chalk.hex('#ffcc00').bold(s),
};

// ─── Timing ───────────────────────────────────────────────────────────────────

export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/**
 * Returns a random inter-character delay in ms, simulating human typing.
 * Occasionally (5 % chance) inserts a "thinking pause" of 300–800 ms.
 */
export function typingDelay(thinking = true): number {
  if (thinking && Math.random() < 0.05) return 300 + Math.random() * 500;
  return 30 + Math.random() * 30; // 30–60 ms per char
}

// ─── Writing helpers ──────────────────────────────────────────────────────────

/** Write a string directly to stdout. */
export const write = (s: string) => process.stdout.write(s);

/** Write a full line and move to next line. */
export const writeln = (s = '') => process.stdout.write(s + '\n');

/**
 * Simulate a human typing `text` at a specific terminal position.
 * @param row  1-based terminal row
 * @param col  1-based terminal column
 * @param text Characters to type
 * @param colorFn  Optional chalk function applied to each character
 */
export async function typeAt(
  row: number,
  col: number,
  text: string,
  colorFn: (s: string) => string = (s) => s,
  opts: { jitter?: boolean; baseMs?: number } = {}
): Promise<void> {
  const { jitter = true, baseMs = 40 } = opts;
  let c2 = col;
  for (const ch of text) {
    write(move(row, c2) + colorFn(ch));
    c2++;
    const delay = jitter ? typingDelay() : baseMs;
    await sleep(delay);
  }
}

/**
 * Print each character of `text` in the current cursor position (inline),
 * useful when you don't need positional control.
 */
export async function typeInline(
  text: string,
  colorFn: (s: string) => string = (s) => s,
  opts: { jitter?: boolean } = {}
): Promise<void> {
  const { jitter = true } = opts;
  for (const ch of text) {
    write(colorFn(ch));
    await sleep(jitter ? typingDelay() : 40);
  }
}

/**
 * Simulate a backspace-and-retype correction — makes the typing look human.
 * @param col  Starting column of the text to retype
 * @param row  Terminal row
 * @param wrong  What was (mis)typed
 * @param right  The corrected version
 */
export async function backspaceCorrect(
  row: number,
  col: number,
  wrong: string,
  right: string
): Promise<void> {
  // Erase wrong text with spaces
  write(move(row, col));
  for (let i = 0; i < wrong.length; i++) {
    write(' ');
    await sleep(40);
  }
  // Retype correct text
  await typeAt(row, col, right, (s) => s);
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

/** Draw a horizontal rule using box-drawing chars. */
export function hRule(width: number, char = '─', startCol = 1) {
  return move(0, startCol) + char.repeat(width);
}

/**
 * Draw a bordered box.
 * Returns the content area start row and col for callers to fill in.
 */
export function drawBox(
  row: number,
  col: number,
  width: number,
  height: number,
  title = '',
  borderColor: (s: string) => string = c.muted
): void {
  const top    = '┌' + (title ? `─ ${title} ` : '') + '─'.repeat(Math.max(0, width - 2 - (title ? title.length + 4 : 0))) + '┐';
  const bottom = '└' + '─'.repeat(width - 2) + '┘';
  const mid    = '│' + ' '.repeat(width - 2) + '│';

  write(move(row, col) + borderColor(top));
  for (let r = 1; r < height - 1; r++) {
    write(move(row + r, col) + borderColor(mid));
  }
  write(move(row + height - 1, col) + borderColor(bottom));
}

/** Print a status line: ✓  label  (in green) */
export const successLine = (label: string) => c.success('  ✓ ') + c.white(label);
/** Print a status line: ✗  label  (in red) */
export const errorLine   = (label: string) => c.error('  ✗ ') + c.white(label);
/** Print a status line: ⚠  label  (in yellow) */
export const warnLine    = (label: string) => c.warn('  ⚠ ') + c.white(label);
/** Print a status line: ↻  label  (in blue) */
export const infoLine    = (label: string) => c.info('  ↻ ') + c.white(label);
