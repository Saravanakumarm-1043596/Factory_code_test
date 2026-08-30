import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { ChartPoint } from '../../lib/aggregate';

interface TrendChartProps {
  title: string;
  subtitle?: string;
  data: ChartPoint[];
}

export function TrendChart({ title, subtitle, data }: TrendChartProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3.5">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="dashboardTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-brand-500)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-brand-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} allowDecimals={false} width={34} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <Area type="monotone" dataKey="value" stroke="var(--color-brand-500)" strokeWidth={2} fill="url(#dashboardTrendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
