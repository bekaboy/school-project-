import { useState } from 'react';
import { useUsers, useDeleteUser, useCreateAuditLog } from '@/lib/supabase/queries';
import { UserTable } from '@/features/users/components/user-table';
import { UserForm } from '@/features/users/components/user-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import type { Tables } from '@pharma-ims/shared';

export function UserManagementPage() {
  const { data: users, isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const auditLog = useCreateAuditLog();
  const currentUser = useAuthStore((s) => s.user);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Tables<'users'> | null>(null);

  function handleEdit(user: Tables<'users'>) {
    setEditingUser(user);
    setFormOpen(true);
  }

  function handleAdd() {
    setEditingUser(null);
    setFormOpen(true);
  }

  function handleSave(action: 'USER_CREATE' | 'USER_EDIT', userId: string, userName: string) {
    auditLog.mutate({
      action,
      entity_type: 'user',
      entity_id: userId || 'new',
      user_id: currentUser?.id ?? '',
      details: { target: userName },
      ip_address: '',
    } as never);
  }

  function handleDelete(id: string) {
    const target = users?.find((u) => u.id === id);
    if (!window.confirm(`Delete user "${target?.full_name ?? id}"? This action cannot be undone.`)) return;

    auditLog.mutate({
      action: 'USER_DELETE',
      entity_type: 'user',
      entity_id: id,
      user_id: currentUser?.id ?? '',
      details: { deleted_user: target?.full_name, email: target?.email },
      ip_address: '',
    } as never);

    deleteUser.mutate({ id, email: target?.email ?? '' });
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users, roles, and account status.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <UserTable
        users={(users ?? []) as Tables<'users'>[]}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <UserForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingUser(null);
        }}
        user={editingUser}
        onSave={handleSave}
      />
    </div>
  );
}
