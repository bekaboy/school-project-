import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface StatusData {
  name: string;
  value: number;
}

interface OrderStatusChartProps {
  data: StatusData[];
}

const COLORS: Record<string, string> = {
  Draft: 'oklch(0.7 0.05 45)',
  'Proforma Generated': 'oklch(0.5 0.1 265)',
  'Pending Payment': 'oklch(0.6 0.1 85)',
  Verified: 'oklch(0.5 0.12 160)',
  'Invoice Generated': 'oklch(0.45 0.15 265)',
  'In Transit': 'oklch(0.55 0.12 45)',
  Delivered: 'oklch(0.5 0.12 160)',
  Cancelled: 'oklch(0.6 0 45)',
  Failed: 'oklch(0.55 0.15 25)',
};

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Orders by Status</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            No orders yet
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={64}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[entry.name] ?? 'oklch(0.6 0 45)'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(0)}%)`]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 6,
                    border: '1px solid oklch(0.9 0.01 45)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 text-xs flex-1">
              {data.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: COLORS[d.name] ?? 'oklch(0.6 0 45)' }}
                    />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
