/**
 * Scenario 2 — The Onboarding Scan
 *
 * Developer runs `groundwork init` in a fresh project. Shows real-time file
 * discovery, a smooth animated progress bar, then decisions populating one by
 * one. Developer approves all findings. Ends with a clean summary.
 *
 * Duration: ~60 seconds
 * Run:  npm run demo:onboard
 * Record: asciinema rec --cols 120 --rows 48 -t "Groundwork — Onboarding Scan" output/02-onboarding-scan.cast -- ts-node scenarios/02-onboarding-scan.ts
 */

import { SingleBar, Presets } from 'cli-progress';
import {
  sleep, write, writeln, typeInline,
  CLEAR, HIDE_CURSOR, SHOW_CURSOR,
  c, move,
} from './utils';

// ── Data ─────────────────────────────────────────────────────────────────────

const SCAN_STEPS: { symbol: string; text: string; delay: number }[] = [
  { symbol: '✓', text: 'Found CLAUDE.md — reading team instructions',           delay: 420 },
  { symbol: '✓', text: 'Found package.json — scanning 47 dependencies',          delay: 380 },
  { symbol: '✓', text: 'Found prisma/schema.prisma — analyzing schema',           delay: 460 },
  { symbol: '↻', text: 'Scanning repository AST (50 files)...',                   delay: 1800 },
  { symbol: '✓', text: 'Reading git history (last 90 days)',                      delay: 520 },
  { symbol: '✓', text: 'Reading .github/workflows/ci.yml',                        delay: 300 },
];

const AUTO_APPROVED: { priority: string; domain: string; text: string }[] = [
  { priority: 'P0', domain: 'Schema',     text: 'User IDs are UUID v4 strings'              },
  { priority: 'P0', domain: 'Auth',       text: 'JWT tokens, Bearer scheme, 24h expiry'     },
  { priority: 'P0', domain: 'ORM',        text: 'Prisma — no raw SQL permitted'             },
  { priority: 'P0', domain: 'Payments',   text: 'Stripe Payment Intents API'                },
  { priority: 'P0', domain: 'API',        text: 'REST with OpenAPI spec, versioned /v1/'    },
  { priority: 'P0', domain: 'Security',   text: 'bcrypt for password hashing'               },
  { priority: 'P1', domain: 'Testing',    text: 'Vitest with co-located test files'         },
  { priority: 'P1', domain: 'State',      text: 'Zustand — no Redux or Context for state'   },
  { priority: 'P1', domain: 'Styling',    text: 'Tailwind CSS only — no CSS-in-JS'          },
  { priority: 'P1', domain: 'Framework',  text: 'Next.js App Router — no pages/ dir'        },
  { priority: 'P1', domain: 'Linting',    text: 'ESLint + Prettier, enforced in CI'         },
  { priority: 'P1', domain: 'Database',   text: 'PostgreSQL 15 + pgvector for embeddings'   },
  { priority: 'P2', domain: 'Infra',      text: 'Docker Compose for local dev'              },
  { priority: 'P2', domain: 'Deploy',     text: 'Railway for staging, Vercel for frontend'  },
  { priority: 'P2', domain: 'Monitoring', text: 'Sentry for error tracking'                 },
];

