import { Suspense, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { Sidebar } from './sidebar';
import { Header } from './header';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 1000;

export function AppLayout() {
  const navigate = useNavigate();
  const lastActivity = useAuthStore((s) => s.lastActivity);
  const updateActivity = useAuthStore((s) => s.updateActivity);
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);

  const checkSession = useCallback(() => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const elapsed = Date.now() - useAuthStore.getState().lastActivity;
    if (elapsed > SESSION_TIMEOUT_MS) {
      useAuthStore.getState().setUser(null);
      useAuthStore.getState().setRole(null);
      navigate('/auth/login');
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(checkSession, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkSession]);

  useEffect(() => {
    const handlers = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const;
    const handler = () => updateActivity();
    handlers.forEach((e) => window.addEventListener(e, handler));
    return () => handlers.forEach((e) => window.removeEventListener(e, handler));
  }, [updateActivity]);

  if (!user && !role) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="relative flex-1 overflow-y-auto">
          <div className="absolute inset-0 bg-white">
            <div
              className={cn(
                'absolute inset-0',
                '[background-size:24px_24px]',
                '[background-image:linear-gradient(to_right,#4B9E1A20_1px,transparent_1px),linear-gradient(to_bottom,#4B9E1A20_1px,transparent_1px)]',
              )}
            />
            <div className="pointer-events-none absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
          </div>
          <div className="relative z-10 p-6">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
