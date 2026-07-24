import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiArrowDownRight, FiArrowRight, FiArrowUpRight,
  FiBell, FiClipboard, FiClock, FiList,
  FiPlus, FiSave, FiTrendingUp, FiUsers
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, Legend, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface DashboardData {
  totalMembers: number;
  activeMembers: number;
  totalLoans: number;
  activeLoans: number;
  totalSavings: number;
  totalLoanOutstanding: number;
  totalSharesValue: number;
  pendingApprovals: number;
}

interface RecentTx {
  id: string;
  transactionNumber: string;
  transactionType: string;
  amount: number;
  description: string;
  transactionDate: string;
  status: string;
  paymentMethod: string;
}

const monthlyData = [
  { month: 'Jan', savings: 42000, loans: 28000 },
  { month: 'Feb', savings: 47000, loans: 31000 },
  { month: 'Mar', savings: 44000, loans: 35000 },
  { month: 'Apr', savings: 52000, loans: 38000 },
  { month: 'May', savings: 58000, loans: 42000 },
  { month: 'Jun', savings: 61000, loans: 45000 },
  { month: 'Jul', savings: 67000, loans: 49000 },
  { month: 'Aug', savings: 72000, loans: 53000 },
  { month: 'Sep', savings: 69000, loans: 57000 },
  { month: 'Oct', savings: 78000, loans: 60000 },
  { month: 'Nov', savings: 84000, loans: 63000 },
  { month: 'Dec', savings: 91000, loans: 67000 },
];

const DONUT_COLORS = ['#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#EFF6FF'];

interface ChartTooltipPayload {
  name: string;
  value: number;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
}

