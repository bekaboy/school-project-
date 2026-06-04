import { useState, useMemo } from 'react';
import { useAuditLogs } from '@/lib/supabase/queries';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/formatters';

const ENTITY_TYPES = ['', 'order', 'payment', 'invoice', 'delivery', 'user', 'product', 'batch', 'customer', 'auth'] as const;
const ACTIONS = ['', 'created', 'updated', 'deleted', 'verified', 'rejected', 'assigned', 'generated', 'status_change', 'STOCK_ADJUST', 'LOGIN', 'ACCOUNT_LOCKOUT', 'QUARANTINE'] as const;

function entityBadge(type: string) {
  const colors: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    order: 'default',
    payment: 'secondary',
    invoice: 'default',
    delivery: 'outline',
    user: 'secondary',
    product: 'outline',
    batch: 'destructive',
    customer: 'secondary',
  };
  return <Badge variant={colors[type] ?? 'secondary'} className="capitalize">{type}</Badge>;
}

function actionBadge(action: string) {
  const colors: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    created: 'default',
    updated: 'secondary',
    deleted: 'destructive',
    verified: 'default',
    rejected: 'destructive',
    assigned: 'outline',
    generated: 'default',
    status_change: 'secondary',
    STOCK_ADJUST: 'default',
    LOGIN: 'secondary',
    ACCOUNT_LOCKOUT: 'destructive',
    QUARANTINE: 'outline',
  };
  return (
    <Badge variant={colors[action] ?? 'secondary'} className="capitalize">
      {action.replace(/_/g, ' ')}
    </Badge>
  );
}

interface AuditLogRow {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string | null;
  ip_address: string | null;
  user_id: string | null;
  users: { full_name: string } | null;
}

export function AuditLogPage() {
  const { data: logs, isLoading } = useAuditLogs();
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!logs) return [];
    const typed = logs as AuditLogRow[];
    return typed.filter((l) => {
      if (entityFilter && l.entity_type !== entityFilter) return false;
      if (actionFilter && l.action !== actionFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const user = l.users?.full_name?.toLowerCase() ?? '';
        return l.action.includes(q) || l.entity_type.includes(q) || l.entity_id.toLowerCase().includes(q) || user.includes(q);
      }
      return true;
    });
  }, [logs, entityFilter, actionFilter, search]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">Track all system actions and changes.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Entities</SelectItem>
            {ENTITY_TYPES.filter(Boolean).map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Actions</SelectItem>
            {ACTIONS.filter(Boolean).map((a) => (
              <SelectItem key={a} value={a}>{a.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No audit logs found.</TableCell>
              </TableRow>
            ) : (
              filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm whitespace-nowrap">{formatDateTime(log.created_at ?? '')}</TableCell>
                  <TableCell className="text-sm">{log.users?.full_name ?? 'System'}</TableCell>
                  <TableCell>{entityBadge(log.entity_type)}</TableCell>
                  <TableCell>{actionBadge(log.action)}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.entity_id.slice(0, 8)}...</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.ip_address ?? '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {(logs as unknown[])?.length ?? 0} log entries
      </p>
    </div>
  );
}
