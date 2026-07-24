import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiSend, FiX } from 'react-icons/fi';
import api from '../services/api';

interface Loan {
  id: string;
  loanNumber: string;
  memberName: string;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  durationMonths: number;
  status: string;
  outstandingBalance: number;
  applicationDate: string;
}

const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-primary-100 text-primary',
  UNDER_REVIEW: 'bg-gray-100 text-gray-700',
  APPROVED: 'bg-green-100 text-green-800',
  DISBURSED: 'bg-primary-100 text-primary',
};

export default function LoanApprovalPage() {
  const { t } = useTranslation();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState({ text: '', type: '' });
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | 'disburse' | null>(null);

  const fetchLoans = async () => {
    try {
      const res = await api.get('/loans');
      setLoans(res.data.filter((l: Loan) =>
        l.status === 'SUBMITTED' || l.status === 'UNDER_REVIEW' || l.status === 'APPROVED'
      ));
    } catch {
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => { await fetchLoans(); };
    load();
  }, []);

  const handleAction = async () => {
    if (!selectedLoan || !action) return;
    try {
      if (action === 'approve') {
        await api.put(`/loans/${selectedLoan}/approve`);
        setActionMsg({ text: t('loans_approvedSuccess'), type: 'success' });
      } else if (action === 'disburse') {
        await api.put(`/loans/${selectedLoan}/disburse`);
        setActionMsg({ text: t('loans_disbursedSuccess'), type: 'success' });
      }
      setSelectedLoan(null);
      setAction(null);
      fetchLoans();
    } catch {
      setActionMsg({ text: action === 'approve' ? t('loans_approveFailed') : t('loans_disburseFailed'), type: 'error' });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
        <span className="text-sm text-gray-500">{t('loans_loadingApprovals')}</span>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-text-dark dark:text-slate-100">{t('loans_pendingApprovals')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('loans_pendingApprovals')}</p>
      </div>

      {actionMsg.text && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${actionMsg.type === 'success' ? 'bg-primary-100 text-primary border border-primary-100' : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}>
          <span>{actionMsg.type === 'success' ? <FiCheck className="inline" /> : <FiX className="inline" />}</span>
          {actionMsg.text}
        </div>
      )}

      {loans.length === 0 ? (
        <div className="rounded-2xl border border-blue-50 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/20">
            <FiCheck className="text-3xl text-white" />
          </div>
          <p className="text-gray-500 text-lg font-medium">{t('loans_noPendingLoans')}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-50 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary-50 dark:bg-slate-700 border-b border-blue-100 dark:border-slate-600">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase">{t('loans_loanNumber')}</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase">{t('loans_member')}</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase">{t('loans_type')}</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-text-soft uppercase">{t('loans_amount')}</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-text-soft uppercase">{t('loans_rate')}</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-text-soft uppercase">{t('loans_term')}</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-text-soft uppercase">{t('loans_status')}</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-text-soft uppercase">{t('loans_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {loans.map((loan, i) => (
                  <tr key={loan.id} className={`hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-primary-50/40 dark:bg-slate-700/40'}`}>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{loan.loanNumber}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{loan.memberName}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{loan.loanType.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3.5 text-right text-sm text-gray-900 font-medium">ETB {Number(loan.principalAmount).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right text-sm text-gray-700">{loan.interestRate}%</td>
                    <td className="px-4 py-3.5 text-right text-sm text-gray-700">{loan.durationMonths}m</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[loan.status] || 'bg-gray-100 text-gray-600'}`}>
                        {loan.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {loan.status === 'SUBMITTED' && (
                          <>
                            <button onClick={() => { setSelectedLoan(loan.id); setAction('approve'); }}
                              className="px-3 py-1.5 text-xs font-medium bg-primary-100 text-primary rounded-lg hover:bg-primary-200 flex items-center gap-1">
                              <FiCheck />{t('loans_approve')}
                            </button>
                            <button onClick={() => { setSelectedLoan(loan.id); setAction('reject'); }}
                              className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1">
                              <FiX />{t('loans_reject')}
                            </button>
                          </>
                        )}
                        {loan.status === 'APPROVED' && (
                          <button onClick={() => { setSelectedLoan(loan.id); setAction('disburse'); }}
                            className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-800 rounded-lg hover:bg-green-200 flex items-center gap-1">
                            <FiSend />{t('loans_disburse')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedLoan && action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setSelectedLoan(null); setAction(null); }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-blue-50 dark:border-slate-700 p-6 w-full max-w-xs mx-4" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-3 ${
                action === 'approve' ? 'bg-primary/10' : action === 'disburse' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {action === 'approve' ? <FiCheck className="w-5 h-5 text-primary" /> :
                  action === 'disburse' ? <FiSend className="w-5 h-5 text-green-600" /> :
                    <FiX className="w-5 h-5 text-red-500" />}
              </div>
              <h3 className="text-sm font-bold text-text-dark">
                {action === 'approve' ? t('loans_approveLoan') : action === 'disburse' ? t('loans_disburseLoan') : t('loans_rejectLoan')}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {action === 'approve' ? t('loans_approveConfirm') : action === 'disburse' ? t('loans_disburseConfirm') : t('loans_rejectConfirm')}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAction}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-colors ${action === 'approve' ? 'bg-primary hover:bg-primary-dark' :
                    action === 'disburse' ? 'bg-green-600 hover:bg-green-700' :
                      'bg-red-500 hover:bg-red-600'
                  }`}>
                {action === 'approve' ? t('loans_yesApprove') : action === 'disburse' ? t('loans_yesDisburse') : t('loans_yesReject')}
              </button>
              <button onClick={() => { setSelectedLoan(null); setAction(null); }}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors">{t('common_cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
