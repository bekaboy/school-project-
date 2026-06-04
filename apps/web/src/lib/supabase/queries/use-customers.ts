import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import type { Tables, TablesInsert, TablesUpdate } from '@pharma-ims/shared';

const queryKey = ['customers'] as const;

export function useCustomers() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*').order('name');
      if (error) throw error;
      return data as Tables<'customers'>[];
    },
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: [...queryKey, id],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Tables<'customers'>;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (customer: TablesInsert<'customers'>) => {
      const { data, error } = await supabase.from('customers').insert(customer).select().single();
      if (error) throw error;
      return data as Tables<'customers'>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: TablesUpdate<'customers'> & { id: string }) => {
      const { data, error } = await supabase.from('customers').update(values).eq('id', id).select().single();
      if (error) throw error;
      return data as Tables<'customers'>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}
