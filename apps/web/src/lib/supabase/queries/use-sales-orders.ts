import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import type { Tables, TablesInsert, TablesUpdate } from '@pharma-ims/shared';

const queryKey = ['sales_orders'] as const;

export function useSalesOrders(salesRepId?: string, page?: number, pageSize?: number, search?: string) {
  const baseKey = salesRepId ? [...queryKey, 'my', salesRepId] : queryKey;
  return useQuery({
    queryKey: [...baseKey, { page, pageSize, search }],
    queryFn: async () => {
      let query = supabase
        .from('sales_orders')
        .select('*, customers(*), users!sales_orders_sales_rep_id_fkey(*), order_items(*, products(*), batches(*))', { count: 'exact' })
        .order('created_at', { ascending: false });
      if (salesRepId) {
        query = query.eq('sales_rep_id', salesRepId);
      }
      if (search) {
        const q = search.toLowerCase();
        query = query.or(`order_id.ilike.%${q}%,status.ilike.%${q}%`);
      }
      if (page != null && pageSize) {
        const from = page * pageSize;
        query = query.range(from, from + pageSize - 1);
      }
      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
    placeholderData: (prev) => prev,
  });
}

export function useSalesOrder(id: string) {
  return useQuery({
    queryKey: [...queryKey, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_orders')
        .select('*, customers(*), users!sales_orders_sales_rep_id_fkey(*), order_items(*, products(*), batches(*))')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useOrdersByCustomer(customerId: string) {
  return useQuery({
    queryKey: [...queryKey, 'customer', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Tables<'sales_orders'>[];
    },
    enabled: !!customerId,
  });
}

export function useOrdersByStatus(status: string) {
  return useQuery({
    queryKey: [...queryKey, 'status', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_orders')
        .select('*, customers(*), users!sales_orders_sales_rep_id_fkey(*), order_items(*, products(*), batches(*))')
        .eq('status', status)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!status,
  });
}

export function useCreateSalesOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (order: TablesInsert<'sales_orders'>) => {
      const { data, error } = await supabase.from('sales_orders').insert(order).select().single();
      if (error) throw error;
      return data as Tables<'sales_orders'>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

export function useUpdateSalesOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: TablesUpdate<'sales_orders'> & { id: string }) => {
      const { data, error } = await supabase.from('sales_orders').update(values).eq('id', id).select().single();
      if (error) throw error;
      return data as Tables<'sales_orders'>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}
