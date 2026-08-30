// Generic client-side aggregation helpers used by the dashboard's chart
// widgets -- run over whatever rows a service.list() call returns (mock or
// live), so charts stay correct under both VITE_DATA_SOURCE modes.

export interface ChartPoint {
  label: string;
  value: number;
}

export function groupByCount<T>(rows: T[], key: keyof T): ChartPoint[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const raw = row[key];
    const label = raw === null || raw === undefined || raw === '' ? 'Unknown' : String(raw);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

export function monthlySeries<T>(rows: T[], key: keyof T, months = 6): ChartPoint[] {
  const now = new Date();
  const buckets: Array<ChartPoint & { year: number; month: number }> = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ label: d.toLocaleDateString(undefined, { month: 'short' }), value: 0, year: d.getFullYear(), month: d.getMonth() });
  }
  for (const row of rows) {
    const raw = row[key];
    if (typeof raw !== 'string') continue;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) continue;
    const bucket = buckets.find((b) => b.year === d.getFullYear() && b.month === d.getMonth());
    if (bucket) bucket.value += 1;
  }
  return buckets.map(({ label, value }) => ({ label, value }));
}

/** The most common value of a field, as "Active - 8" -- the one-line summary
 *  under a stat card's total, so the number has some shape to it. */
export function topValue<T>(rows: T[], key: keyof T): string {
  const points = groupByCount(rows, key);
  if (points.length === 0) return '';
  const top = points[0];
  return `${top.label} - ${top.value}`;
}

/** How many rows fall in the current calendar month, for a "N this month"
 *  line under a stat card. */
export function countThisMonth<T>(rows: T[], key: keyof T): number {
  const now = new Date();
  let total = 0;
  for (const row of rows) {
    const raw = row[key];
    if (typeof raw !== 'string') continue;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) continue;
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) total += 1;
  }
  return total;
}

/** What a set of rows actually contains, as "Active 7 - Pending 3 - Closed 2".
 *  More use than a bare total: it says how the records are distributed, not
 *  just how many there are. */
export function distribution<T>(rows: T[], key: keyof T, max = 3): string {
  const points = groupByCount(rows, key).slice(0, max);
  if (points.length === 0) return '';
  return points.map((p) => `${p.label} ${p.value}`).join(' - ');
}

/** The most recent date present in a field, e.g. "Latest 12 Aug 2026" -- the
 *  useful thing to say about records that carry no status of their own. */
export function latestDate<T>(rows: T[], key: keyof T): string {
  let newest: Date | null = null;
  for (const row of rows) {
    const raw = row[key];
    if (typeof raw !== 'string') continue;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) continue;
    if (!newest || d > newest) newest = d;
  }
  if (!newest) return '';
  return `Latest ${newest.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export function sumBy<T>(rows: T[], key: keyof T): number {
  let total = 0;
  for (const row of rows) {
    const raw = row[key];
    if (typeof raw === 'number') total += raw;
  }
  return Math.round(total * 100) / 100;
}
