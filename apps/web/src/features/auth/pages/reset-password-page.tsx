import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { passwordSchema } from '@pharma-ims/shared';
import { cn } from '@/lib/utils';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Invalid password');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate('/auth/login'), 3000);
  }

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

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl bg-white/70 p-10 shadow-xl shadow-black/5 backdrop-blur-xl">
          <div className="mb-6 flex justify-center">
            <img src="/logo.png" alt="Era Med Pharmaceuticals" className="h-32 object-contain" />
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <p className="text-green-600 font-medium">Password updated successfully!</p>
              <p className="text-sm text-muted-foreground">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h1 className="text-xl font-bold text-center">Reset Password</h1>
              <p className="text-sm text-muted-foreground text-center">
                Enter your new password.
              </p>

              <div>
                <label className="block text-sm font-medium mb-1.5">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border bg-white/60 px-4 py-3 text-base backdrop-blur-sm"
                  placeholder="Min 8 chars, upper, lower, number, special"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border bg-white/60 px-4 py-3 text-base backdrop-blur-sm"
                />
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Password must contain:</p>
                <ul className="list-disc pl-4">
                  <li className={password.length >= 8 ? 'text-green-600' : ''}>At least 8 characters</li>
                  <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>One uppercase letter</li>
                  <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>One lowercase letter</li>
                  <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>One number</li>
                  <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : ''}>One special character</li>
                </ul>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
