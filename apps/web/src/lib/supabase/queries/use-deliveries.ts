import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import type { Tables, TablesInsert, TablesUpdate } from '@pharma-ims/shared';

const queryKey = ['deliveries'] as const;

export function useDeliveries() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*, sales_orders(*, customers(*)), users!deliveries_driver_id_fkey(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useDelivery(id: string) {
  return useQuery({
    queryKey: [...queryKey, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*, sales_orders(*), users!deliveries_driver_id_fkey(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useDeliveriesByDriver(driverId: string) {
  return useQuery({
    queryKey: [...queryKey, 'driver', driverId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*, sales_orders(*, customers(*))')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!driverId,
  });
}

export function useDeliveriesByStatus(status: string) {
  return useQuery({
    queryKey: [...queryKey, 'status', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*, sales_orders(*, customers(*))')
        .eq('status', status)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!status,
  });
}

export function useCreateDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (delivery: TablesInsert<'deliveries'>) => {
      const { data, error } = await supabase.from('deliveries').insert(delivery).select().single();
      if (error) throw error;
      return data as Tables<'deliveries'>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

export function useUpdateDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: TablesUpdate<'deliveries'> & { id: string }) => {
      const { data, error } = await supabase.from('deliveries').update(values).eq('id', id).select().single();
      if (error) throw error;
      return data as Tables<'deliveries'>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}
