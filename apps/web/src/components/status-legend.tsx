import { AlertTriangle, Clock, TrendingDown, Package } from 'lucide-react';

const ITEMS = [
  { icon: TrendingDown, label: 'Expired', color: 'text-destructive', bg: 'bg-destructive/10' },
  { icon: Clock, label: 'Expiring soon (< 90 days)', color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: AlertTriangle, label: 'Low stock', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: Package, label: 'In stock / OK', color: 'text-green-600', bg: 'bg-green-50' },
];

export function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">Legend:</span>
      {ITEMS.map((item) => (
        <span key={item.label} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${item.bg} ${item.color}`}>
          <item.icon className="h-3 w-3" />
          {item.label}
        </span>
      ))}
    </div>
  );
}
