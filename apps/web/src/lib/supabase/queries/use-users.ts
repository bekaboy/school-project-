import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import type { Tables, TablesInsert, TablesUpdate } from '@pharma-ims/shared';

const queryKey = ['users'] as const;

export function useUsers() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*').order('full_name');
      if (error) throw error;
      return data as Tables<'users'>[];
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: [...queryKey, id],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Tables<'users'>;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (user: TablesInsert<'users'>) => {
      const { data, error } = await supabase.from('users').insert(user).select().single();
      if (error) throw error;
      return data as Tables<'users'>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: TablesUpdate<'users'> & { id: string }) => {
      const { data, error } = await supabase.from('users').update(values).eq('id', id).select().single();
      if (error) throw error;
      return data as Tables<'users'>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}