const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-3 text-xs">
        <p className="font-bold text-text-dark mb-1">{label}</p>
        {payload.map((e) => (
          <p key={e.name} style={{ color: e.color }}>
            {e.name}: <span className="font-bold">ETB {e.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { t: td } = useTranslation('dashboard'); // dashboard-specific keys
  const { t } = useTranslation();               // shared keys (members_title, sidebar_*)

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentTxs, setRecentTxs] = useState<RecentTx[]>([]);
  const [chartPeriod, setChartPeriod] = useState<'6m' | '1y'>('1y');

  const isMember = user?.role === 'MEMBER';

  useEffect(() => {
    api.get('/dashboard/summary').then(r => setData(r.data)).catch(() => { }).finally(() => setLoading(false));
    if (isMember) api.get('/transactions/me').then(r => setRecentTxs(r.data.slice(0, 6))).catch(() => { });
  }, [isMember]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-bg dark:bg-slate-950">
      <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  );

  const chartData = chartPeriod === '6m' ? monthlyData.slice(6) : monthlyData;

  const fmtVal = (v: number, f: string) =>
    f === 'ETB'
      ? `ETB ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : v.toLocaleString();

  const statTiles = [
    { label: td('totalMembers'), value: data?.totalMembers ?? 0, fmt: 'n', sub: `${data?.activeMembers ?? 0} ${td('active')}` },
    { label: td('totalSavings'), value: data?.totalSavings ?? 0, fmt: 'ETB', sub: td('portfolioBalance') },
    { label: td('loanPortfolio'), value: data?.totalLoanOutstanding ?? 0, fmt: 'ETB', sub: `${data?.activeLoans ?? 0} ${td('activeLoans')}` },
    { label: td('pendingApprovals'), value: data?.pendingApprovals ?? 0, fmt: 'n', sub: td('awaitingReview') },
  ];

  const quickActions = [
    { label: t('members_title'), desc: td('browseMembers'), path: '/members', icon: FiUsers },
    { label: t('sidebar_loanApplication'), desc: td('submitNewApplication'), path: '/loans/apply', icon: FiPlus },
    { label: t('sidebar_loanApprovals'), desc: td('pendingLoanRequests'), path: '/loans/approval', icon: FiList },
    { label: t('sidebar_savings'), desc: td('savingsAccounts'), path: '/savings', icon: FiSave },
  ];

  // Donut data
  const donutData = isMember && recentTxs.length > 0
    ? (() => {
      const counts: Record<string, number> = {};
      recentTxs.forEach(tx => {
        const key = tx.transactionType.replace(/_/g, ' ');
        counts[key] = (counts[key] || 0) + Number(tx.amount);
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    })()
    : data
      ? [
        { name: td('totalSavings'), value: Math.max(data.totalSavings, 1) },
        { name: td('loanPortfolio'), value: Math.max(data.totalLoanOutstanding, 1) },
        { name: 'Shares', value: Math.max(data.totalSharesValue, 1) },
      ]
      : [];

  const donutTotal = donutData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="min-h-screen bg-bg dark:bg-slate-950">

      {/* ── Top Navbar ── */}
      <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-sm border-b border-blue-100 dark:border-slate-700 px-4 sm:px-8 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-lg sm:text-xl font-black text-text-dark">
              {td('welcome')}, <span className="text-primary">{user?.fullName?.split(' ')[0] || 'User'}</span> 👋
            </h1>
            <p className="text-xs text-text-soft mt-0.5 hidden sm:block">{td('subtitle')}</p>
          </div>
          <button className="relative w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary hover:bg-primary-100 transition-colors">
            <FiBell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-5 sm:py-7 space-y-5 sm:space-y-6">

        {/* ── Stat Tiles ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {statTiles.map((tile, i) => {
            const filled = i % 2 === 0;
            return (
              <div key={tile.label} className={`rounded-2xl p-4 sm:p-5 transition-shadow hover:shadow-lg ${filled ? 'bg-primary shadow-md shadow-primary/25' : 'bg-white border border-blue-50 shadow-sm shadow-blue-100'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${filled ? 'bg-white/20' : 'bg-primary-50'}`}>
                  {i === 0 && <FiUsers className={`w-5 h-5 ${filled ? 'text-white' : 'text-primary'}`} />}
                  {i === 1 && <FiSave className={`w-5 h-5 ${filled ? 'text-white' : 'text-primary'}`} />}
                  {i === 2 && <FiClipboard className={`w-5 h-5 ${filled ? 'text-white' : 'text-primary'}`} />}
                  {i === 3 && <FiClock className={`w-5 h-5 ${filled ? 'text-white' : 'text-primary'}`} />}
                </div>
                <p className={`text-xl sm:text-2xl font-black leading-none ${filled ? 'text-white' : 'text-primary'}`}>
                  {fmtVal(tile.value, tile.fmt)}
                </p>
                <p className={`text-xs font-semibold mt-1.5 ${filled ? 'text-white/80' : 'text-text-mid'}`}>{tile.label}</p>
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${filled ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary'
                    }`}>
                    <FiArrowUpRight className="w-3 h-3" />
                    {i === 3 ? (tile.value === 0 ? td('allClear') : `${tile.value} ${td('pending')}`) : tile.sub}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Area chart + Quick actions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-blue-50 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-text-dark">{td('accountBalance')}</h2>
                <p className="text-xs text-text-soft mt-0.5">{td('savingsVsLoans')}</p>
              </div>
              <div className="flex items-center gap-1 bg-primary-50 rounded-lg p-1">
                {(['6m', '1y'] as const).map(p => (
                  <button key={p} onClick={() => setChartPeriod(p)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${chartPeriod === p ? 'bg-primary text-white shadow-sm' : 'text-text-soft hover:text-primary'}`}>
                    {p === '6m' ? '6M' : '1Y'}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="gLoans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#BAD9FD" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#BAD9FD" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F8FF" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `ETB ${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="savings" name="Savings" stroke="#60A5FA" strokeWidth={2.5} fill="url(#gSavings)" dot={false} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="loans" name="Loans" stroke="#BAD9FD" strokeWidth={2.5} fill="url(#gLoans)" dot={false} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-blue-50 dark:border-slate-700">
            <h2 className="text-base font-bold text-text-dark mb-4">{td('quickActions')}</h2>
            <div className="space-y-2">
              {quickActions.map(action => (
                <button key={action.path} onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-text-dark">{action.label}</p>
                    <p className="text-xs text-text-soft">{action.desc}</p>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-text-soft group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
            {data && (
              <div className="mt-5 pt-5 border-t border-blue-50 space-y-3">
                <p className="text-xs font-bold text-text-soft uppercase tracking-wider">{td('activity')}</p>
                {[
                  { label: td('activeMembers'), val: data.activeMembers, total: data.totalMembers || 1 },
                  { label: td('loanUtilization'), val: data.activeLoans, total: data.totalLoans || 1 },
                ].map(bar => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs text-text-soft mb-1">
                      <span>{bar.label}</span>
                      <span className="font-semibold text-text-mid">{bar.val}/{bar.total}</span>
                    </div>
                    <div className="h-1.5 bg-primary-50 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (bar.val / bar.total) * 100).toFixed(0)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Bar chart + Recent Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-blue-50 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-text-dark">{td('portfolioDistribution')}</h2>
                <p className="text-xs text-text-soft mt-0.5">{td('monthlySavingsVsLoans')}</p>
              </div>
              <FiTrendingUp className="w-4 h-4 text-text-soft" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barGap={4} margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F8FF" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `ETB ${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="savings" name="Savings" fill="#60A5FA" radius={[4, 4, 0, 0]} maxBarSize={16} />
                <Bar dataKey="loans" name="Loans" fill="#DBEAFE" radius={[4, 4, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity — Donut + list */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-blue-50 dark:border-slate-700 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-text-dark">{td('recentActivity')}</h2>
                <p className="text-xs text-text-soft mt-0.5">{td('transactionBreakdown')}</p>
              </div>
              {isMember && (
                <button onClick={() => navigate('/transactions')} className="text-xs text-primary font-semibold hover:underline">
                  {t('dashboard_viewAll')} →
                </button>
              )}
            </div>

            {/* Donut */}
            <div className="flex flex-col items-center">
              <div className="relative w-full" style={{ height: 170 }}>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={donutData.length ? donutData : [{ name: 'No data', value: 1 }]}
                      cx="50%" cy="50%" innerRadius={52} outerRadius={76}
                      paddingAngle={donutData.length > 1 ? 3 : 0}
                      dataKey="value" strokeWidth={0}
                    >
                      {(donutData.length ? donutData : [{ name: 'No data', value: 1 }]).map((_, idx) => (
                        <Cell key={idx} fill={donutData.length ? DONUT_COLORS[idx % DONUT_COLORS.length] : '#EFF6FF'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number, n: string) => [`ETB ${v.toLocaleString()}`, n]}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #DBEAFE', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('dashboard_total')}</span>
                  <span className="text-lg font-black text-text-dark leading-tight">
                    ETB {donutTotal >= 1000 ? `${(donutTotal / 1000).toFixed(1)}k` : donutTotal.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1 mb-4">
                {donutData.slice(0, 5).map((d, idx) => (
                  <div key={d.name} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DONUT_COLORS[idx % DONUT_COLORS.length] }} />
                    <span className="text-[11px] text-text-soft truncate max-w-[80px]">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction list */}
            <div className="flex-1 overflow-y-auto divide-y divide-blue-50">
              {isMember && recentTxs.length > 0 ? (
                recentTxs.slice(0, 5).map(tx => {
                  const income = ['DEPOSIT', 'LOAN_DISBURSEMENT', 'LOAN_REPAYMENT'].includes(tx.transactionType);
                  return (
                    <div key={tx.id} className="flex items-center gap-3 py-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${income ? 'bg-primary-50' : 'bg-blue-50'}`}>
                        {income ? <FiArrowUpRight className="w-3 h-3 text-primary" /> : <FiArrowDownRight className="w-3 h-3 text-blue-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-dark truncate">{tx.transactionType.replace(/_/g, ' ')}</p>
                        <p className="text-[11px] text-text-soft">{new Date(tx.transactionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <p className={`text-xs font-bold shrink-0 ${income ? 'text-primary' : 'text-blue-400'}`}>
                        {income ? '+' : '-'}ETB {Number(tx.amount).toLocaleString()}
                      </p>
                    </div>
                  );
                })
              ) : !isMember && data ? (
                [
                  { label: t('members_title'), value: data.totalMembers.toLocaleString() },
                  { label: t('dashboard_activeLoans'), value: data.activeLoans.toLocaleString() },
                  { label: t('dashboard_totalSavings'), value: `ETB ${Number(data.totalSavings).toLocaleString()}` },
                  { label: 'Shares', value: `ETB ${Number(data.totalSharesValue).toLocaleString()}` },
                  { label: t('dashboard_pendingApprovals'), value: data.pendingApprovals.toLocaleString() },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2.5">
                    <span className="text-xs text-text-mid">{item.label}</span>
                    <span className="text-xs font-bold text-text-dark">{item.value}</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <FiClipboard className="w-5 h-5 text-primary-200 mb-2" />
                  <p className="text-xs text-text-soft">{t('dashboard_noTransactions')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
