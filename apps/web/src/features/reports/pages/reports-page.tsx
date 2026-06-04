import { SalesReport } from '@/features/reports/components/sales-report';
import { InventoryReport } from '@/features/reports/components/inventory-report';
import { BatchTraceReport } from '@/features/reports/components/batch-trace-report';
import { BarChart3, Package, Hash } from 'lucide-react';
import { useState } from 'react';

const TABS = [
  { id: 'sales', label: 'Sales', icon: BarChart3 },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'batches', label: 'Batch Traceability', icon: Hash },
] as const;

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<string>('sales');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Export sales, inventory, and batch traceability data.
        </p>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'sales' && <SalesReport />}
      {activeTab === 'inventory' && <InventoryReport />}
      {activeTab === 'batches' && <BatchTraceReport />}
    </div>
  );
}
