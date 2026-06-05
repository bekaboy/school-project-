import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import type { Tables, TablesInsert, TablesUpdate } from '@pharma-ims/shared';

const queryKey = ['customers'] as const;

export function useCustomers(page?: number, pageSize?: number, search?: string) {
  return useQuery({
    queryKey: [...queryKey, { page, pageSize, search }],
    queryFn: async () => {
      let query = supabase.from('customers').select('*', { count: 'exact' });
      if (search) {
        const q = search.toLowerCase();
        query = query.or(
          `name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%,contact_person.ilike.%${q}%`
        );
      }
      query = query.order('name');
      if (page != null && pageSize) {
        const from = page * pageSize;
        query = query.range(from, from + pageSize - 1);
      }
      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data as Tables<'customers'>[], count: count ?? 0 };
    },
    placeholderData: (prev) => prev,
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
