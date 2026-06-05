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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user as unknown as User);
        setRole((session.user.user_metadata?.role as string) ?? null);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user as unknown as User);
        setRole((session.user.user_metadata?.role as string) ?? null);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => listener?.subscription.unsubscribe();
  }, [setUser, setRole, setLoading]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    navigate('/auth/login');
  };

  return { user, role, isLoading, signOut };
}
