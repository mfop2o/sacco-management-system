import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiBarChart2, FiCheck, FiCreditCard, FiDollarSign,
  FiGlobe, FiKey, FiLogOut, FiMenu, FiMonitor,
  FiMoon, FiPlus, FiRepeat, FiSave, FiSettings,
  FiShield, FiSun, FiTrendingUp, FiUsers, FiX
} from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, type ThemeMode } from '../contexts/ThemeContext';

const LANGUAGES = [
  { code: 'en', native: 'English' },
  { code: 'am', native: 'አማርኛ' },
  { code: 'om', native: 'Afaan Oromoo' },
];

const THEMES: { value: ThemeMode; icon: React.ElementType; key: string }[] = [
  { value: 'light', icon: FiSun, key: 'sidebar.themeLight' },
  { value: 'dark', icon: FiMoon, key: 'sidebar.themeDark' },
  { value: 'system', icon: FiMonitor, key: 'sidebar.themeSystem' },
];

const NAV_ITEMS = [
  { to: '/', key: 'nav.dashboard', icon: FiBarChart2, roles: null, exact: true },
  { to: '/members', key: 'nav.members', icon: FiUsers, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER', 'LOAN_OFFICER'], exact: true },
  { to: '/loans', key: 'nav.loans', icon: FiDollarSign, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'MEMBER'], exact: true },
  { to: '/my-loans', key: 'nav.myLoans', icon: FiDollarSign, roles: ['MEMBER'], exact: true },
  { to: '/loans/apply', key: 'nav.loanApplication', icon: FiPlus, roles: ['MEMBER'], exact: true },
  { to: '/loans/approval', key: 'nav.loanApprovals', icon: FiCheck, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER'], exact: true },
  { to: '/loans/pay', key: 'nav.loanRepayment', icon: FiTrendingUp, roles: ['MEMBER'], exact: true },
  { to: '/repayment', key: 'nav.repayment', icon: FiRepeat, roles: ['MEMBER', 'TELLER', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'SUPER_ADMIN', 'SYSTEM_ADMIN'], exact: true },
  { to: '/savings', key: 'nav.savings', icon: FiSave, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER', 'ACCOUNTANT'], exact: true },
  { to: '/transactions', key: 'nav.transactions', icon: FiCreditCard, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER', 'ACCOUNTANT'], exact: true },
  { to: '/users', key: 'nav.users', icon: FiShield, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'], exact: true },
  { to: '/roles', key: 'nav.rolesPermissions', icon: FiKey, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'], exact: true },
];

function SidebarContent({
  onClose,
  showProfile, setShowProfile,
  showLang, setShowLang,
  showTheme, setShowTheme,
  profileRef, langRef, themeRef,
}: {
  onClose: () => void;
  showProfile: boolean; setShowProfile: (v: boolean) => void;
  showLang: boolean; setShowLang: (v: boolean) => void;
  showTheme: boolean; setShowTheme: (v: boolean) => void;
  profileRef: React.RefObject<HTMLDivElement | null>;
  langRef: React.RefObject<HTMLDivElement | null>;
  themeRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { hasRole, user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const { mode, setMode } = useTheme();

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18n_lang', code);
    setShowLang(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-blue-50 dark:border-slate-700 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-primary/30 shrink-0">H</div>
          <div>
            <div className="text-sm font-extrabold text-text-dark tracking-wide">HUNDAAF</div>
            <div className="text-[10px] font-semibold text-text-soft uppercase tracking-widest">SACCO Portal</div>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded-lg text-text-soft hover:bg-primary-50">
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Nav — flex-1 + min-h-0 allows scroll without overflow blocking clicks */}
      <nav className="flex-1 min-h-0 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="px-3 text-[10px] font-bold text-text-soft uppercase tracking-widest mb-2">{t('sidebar.menu')}</p>
        {NAV_ITEMS.map(item => {
          if (item.roles && !hasRole(item.roles)) return null;
          return (
              <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
                  ? 'bg-primary text-white shadow-sm shadow-primary/25'
                  : 'text-text-mid hover:text-primary hover:bg-primary-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`text-[17px] shrink-0 ${isActive ? 'text-white' : 'text-text-soft'}`} />
                  <span>{t(item.key)}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom toolbar */}
      <div className="shrink-0 border-t border-blue-50 dark:border-slate-700 px-3 py-3">
        <div className="flex items-center gap-1">

          {/* Profile */}
          <div className="relative flex-1" ref={profileRef}>
            <button
              onClick={() => { setShowProfile(!showProfile); setShowLang(false); setShowTheme(false); }}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-primary-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0">{initials}</div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-text-dark truncate leading-tight">{user?.fullName?.split(' ')[0]}</p>
                <p className="text-[10px] text-text-soft truncate capitalize">{user?.role?.toLowerCase().replace(/_/g, ' ')}</p>
              </div>
            </button>

            {showProfile && (
              <div className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-blue-50 dark:border-slate-700 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-blue-50 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">{initials}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-dark truncate">{user?.fullName}</p>
                      <p className="text-xs text-text-soft truncate">{user?.username}</p>
                    </div>
                  </div>
                  <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary capitalize">
                    {user?.role?.toLowerCase().replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { setShowProfile(false); setShowTheme(true); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-text-mid hover:bg-primary-50 hover:text-primary transition-colors"
                  >
                    <FiSettings className="w-4 h-4 shrink-0" />{t('sidebar.settings')}
                  </button>
                  <button
                    onClick={() => { setShowProfile(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-text-mid hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <FiLogOut className="w-4 h-4 shrink-0" />{t('sidebar.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Language */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => { setShowLang(!showLang); setShowProfile(false); setShowTheme(false); }}
              className="w-9 h-9 rounded-xl hover:bg-primary-50 flex items-center justify-center text-text-soft hover:text-primary transition-colors"
              title={t('sidebar.language')}
            >
              <FiGlobe className="w-4 h-4" />
            </button>
            {showLang && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-blue-50 dark:border-slate-700 overflow-hidden z-50">
                <p className="px-4 py-2.5 text-[10px] font-bold text-text-soft uppercase tracking-widest border-b border-blue-50 dark:border-slate-700">{t('sidebar.language')}</p>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${i18n.language === lang.code
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-text-mid hover:bg-primary-50 hover:text-primary'
                      }`}
                  >
                    <span>{lang.native}</span>
                    {i18n.language === lang.code && <FiCheck className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => { setShowTheme(!showTheme); setShowProfile(false); setShowLang(false); }}
              className="w-9 h-9 rounded-xl hover:bg-primary-50 flex items-center justify-center text-text-soft hover:text-primary transition-colors"
              title={t('sidebar.theme')}
            >
              {mode === 'dark' ? <FiMoon className="w-4 h-4" /> : mode === 'system' ? <FiMonitor className="w-4 h-4" /> : <FiSun className="w-4 h-4" />}
            </button>
            {showTheme && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-blue-50 dark:border-slate-700 overflow-hidden z-50">
                <p className="px-4 py-2.5 text-[10px] font-bold text-text-soft uppercase tracking-widest border-b border-blue-50 dark:border-slate-700">{t('sidebar.theme')}</p>
                {THEMES.map(th => (
                  <button
                    key={th.value}
                    onClick={() => { setMode(th.value); setShowTheme(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${mode === th.value
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-text-mid hover:bg-primary-50 hover:text-primary'
                      }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <th.icon className="w-3.5 h-3.5" />
                      {t(th.key)}
                    </span>
                    {mode === th.value && <FiCheck className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showTheme, setShowTheme] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setShowLang(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setShowTheme(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const contentProps = {
    onClose: () => setOpen(false),
    showProfile, setShowProfile,
    showLang, setShowLang,
    showTheme, setShowTheme,
    profileRef, langRef, themeRef,
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 rounded-xl bg-white border border-blue-100 shadow-sm flex items-center justify-center text-primary"
      >
        <FiMenu className="w-5 h-5" />
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-blue-100 dark:border-slate-700 shadow-xl transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent {...contentProps} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-30 bg-white dark:bg-slate-900 border-r border-blue-100 dark:border-slate-700 shadow-sm">
        <SidebarContent {...contentProps} />
      </aside>
    </>
  );
}
