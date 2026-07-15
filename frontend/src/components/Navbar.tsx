import { useTranslation } from 'react-i18next';
import { FiBell } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-blue-50 dark:border-slate-700 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Left — offset for mobile hamburger */}
      <div className="pl-12 lg:pl-0">
        <h1 className="text-sm sm:text-base font-bold text-text-dark">
          {t('dashboard.welcome')}, <span className="text-primary">{user?.fullName || 'User'}</span>
        </h1>
      </div>

      {/* Right — just the bell */}
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary hover:bg-primary-100 transition-colors">
          <FiBell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
}
