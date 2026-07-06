import { defineConfig } from '@playwright/test';
import * as path from 'path';

const OUT = path.join(__dirname, 'output', 'videos');

export default defineConfig({
  testDir: './scenarios',
  timeout: 60000,
  use: {
    headless: true,
    viewport: { width: 1200, height: 800 },
    video: 'on',
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },
  outputDir: OUT,
  reporter: [['list']],
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
