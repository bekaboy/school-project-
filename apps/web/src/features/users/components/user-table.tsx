import { useState, useMemo } from 'react';
import type { Tables } from '@pharma-ims/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils/formatters';
import { Pencil, Trash2, Search } from 'lucide-react';

const roleColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Technical Manager/Owner': 'default',
  'Store Manager': 'default',
  'Finance Officer': 'secondary',
  'Sales Representative': 'secondary',
  'Delivery Driver': 'outline',
};

interface UserTableProps {
  users: Tables<'users'>[];
  onEdit: (user: Tables<'users'>) => void;
  onDelete?: (id: string) => void;
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.phone ?? '').includes(q),
    );
  }, [users, search]);

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-16">Edit</TableHead>
              {onDelete && <TableHead className="w-16" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={onDelete ? 8 : 7} className="h-32 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell className="font-mono text-sm">{user.phone ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={roleColor[user.role] ?? 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active !== false ? 'default' : 'secondary'}>
                      {user.is_active !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(user.created_at ?? '')}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  {onDelete && (
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(user.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {users.length} users
      </p>
    </div>
  );
}
