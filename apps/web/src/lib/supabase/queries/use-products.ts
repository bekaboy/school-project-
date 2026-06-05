import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import type { Tables, TablesInsert, TablesUpdate } from '@pharma-ims/shared';

const queryKey = ['products'] as const;

export function useProducts(page?: number, pageSize?: number, search?: string) {
  return useQuery({
    queryKey: [...queryKey, { page, pageSize, search }],
    queryFn: async () => {
      let query = supabase.from('products').select('*', { count: 'exact' });
      if (search) {
        const q = search.toLowerCase();
        query = query.or(
          `generic_name.ilike.%${q}%,brand_name.ilike.%${q}%,category.ilike.%${q}%,product_id.ilike.%${q}%`
        );
      }
      query = query.order('generic_name');
      if (page != null && pageSize) {
        const from = page * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }
      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data as Tables<'products'>[], count: count ?? 0 };
    },
    placeholderData: (prev) => prev,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [...queryKey, id],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Tables<'products'>;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: TablesInsert<'products'>) => {
      const { data, error } = await supabase.from('products').insert(product).select().single();
      if (error) throw error;
      return data as Tables<'products'>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: TablesUpdate<'products'> & { id: string }) => {
      const { data, error } = await supabase.from('products').update(values).eq('id', id).select().single();
      if (error) throw error;
      return data as Tables<'products'>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').update({ active_status: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}
