import { readFile } from 'node:fs/promises';

const summary = JSON.parse(await readFile('coverage/coverage-summary.json', 'utf8'));
const total = summary.total;
const metrics = ['lines', 'statements', 'functions', 'branches'];
const failures = metrics.filter(metric => total[metric].pct !== 100);

if (failures.length > 0) {
  console.error(`Coverage gaps detected: ${failures.join(', ')}`);
  process.exitCode = 1;
}
