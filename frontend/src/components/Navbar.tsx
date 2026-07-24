import { useTranslation } from 'react-i18next';
import {
  FiBarChart2,
  FiBell,
  FiCheck, FiCreditCard, FiDollarSign,
  FiKey,
  FiPlus,
  FiRepeat, FiSave, FiShield,
  FiTrendingUp, FiUsers
} from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

const PAGE_META: { path: string; key: string; icon: React.ElementType; exact?: boolean }[] = [
  { path: '/', key: 'sidebar_dashboard', icon: FiBarChart2, exact: true },
  { path: '/members', key: 'sidebar_members', icon: FiUsers },
  { path: '/loans/apply', key: 'sidebar_loanApplication', icon: FiPlus },
  { path: '/loans/approval', key: 'sidebar_loanApprovals', icon: FiCheck },
  { path: '/loans/pay', key: 'sidebar_loanRepayment', icon: FiTrendingUp },
  { path: '/loans', key: 'sidebar_loans', icon: FiDollarSign },
  { path: '/my-loans', key: 'sidebar_myLoans', icon: FiDollarSign },
  { path: '/repayment', key: 'sidebar_repayment', icon: FiRepeat },
  { path: '/savings', key: 'sidebar_savings', icon: FiSave },
  { path: '/transactions', key: 'sidebar_transactions', icon: FiCreditCard },
  { path: '/users', key: 'sidebar_users', icon: FiShield },
  { path: '/roles', key: 'sidebar_rolesPermissions', icon: FiKey },
];

function usePageMeta() {
  const { pathname } = useLocation();
  // exact match first, then prefix match (longest wins)
  const exact = PAGE_META.find(p => p.exact && p.path === pathname);
  if (exact) return exact;
  const prefix = [...PAGE_META]
    .filter(p => !p.exact && pathname.startsWith(p.path))
    .sort((a, b) => b.path.length - a.path.length)[0];
  return prefix ?? PAGE_META[0];
}

export default function Navbar() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const meta = usePageMeta();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-blue-50 dark:border-slate-700 px-3 sm:px-5 py-2.5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Left — logo + page title */}
      <div className="pl-10 lg:pl-0 flex items-center gap-2.5">
        <img src={logo} alt="SACCO" className="w-7 h-7 rounded-lg object-contain shrink-0" />
        <h1 className="text-sm font-bold text-text-dark">
          {t(meta.key)}
          {user?.fullName && (
            <span className="hidden sm:inline text-text-soft font-normal text-xs ml-2">
              — {user.fullName}
            </span>
          )}
        </h1>
      </div>

      {/* Right — bell */}
      <div className="flex items-center gap-2">
        <button className="relative w-7 h-7 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center text-primary hover:bg-primary-100 transition-colors">
          <FiBell className="w-3.5 h-3.5" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
}
