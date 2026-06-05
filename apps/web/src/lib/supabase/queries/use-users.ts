import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import { adminCreateUser, adminDeleteUser } from '../auth';
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

export function useCreateUserWithAuth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      email: string;
      password: string;
      fullName: string;
      phone: string | null;
      role: string;
      isActive: boolean;
    }) => {
      const result = await adminCreateUser({
        email: params.email,
        password: params.password,
        role: params.role,
        fullName: params.fullName,
        phone: params.phone,
        isActive: params.isActive,
      });
      return result as Tables<'users'>;
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
    mutationFn: async ({ id, email }: { id: string; email: string }) => {
      const { error } = await supabase.from('users').update({ is_active: false }).eq('id', id);
      if (error) throw error;
      await adminDeleteUser(email).catch(() => {});
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}
