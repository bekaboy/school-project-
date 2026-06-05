import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import type { Tables, TablesInsert, TablesUpdate } from '@pharma-ims/shared';

const queryKey = ['batches'] as const;

export function useBatches() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from('batches').select('*, products(*)').order('expiry_date');
      if (error) throw error;
      return data;
    },
  });
}

export function useMarkExpiredBatches() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('batches')
        .update({ batch_status: 'Expired' })
        .eq('batch_status', 'Active')
        .lt('expiry_date', today);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['batches'] }),
  });
}

export function useBatchesByProduct(productId: string) {
  return useQuery({
    queryKey: [...queryKey, 'product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('product_id', productId)
        .order('manufacturing_date');
      if (error) throw error;
      return data as Tables<'batches'>[];
    },
    enabled: !!productId,
  });
}

export function useBatch(id: string) {
  return useQuery({
    queryKey: [...queryKey, id],
    queryFn: async () => {
      const { data, error } = await supabase.from('batches').select('*, products(*)').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (batch: TablesInsert<'batches'>) => {
      const { data, error } = await supabase.from('batches').insert(batch).select().single();
      if (error) throw error;
      return data as Tables<'batches'>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['batches'] }),
  });
}

export function useUpdateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: TablesUpdate<'batches'> & { id: string }) => {
      const { data, error } = await supabase.from('batches').update(values).eq('id', id).select().single();
      if (error) throw error;
      return data as Tables<'batches'>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['batches'] }),
  });
}

export function useDeleteBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('batches').update({ batch_status: 'Expired' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['batches'] }),
  });
}
