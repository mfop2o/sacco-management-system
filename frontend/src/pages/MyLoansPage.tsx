import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { FiDollarSign, FiPlus } from 'react-icons/fi';

interface Loan {
  id: string;
  loanNumber: string;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  durationMonths: number;
  status: string;
  outstandingBalance: number;
  applicationDate: string;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-primary-100 text-primary',
  UNDER_REVIEW: 'bg-gray-100 text-gray-700',
  APPROVED: 'bg-primary-100 text-primary',
  DISBURSED: 'bg-primary-100 text-primary',
  REPAYMENT: 'bg-primary-100 text-primary',
  CLOSED: 'bg-gray-100 text-gray-500',
  DEFAULTED: 'bg-gray-200 text-gray-700',
};

export default function MyLoansPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await api.get('/members/me');
        const loansRes = await api.get(`/loans/member/${meRes.data.id}`);
        setLoans(loansRes.data);
      } catch {
        setLoans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
        <span className="text-sm text-gray-500">{t('loans_loadingLoans')}</span>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-text-dark dark:text-slate-100">{t('loans_myLoans')}</h2>
          <p className="text-sm text-gray-500 mt-1">{loans.length} {loans.length === 1 ? t('loans_loanCountSingle') : t('loans_loanCount')}</p>
        </div>
        <button onClick={() => navigate('/loans/apply')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
          <FiPlus className="text-lg" /> {t('sidebar_newLoanApplication')}
        </button>
      </div>

      {loans.length === 0 ? (
        <div className="rounded-2xl border border-blue-50 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/20">
            <FiDollarSign className="text-3xl text-white" />
          </div>
          <p className="text-gray-500 mb-4">{t('loans_noLoansYet')}</p>
          <button onClick={() => navigate('/loans/apply')}
            className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all">
            {t('sidebar_applyForLoan')}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-50 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary-50 dark:bg-slate-700 border-b border-blue-100 dark:border-slate-600">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans_loanNumber')}</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans_type')}</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans_amount')}</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans_rate')}</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans_term')}</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans_status')}</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans_balance')}</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {loans.map((loan, i) => (
                  <tr key={loan.id} className={`hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-primary-50/40 dark:bg-slate-700/40'}`}>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{loan.loanNumber}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{loan.loanType.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3.5 text-right text-sm text-gray-900 font-medium">ETB {Number(loan.principalAmount).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right text-sm text-gray-700">{loan.interestRate}%</td>
                    <td className="px-4 py-3.5 text-right text-sm text-gray-700">{loan.durationMonths}m</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[loan.status] || 'bg-gray-100 text-gray-600'}`}>
                        {loan.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm font-medium text-gray-900">ETB {Number(loan.outstandingBalance).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right">
                      {(loan.status === 'DISBURSED' || loan.status === 'REPAYMENT') && (
                        <button onClick={() => navigate('/loans/pay')}
                          className="px-3 py-1.5 text-xs font-medium bg-primary-100 text-primary rounded-lg hover:bg-primary-200">{t('loans_pay')}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
