import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ChartPoint } from '../../lib/aggregate';

// One tonal ramp rather than a rainbow: the categories here aren't
// semantically different, so varying hue implies a distinction that doesn't
// exist. Shade alone separates the bars and keeps the chart on-brand.
const BREAKDOWN_COLORS = [
  'var(--color-brand-800)', 'var(--color-brand-700)', 'var(--color-brand-600)',
  'var(--color-brand-500)', 'var(--color-brand-400)', 'var(--color-brand-300)',
  'var(--color-brand-200)', 'var(--color-brand-100)',
];

interface BreakdownChartProps {
  title: string;
  subtitle?: string;
  data: ChartPoint[];
}

export function BreakdownChart({ title, subtitle, data }: BreakdownChartProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} width={96} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} cursor={{ fill: '#f1f5f9' }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {data.map((entry, i) => (
                <Cell key={entry.label} fill={BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
