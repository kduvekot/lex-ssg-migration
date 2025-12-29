#!/usr/bin/env node
/**
 * capture-screenshots.js
 * Captures screenshots of all pages at multiple viewports using Playwright
 * 
 * Usage:
 *   node scripts/capture-screenshots.js --base-url="http://localhost:8080" --output-dir="comparison/baseline"
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace('--', '').split('=');
  acc[key] = value;
  return acc;
}, {});

const BASE_URL = args['base-url'] || 'http://localhost:8080';
const OUTPUT_DIR = args['output-dir'] || 'comparison/screenshots';
const SOURCE = args['source'] || 'unknown';

// Load configuration
const viewportsPath = path.join(__dirname, '..', 'viewports.json');
const urlsPath = path.join(__dirname, '..', 'urls.json');

const viewports = fs.existsSync(viewportsPath) 
  ? JSON.parse(fs.readFileSync(viewportsPath, 'utf8'))
  : {
      "mobile": { "width": 375, "height": 812 },
      "tablet": { "width": 768, "height": 1024 },
      "desktop": { "width": 1024, "height": 768 },
      "wide": { "width": 1440, "height": 900 },
      "ultrawide": { "width": 1920, "height": 1080 }
    };

const urls = fs.existsSync(urlsPath)
  ? JSON.parse(fs.readFileSync(urlsPath, 'utf8'))
  : [
      { "path": "/", "name": "home" },
      { "path": "/over-mij/", "name": "over-mij" },
      { "path": "/behandeling/", "name": "behandeling" },
      { "path": "/aanmelding/", "name": "aanmelding" },
      { "path": "/tarieven-en-vergoeding/", "name": "tarieven" },
      { "path": "/cursussen/", "name": "cursussen" },
      { "path": "/werkwijze/", "name": "werkwijze" },
      { "path": "/werk/", "name": "werk" },
      { "path": "/sport/", "name": "sport" },
      { "path": "/gezondheid/", "name": "gezondheid" },
      { "path": "/running-therapie/", "name": "running-therapie" },
      { "path": "/contact/", "name": "contact" },
      { "path": "/privacy/", "name": "privacy" },
      { "path": "/disclaimer/", "name": "disclaimer" }
    ];

async function captureScreenshots() {
  console.log(`\n📸 Screenshot Capture`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Output: ${OUTPUT_DIR}`);
  console.log(`   Source: ${SOURCE}`);
  console.log(`   Pages: ${urls.length}`);
  console.log(`   Viewports: ${Object.keys(viewports).length}`);
  console.log(`   Total screenshots: ${urls.length * Object.keys(viewports).length}\n`);

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {
    source: SOURCE,
    baseUrl: BASE_URL,
    timestamp: new Date().toISOString(),
    screenshots: []
  };

  for (const url of urls) {
    for (const [viewportName, viewport] of Object.entries(viewports)) {
      const filename = `${url.name}-${viewportName}.png`;
      const filepath = path.join(OUTPUT_DIR, filename);
      const fullUrl = `${BASE_URL}${url.path}`;

      try {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          deviceScaleFactor: 1,
        });

        const page = await context.newPage();
        
        // Navigate and wait for content
        await page.goto(fullUrl, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });

        // Wait for fonts to load
        await page.waitForTimeout(1000);

        // Hide cookie consent banners and other overlays
        await page.evaluate(() => {
          const selectors = [
            '.cookie-consent',
            '.cookie-banner',
            '#cookie-notice',
            '.cmplz-cookiebanner',
            '[class*="cookie"]',
            '[id*="cookie"]',
            '.gdpr',
            '#gdpr',
          ];
          selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
              el.style.display = 'none';
            });
          });
        });

        // Capture full page screenshot
        await page.screenshot({
          path: filepath,
          fullPage: true
        });

        console.log(`   ✓ ${filename}`);
        results.screenshots.push({
          name: url.name,
          viewport: viewportName,
          filename,
          url: fullUrl,
          success: true
        });

        await context.close();

      } catch (error) {
        console.error(`   ✗ ${filename}: ${error.message}`);
        results.screenshots.push({
          name: url.name,
          viewport: viewportName,
          filename,
          url: fullUrl,
          success: false,
          error: error.message
        });
      }
    }
  }

  await browser.close();

  // Write results manifest
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2));

  const successCount = results.screenshots.filter(s => s.success).length;
  const failCount = results.screenshots.filter(s => !s.success).length;

  console.log(`\n📊 Complete: ${successCount} succeeded, ${failCount} failed`);
  console.log(`   Manifest: ${manifestPath}\n`);

  return results;
}

// Run
captureScreenshots().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
