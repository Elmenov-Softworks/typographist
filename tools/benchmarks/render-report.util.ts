import type { BenchmarkReport, ImplementationResult, ProcessingResult } from './benchmark.types.ts';

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
const milliseconds = (value: number) => value.toFixed(4);

const comparison = (result: ProcessingResult, baseline: ImplementationResult | undefined) => {
  const previous = baseline?.processing.find(
    (entry) => entry.name === result.name && entry.locale === result.locale && entry.inputSha256 === result.inputSha256,
  );

  if (previous === undefined || result.medianMs === 0) {
    return '—';
  }

  return `${(previous.medianMs / result.medianMs).toFixed(2)}×`;
};

export const renderReport = (report: BenchmarkReport) => {
  const baseline = report.implementations.find(({ id }) => id === 'current-standard');
  const preparation = report.implementations
    .map(
      (implementation) => `<tr>
    <td>${escapeHtml(implementation.id)}</td><td>${escapeHtml(implementation.algorithm)}</td>
    <td>${milliseconds(implementation.preparation.medianMs)}</td>
    <td>${milliseconds(implementation.preparation.minMs)} / ${milliseconds(implementation.preparation.maxMs)}</td>
  </tr>`,
    )
    .join('\n');
  const rows = report.implementations
    .flatMap((implementation) =>
      implementation.processing.map(
        (result) => `<tr data-implementation="${escapeHtml(implementation.id)}" data-name="${escapeHtml(result.name)}">
    <td>${escapeHtml(result.name)}<small>${result.locale} · ${result.inputUtf16.toLocaleString('en-US')} UTF-16 units · ${String(result.iterations)} calls/sample</small></td>
    <td>${escapeHtml(implementation.id)}</td><td>${milliseconds(result.medianMs)}</td>
    <td>${milliseconds(result.minMs)} / ${milliseconds(result.maxMs)}</td>
    <td>${result.millionUtf16PerSecond.toFixed(2)}</td><td>${comparison(result, baseline)}</td>
    <td><details><summary>7 samples</summary>${result.samplesMs.map(milliseconds).join(', ')} ms</details></td>
  </tr>`,
      ),
    )
    .join('\n');
  const options = report.implementations
    .map(({ id }) => `<option value="${escapeHtml(id)}">${escapeHtml(id)}</option>`)
    .join('');

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Typographist benchmark results</title>
<style>
  :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
  body { margin: 0 auto; padding: 32px; max-width: 1440px; }
  h1 { margin-bottom: 8px; } p { line-height: 1.6; } small { display: block; opacity: .7; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
  th, td { text-align: left; padding: 12px; border-bottom: 1px solid #8885; }
  th { position: sticky; top: 0; background: Canvas; } td:nth-child(n+3) { white-space: nowrap; }
  .scroll { overflow-x: auto; } .filters { display: flex; gap: 20px; margin: 24px 0; flex-wrap: wrap; }
  input, select { font: inherit; padding: 8px; margin-left: 8px; } details { white-space: normal; max-width: 240px; }
  code { overflow-wrap: anywhere; } summary { cursor: pointer; } [hidden] { display: none; }
</style></head>
<body>
<h1>Typographist benchmark results</h1>
<p>${escapeHtml(report.createdAt)} · ${escapeHtml(report.node)} · ICU ${escapeHtml(report.icu ?? 'unknown')}<br>
${escapeHtml(report.cpu ?? 'Unknown CPU')} · ${escapeHtml(report.os)}</p>
<p>Implementation: <code>${escapeHtml(report.implementationCommit)}</code>${report.workingTreeDirty ? ' + working tree changes' : ''}<br>
Legacy: <code>${escapeHtml(report.legacyModule ?? 'not measured')}</code> · commit ${escapeHtml(report.legacyCommit ?? 'not specified')}</p>
<p>Standard mode runs Knuth–Liang; fast mode runs Khristov. Each measurement uses ${String(report.warmupIterations)} warm-ups and ${String(report.sampleCount)} samples.
Outputs are checked for preservation, idempotence and grapheme boundaries. Fast mode also checks its own expected-output fixtures.
When supplied, legacy output equality is checked only for Knuth–Liang implementations.</p>
<h2>Instance preparation</h2>
<p>Includes compilation of both locales and creation of ready-to-use formatters. Module loading is excluded.</p>
<div class="scroll"><table><thead><tr><th>Implementation</th><th>Actual algorithm</th><th>Median, ms</th><th>Min / max, ms</th></tr></thead><tbody>${preparation}</tbody></table></div>
<h2>Formatting</h2>
<p>Lower latency is better. Relative speed = current standard median / selected median; above 1 means faster on this run. Algorithms can produce different breaks. Timing variation is visible in all retained samples.</p>
<div class="filters"><label>Workload <input id="search" type="search" placeholder="Filter workloads"></label>
<label>Implementation <select id="implementation"><option value="">All</option>${options}</select></label></div>
<div class="scroll"><table><thead><tr><th>Workload</th><th>Implementation</th><th>Median, ms</th><th>Min / max, ms</th><th>Million UTF-16/s</th><th>Relative speed</th><th>Samples</th></tr></thead><tbody id="results">${rows}</tbody></table></div>
<p>Mixed workloads use an explicitly selected locale per call. Measurements describe this machine and runtime; they are not universal performance guarantees.</p>
<script>
  const search = document.getElementById('search');
  const implementation = document.getElementById('implementation');
  const rows = document.querySelectorAll('#results tr');
  const filter = () => {
    for (const row of rows) {
      row.hidden = !row.dataset.name.toLowerCase().includes(search.value.toLowerCase()) ||
        (implementation.value !== '' && row.dataset.implementation !== implementation.value);
    }
  };
  search.addEventListener('input', filter);
  implementation.addEventListener('change', filter);
</script>
</body></html>\n`;
};
