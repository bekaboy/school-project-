import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@pharma-ims/shared';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/lib/utils/permissions';
import { useMediaQuery } from '@/hooks/use-media-query';
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
  ScrollText,
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
  { labelKey: 'nav.audit', to: '/audit', icon: ScrollText, permission: 'audit:view' },
  { labelKey: 'nav.users', to: '/users', icon: Shield, permission: 'user:manage' },
  { labelKey: 'nav.settings', to: '/settings', icon: Settings, permission: 'settings:manage' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { role } = useAuth();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const visibleItems = navItems.filter(
    (item) => !item.permission || hasPermission(role as UserRole, item.permission),
  );

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar">
      <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-4">
        <img src="/logo.png" alt="Era Med" className="h-14 object-contain" />
        <span className="text-lg font-bold text-sidebar-foreground">Era Med</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => isMobile && onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );

  if (!isMobile) return sidebar;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
        />
      )}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebar}
      </div>
    </>
  );
}
