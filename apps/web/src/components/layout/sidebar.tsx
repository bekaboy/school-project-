import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import type { UserRole } from '@pharma-ims/shared';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/lib/utils/permissions';
import {
  LayoutDashboard,
  Package,
  Layers,
  Warehouse,
  Users,
  ShoppingCart,
  Banknote,
  FileText,
  Truck,
  BarChart3,
  Settings,
  Shield,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  labelKey: string;
  to: string;
  icon: LucideIcon;
  permission?: string;
}

const navItems: NavItem[] = [
  { labelKey: 'nav.dashboard', to: '/dashboard', icon: LayoutDashboard, permission: 'dashboard:view' },
  { labelKey: 'nav.products', to: '/products', icon: Package, permission: 'product:view' },
  { labelKey: 'nav.batches', to: '/batches', icon: Layers, permission: 'batch:manage' },
  { labelKey: 'nav.inventory', to: '/inventory', icon: Warehouse, permission: 'inventory:view' },
  { labelKey: 'nav.customers', to: '/customers', icon: Users, permission: 'customer:view' },
  { labelKey: 'nav.sales', to: '/sales', icon: ShoppingCart, permission: 'order:create' },
  { labelKey: 'nav.payments', to: '/payments', icon: Banknote, permission: 'payment:view' },
  { labelKey: 'nav.invoices', to: '/invoices', icon: FileText, permission: 'invoice:view' },
  { labelKey: 'nav.deliveries', to: '/deliveries', icon: Truck, permission: 'delivery:view-assigned' },
  { labelKey: 'nav.reports', to: '/reports', icon: BarChart3, permission: 'report:view' },
  { labelKey: 'nav.users', to: '/users', icon: Shield, permission: 'user:manage' },
  { labelKey: 'nav.settings', to: '/settings', icon: Settings, permission: 'settings:manage' },
];

export function Sidebar() {
  const { t } = useTranslation();
  const { role } = useAuth();

  const visibleItems = navItems.filter(
    (item) => !item.permission || hasPermission(role as UserRole, item.permission),
  );

  return (
    <aside className="flex w-64 flex-col border-r bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <Package className="h-6 w-6 text-sidebar-primary" />
        <span className="text-lg font-bold text-sidebar-foreground">
          PharmaIMS
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
