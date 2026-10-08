import type { BenchmarkReport, ProcessingResult } from './benchmark.types.ts';
import { isComparable, relativeSpeed } from './comparison.util.ts';

type ChartSeries = { label: string; color: string };
type ChartValue = { median: number; min: number; max: number };
type ChartRow = { label: string; values: readonly (ChartValue | null)[] };

const escape = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const renderBars = (
  title: string,
  rows: readonly ChartRow[],
  series: readonly ChartSeries[],
  unit: string,
  reference: number | null = null,
) => {
  const maximum = Math.max(reference ?? 0, ...rows.flatMap(({ values }) => values.map((value) => value?.max ?? 0)));
  const scale = maximum === 0 ? 0 : 620 / maximum;
  const rowHeight = series.length * 24 + 20;
  const height = rows.length * rowHeight + 66;
  const ticks = Array.from({ length: 5 }, (_, index) => {
    const value = (maximum * index) / 4;
    const x = 270 + value * scale;

    return `<line x1="${String(x)}" x2="${String(x)}" y1="30" y2="${String(height - 30)}" class="grid"/>
      <text x="${String(x)}" y="18" text-anchor="middle" class="axis">${value.toFixed(2)} ${unit}</text>`;
  }).join('');
  const bars = rows
    .map(({ label, values }, rowIndex) => {
      const top = 42 + rowIndex * rowHeight;
      const marks = values
        .map((value, index) => {
          const entry = series[index];

          if (value === null || entry === undefined) {
            return '';
          }

          const y = top + index * 24;
          const end = 270 + value.median * scale;
          const low = 270 + value.min * scale;
          const high = 270 + value.max * scale;

          return `<g><title>${escape(label)} · ${escape(entry.label)}: ${value.median.toFixed(4)} ${unit}; min ${value.min.toFixed(4)}, max ${value.max.toFixed(4)}</title>
            <rect x="270" y="${String(y)}" width="${String(value.median * scale)}" height="15" rx="3" fill="${entry.color}"/>
            <path d="M${String(low)},${String(y + 3)}v9 M${String(low)},${String(y + 7.5)}H${String(high)} M${String(high)},${String(y + 3)}v9" class="range"/>
            <text x="${String(Math.max(920, end + 12))}" y="${String(y + 12)}" class="value">${value.median.toFixed(unit === '×' ? 2 : 4)} ${unit}</text></g>`;
        })
        .join('');

      return `<text x="250" y="${String(top + 12)}" text-anchor="end" class="workload">${escape(label)}</text>${marks}`;
    })
    .join('');
  const baseline =
    reference === null
      ? ''
      : `<line x1="${String(270 + reference * scale)}" x2="${String(270 + reference * scale)}" y1="30" y2="${String(height - 30)}" class="reference"/>`;

  return `<div class="legend">${series.map(({ label, color }) => `<span><i style="background:${color}"></i>${escape(label)}</span>`).join('')}</div>
    <div class="chart-scroll"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1050 ${String(height)}" role="img" aria-label="${escape(title)}">
    <title>${escape(title)}</title>${ticks}${baseline}${bars}</svg></div>`;
};

const matched = (results: readonly ProcessingResult[], result: ProcessingResult) =>
  results.find(
    (entry) => entry.name === result.name && entry.locale === result.locale && entry.inputSha256 === result.inputSha256,
  ) ?? null;

export const renderCharts = (report: BenchmarkReport) => {
  const colors = new Map([
    ['current-standard', '#2563eb'],
    ['current-fast', '#dc6828'],
    ['hyphen', '#008470'],
    ['hypher', '#8755c5'],
    ['hyphenopoly', '#b33f69'],
    ['legacy', '#52677f'],
  ]);
  const series = report.implementations.map(({ id, version }) => ({
    label:
      version === undefined
        ? id === 'current-fast'
          ? 'Khristov'
          : id === 'current-standard'
            ? 'Knuth–Liang'
            : id
        : `${id}@${version}`,
    color: colors.get(id) ?? '#52677f',
  }));
  const preparation = renderBars(
    'Instance preparation latency',
    [
      {
        label: 'Both bundled locales',
        values: report.implementations.map(({ preparation }) => ({
          median: preparation.medianMs,
          min: preparation.minMs,
          max: preparation.maxMs,
        })),
      },
    ],
    series,
    'ms',
  );
  const standard = report.implementations.find(({ id }) => id === 'current-standard');
  const fast = report.implementations.find(({ id }) => id === 'current-fast');
  const reference = standard ?? report.implementations[0];
  const workloads = reference?.processing ?? [];
  const latency = (locale: string) =>
    renderBars(
      `${locale.toUpperCase()} formatting latency`,
      workloads
        .filter((result) => result.locale === locale)
        .map((result) => ({
          label: result.name,
          values: report.implementations.map(({ processing }) => {
            const entry = matched(processing, result);

            return entry === null || !isComparable(entry)
              ? null
              : { median: entry.medianMs, min: entry.minMs, max: entry.maxMs };
          }),
        })),
      series,
      'ms',
    );
  const ratios: ChartRow[] = [];

  if (standard !== undefined && fast !== undefined) {
    for (const result of standard.processing) {
      const candidate = matched(fast.processing, result);

      if (candidate === null || candidate.medianMs <= 0) {
        continue;
      }

      const ratio = result.medianMs / candidate.medianMs;
      ratios.push({
        label: result.name,
        values: [{ median: ratio, min: ratio, max: ratio }],
      });
    }
  }

  const librarySeries: ChartSeries[] = [];
  const libraryValues: (ChartValue | null)[] = [];

  for (const implementation of report.implementations.filter(({ version }) => version !== undefined)) {
    const ratios = implementation.processing
      .map((result) => relativeSpeed(result, standard))
      .filter((ratio) => ratio !== null)
      .sort((left, right) => left - right);
    const middle = Math.floor(ratios.length / 2);
    const upper = ratios[middle];
    const lower = ratios[middle - 1];
    const median =
      upper === undefined ? null : ratios.length % 2 === 0 && lower !== undefined ? (lower + upper) / 2 : upper;
    librarySeries.push({
      label: `${implementation.id}@${implementation.version ?? ''} · ${String(ratios.length)}/${String(workloads.length)} workloads`,
      color: colors.get(implementation.id) ?? '#52677f',
    });
    libraryValues.push(median === null ? null : { median, min: median, max: median });
  }

  return {
    preparation,
    english: latency('en'),
    russian: latency('ru'),
    libraries: renderBars(
      'External library speed relative to Knuth–Liang',
      [{ label: 'Median workload ratio', values: libraryValues }],
      librarySeries,
      '×',
      1,
    ),
    speedup: renderBars(
      'Khristov speed relative to Knuth–Liang',
      ratios,
      [{ label: 'Khristov / Knuth–Liang', color: '#dc6828' }],
      '×',
      1,
    ),
  };
};
