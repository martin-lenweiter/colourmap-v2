import fs from 'node:fs';
import path from 'node:path';

export const METRICS = ['lines', 'statements', 'functions', 'branches'];
const DEFAULT_CONFIG_PATH = 'config/coverage-gate.json';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function listFiles(rootDir) {
  const files = [];
  const stack = [rootDir];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || !fs.existsSync(current)) {
      continue;
    }

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'coverage' || entry.name === 'node_modules') {
        continue;
      }

      const absolutePath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        stack.push(absolutePath);
        continue;
      }

      files.push(absolutePath);
    }
  }

  return files;
}

function normalizePath(filePath, cwd = process.cwd()) {
  return path.relative(cwd, filePath).split(path.sep).join('/');
}

function matchesRule(relativePath, rule, excludeSuffixes = []) {
  const normalizedPath = relativePath.split(path.sep).join('/');
  const hasAllowedExtension =
    !rule.extensions || rule.extensions.some((extension) => normalizedPath.endsWith(extension));
  const hasExactFileMatch = !rule.files || rule.files.includes(normalizedPath);
  const hasPrefixMatch = !rule.prefix || normalizedPath.startsWith(rule.prefix);
  const hasAllowedSuffix =
    !rule.suffixes || rule.suffixes.some((suffix) => normalizedPath.endsWith(suffix));
  const hasExcludedSuffix = excludeSuffixes.some((suffix) => normalizedPath.endsWith(suffix));

  return (
    hasAllowedExtension &&
    hasExactFileMatch &&
    hasPrefixMatch &&
    hasAllowedSuffix &&
    !hasExcludedSuffix
  );
}

function resolveFiles({ include, excludeSuffixes = [] }, cwd = process.cwd()) {
  const roots = new Set();

  for (const rule of include) {
    if (rule.files) {
      for (const file of rule.files) {
        roots.add(file.split('/')[0]);
      }
    }

    if (rule.prefix) {
      roots.add(rule.prefix.split('/')[0]);
    }
  }

  const discoveredFiles = [...roots].flatMap((root) => listFiles(path.join(cwd, root)));
  const relativeFiles = discoveredFiles.map((file) => normalizePath(file, cwd));

  return relativeFiles
    .filter((file) => include.some((rule) => matchesRule(file, rule, excludeSuffixes)))
    .sort();
}

function getCoverageEntry(summary, relativePath, cwd = process.cwd()) {
  const absolutePath = path.resolve(cwd, relativePath);
  return summary[absolutePath] ?? null;
}

function formatPct(value) {
  return value.toFixed(2);
}

function aggregateCoverage(summary, files, cwd = process.cwd()) {
  const totals = Object.fromEntries(METRICS.map((metric) => [metric, { total: 0, covered: 0 }]));
  const missingFiles = [];

  for (const file of files) {
    const entry = getCoverageEntry(summary, file, cwd);

    if (!entry) {
      missingFiles.push(file);
      continue;
    }

    for (const metric of METRICS) {
      totals[metric].total += entry[metric].total;
      totals[metric].covered += entry[metric].covered;
    }
  }

  const percentages = Object.fromEntries(
    METRICS.map((metric) => {
      const total = totals[metric].total;
      const covered = totals[metric].covered;
      const pct = total === 0 ? 100 : (covered / total) * 100;
      return [metric, pct];
    }),
  );

  return { missingFiles, percentages };
}

export function evaluateThresholds(summary, config, cwd = process.cwd()) {
  const results = [];
  const failures = [];

  for (const group of config.thresholds) {
    const files = resolveFiles(group, cwd);
    const { missingFiles, percentages } = aggregateCoverage(summary, files, cwd);

    if (files.length === 0) {
      failures.push(`Coverage group "${group.name}" resolved to no files.`);
      continue;
    }

    if (missingFiles.length > 0) {
      failures.push(
        `Coverage summary is missing ${missingFiles.length} file(s) for "${group.name}": ${missingFiles.join(', ')}`,
      );
      continue;
    }

    const metricSummary = METRICS.map((metric) => ({
      metric,
      actual: percentages[metric],
      threshold: group.metrics[metric],
    }));

    results.push({
      description: group.description,
      files,
      name: group.name,
      metrics: metricSummary,
    });

    for (const { metric, actual, threshold } of metricSummary) {
      if (actual + Number.EPSILON < threshold) {
        failures.push(
          `Coverage group "${group.name}" failed ${metric}: ${formatPct(actual)}% < ${formatPct(threshold)}%`,
        );
      }
    }
  }

  return { failures, results };
}

export function createProtectedBaseline(summary, config, cwd = process.cwd()) {
  const files = resolveFiles(config.protectedPaths, cwd);
  const baseline = {};

  for (const file of files) {
    const entry = getCoverageEntry(summary, file, cwd);

    if (!entry) {
      throw new Error(`Coverage summary is missing protected file ${file}`);
    }

    baseline[file] = Object.fromEntries(METRICS.map((metric) => [metric, entry[metric].pct]));
  }

  return baseline;
}

export function evaluateProtectedRegression(summary, config, baselineData, cwd = process.cwd()) {
  const files = resolveFiles(config.protectedPaths, cwd);
  const failures = [];

  for (const file of files) {
    const entry = getCoverageEntry(summary, file, cwd);

    if (!entry) {
      failures.push(`Coverage summary is missing protected file ${file}`);
      continue;
    }

    const baseline = baselineData.protectedPaths[file];

    if (!baseline) {
      continue;
    }

    for (const metric of METRICS) {
      const current = entry[metric].pct;
      const previous = baseline[metric];

      if (current + 0.005 < previous) {
        failures.push(
          `Protected path regression for ${file} ${metric}: ${formatPct(current)}% < baseline ${formatPct(previous)}%`,
        );
      }
    }
  }

  return failures;
}

function printSummary(result) {
  for (const group of result.results) {
    const metrics = group.metrics
      .map(({ metric, actual, threshold }) => `${metric} ${formatPct(actual)}%/${formatPct(threshold)}%`)
      .join(', ');

    console.log(`coverage-gate ${group.name}: ${metrics}`);
  }
}

function main() {
  const cwd = process.cwd();
  const args = new Set(process.argv.slice(2));
  const configPath = path.resolve(cwd, DEFAULT_CONFIG_PATH);
  const config = readJson(configPath);
  const summaryPath = path.resolve(cwd, config.summaryFile);
  const baselinePath = path.resolve(cwd, config.baselineFile);
  const summary = readJson(summaryPath);

  if (args.has('--print-baseline')) {
    const protectedPaths = createProtectedBaseline(summary, config, cwd);
    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          protectedPaths,
        },
        null,
        2,
      ),
    );
    return;
  }

  const thresholdResult = evaluateThresholds(summary, config, cwd);
  const baselineData = readJson(baselinePath);
  const regressionFailures = evaluateProtectedRegression(summary, config, baselineData, cwd);
  const failures = [...thresholdResult.failures, ...regressionFailures];

  printSummary(thresholdResult);

  if (failures.length === 0) {
    console.log('coverage-gate passed');
    return;
  }

  console.error('coverage-gate failed');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exitCode = 1;
}

if (import.meta.main) {
  main();
}
