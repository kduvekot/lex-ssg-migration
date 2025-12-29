#!/usr/bin/env node
/**
 * generate-report.js
 * Generates an HTML report from comparison results
 * 
 * Usage:
 *   node scripts/generate-report.js \
 *     --results="comparison/results.json" \
 *     --output="comparison/report.html"
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace('--', '').split('=');
  acc[key] = value;
  return acc;
}, {});

const RESULTS_PATH = args['results'] || 'comparison/results.json';
const OUTPUT_PATH = args['output'] || 'comparison/report.html';

function generateReport() {
  console.log('\n📄 Generating Comparison Report');
  console.log(`   Results: ${RESULTS_PATH}`);
  console.log(`   Output: ${OUTPUT_PATH}\n`);

  if (!fs.existsSync(RESULTS_PATH)) {
    console.error('   ❌ Results file not found');
    process.exit(1);
  }

  const results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));

  // Sort diffs by percentage (highest first)
  const sortedDiffs = Object.entries(results.diffs || {})
    .sort((a, b) => {
      const pctA = a[1].percentage ?? -1;
      const pctB = b[1].percentage ?? -1;
      return pctB - pctA;
    });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Comparison Report</title>
  <style>
    :root {
      --excellent: #22c55e;
      --good: #eab308;
      --acceptable: #f97316;
      --needs-work: #ef4444;
      --significant: #dc2626;
      --error: #6b7280;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f3f4f6;
      color: #1f2937;
      line-height: 1.5;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    h1 {
      font-size: 1.875rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    .timestamp {
      color: #6b7280;
      margin-bottom: 2rem;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .summary-card {
      background: white;
      border-radius: 0.5rem;
      padding: 1rem;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .summary-card .count {
      font-size: 2rem;
      font-weight: 700;
    }
    
    .summary-card .label {
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .summary-card.excellent .count { color: var(--excellent); }
    .summary-card.good .count { color: var(--good); }
    .summary-card.acceptable .count { color: var(--acceptable); }
    .summary-card.needs-work .count { color: var(--needs-work); }
    .summary-card.significant .count { color: var(--significant); }
    
    .results {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .result-row {
      background: white;
      border-radius: 0.5rem;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      cursor: pointer;
    }
    
    .result-name {
      font-weight: 600;
    }
    
    .result-percentage {
      font-weight: 700;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
    }
    
    .result-percentage.excellent { background: #dcfce7; color: var(--excellent); }
    .result-percentage.good { background: #fef9c3; color: #a16207; }
    .result-percentage.acceptable { background: #ffedd5; color: #c2410c; }
    .result-percentage.needs-work { background: #fee2e2; color: var(--needs-work); }
    .result-percentage.significant { background: #fee2e2; color: var(--significant); }
    .result-percentage.error { background: #f3f4f6; color: var(--error); }
    
    .result-details {
      display: none;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }
    
    .result-row.expanded .result-details {
      display: block;
    }
    
    .result-images {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    
    .image-container {
      text-align: center;
    }
    
    .image-container img {
      max-width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: 0.25rem;
    }
    
    .image-container .label {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.5rem;
    }
    
    .meta {
      display: flex;
      gap: 2rem;
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.5rem;
    }
    
    .expand-icon {
      transition: transform 0.2s;
    }
    
    .result-row.expanded .expand-icon {
      transform: rotate(180deg);
    }
    
    @media (max-width: 768px) {
      .result-images {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Visual Comparison Report</h1>
    <p class="timestamp">Generated: ${results.timestamp || new Date().toISOString()}</p>
    
    <div class="summary">
      <div class="summary-card">
        <div class="count">${results.summary?.total || 0}</div>
        <div class="label">Total</div>
      </div>
      <div class="summary-card excellent">
        <div class="count">${results.summary?.excellent || 0}</div>
        <div class="label">Excellent (&lt;1%)</div>
      </div>
      <div class="summary-card good">
        <div class="count">${results.summary?.good || 0}</div>
        <div class="label">Good (&lt;2%)</div>
      </div>
      <div class="summary-card acceptable">
        <div class="count">${results.summary?.acceptable || 0}</div>
        <div class="label">Acceptable (&lt;5%)</div>
      </div>
      <div class="summary-card needs-work">
        <div class="count">${results.summary?.needs_work || 0}</div>
        <div class="label">Needs Work</div>
      </div>
      <div class="summary-card significant">
        <div class="count">${results.summary?.significant || 0}</div>
        <div class="label">Significant</div>
      </div>
    </div>
    
    <div class="results">
      ${sortedDiffs.map(([filename, diff]) => `
        <div class="result-row" onclick="this.classList.toggle('expanded')">
          <div class="result-header">
            <span class="result-name">${filename}</span>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="result-percentage ${diff.category || 'error'}">
                ${diff.percentage !== null && diff.percentage !== undefined
                  ? `${diff.percentage.toFixed(2)}%`
                  : diff.error || 'Error'}
              </span>
              <span class="expand-icon">▼</span>
            </div>
          </div>
          <div class="result-details">
            ${diff.error 
              ? `<p style="color: var(--error)">Error: ${diff.error}</p>`
              : `
                <div class="meta">
                  <span>Diff pixels: ${diff.diffPixels?.toLocaleString() || 'N/A'}</span>
                  <span>Total pixels: ${diff.totalPixels?.toLocaleString() || 'N/A'}</span>
                  <span>Size match: ${diff.sizeMatch ? 'Yes' : 'No'}</span>
                </div>
                <div class="result-images">
                  <div class="image-container">
                    <img src="./baseline/${filename}" alt="Baseline" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22100%22><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 fill=%22%23999%22>Not found</text></svg>'">
                    <div class="label">Baseline (Original)</div>
                  </div>
                  <div class="image-container">
                    <img src="./current/${filename}" alt="Current" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22100%22><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 fill=%22%23999%22>Not found</text></svg>'">
                    <div class="label">Current (Eleventy)</div>
                  </div>
                  <div class="image-container">
                    <img src="./diffs/diff-${filename}" alt="Diff" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22100%22><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 fill=%22%23999%22>Not found</text></svg>'">
                    <div class="label">Difference</div>
                  </div>
                </div>
              `
            }
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, html);

  console.log(`   ✓ Report generated: ${OUTPUT_PATH}\n`);
}

// Run
generateReport();
