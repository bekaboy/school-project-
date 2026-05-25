import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function Header() {
  const { t, i18n } = useTranslation();
  const { user, role, signOut } = useAuth();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <h1 className="text-lg font-semibold text-foreground">
        {t('nav.dashboard')}
      </h1>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleLanguage}
          className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
        >
          {i18n.language === 'en' ? 'አማርኛ' : 'English'}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{role}</span>
          <span className="text-sm font-medium">{user?.email}</span>
          <button
            onClick={signOut}
            className="rounded-md bg-destructive px-3 py-1 text-sm text-destructive-foreground hover:bg-destructive/90"
          >
            {t('auth.logout')}
          </button>
        </div>
      </div>
    </header>
  );
}
