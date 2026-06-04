import { useState } from 'react';
import { useCustomers, useDeleteCustomer } from '@/lib/supabase/queries';
import { CustomerTable } from '@/features/customers/components/customer-table';
import { CustomerForm } from '@/features/customers/components/customer-form';
import { OrderHistoryDialog } from '@/features/customers/components/order-history-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Tables } from '@pharma-ims/shared';

export function CustomerPage() {
  const { data: customers, isLoading } = useCustomers();
  const deleteCustomer = useDeleteCustomer();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Tables<'customers'> | null>(null);
  const [ordersCustomer, setOrdersCustomer] = useState<Tables<'customers'> | null>(null);

  function handleEdit(customer: Tables<'customers'>) {
    setEditingCustomer(customer);
    setFormOpen(true);
  }

  function handleDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer.mutate(id);
    }
  }

  function handleAdd() {
    setEditingCustomer(null);
    setFormOpen(true);
  }

  function handleViewOrders(customer: Tables<'customers'>) {
    setOrdersCustomer(customer);
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage customer accounts and credit limits.</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <CustomerTable
        customers={customers ?? []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewOrders={handleViewOrders}
      />

      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editingCustomer}
      />

      {ordersCustomer && (
        <OrderHistoryDialog
          open={!!ordersCustomer}
          onOpenChange={(open) => { if (!open) setOrdersCustomer(null); }}
          customer={ordersCustomer}
        />
      )}
    </div>
  );
}