const NEEDS_REVIEW: { text: string; confidence: string }[] = [
  { text: 'API response shape: { data, error }',   confidence: '0.78' },
  { text: 'Rate limit: 100 req/min per user',       confidence: '0.71' },
  { text: 'Cache layer: Redis for session tokens',  confidence: '0.68' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

let currentRow = 1;

function println(text = '', indent = 0) {
  write(move(currentRow, 1 + indent) + text + '\n');
  currentRow++;
}

function blank(n = 1) {
  for (let i = 0; i < n; i++) println();
}

function header(text: string) {
  const bar = '─'.repeat(4);
  write(move(currentRow, 1) + c.muted('  ' + bar + '  ') + c.bold(c.white(text)) + c.muted('  ' + bar) + '\n');
  currentRow++;
}

function priorityBadge(p: string): string {
  if (p === 'P0') return c.p0('[P0]');
  if (p === 'P1') return c.p1('[P1]');
  return c.dim('[P2]');
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  write(CLEAR + HIDE_CURSOR);
  await sleep(400);

  // ── Prompt ────────────────────────────────────────────────────────────────

  blank(1);
  write(move(currentRow, 1));
  await typeInline(c.success('~/acme-app') + c.white(' $ '), (s) => s, { jitter: false });
  await typeInline('groundwork init', c.white);
  writeln();
  currentRow++;
  blank(1);

  // ── Header ───────────────────────────────────────────────────────────────

  const LOGO = [
    '  ╔═══════════════════════════════════════╗',
    '  ║   ░░  Groundwork  ░░                  ║',
    '  ║   Architectural decisions, enforced.  ║',
    '  ╚═══════════════════════════════════════╝',
  ];
  for (const line of LOGO) {
    println(c.success(line));
    await sleep(60);
  }
  blank(1);

  // ── Discovery ─────────────────────────────────────────────────────────────

  println(c.bold(c.white('  Groundwork — initializing project scan')));
  blank(1);

  for (const step of SCAN_STEPS) {
    const sym = step.symbol === '✓' ? c.success(step.symbol) : c.info(step.symbol);
    write(move(currentRow, 1) + '  ' + sym + '  ' + c.white(step.text) + '\n');
    currentRow++;
    await sleep(step.delay);
  }

  blank(1);

  // ── Progress bar ──────────────────────────────────────────────────────────

  write(move(currentRow, 1));
  const progressLabel = '  Classifying 51 findings...';
  write(c.white(progressLabel) + '  ');
  currentRow++;

  // cli-progress bar — custom format to match brand
  const bar = new SingleBar({
    format: '  ' + c.success('{bar}') + '  {percentage}%',
    barCompleteChar: '█',
    barIncompleteChar: '░',
    hideCursor: true,
    clearOnComplete: false,
    barsize: 36,
  }, Presets.shades_classic);

  bar.start(100, 0);
  for (let pct = 0; pct <= 100; pct++) {
    bar.update(pct);
    await sleep(18 + Math.random() * 12);
  }
  bar.stop();
  currentRow++; // bar wrote to current row
  blank(1);

  // ── Auto-approved decisions ───────────────────────────────────────────────

  println(c.bold(c.success('  AUTO-APPROVED') + c.muted(' (confidence ≥ 0.85) ') + c.white('— ' + AUTO_APPROVED.length + ' decisions')));
  blank();

  for (const d of AUTO_APPROVED) {
    write(move(currentRow, 1));
    write('  ' + c.success('✓') + '  ' + priorityBadge(d.priority) + '  ' + c.muted(d.domain + ':') + '  ' + c.white(d.text) + '\n');
    currentRow++;
    await sleep(70 + Math.random() * 60);
  }

  blank();
  println('  ' + c.muted('  ... ' + (31 - AUTO_APPROVED.length) + ' more (run `groundwork status --all` to view)'));
  blank();

  // ── Needs review ─────────────────────────────────────────────────────────

  println(c.bold(c.warn('  NEEDS REVIEW') + c.muted(' (confidence < 0.85) ') + c.white('— ' + NEEDS_REVIEW.length + ' decisions')));
  blank();

  for (const d of NEEDS_REVIEW) {
    write(move(currentRow, 1));
    const conf = parseFloat(d.confidence) >= 0.75 ? c.warn(d.confidence) : c.error(d.confidence);
    write('  ' + c.warn('?') + '  ' + c.white(d.text) + '  ' + c.muted('[conf: ') + conf + c.muted(']  ') + c.muted('[y/n/e]') + '\n');
    currentRow++;
    await sleep(120);
  }
  blank();

  // ── Interactive prompt ────────────────────────────────────────────────────

  write(move(currentRow, 1) + '  Approve all? ' + c.muted('[a = yes all / r = review / q = quit]') + '  ');
  await sleep(1200);
  write(c.success('a'));
  writeln();
  currentRow++;
  blank();

  // ── Completion ───────────────────────────────────────────────────────────

  await sleep(400);

  const DONE_LINES = [
    c.success('  ✓ ') + c.white('39 decisions loaded into your Groundwork graph'),
    c.success('  ✓ ') + c.white('Your AI tools will now respect these constraints'),
    c.success('  ✓ ') + c.white('Run: ') + c.info('groundwork connect --all') + c.white(' to activate'),
  ];

  for (const line of DONE_LINES) {
    write(move(currentRow, 1) + line + '\n');
    currentRow++;
    await sleep(300);
  }

  blank();
  println(c.muted('  Setup complete in 38 seconds.'));
  blank();
  write(SHOW_CURSOR + '\n');
}

main().catch(err => {
  write(SHOW_CURSOR);
  console.error(err);
  process.exit(1);
});
