import type { BenchmarkReport, ProcessingResult } from './benchmark.types.ts';
import { relativeSpeed } from './comparison.util.ts';
import { renderCharts } from './render-charts.util.ts';

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
const milliseconds = (value: number) => value.toFixed(4);

const validationLabel = ({ validation }: ProcessingResult) => {
  if (validation === undefined) return 'passed';
  const issues = [
    !validation.sourcePreserved ? 'source changed' : '',
    !validation.idempotent ? 'not idempotent' : '',
    validation.graphemeSafe === false ? 'unsafe grapheme breaks' : '',
    validation.graphemeSafe === null ? 'graphemes not checked' : '',
  ].filter(Boolean);
  return issues.length === 0 ? 'passed' : issues.join('; ');
};

export const renderReport = (report: BenchmarkReport) => {
  const charts = renderCharts(report);
  const baseline = report.implementations.find(({ id }) => id === 'current-standard');
  const extension = report.externalComparison;
  const external =
    extension === undefined
      ? ''
      : `<section id="libraries"><h2>External library comparison</h2>
<p>Original Typographist measurements are retained unchanged. Libraries were measured separately on ${escapeHtml(extension.createdAt)} under ${escapeHtml(extension.node)} on the same CPU, OS and ICU. Cross-run timing variation remains possible.
External harness: <code>${escapeHtml(extension.implementationCommit)}</code>${extension.workingTreeDirty ? ' + working tree changes' : ''}.</p>
<p>Native synchronous whole-text APIs and bundled language patterns are used. Word caches remain enabled where built in; verification and warm-ups populate them. Typographist has no persistent word cache. Different dictionaries, exclusions and output contracts affect timings.</p>
<p>Ratios include only workloads that preserve source characters, remain idempotent and insert at original grapheme boundaries. Other raw timings remain in the table, without speed ratios or latency bars. Unsupported workloads are listed separately. Median ratios weight each included workload equally; coverage differs by library.</p>
${charts.libraries}
${report.implementations
  .filter(({ version }) => version !== undefined)
  .map(
    (
      implementation,
    ) => `<p><strong>${escapeHtml(implementation.id)}@${escapeHtml(implementation.version ?? '')}</strong>: ${escapeHtml(implementation.notes ?? '')}</p>
${(implementation.skippedWorkloads ?? []).map(({ name, reason }) => `<small>Not measured: ${escapeHtml(name)} — ${escapeHtml(reason)}</small>`).join('')}`,
  )
  .join('')}
</section>`;
  const preparation = report.implementations
    .map(
      (implementation) => `<tr>
    <td>${escapeHtml(implementation.id)}${implementation.version === undefined ? '' : `@${escapeHtml(implementation.version)}`}</td><td>${escapeHtml(implementation.algorithm)}</td>
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
    <td>${result.millionUtf16PerSecond.toFixed(2)}</td><td>${relativeSpeed(result, baseline)?.toFixed(2) ?? '—'}${relativeSpeed(result, baseline) === null ? '' : '×'}</td>
    <td>${escapeHtml(validationLabel(result))}</td>
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
  :root { color-scheme: light; font-family: system-ui, sans-serif; color: #19283f; background: #f2f5fa; }
  body { margin: 0 auto; padding: 32px; max-width: 1440px; }
  section, header { background: white; border: 1px solid #dfe6ef; border-radius: 16px; padding: 28px; margin-bottom: 24px; }
  h1 { font-size: 36px; letter-spacing: -.03em; } h2 { margin-top: 0; }
  .eyebrow { color: #52677f; text-transform: uppercase; letter-spacing: .12em; font-size: 12px; font-weight: 700; }
  .legend { display: flex; flex-wrap: wrap; gap: 24px; margin: 20px 0; font-size: 14px; }
  .legend span { display: flex; align-items: center; gap: 8px; } .legend i { width: 12px; height: 12px; border-radius: 3px; }
  .chart-scroll { overflow-x: auto; } svg { display: block; width: 100%; min-width: 900px; }
  .grid { stroke: #e2e8f0; } .axis { fill: #52677f; font-size: 12px; }
  .workload, .value { fill: #19283f; font-size: 13px; font-variant-numeric: tabular-nums; }
  .range { stroke: #172c48; stroke-width: 1.4; fill: none; } .reference { stroke: #19283f; stroke-dasharray: 5 5; }
  nav { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 22px; } a { color: #2563eb; }
  @media (max-width: 600px) { body { padding: 12px; } section, header { padding: 18px; } h1 { font-size: 28px; } }
  h1 { margin-bottom: 8px; } p { line-height: 1.6; } small { display: block; opacity: .7; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
  th, td { text-align: left; padding: 12px; border-bottom: 1px solid #8885; }
  th { position: sticky; top: 0; background: Canvas; } td:nth-child(n+3) { white-space: nowrap; }
  .scroll { overflow-x: auto; } .filters { display: flex; gap: 20px; margin: 24px 0; flex-wrap: wrap; }
  input, select { font: inherit; padding: 8px; margin-left: 8px; } details { white-space: normal; max-width: 240px; }
  code { overflow-wrap: anywhere; } summary { cursor: pointer; } [hidden] { display: none; }
</style></head>
<body>
<header id="overview">
<div class="eyebrow">Same workloads · ${extension === undefined ? 'two algorithms' : 'five implementations'}</div>
<h1>Typographist benchmark results</h1>
<p>${escapeHtml(report.createdAt)} · ${escapeHtml(report.node)} · ICU ${escapeHtml(report.icu ?? 'unknown')}<br>
${escapeHtml(report.cpu ?? 'Unknown CPU')} · ${escapeHtml(report.os)}</p>
<p>Implementation: <code>${escapeHtml(report.implementationCommit)}</code>${report.workingTreeDirty ? ' + working tree changes' : ''}<br>
Legacy: <code>${escapeHtml(report.legacyModule ?? 'not measured')}</code> · commit ${escapeHtml(report.legacyCommit ?? 'not specified')}</p>
<p>Standard mode runs Knuth–Liang; fast mode runs Khristov. Each measurement uses ${String(report.warmupIterations)} warm-ups and ${String(report.sampleCount)} samples.
Typographist outputs are checked for preservation, idempotence and grapheme boundaries. Fast mode also checks its own expected-output fixtures.
When supplied, legacy output equality is checked only for Knuth–Liang implementations.</p>
<nav><a href="#speedup">Relative speed</a>${extension === undefined ? '' : '<a href="#libraries">External libraries</a>'}<a href="#latency-en">English latency</a><a href="#latency-ru">Russian latency</a><a href="#raw-results">All samples</a></nav>
</header>
<section id="preparation">
<h2>Instance preparation</h2>
<p>Includes compilation of both locales and creation of ready-to-use formatters. Module loading is excluded.</p>
${charts.preparation}
<div class="scroll"><table><thead><tr><th>Implementation</th><th>Actual algorithm</th><th>Median, ms</th><th>Min / max, ms</th></tr></thead><tbody>${preparation}</tbody></table></div>
</section>
<section id="speedup"><h2>Khristov relative to Knuth–Liang</h2>
<p>Standard median latency / fast median latency on identical inputs. Above 1× means Khristov was faster; the dashed line marks equal speed. Ratios compare medians, without an uncertainty interval. Different break positions are expected.</p>
${charts.speedup}</section>
${external}
<section id="latency-en"><h2>English formatting latency</h2>
<p>Median milliseconds per call; lower is better. Whiskers show the minimum and maximum of the retained samples. All English rows share one linear scale starting at zero.</p>
${charts.english}</section>
<section id="latency-ru"><h2>Russian formatting latency</h2>
<p>Median milliseconds per call; lower is better. Whiskers show the minimum and maximum of the retained samples. All Russian rows share one linear scale starting at zero.</p>
${charts.russian}</section>
<section id="raw-results">
<h2>Formatting</h2>
<p>Lower latency is better. Relative speed = current standard median / selected median; above 1 means faster on this run. Algorithms can produce different breaks. Timing variation is visible in all retained samples.</p>
<div class="filters"><label>Workload <input id="search" type="search" placeholder="Filter workloads"></label>
<label>Implementation <select id="implementation"><option value="">All</option>${options}</select></label></div>
<div class="scroll"><table><thead><tr><th>Workload</th><th>Implementation</th><th>Median, ms</th><th>Min / max, ms</th><th>Million UTF-16/s</th><th>Relative speed</th><th>Validation</th><th>Samples</th></tr></thead><tbody id="results">${rows}</tbody></table></div>
<p>Mixed workloads use an explicitly selected locale per call. Measurements describe this machine and runtime; they are not universal performance guarantees.</p>
</section>
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
