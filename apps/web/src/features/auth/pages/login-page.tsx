import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import { useCreateAuditLog } from '@/lib/supabase/queries';
import { useTranslation } from 'react-i18next';
import { cn, getLandingRoute } from '@/lib/utils';
import { loginSchema } from '@pharma-ims/shared';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const setRole = useAuthStore((s) => s.setRole);
  const rememberMe = useAuthStore((s) => s.rememberMe);
  const setRememberMe = useAuthStore((s) => s.setRememberMe);
  const auditLog = useCreateAuditLog();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState(localStorage.getItem('era-med-email') ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(0);

  const isLocked = Date.now() < lockoutUntil;
  const lockoutRemaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 60000));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLocked) {
      setError(`Account locked. Try again in ${lockoutRemaining} minute(s).`);
      return;
    }

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Invalid input');
      return;
    }

    setLoading(true);

    if (rememberMe) localStorage.setItem('era-med-email', email);
    else localStorage.removeItem('era-med-email');

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);
      if (newCount >= 5) {
        setLockoutUntil(Date.now() + 15 * 60 * 1000);
        setError('Too many failed attempts. Account locked for 15 minutes.');
        auditLog.mutate({
          action: 'ACCOUNT_LOCKOUT',
          entity_type: 'auth',
          entity_id: email,
          user_id: 'unknown',
          details: { email, attempts: newCount },
          ip_address: '',
        } as never);
      } else if (authError.message?.includes('Invalid login')) {
        setError(`Invalid email or password. Attempt ${newCount}/5.`);
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    setFailedAttempts(0);

    if (data.user) {
      const { data: userRecord } = await supabase
        .from('users')
        .select('is_active')
        .eq('email', email)
        .maybeSingle();

      if (userRecord && !userRecord.is_active) {
        await supabase.auth.signOut();
        setError('Account has been deactivated. Contact an administrator.');
        setLoading(false);
        return;
      }

      auditLog.mutate({
        action: 'LOGIN',
        entity_type: 'auth',
        entity_id: data.user.id,
        user_id: data.user.id,
        details: { email, method: 'password' },
        ip_address: '',
      } as never);

      const role = (data.user.user_metadata?.role as string) ?? null;
      setUser(data.user as unknown as any);
      setRole(role);
      navigate(getLandingRoute(role), { replace: true });
    }
  };

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/login`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setResetSent(true);
    }
  }

  useEffect(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('sb-'));
    keys.forEach((k) => localStorage.removeItem(k));
    supabase.auth.signOut().finally(() => setReady(true));
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fefaf2] p-6">
      <div
        className={cn(
          'absolute inset-0',
          '[background-size:24px_24px]',
          '[background-image:radial-gradient(#4B9E1A_1px,transparent_1px)]',
        )}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#fefaf2] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="relative z-10 w-full max-w-lg space-y-8">
        <div className="rounded-2xl bg-white/70 p-10 shadow-xl shadow-black/5 backdrop-blur-xl">
          <div className="mb-6 flex justify-center">
            <img src="/logo.png" alt="Era Med Pharmaceuticals" className="h-40 object-contain" />
          </div>

          {resetSent ? (
            <div className="text-center space-y-4">
              <p className="text-green-600 font-medium">Password reset link sent!</p>
              <p className="text-sm text-muted-foreground">
                Check your email inbox at <strong>{email}</strong> for the reset link.
              </p>
              <button
                onClick={() => setResetSent(false)}
                className="text-sm text-primary hover:underline"
              >
                Back to login
              </button>
            </div>
          ) : !ready ? (
            <div className="flex justify-center py-12">
              <span className="text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('auth.email')}</label>
                <input
                  type="email"
                  name="login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                  className="w-full rounded-lg border bg-white/60 px-4 py-3 text-base backdrop-blur-sm"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('auth.password')}</label>
                <input
                  type="password"
                  name="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-lg border bg-white/60 px-4 py-3 text-base backdrop-blur-sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Remember Me
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:underline"
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading || isLocked}
                className="w-full rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Please wait...' : isLocked ? `Locked (${lockoutRemaining}m)` : t('auth.login')}
              </button>
            </form>
          )}
        </div>

      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground">
        &copy; 2026 Era Med Pharmaceutical Wholesale PLC. All rights reserved.
      </footer>
    </div>
  );
}
