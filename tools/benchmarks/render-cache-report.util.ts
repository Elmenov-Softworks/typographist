import type {
  CacheComparisonReport,
  CacheImplementationResult,
  CacheProcessingResult,
} from './cache-comparison.types.ts';

const escapeHtml = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const passes = (result: CacheProcessingResult) =>
  result.validation?.sourcePreserved === true &&
  result.validation.idempotent &&
  result.validation.graphemeSafe === true;
const medianRatio = (values: readonly number[]) => {
  const sorted = [...values].sort((left, right) => left - right);
  const lower = sorted[Math.floor((sorted.length - 1) / 2)];
  const upper = sorted[Math.floor(sorted.length / 2)];
  if (lower === undefined || upper === undefined) throw new Error('Missing comparable workloads');
  return (lower + upper) / 2;
};
const ratios = (baseline: CacheImplementationResult, implementation: CacheImplementationResult) =>
  implementation.processing.flatMap((result) => {
    const other = baseline.processing.find(
      (candidate) => candidate.name === result.name && candidate.inputSha256 === result.inputSha256,
    );
    return other !== undefined && passes(result) && passes(other) ? [other.medianMs / result.medianMs] : [];
  });
const colors = ['#2563eb', '#60a5fa', '#0d9488', '#14b8a6', '#fb923c', '#ea580c', '#a855f7'];
type Bar = { label: string; value: number; detail: string; color: string };

const chart = (bars: readonly Bar[], unit: string, reference: number | null = null) => {
  if (bars.length === 0) return '<p>No passing comparisons.</p>';
  const width = 1200;
  const left = 430;
  const plot = 650;
  const height = bars.length * 30 + 55;
  const maximum = Math.max(...bars.map(({ value }) => value), reference ?? 0) * 1.08;
  const scale = plot / maximum;
  const grid = Array.from({ length: 5 }, (_, index) => {
    const value = (maximum * index) / 4;
    const x = left + value * scale;
    return `<line x1="${String(x)}" x2="${String(x)}" y1="18" y2="${String(height - 28)}" stroke="#e2e8f0"/><text x="${String(x)}" y="${String(height - 8)}" text-anchor="middle" fill="#52677f">${value.toFixed(2)} ${unit}</text>`;
  }).join('');
  return `<div class="chart-scroll"><svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeHtml(unit)} comparison" viewBox="0 0 ${String(width)} ${String(height)}">${grid}${
    reference === null
      ? ''
      : `<line x1="${String(left + reference * scale)}" x2="${String(left + reference * scale)}" y1="18" y2="${String(height - 28)}" stroke="#172c48" stroke-dasharray="4 4"/>`
  }${bars
    .map(
      ({ label, value, detail, color }, index) =>
        `<g><title>${escapeHtml(detail)}</title><text x="${String(left - 12)}" y="${String(index * 30 + 34)}" text-anchor="end">${escapeHtml(label)}</text><rect x="${String(left)}" y="${String(index * 30 + 19)}" width="${String(value * scale)}" height="20" rx="3" fill="${color}"/><text x="${String(left + value * scale + 8)}" y="${String(index * 30 + 34)}">${value.toFixed(3)} ${unit}</text></g>`,
    )
    .join('')}</svg></div>`;
};

