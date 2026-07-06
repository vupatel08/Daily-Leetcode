/**
 * record-videos.spec.ts
 *
 * Playwright test suite that:
 *  1. Loads each animated demo HTML page
 *  2. Waits for the animation to complete
 *  3. Saves the recorded video as a .webm file
 *
 * Run: npx playwright test demos/scenarios/record-videos.spec.ts --headed=false
 * Playwright automatically saves video to test-results/; we copy them to demos/output/videos/
 */

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const ANIM_DIR = path.join(__dirname, '../animations');
const OUT_DIR  = path.join(__dirname, '../output/videos');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function runAnimation(page: Page, slug: string, durationMs: number): Promise<void> {
  const htmlFile = path.join(ANIM_DIR, `${slug}.html`);
  await page.goto(`file://${htmlFile}`);
  // Give the animation time to fully complete
  await page.waitForTimeout(durationMs);
  // Signal done
  await page.evaluate(() => {
    (window as any).__animDone = true;
  });
}

// Helper to copy the recorded video after each test
async function saveVideo(page: Page, slug: string): Promise<void> {
  const video = page.video();
  if (!video) return;
  const src = await video.path();
  if (!src) return;
  const dest = path.join(OUT_DIR, `${slug}.webm`);
  // Playwright saves after page close — wait for file
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(src)) break;
    await new Promise(r => setTimeout(r, 200));
  }
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  ✓ Saved ${slug}.webm`);
  }
}

// ── Scenario 01: Conflict Catch ─────────────────────────────────────────────

test('01 conflict catch', async ({ page }) => {
  await runAnimation(page, '01-conflict-catch', 22000);
  await page.close();
  await saveVideo(page, '01-conflict-catch');
});

// ── Scenario 02: Onboarding Scan ────────────────────────────────────────────

test('02 onboarding scan', async ({ page }) => {
  await runAnimation(page, '02-onboarding-scan', 28000);
  await page.close();
  await saveVideo(page, '02-onboarding-scan');
});

// ── Scenario 03: PR Check ───────────────────────────────────────────────────

test('03 pr check', async ({ page }) => {
  await runAnimation(page, '03-pr-check', 20000);
  await page.close();
  await saveVideo(page, '03-pr-check');
});

// ── Scenario 04: Propagation ────────────────────────────────────────────────

test('04 propagation', async ({ page }) => {
  await runAnimation(page, '04-propagation', 26000);
  await page.close();
  await saveVideo(page, '04-propagation');
});

// ── Scenario 05: Dashboard ──────────────────────────────────────────────────

test('05 dashboard', async ({ page }) => {
  await runAnimation(page, '05-dashboard', 22000);
  await page.close();
  await saveVideo(page, '05-dashboard');
});

// ── Scenario 06: Context Injection ──────────────────────────────────────────

test('06 context injection', async ({ page }) => {
  await runAnimation(page, '06-context-injection', 20000);
  await page.close();
  await saveVideo(page, '06-context-injection');
});
