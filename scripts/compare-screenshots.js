#!/usr/bin/env node
/**
 * compare-screenshots.js
 * Compares baseline and current screenshots using pixelmatch
 * 
 * Usage:
 *   node scripts/compare-screenshots.js \
 *     --baseline-dir="comparison/baseline" \
 *     --current-dir="comparison/current" \
 *     --diff-dir="comparison/diffs" \
 *     --output-json="comparison/results.json"
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace('--', '').split('=');
  acc[key] = value;
  return acc;
}, {});

const BASELINE_DIR = args['baseline-dir'] || 'comparison/baseline';
const CURRENT_DIR = args['current-dir'] || 'comparison/current';
const DIFF_DIR = args['diff-dir'] || 'comparison/diffs';
const OUTPUT_JSON = args['output-json'] || 'comparison/results.json';

// Thresholds for categorization
const THRESHOLDS = {
  excellent: 1,    // < 1% diff
  good: 2,         // < 2% diff
  acceptable: 5,   // < 5% diff
  needsWork: 10    // < 10% diff
  // > 10% = significant
};

function compareImages(baselinePath, currentPath, diffPath) {
  return new Promise((resolve, reject) => {
    try {
      // Check if files exist
      if (!fs.existsSync(baselinePath)) {
        resolve({ error: 'baseline_missing', percentage: null });
        return;
      }
      if (!fs.existsSync(currentPath)) {
        resolve({ error: 'current_missing', percentage: null });
        return;
      }

      const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
      const current = PNG.sync.read(fs.readFileSync(currentPath));

      // Handle size differences
      const width = Math.max(baseline.width, current.width);
      const height = Math.max(baseline.height, current.height);

      // Create normalized images if sizes differ
      let baselineData = baseline.data;
      let currentData = current.data;

      if (baseline.width !== width || baseline.height !== height) {
        baselineData = resizeImage(baseline, width, height);
      }
      if (current.width !== width || current.height !== height) {
        currentData = resizeImage(current, width, height);
      }

      const diff = new PNG({ width, height });

      const numDiffPixels = pixelmatch(
        baselineData,
        currentData,
        diff.data,
        width,
        height,
        { 
          threshold: 0.1,
          includeAA: false,
          alpha: 0.3,
          diffColor: [255, 0, 0],
          diffColorAlt: [0, 255, 0]
        }
      );

      // Save diff image
      fs.mkdirSync(path.dirname(diffPath), { recursive: true });
      fs.writeFileSync(diffPath, PNG.sync.write(diff));

      const totalPixels = width * height;
      const percentage = (numDiffPixels / totalPixels) * 100;

      resolve({
        diffPixels: numDiffPixels,
        totalPixels,
        percentage: Math.round(percentage * 100) / 100,
        width,
        height,
        baselineSize: { width: baseline.width, height: baseline.height },
        currentSize: { width: current.width, height: current.height },
        sizeMatch: baseline.width === current.width && baseline.height === current.height
      });

    } catch (error) {
      reject(error);
    }
  });
}

function resizeImage(png, targetWidth, targetHeight) {
  const newData = Buffer.alloc(targetWidth * targetHeight * 4, 0);
  
  for (let y = 0; y < png.height && y < targetHeight; y++) {
    for (let x = 0; x < png.width && x < targetWidth; x++) {
      const srcIdx = (png.width * y + x) * 4;
      const dstIdx = (targetWidth * y + x) * 4;
      newData[dstIdx] = png.data[srcIdx];
      newData[dstIdx + 1] = png.data[srcIdx + 1];
      newData[dstIdx + 2] = png.data[srcIdx + 2];
      newData[dstIdx + 3] = png.data[srcIdx + 3];
    }
  }
  
  return newData;
}

function categorize(percentage) {
  if (percentage === null) return 'error';
  if (percentage < THRESHOLDS.excellent) return 'excellent';
  if (percentage < THRESHOLDS.good) return 'good';
  if (percentage < THRESHOLDS.acceptable) return 'acceptable';
  if (percentage < THRESHOLDS.needsWork) return 'needs_work';
  return 'significant';
}

async function compareAll() {
  console.log('\n🔍 Screenshot Comparison');
  console.log(`   Baseline: ${BASELINE_DIR}`);
  console.log(`   Current: ${CURRENT_DIR}`);
  console.log(`   Diffs: ${DIFF_DIR}\n`);

  // Get all baseline images
  let baselineFiles = [];
  if (fs.existsSync(BASELINE_DIR)) {
    baselineFiles = fs.readdirSync(BASELINE_DIR)
      .filter(f => f.endsWith('.png') && f !== 'manifest.json');
  }

  // Get all current images
  let currentFiles = [];
  if (fs.existsSync(CURRENT_DIR)) {
    currentFiles = fs.readdirSync(CURRENT_DIR)
      .filter(f => f.endsWith('.png') && f !== 'manifest.json');
  }

  // Combine file lists
  const allFiles = [...new Set([...baselineFiles, ...currentFiles])];

  if (allFiles.length === 0) {
    console.log('   ⚠ No screenshots found to compare\n');
    const results = {
      timestamp: new Date().toISOString(),
      summary: { total: 0 },
      diffs: {}
    };
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2));
    return results;
  }

  const results = {
    timestamp: new Date().toISOString(),
    thresholds: THRESHOLDS,
    summary: {
      total: allFiles.length,
      excellent: 0,
      good: 0,
      acceptable: 0,
      needs_work: 0,
      significant: 0,
      error: 0,
      averagePercentage: 0
    },
    diffs: {}
  };

  let totalPercentage = 0;
  let validComparisons = 0;

  for (const filename of allFiles) {
    const baselinePath = path.join(BASELINE_DIR, filename);
    const currentPath = path.join(CURRENT_DIR, filename);
    const diffPath = path.join(DIFF_DIR, `diff-${filename}`);

    try {
      const result = await compareImages(baselinePath, currentPath, diffPath);
      const category = categorize(result.percentage);
      
      results.diffs[filename] = {
        ...result,
        category,
        diffImage: result.error ? null : `diff-${filename}`
      };
      
      results.summary[category]++;
      
      if (result.percentage !== null) {
        totalPercentage += result.percentage;
        validComparisons++;
      }

      // Print result
      const icon = {
        excellent: '🟢',
        good: '🟡',
        acceptable: '🟠',
        needs_work: '🔴',
        significant: '⛔',
        error: '❓'
      }[category];
      
      const pctStr = result.percentage !== null 
        ? `${result.percentage.toFixed(2)}%` 
        : result.error;
      
      console.log(`   ${icon} ${filename}: ${pctStr}`);

    } catch (error) {
      console.error(`   ❌ ${filename}: ${error.message}`);
      results.diffs[filename] = {
        error: error.message,
        category: 'error'
      };
      results.summary.error++;
    }
  }

  // Calculate average
  results.summary.averagePercentage = validComparisons > 0
    ? Math.round((totalPercentage / validComparisons) * 100) / 100
    : null;

  // Write results
  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2));

  // Print summary
  console.log('\n📊 Summary:');
  console.log(`   🟢 Excellent (<${THRESHOLDS.excellent}%): ${results.summary.excellent}`);
  console.log(`   🟡 Good (<${THRESHOLDS.good}%): ${results.summary.good}`);
  console.log(`   🟠 Acceptable (<${THRESHOLDS.acceptable}%): ${results.summary.acceptable}`);
  console.log(`   🔴 Needs Work (<${THRESHOLDS.needsWork}%): ${results.summary.needs_work}`);
  console.log(`   ⛔ Significant (>${THRESHOLDS.needsWork}%): ${results.summary.significant}`);
  console.log(`   ❓ Errors: ${results.summary.error}`);
  console.log(`   📈 Average diff: ${results.summary.averagePercentage}%`);
  console.log(`\n   Results written to: ${OUTPUT_JSON}\n`);

  return results;
}

// Run
compareAll().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
