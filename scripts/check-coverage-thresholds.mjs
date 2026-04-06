import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const summaryPath = path.join(repoRoot, 'coverage', 'coverage-summary.json');

const criticalThresholds = [
  {
    prefix: 'app/api/',
    thresholds: { lines: 85, statements: 85, functions: 85, branches: 70 },
  },
  {
    prefix: 'lib/services/',
    thresholds: { lines: 90, statements: 90, functions: 90, branches: 80 },
  },
  {
    prefix: 'lib/supabase/',
    thresholds: { lines: 90, statements: 90, functions: 90, branches: 80 },
  },
  {
    prefix: 'lib/db/',
    thresholds: { lines: 85, statements: 85, functions: 85, branches: 70 },
  },
];

if (!fs.existsSync(summaryPath)) {
  console.error(
    `Coverage summary not found at ${summaryPath}. Run "vitest run --coverage" before checking thresholds.`,
  );
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const violations = [];

for (const [filePath, metrics] of Object.entries(summary)) {
  if (filePath === 'total') {
    continue;
  }

  const relativePath = normalizeToRepoRelativePath(filePath);
  const rule = criticalThresholds.find(({ prefix }) => relativePath.startsWith(prefix));

  if (!rule) {
    continue;
  }

  const failedMetrics = Object.entries(rule.thresholds).flatMap(([metricName, minimum]) => {
    const metric = metrics?.[metricName];
    const actual = metric?.pct;

    if (typeof actual !== 'number' || actual < minimum) {
      return `${metricName} ${formatPercent(actual)} < ${minimum}%`;
    }

    return [];
  });

  if (failedMetrics.length > 0) {
    violations.push(`${relativePath}: ${failedMetrics.join(', ')}`);
  }
}

if (violations.length > 0) {
  console.error('Critical-path coverage thresholds failed:');

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exit(1);
}

console.log('Critical-path coverage thresholds passed.');

function normalizeToRepoRelativePath(filePath) {
  const normalizedPath = filePath.replaceAll('\\', '/');

  if (path.isAbsolute(filePath)) {
    return path.relative(repoRoot, filePath).replaceAll('\\', '/');
  }

  const withoutLeadingDot = normalizedPath.startsWith('./')
    ? normalizedPath.slice(2)
    : normalizedPath;

  return path.normalize(withoutLeadingDot).replaceAll('\\', '/');
}

function formatPercent(value) {
  return typeof value === 'number' ? `${value.toFixed(2)}%` : 'missing';
}
