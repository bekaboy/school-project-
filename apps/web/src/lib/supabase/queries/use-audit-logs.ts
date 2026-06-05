import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../client';
import type { Tables, TablesInsert } from '@pharma-ims/shared';

const queryKey = ['audit_logs'] as const;

export function useAuditLogs() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const [auditRes, usersRes] = await Promise.all([
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('users').select('id, full_name'),
      ]);
      if (auditRes.error) throw auditRes.error;
      if (usersRes.error) throw usersRes.error;

      const nameByUserId = new Map(usersRes.data.map((u) => [u.id, u.full_name]));

      return auditRes.data.map((log) => ({
        ...log,
        user_name: log.user_id ? (nameByUserId.get(log.user_id) ?? null) : null,
      }));
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
