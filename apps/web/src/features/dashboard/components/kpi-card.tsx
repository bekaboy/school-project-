import { type LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  accent?: string;
}

export function KpiCard({ title, value, icon: Icon, trend, accent }: KpiCardProps) {
  return (
    <div className="rounded-lg border bg-card p-5 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className={`h-4 w-4 ${accent ? `text-${accent}` : 'text-muted-foreground'}`} />
      </div>
      <p className={`text-2xl font-bold ${accent ? `text-${accent}` : ''}`}>
        {value}
      </p>
      {trend && (
        <p className={`text-xs ${trend.positive ? 'text-emerald-600' : 'text-destructive'}`}>
          {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
        </p>
      )}
    </div>
  );
}
