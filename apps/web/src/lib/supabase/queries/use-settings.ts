import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';

export interface UserSettings {
  id: string;
  user_id: string;
  company_name: string;
  amharic_name: string;
  tax_id: string;
  vat_registration: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  default_tax_rate: string;
  low_stock_threshold: string;
  expiry_warning_period: string;
}

const queryKey = ['user_settings'] as const;

export function useSettings(userId: string | undefined) {
  return useQuery({
    queryKey: [...queryKey, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data as UserSettings | null;
    },
    enabled: !!userId,
  });
}

export function useUpsertSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert(settings, { onConflict: 'user_id' })
        .select()
        .single();
      if (error) throw error;
      return data as UserSettings;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}
