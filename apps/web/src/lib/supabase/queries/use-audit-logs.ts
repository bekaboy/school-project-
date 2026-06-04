import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../client';
import type { Tables, TablesInsert } from '@pharma-ims/shared';

const queryKey = ['audit_logs'] as const;

export function useAuditLogs() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, users(*)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAuditLog() {
  return useMutation({
    mutationFn: async (log: TablesInsert<'audit_logs'>) => {
      const { error } = await supabase.from('audit_logs').insert(log);
      if (error) throw error;
    },
  });
}
