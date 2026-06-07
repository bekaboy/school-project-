import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useMediaQuery } from '@/hooks/use-media-query';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { user, role, signOut } = useAuth();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en');
  };

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="rounded-md p-2 hover:bg-muted"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-base font-semibold text-foreground md:text-lg">
          {t('nav.dashboard')}
        </h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={toggleLanguage}
          className="rounded-md border px-2 py-1 text-xs hover:bg-muted md:px-3 md:text-sm"
        >
          {i18n.language === 'en' ? 'አማርኛ' : 'English'}
        </button>
        {!isMobile && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{role}</span>
            <span className="text-sm font-medium">{user?.email}</span>
          </div>
        )}
        <button
          onClick={signOut}
          className="rounded-md bg-destructive px-2 py-1 text-xs text-destructive-foreground hover:bg-destructive/90 md:px-3 md:text-sm"
        >
          {t('auth.logout')}
        </button>
      </div>
    </header>
  );
}
