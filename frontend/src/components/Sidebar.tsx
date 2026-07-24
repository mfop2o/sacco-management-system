import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiBarChart2, FiCheck, FiChevronLeft, FiChevronRight,
  FiCreditCard, FiDollarSign,
  FiGlobe, FiKey, FiLogOut, FiMenu, FiMonitor,
  FiMoon, FiPlus, FiRepeat, FiSave, FiSettings,
  FiShield, FiSun, FiTrendingUp, FiUsers, FiX
} from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, type ThemeMode } from '../contexts/ThemeContext';
import { useSidebar } from '../contexts/SidebarContext';
import logo from '../assets/logo.png';

const LANGUAGES = [
  { code: 'en', native: 'English' },
  { code: 'am', native: 'አማርኛ' },
  { code: 'om', native: 'Afaan Oromoo' },
];

const THEMES: { value: ThemeMode; icon: React.ElementType; key: string }[] = [
  { value: 'light', icon: FiSun, key: 'sidebar_themeLight' },
  { value: 'dark', icon: FiMoon, key: 'sidebar_themeDark' },
  { value: 'system', icon: FiMonitor, key: 'sidebar_themeSystem' },
];

const NAV_ITEMS = [
  { to: '/', key: 'sidebar_dashboard', icon: FiBarChart2, roles: null, exact: true },
  { to: '/members', key: 'sidebar_members', icon: FiUsers, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER', 'LOAN_OFFICER'], exact: true },
  { to: '/loans', key: 'sidebar_loans', icon: FiDollarSign, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'MEMBER'], exact: true },
  { to: '/my-loans', key: 'sidebar_myLoans', icon: FiDollarSign, roles: ['MEMBER'], exact: true },
  { to: '/loans/apply', key: 'sidebar_loanApplication', icon: FiPlus, roles: ['MEMBER'], exact: true },
  { to: '/loans/approval', key: 'sidebar_loanApprovals', icon: FiCheck, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER'], exact: true },
  { to: '/loans/pay', key: 'sidebar_loanRepayment', icon: FiTrendingUp, roles: ['MEMBER'], exact: true },
  { to: '/repayment', key: 'sidebar_repayment', icon: FiRepeat, roles: ['MEMBER', 'TELLER', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'SUPER_ADMIN', 'SYSTEM_ADMIN'], exact: true },
  { to: '/savings', key: 'sidebar_savings', icon: FiSave, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER', 'ACCOUNTANT'], exact: true },
  { to: '/transactions', key: 'sidebar_transactions', icon: FiCreditCard, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'TELLER', 'ACCOUNTANT'], exact: true },
  { to: '/users', key: 'sidebar_users', icon: FiShield, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'], exact: true },
  { to: '/roles', key: 'sidebar_rolesPermissions', icon: FiKey, roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'], exact: true },
];

function SidebarContent({
  onClose,
  collapsed, onToggleCollapse,
  showProfile, setShowProfile,
  showLang, setShowLang,
  showTheme, setShowTheme,
  profileRef, langRef, themeRef,
}: {
  onClose: () => void;
  collapsed: boolean; onToggleCollapse: () => void;
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

      {/* Logo + collapse toggle */}
      <div className="px-3 py-3 border-b border-blue-50 dark:border-slate-700 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={logo} alt="SACCO" className="w-7 h-7 rounded-lg object-contain shadow-sm shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-text-dark tracking-wide truncate">HUNDAAF</div>
              <div className="text-[9px] font-semibold text-text-soft uppercase tracking-widest truncate">SACCO Portal</div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onClose} className="lg:hidden p-1 rounded-md text-text-soft hover:bg-primary-50">
            <FiX className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-6 h-6 rounded-md items-center justify-center text-text-soft hover:bg-primary-50 hover:text-primary transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <FiChevronRight className="w-3.5 h-3.5" /> : <FiChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Nav — scrollable */}
      <nav className="flex-1 min-h-0 px-2 py-3 overflow-y-auto space-y-0.5 scrollbar-thin">
        {!collapsed && (
          <p className="px-2.5 text-[9px] font-bold text-text-soft uppercase tracking-widest mb-1.5">{t('sidebar_menu')}</p>
        )}
        {NAV_ITEMS.map(item => {
          if (item.roles && !hasRole(item.roles)) return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={onClose}
              title={collapsed ? t(item.key) : undefined}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${collapsed ? 'px-0 py-2 justify-center' : 'px-2.5 py-2'} ${isActive
                  ? 'bg-primary text-white shadow-sm shadow-primary/25'
                  : 'text-text-mid hover:text-primary hover:bg-primary-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex items-center justify-center w-6 h-6 rounded-md shrink-0 transition-all ${isActive ? 'bg-white/20' : 'bg-primary-100'}`}>
                    <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-primary'}`} />
                  </span>
                  {!collapsed && <span>{t(item.key)}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom toolbar */}
      <div className="shrink-0 border-t border-blue-50 dark:border-slate-700 px-2 py-2">
        <div className={`flex items-center ${collapsed ? 'flex-col gap-1' : 'gap-1'}`}>

          {/* Profile */}
          <div className={`${collapsed ? 'w-full' : 'relative flex-1'}`} ref={profileRef}>
            <button
              onClick={() => { setShowProfile(!showProfile); setShowLang(false); setShowTheme(false); }}
              className={`w-full flex items-center gap-1.5 rounded-lg hover:bg-primary-50 transition-colors ${collapsed ? 'justify-center px-1 py-2' : 'px-2 py-1.5'}`}
              title={collapsed ? user?.fullName : undefined}
            >
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[9px] font-bold shrink-0">{initials}</div>
              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[11px] font-semibold text-text-dark truncate leading-tight">{user?.fullName?.split(' ')[0]}</p>
                  <p className="text-[9px] text-text-soft truncate capitalize">{user?.role?.toLowerCase().replace(/_/g, ' ')}</p>
                </div>
              )}
            </button>

            {showProfile && (
              <div className="absolute bottom-full left-0 mb-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-blue-50 dark:border-slate-700 overflow-hidden z-50">
                <div className="px-3 py-2.5 border-b border-blue-50 dark:border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">{initials}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text-dark truncate">{user?.fullName}</p>
                      <p className="text-[10px] text-text-soft truncate">{user?.username}</p>
                    </div>
                  </div>
                  <span className="mt-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary-100 text-primary capitalize">
                    {user?.role?.toLowerCase().replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { setShowProfile(false); setShowTheme(true); }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-text-mid hover:bg-primary-50 hover:text-primary transition-colors"
                  >
                    <FiSettings className="w-3.5 h-3.5 shrink-0" />{t('sidebar_settings')}
                  </button>
                  <button
                    onClick={() => { setShowProfile(false); logout(); }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-text-mid hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <FiLogOut className="w-3.5 h-3.5 shrink-0" />{t('sidebar_logout')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Language */}
          {!collapsed && (
            <div className="relative" ref={langRef}>
              <button
                onClick={() => { setShowLang(!showLang); setShowProfile(false); setShowTheme(false); }}
                className="w-7 h-7 rounded-lg hover:bg-primary-50 flex items-center justify-center text-text-soft hover:text-primary transition-colors"
                title={t('sidebar_language')}
              >
                <FiGlobe className="w-3.5 h-3.5" />
              </button>
              {showLang && (
                <div className="absolute bottom-full right-0 mb-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-blue-50 dark:border-slate-700 overflow-hidden z-50">
                  <p className="px-3 py-2 text-[9px] font-bold text-text-soft uppercase tracking-widest border-b border-blue-50 dark:border-slate-700">{t('sidebar_language')}</p>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${i18n.language === lang.code
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-text-mid hover:bg-primary-50 hover:text-primary'
                        }`}
                    >
                      <span>{lang.native}</span>
                      {i18n.language === lang.code && <FiCheck className="w-3 h-3 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Theme */}
          {!collapsed && (
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => { setShowTheme(!showTheme); setShowProfile(false); setShowLang(false); }}
                className="w-7 h-7 rounded-lg hover:bg-primary-50 flex items-center justify-center text-text-soft hover:text-primary transition-colors"
                title={t('sidebar_theme')}
              >
                {mode === 'dark' ? <FiMoon className="w-3.5 h-3.5" /> : mode === 'system' ? <FiMonitor className="w-3.5 h-3.5" /> : <FiSun className="w-3.5 h-3.5" />}
              </button>
              {showTheme && (
                <div className="absolute bottom-full right-0 mb-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-blue-50 dark:border-slate-700 overflow-hidden z-50">
                  <p className="px-3 py-2 text-[9px] font-bold text-text-soft uppercase tracking-widest border-b border-blue-50 dark:border-slate-700">{t('sidebar_theme')}</p>
                  {THEMES.map(th => (
                    <button
                      key={th.value}
                      onClick={() => { setMode(th.value); setShowTheme(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${mode === th.value
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-text-mid hover:bg-primary-50 hover:text-primary'
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        <th.icon className="w-3 h-3" />
                        {t(th.key)}
                      </span>
                      {mode === th.value && <FiCheck className="w-3 h-3 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Collapsed-only: language + theme icons stacked */}
          {collapsed && (
            <>
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => { setShowLang(!showLang); setShowProfile(false); setShowTheme(false); }}
                  className="w-full flex items-center justify-center p-1.5 rounded-lg hover:bg-primary-50 text-text-soft hover:text-primary transition-colors"
                  title={t('sidebar_language')}
                >
                  <FiGlobe className="w-3.5 h-3.5" />
                </button>
                {showLang && (
                  <div className="absolute bottom-full left-full ml-2 mb-0 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-blue-50 dark:border-slate-700 overflow-hidden z-50">
                    <p className="px-3 py-2 text-[9px] font-bold text-text-soft uppercase tracking-widest border-b border-blue-50 dark:border-slate-700">{t('sidebar_language')}</p>
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${i18n.language === lang.code
                          ? 'bg-primary-50 text-primary font-semibold'
                          : 'text-text-mid hover:bg-primary-50 hover:text-primary'
                          }`}
                      >
                        <span>{lang.native}</span>
                        {i18n.language === lang.code && <FiCheck className="w-3 h-3 text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative" ref={themeRef}>
                <button
                  onClick={() => { setShowTheme(!showTheme); setShowProfile(false); setShowLang(false); }}
                  className="w-full flex items-center justify-center p-1.5 rounded-lg hover:bg-primary-50 text-text-soft hover:text-primary transition-colors"
                  title={t('sidebar_theme')}
                >
                  {mode === 'dark' ? <FiMoon className="w-3.5 h-3.5" /> : mode === 'system' ? <FiMonitor className="w-3.5 h-3.5" /> : <FiSun className="w-3.5 h-3.5" />}
                </button>
                {showTheme && (
                  <div className="absolute bottom-full left-full ml-2 mb-0 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-blue-50 dark:border-slate-700 overflow-hidden z-50">
                    <p className="px-3 py-2 text-[9px] font-bold text-text-soft uppercase tracking-widest border-b border-blue-50 dark:border-slate-700">{t('sidebar_theme')}</p>
                    {THEMES.map(th => (
                      <button
                        key={th.value}
                        onClick={() => { setMode(th.value); setShowTheme(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${mode === th.value
                          ? 'bg-primary-50 text-primary font-semibold'
                          : 'text-text-mid hover:bg-primary-50 hover:text-primary'
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          <th.icon className="w-3 h-3" />
                          {t(th.key)}
                        </span>
                        {mode === th.value && <FiCheck className="w-3 h-3 text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { collapsed, toggleCollapse } = useSidebar();
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
    collapsed, onToggleCollapse: toggleCollapse,
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

      {/* Mobile drawer — always full width */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-blue-100 dark:border-slate-700 shadow-xl transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent {...contentProps} collapsed={false} />
      </aside>

      {/* Desktop sidebar — collapsible */}
      <aside className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-white dark:bg-slate-900 border-r border-blue-100 dark:border-slate-700 shadow-sm transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
        <SidebarContent {...contentProps} />
      </aside>
    </>
  );
}
