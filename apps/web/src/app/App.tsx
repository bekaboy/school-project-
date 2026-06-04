import { AppProviders } from './providers';
import { AppRouter } from './router';
import { Toaster } from '@/components/ui/toaster';

export function App() {
  return (
    <AppProviders>
      <AppRouter />
      <Toaster />
    </AppProviders>
  );
}
