import type { User, AuthResponse } from '@supabase/supabase-js';
import { supabase } from './client';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  return { data, error };
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user as User | null;
}

const FUNCTIONS_BASE = '/.netlify/functions';

export async function adminCreateUser(params: {
  email: string;
  password: string;
  role: string;
  fullName: string;
  phone: string | null;
  isActive: boolean;
}): Promise<{ id: string }> {
  const res = await fetch(`${FUNCTIONS_BASE}/create-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to create user');
  return body;
}

export async function adminDeleteUser(email: string): Promise<void> {
  const res = await fetch(`${FUNCTIONS_BASE}/delete-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Failed to delete user');
  }
}
