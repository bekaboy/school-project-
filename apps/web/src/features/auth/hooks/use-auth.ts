import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const navigate = useNavigate();
  const store = useAuthStore();
  const { user, role, isLoading, setUser, setRole, setLoading } = store;

  useEffect(() => {
    const storeUser = useAuthStore.getState().user;
    if (storeUser && 'id' in storeUser && storeUser.id === 'dev-mode') {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user as unknown as User);
        setRole((session.user.user_metadata?.role as string) ?? null);
      } else {
        const current = useAuthStore.getState().user;
        if (!current || current.id !== 'dev-mode') {
          setUser(null);
          setRole(null);
        }
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user as unknown as User);
        setRole((session.user.user_metadata?.role as string) ?? null);
      } else {
        const current = useAuthStore.getState().user;
        if (!current || current.id !== 'dev-mode') {
          setUser(null);
          setRole(null);
        }
      }
      setLoading(false);
    });

    return () => listener?.subscription.unsubscribe();
  }, [setUser, setRole, setLoading]);

  const signOut = async () => {
    const current = useAuthStore.getState().user;
    if (current?.id !== 'dev-mode') {
      await supabase.auth.signOut();
    }
    setUser(null);
    setRole(null);
    navigate('/auth/login');
  };

  return { user, role, isLoading, signOut };
}
