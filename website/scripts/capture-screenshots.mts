import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.SCREENSHOT_BASE ?? "http://localhost:3000";
const OUT = path.join(process.cwd(), "public", "screenshots");

const PAGES = [
  { path: "/", name: "home-desktop" },
  { path: "/product", name: "product-desktop" },
  { path: "/blog", name: "blog-desktop" },
  { path: "/docs", name: "docs-desktop" },
  { path: "/demos/injection", name: "injection-demo" },
  { path: "/demos/conflict-alert", name: "conflict-demo" },
  { path: "/demos/decision-timeline", name: "timeline-demo" },
  { path: "/blog/we-lost-two-days-because-tuesday-didnt-know-about-monday", name: "blog-post-desktop" },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });

  for (const page of PAGES) {
    const url = `${BASE}${page.path}`;
    console.log(`Capturing ${url}`);

    await desktop.goto(url, { waitUntil: "networkidle" });
    await desktop.screenshot({ path: path.join(OUT, `${page.name}.png`), fullPage: true });

    if (page.path === "/") {
      await mobile.goto(url, { waitUntil: "networkidle" });
      await mobile.screenshot({ path: path.join(OUT, "home-mobile.png"), fullPage: true });
    }
  }

  await browser.close();
  console.log(`Screenshots saved to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