export const renderCacheReport = (report: CacheComparisonReport) => {
  const baseline = report.implementations.find(({ id }) => id === 'knuth-liang-disabled');
  if (baseline === undefined) throw new Error('Missing uncached Knuth–Liang baseline');

  const summary = report.implementations.map((implementation) => {
    const included = ratios(baseline, implementation);
    const valid = implementation.processing.filter(passes).length;
    return `<tr><td>${escapeHtml(implementation.label)}</td><td>${String(implementation.cacheSizeMiB ?? 'native')}</td><td>${String(valid)}/29</td><td>${String(implementation.processing.length - valid)}</td><td>${String(implementation.skippedWorkloads?.length ?? 0)}</td><td>${included.length ? medianRatio(included).toFixed(2) + '×' : '—'}</td></tr>`;
  });
  const gainBars: Bar[] = report.implementations
    .filter(({ library, cacheState }) => library === 'typographist' && cacheState !== 'disabled')
    .map((implementation, index) => {
      const ownBaseline = report.implementations.find(
        ({ library, algorithm, cacheState }) =>
          library === 'typographist' && algorithm === implementation.algorithm && cacheState === 'disabled',
      );
      if (ownBaseline === undefined) throw new Error('Missing algorithm baseline');
      const included = ratios(ownBaseline, implementation);
      return {
        label: `${implementation.label} (${String(included.length)}/29)`,
        value: medianRatio(included),
        detail: `${implementation.label}: median of uncached/cached workload ratios; each included workload has equal weight`,
        color: colors[index % colors.length] ?? '#2563eb',
      };
    });
  const externalBars: Bar[] = report.implementations
    .filter(({ library, cacheState }) => library !== 'typographist' && cacheState === 'warmed')
    .flatMap((implementation, libraryIndex) =>
      report.implementations
        .filter(({ library, cacheState }) => library === 'typographist' && cacheState !== 'empty')
        .map((own) => {
          const included = ratios(implementation, own);
          return {
            label: `${own.label} vs ${implementation.library} (${String(included.length)}/29)`,
            value: included.length ? medianRatio(included) : 0,
            detail:
              'Library/Typographist median latency ratio; above 1 means Typographist is faster. Only shared passing workloads.',
            color: colors[libraryIndex + 2] ?? '#2563eb',
          };
        }),
    );

  const latency = (locale: 'en' | 'ru') => {
    const profiles = report.implementations.filter(({ cacheState }) => cacheState !== 'empty');
    const bars: Bar[] = baseline.processing
      .filter((result) => result.locale === locale)
      .flatMap((workload) =>
        profiles.flatMap((profile, index) => {
          const result = profile.processing.find(({ name }) => name === workload.name);
          if (result === undefined || !passes(result)) return [];
          return [
            {
              label: `${workload.name} · ${profile.label}`,
              value: result.medianMs,
              detail: `${profile.label}, ${workload.name}: ${result.medianMs.toFixed(6)} ms; range ${result.minMs.toFixed(6)}–${result.maxMs.toFixed(6)} ms`,
              color: colors[index % colors.length] ?? '#2563eb',
            },
          ];
        }),
      );
    return chart(bars, 'ms');
  };
  const rows = report.implementations.flatMap((profile) =>
    profile.processing.map((result) => {
      const checked = result.validation;
      const status = passes(result)
        ? 'passed'
        : [
            checked?.sourcePreserved ? '' : 'source changed',
            checked?.idempotent ? '' : 'not idempotent',
            checked?.graphemeSafe === true ? '' : 'graphemes unchecked/unsafe',
          ]
            .filter(Boolean)
            .join('; ');
      return `<tr data-profile="${escapeHtml(profile.id)}" data-name="${escapeHtml(result.name)}" data-state="${profile.cacheState}" data-locale="${result.locale}"><td>${escapeHtml(result.name)}<small>${result.locale} · ${String(result.inputUtf16)} UTF-16 units</small></td><td>${escapeHtml(profile.label)}</td><td>${result.medianMs.toFixed(4)}</td><td>${result.minMs.toFixed(4)} / ${result.maxMs.toFixed(4)}</td><td>${result.preparation.medianMs.toFixed(4)}</td><td>${result.cacheWarmup.medianMs.toFixed(4)}</td><td>${escapeHtml(status)}${result.outputEqual ? '<small>Equals uncached output</small>' : ''}</td><td><details><summary>${String(result.samplesMs.length)} samples</summary>${result.samplesMs.map((value) => value.toFixed(6)).join(', ')}</details></td></tr>`;
    }),
  );
  const unsupported = report.implementations.flatMap((profile) =>
    (profile.skippedWorkloads ?? []).map(
      ({ name, reason }) => `<li>${escapeHtml(profile.label)} · ${escapeHtml(name)}: ${escapeHtml(reason)}</li>`,
    ),
  );
  const options = report.implementations
    .map(({ id, label }) => `<option value="${id}">${escapeHtml(label)}</option>`)
    .join('');

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Typographist cache and library benchmarks</title><style>
  :root{font-family:system-ui,sans-serif;color:#19283f;background:#f2f5fa;color-scheme:light}body{max-width:1440px;margin:auto;padding:28px}section,header{background:white;border:1px solid #dfe6ef;border-radius:16px;padding:26px;margin-bottom:24px}h1{font-size:34px;letter-spacing:-.03em}h2{margin-top:0}p{line-height:1.6}small{display:block;color:#52677f}a{color:#2563eb}nav,.filters{display:flex;gap:16px;flex-wrap:wrap}.chart-scroll,.table-scroll{overflow-x:auto}svg{display:block;width:100%;min-width:1100px;font-size:12px;fill:#19283f}table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}th,td{text-align:left;border-bottom:1px solid #e2e8f0;padding:12px}td:nth-child(n+3){white-space:nowrap}input,select{font:inherit;padding:8px;max-width:100%;box-sizing:border-box}details{max-width:280px;white-space:normal}code{overflow-wrap:anywhere}[hidden]{display:none}.filters{margin:20px 0}@media(max-width:600px){body{padding:12px}section,header{padding:16px}h1{font-size:26px}.filters{display:grid}svg{min-width:1100px}}
  </style></head><body>
  <header id="overview"><small>ENGLISH + RUSSIAN · 29 WORKLOADS · ${String(report.sampleCount)} SAMPLES</small><h1>Word cache and library comparison</h1><p>Knuth–Liang and Khristov with caching disabled, an initially empty 64 MiB cache, and a warmed 64 MiB cache. Compared with hyphen, Hypher and Hyphenopoly using their native cache policies.</p><p>${escapeHtml(report.node)} · ICU ${escapeHtml(report.icu ?? 'unknown')} · ${escapeHtml(report.cpu ?? 'unknown')}<br>${escapeHtml(report.os)}<br>${escapeHtml(report.createdAt)} · <code>${escapeHtml(report.implementationCommit)}</code>${report.workingTreeDirty ? ' + benchmark working tree changes' : ''}</p><nav><a href="#cache-gains">Cache gains</a><a href="#libraries">Libraries</a><a href="#latency-en">English</a><a href="#latency-ru">Russian</a><a href="#results-section">All samples</a><a href="cache-comparison.json">Download JSON</a></nav></header>
  <section id="summary"><h2>Coverage and relative speed</h2><p>Speed = uncached Knuth–Liang / selected profile. Above 1 means the selected profile is faster. Each passing workload has equal weight; different coverage prevents a universal ranking.</p><div class="table-scroll"><table><thead><tr><th>Profile</th><th>Cache MiB</th><th>Passing</th><th>Failed</th><th>Unsupported</th><th>Median speed</th></tr></thead><tbody>${summary.join('')}</tbody></table></div></section>
  <section id="cache-gains"><h2>Cache gains within each algorithm</h2><p>Uncached / cached latency. Above 1 means caching is faster. Empty means a first call on a fresh instance; repeated words may already hit within that call. Warmed means the identical input was processed once before timing.</p>${chart(gainBars, '×', 1)}</section>
  <section id="libraries"><h2>Typographist versus warmed native libraries</h2><p>Library / Typographist latency. Above 1 means Typographist is faster. Compare only shared workloads passing source-preservation, idempotence and grapheme checks. Linguistic outputs may differ.</p>${chart(externalBars, '×', 1)}</section>
  <section id="latency-en"><h2>English formatting latency</h2><p>Uncached Typographist and warmed profiles. Failed and unsupported cases are excluded. Bars start at zero; hover for min/max samples. Cold-profile measurements are available in the table.</p>${latency('en')}</section>
  <section id="latency-ru"><h2>Russian formatting latency</h2>${latency('ru')}</section>
  <section id="method"><h2>Procedure and limits</h2><p>${escapeHtml(report.procedure)}</p><p>Rule preparation and cache warm-up are excluded from formatting timers, but retained per workload. Import/loading, DOM layout and network time are excluded. Reported values measure elapsed Node formatting time on this machine; browser screenshots only validate report rendering.</p>${report.implementations
    .filter(({ cacheState }) => cacheState === 'warmed')
    .map(({ label, notes }) => `<p><strong>${escapeHtml(label)}</strong>: ${escapeHtml(notes ?? '')}</p>`)
    .join(
      '',
    )}<details><summary>Unsupported workloads (${String(unsupported.length)})</summary><ul>${unsupported.join('')}</ul></details></section>
  <section id="results-section"><h2>All measured samples</h2><div class="filters"><input id="search" aria-label="Search workloads" placeholder="Search workloads"><select id="profile" aria-label="Profile"><option value="">All profiles</option>${options}</select><select id="state" aria-label="Cache state"><option value="">All states</option><option>disabled</option><option>empty</option><option>warmed</option></select><select id="locale" aria-label="Locale"><option value="">Both locales</option><option>en</option><option>ru</option></select></div><div class="table-scroll"><table><thead><tr><th>Workload</th><th>Profile</th><th>Format ms</th><th>Min / max ms</th><th>Preparation ms</th><th>Cache warm-up ms</th><th>Validation</th><th>Raw samples</th></tr></thead><tbody id="results">${rows.join('')}</tbody></table></div></section>
  <script>const controls=['search','profile','state','locale'].map(id=>document.getElementById(id));const rows=[...document.querySelectorAll('#results tr')];const filter=()=>{const [search,profile,state,locale]=controls.map(el=>el.value.toLowerCase());for(const row of rows)row.hidden=!(row.dataset.name.includes(search)&&(!profile||row.dataset.profile===profile)&&(!state||row.dataset.state===state)&&(!locale||row.dataset.locale===locale));};for(const el of controls)el.addEventListener('input',filter);</script></body></html>`;
};
