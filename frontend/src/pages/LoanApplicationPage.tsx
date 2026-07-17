import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { FiCheck, FiX, FiTrendingUp } from 'react-icons/fi';

interface Member {
  id: string;
  membershipNumber: string;
  firstName: string;
  lastName: string;
}

const LOAN_TYPES = ['LONG_TERM', 'SHORT_TERM', 'EMERGENCY', 'EDUCATION', 'BUSINESS', 'AGRICULTURAL', 'SALARY_ADVANCE', 'HOUSING', 'VEHICLE'];

export default function LoanApplicationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedMemberId = searchParams.get('memberId') || '';

  const [members, setMembers] = useState<Member[]>([]);
  const [memberId, setMemberId] = useState(preselectedMemberId);
  const [loanType, setLoanType] = useState('SHORT_TERM');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('12');
  const [durationMonths, setDurationMonths] = useState('12');
  const [collateralType, setCollateralType] = useState('');
  const [collateralDescription, setCollateralDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCustomer, setIsCustomer] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
      const meRes = await api.get('/members/me');
      const me = meRes.data;
      setMemberId(me.id);
        setIsCustomer(true);
      } catch {
        const res = await api.get('/members');
        setMembers(res.data);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const calcMonthlyPayment = (): string => {
    if (!principalAmount || !interestRate || !durationMonths) return '0.00';
    const p = parseFloat(principalAmount);
    const r = parseFloat(interestRate) / 100 / 12;
    const n = parseInt(durationMonths);
    if (p <= 0 || r <= 0 || n <= 0) return '0.00';
    const payment = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return payment.toFixed(2);
  };

  const calcTotalInterest = (): string => {
    const monthly = parseFloat(calcMonthlyPayment());
    const p = parseFloat(principalAmount);
    const n = parseInt(durationMonths);
    if (!monthly || !p || !n) return '0.00';
    return (monthly * n - p).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) { setError(t('loans_pleaseSelectMember')); return; }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/loans', {
        memberId, loanType,
        principalAmount: parseFloat(principalAmount),
        interestRate: parseFloat(interestRate),
        durationMonths: parseInt(durationMonths),
        collateralType: collateralType || undefined,
        collateralDescription: collateralDescription || undefined,
      });
      setSuccess(t('loans_applicationSuccess'));
      setTimeout(() => navigate('/loans'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || t('loans_applicationFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
        <span className="text-sm text-gray-500">{t('common_loading')}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-text-dark dark:text-slate-100">{t('loans_apply')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('loans_submitApplication')}</p>
      </div>

      {error && <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><FiX className="h-4 w-4 shrink-0" />{error}</div>}
      {success && <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary-100 bg-blue-100 px-4 py-3 text-sm text-primary"><FiCheck className="h-4 w-4 shrink-0" />{success}</div>}

      {/* Payment Estimate */}
      {principalAmount && parseFloat(principalAmount) > 0 && interestRate && durationMonths && (
        <div className="mb-5 rounded-xl border border-blue-100 bg-primary-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FiTrendingUp className="text-primary" />
            <span className="text-sm font-semibold text-blue-900">{t('loans_paymentEstimate')}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-blue-600">{t('loans_monthlyPayment')}</p>
              <p className="text-lg font-bold text-blue-900">${Number(calcMonthlyPayment()).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-blue-600">{t('loans_totalInterest')}</p>
              <p className="text-lg font-bold text-blue-900">${Number(calcTotalInterest()).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-blue-600">{t('loans_totalRepayment')}</p>
              <p className="text-lg font-bold text-blue-900">${(parseFloat(principalAmount) + parseFloat(calcTotalInterest())).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-50 dark:border-slate-700 p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {isCustomer ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common_member')}</label>
              <input type="text" readOnly value={t('loans_youSelfService')}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common_member')} *</label>
              <select value={memberId} onChange={e => setMemberId(e.target.value)} required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm bg-white">
                <option value="">{t('loans_selectMember')}</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.membershipNumber})</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('loans_loanType')} *</label>
            <select value={loanType} onChange={e => setLoanType(e.target.value)} required
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm bg-white">
              {LOAN_TYPES.map(loanTypeOption => <option key={loanTypeOption} value={loanTypeOption}>{loanTypeOption.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('loans_principalAmount')} *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm font-medium">$</span>
              <input type="number" step="0.01" min="100" max="500000" required value={principalAmount} onChange={e => setPrincipalAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('loans_interestRate')} *</label>
            <input type="number" step="0.1" min="0.1" required value={interestRate} onChange={e => setInterestRate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('loans_durationMonths')} *</label>
          <input type="number" min="1" max="360" required value={durationMonths} onChange={e => setDurationMonths(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
          <p className="mt-1 text-xs text-gray-400">{t('loans_durationHint')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('loans_collateralType')}</label>
            <input type="text" value={collateralType} onChange={e => setCollateralType(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" placeholder="e.g., Vehicle, Land" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('loans_collateralDescription')}</label>
          <textarea value={collateralDescription} onChange={e => setCollateralDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" rows={3} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50 transition-all duration-200 shadow-lg shadow-primary/20">
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                {t('loans_submitting')}
              </span>
            ) : t('loans_submitApplication')}
          </button>
          <button type="button" onClick={() => navigate('/loans')}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">{t('common_cancel')}</button>
        </div>
      </form>
    </div>
  );
}
