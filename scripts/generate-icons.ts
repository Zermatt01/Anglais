/**
 * Generates the application icons (ARC-01, docs/ARCHITECTURE.md §11) from one
 * SVG drawing: a notebook page with lines of blue ink and a red correction tick.
 * Run with `npm run generate:icons`; the results are committed in public/.
 *
 * PNG files are rendered by Playwright's Chromium, already used for the
 * end-to-end tests, so no image library is needed.
 */
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const INK = '#1f4bb3';
const PAPER = '#fbf8f1';
const RULE = '#c9d6ee';
const MARGIN = '#e4a3a0';
const RED_PEN = '#c42b2b';

/**
 * 512 × 512 drawing. Everything meaningful stays inside the central circle of
 * radius 204 px, the safe zone of maskable icons.
 */
function iconSvg(options: { readonly roundedBackground: boolean; readonly size: number }): string {
  const background = options.roundedBackground
    ? `<rect width="512" height="512" rx="112" fill="${INK}"/>`
    : `<rect width="512" height="512" fill="${INK}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${String(options.size)}" height="${String(options.size)}" viewBox="0 0 512 512">
  ${background}
  <rect x="136" y="112" width="240" height="288" rx="24" fill="${PAPER}"/>
  <g stroke-linecap="round" fill="none">
    <path d="M176 112v288" stroke="${MARGIN}" stroke-width="6"/>
    <path d="M192 192h160M192 240h160M192 288h160M192 336h160" stroke="${RULE}" stroke-width="4"/>
    <path d="M200 180h124M200 228h92M200 276h132" stroke="${INK}" stroke-width="14"/>
    <path d="M254 326l26 26 58-70" stroke="${RED_PEN}" stroke-width="16" stroke-linejoin="round"/>
  </g>
</svg>
`;
}

const PNG_ICONS = [
  { file: 'public/pwa-192x192.png', size: 192, roundedBackground: true },
  { file: 'public/pwa-512x512.png', size: 512, roundedBackground: true },
  // Maskable and Apple icons fill the square: the system applies its own shape.
  { file: 'public/maskable-icon-512x512.png', size: 512, roundedBackground: false },
  { file: 'public/apple-touch-icon-180x180.png', size: 180, roundedBackground: false },
] as const;

writeFileSync('public/favicon.svg', iconSvg({ roundedBackground: true, size: 512 }));

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const icon of PNG_ICONS) {
    await page.setViewportSize({ width: icon.size, height: icon.size });
    await page.setContent(
      `<!doctype html><body style="margin:0;background:transparent">${iconSvg(icon)}</body>`,
    );
    await page.screenshot({
      path: icon.file,
      omitBackground: true,
      clip: { x: 0, y: 0, width: icon.size, height: icon.size },
    });
    console.log(`Written ${icon.file}`);
  }
} finally {
  await browser.close();
}
