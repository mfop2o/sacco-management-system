import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiCheckCircle, FiEdit2, FiEye, FiList, FiRefreshCw, FiTrash2, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  DRAFT: 'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-primary-100 text-primary',
  UNDER_REVIEW: 'bg-gray-100 text-gray-700',
  APPROVED: 'bg-primary-100 text-primary',
  DISBURSED: 'bg-primary-100 text-primary',
  REPAYMENT: 'bg-primary-100 text-primary',
  CLOSED: 'bg-gray-100 text-gray-500',
  DEFAULTED: 'bg-gray-200 text-gray-700',
};

const LOAN_TYPES = ['LONG_TERM', 'SHORT_TERM', 'EMERGENCY', 'EDUCATION', 'BUSINESS', 'AGRICULTURAL', 'SALARY_ADVANCE', 'HOUSING', 'VEHICLE'];

export default function LoanListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState({ text: '', type: '' });
  const [_showDisburseModal, setShowDisburseModal] = useState('');
  const [repayLoanId, setRepayLoanId] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState('');
  const [viewLoan, setViewLoan] = useState<Loan | null>(null);
  const [editLoan, setEditLoan] = useState<Loan | null>(null);
  const [editForm, setEditForm] = useState({ loanType: '', principalAmount: '', interestRate: '', durationMonths: '' });
  const [cancelId, setCancelId] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      const res = await api.get('/loans');
      setLoans(res.data);
    } catch {
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => { await fetchLoans(); })();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/loans/${id}/approve`);
      setActionMsg({ text: t('loans_approvedSuccess'), type: 'success' });
      setShowApproveModal('');
      fetchLoans();
    } catch {
      setActionMsg({ text: t('loans_approveFailed'), type: 'error' });
    }
  };


  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/loans/${repayLoanId}/repay`, null, { params: { amount: repayAmount } });
      setActionMsg({ text: t('loans_repaymentSuccess'), type: 'success' });
      setShowRepayModal(false);
      setRepayLoanId('');
      setRepayAmount('');
      fetchLoans();
    } catch {
      setActionMsg({ text: t('loans_repaymentFailed'), type: 'error' });
    }
  };

  const openEdit = (loan: Loan) => {
    setEditLoan(loan);
    setEditForm({
      loanType: loan.loanType,
      principalAmount: String(loan.principalAmount),
      interestRate: String(loan.interestRate),
      durationMonths: String(loan.durationMonths),
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLoan) return;
    try {
      await api.put(`/loans/${editLoan.id}`, {
        memberId: '', loanType: editForm.loanType,
        principalAmount: parseFloat(editForm.principalAmount),
        interestRate: parseFloat(editForm.interestRate),
        durationMonths: parseInt(editForm.durationMonths),
      });
      setActionMsg({ text: t('loans_loanUpdated'), type: 'success' });
      setEditLoan(null);
      fetchLoans();
    } catch {
      setActionMsg({ text: t('loans_updateFailed'), type: 'error' });
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      await api.delete(`/loans/${cancelId}`);
      setActionMsg({ text: t('loans_loanCancelled'), type: 'success' });
      setCancelId(null);
      fetchLoans();
    } catch {
      setActionMsg({ text: t('loans_cancelFailed'), type: 'error' });
    }
  };

  const canEdit = (status: string) => status === 'DRAFT' || status === 'SUBMITTED';

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-bold text-text-dark dark:text-slate-100">{t('loans_title')}</h2>
        </div>
        <button onClick={() => navigate('/loans/apply')} className="px-3.5 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center gap-1.5">
          <span>+</span> {t('loans_apply')}
        </button>
      </div>

      {actionMsg.text && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${actionMsg.type === 'success' ? 'bg-primary-100 text-primary border border-primary-100' : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}>
          <span>{actionMsg.type === 'success' ? <FiCheck className="inline" /> : <FiX className="inline" />}</span>
          {actionMsg.text}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-50 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-50 dark:bg-slate-700 border-b border-blue-100 dark:border-slate-600">
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('loans_loanNumber')}</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('loans_member')}</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('loans_type')}</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('loans_amount')}</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('loans_rate')}</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('loans_term')}</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('loans_status')}</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('loans_balance')}</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('loans_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loans.map((loan, i) => (
                <tr key={loan.id} className={`hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-primary-50/40 dark:bg-slate-700/40'}`}>
                  <td className="px-3 py-2.5 text-xs font-medium text-gray-900">{loan.loanNumber}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-700">{loan.memberName}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-700">{loan.loanType.replace(/_/g, ' ')}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-900 font-medium">${Number(loan.principalAmount).toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-700">{loan.interestRate}%</td>
                  <td className="px-3 py-2.5 text-xs text-gray-700">{loan.durationMonths}m</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[loan.status] || 'bg-gray-100 text-gray-600'}`}>
                      {loan.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs font-medium text-gray-900">${Number(loan.outstandingBalance).toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewLoan(loan)} title={t('loans_view')} className="p-1.5 text-primary bg-primary-50 rounded-lg hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                        <FiEye className="w-3.5 h-3.5" />
                      </button>
                      {loan.status === 'SUBMITTED' && (
                        <button onClick={() => setShowApproveModal(loan.id)} title={t('loans_approve')} className="p-1.5 text-primary bg-primary-50 rounded-lg hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                          <FiCheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {(loan.status === 'DISBURSED' || loan.status === 'REPAYMENT') && (
                        <button onClick={() => { setRepayLoanId(loan.id); setShowRepayModal(true); }} title={t('loans_repay')} className="p-1.5 text-primary bg-primary-50 rounded-lg hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                          <FiRefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canEdit(loan.status) && hasRole(['SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER']) && (
                        <button onClick={() => openEdit(loan)} title={t('loans_edit')} className="p-1.5 text-primary bg-primary-50 rounded-lg hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canEdit(loan.status) && hasRole(['SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER']) && (
                        <button onClick={() => setCancelId(loan.id)} title={t('loans_cancel')} className="p-1.5 text-primary bg-primary-50 rounded-lg hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {loans.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-0">
                  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/20">
                      <FiList className="text-3xl text-white" />
                    </div>
                    <p className="text-gray-500 text-base font-medium">{t('loans_noLoans')}</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showApproveModal && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col" onClick={() => setShowApproveModal('')}>
          <div className="w-full flex-1 p-6 md:p-10 flex flex-col justify-center" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/20">
                <FiCheck className="text-2xl text-white" />
              </div>
              <h3 className="text-lg font-bold text-text-dark">{t('loans_approveLoan')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('loans_approveConfirm')}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleApprove(showApproveModal)} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dark transition-colors">{t('loans_yesApprove')}</button>
              <button onClick={() => setShowApproveModal('')} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors">{t('common_cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {viewLoan && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col" onClick={() => setViewLoan(null)}>
          <div className="w-full flex-1 p-6 md:p-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/30">
                  <FiEye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-dark">{viewLoan.loanNumber}</h3>
                  <p className="text-xs text-text-soft capitalize">{viewLoan.loanType.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <button onClick={() => setViewLoan(null)} className="p-2 rounded-xl hover:bg-gray-100 text-text-soft transition-colors">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              {[
                { label: t('loans_member'), value: viewLoan.memberName },
                { label: t('loans_loanType'), value: viewLoan.loanType.replace(/_/g, ' ') },
                { label: t('loans_amount'), value: `$${Number(viewLoan.principalAmount).toLocaleString()}` },
                { label: t('loans_rate'), value: `${viewLoan.interestRate}%` },
                { label: t('loans_term'), value: `${viewLoan.durationMonths} months` },
                { label: t('loans_outstanding'), value: `$${Number(viewLoan.outstandingBalance).toLocaleString()}` },
              ].map(row => (
                <div key={row.label} className="bg-primary-50 dark:bg-slate-700 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-text-soft uppercase tracking-wider">{row.label}</p>
                  <p className="text-sm font-bold text-text-dark mt-0.5">{row.value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between py-3 border-t border-blue-50 dark:border-slate-700">
              <span className="text-sm text-text-mid">{t('loans_status')}</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColors[viewLoan.status] || 'bg-gray-100 text-gray-600'}`}>
                {viewLoan.status.replace(/_/g, ' ')}
              </span>
            </div>
            <button onClick={() => setViewLoan(null)} className="mt-4 w-full px-4 py-2.5 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dark transition-colors">
              {t('common_close')}
            </button>
          </div>
        </div>
      )}

      {showRepayModal && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col" onClick={() => setShowRepayModal(false)}>
          <div className="w-full flex-1 p-6 md:p-10 flex flex-col justify-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-text-dark mb-1">{t('loans_recordRepayment')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('loans_enterPaymentAmount')}</p>
            <form onSubmit={handleRepay}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common_amount')}</label>
                <input type="number" step="0.01" min="0.01" required value={repayAmount} onChange={e => setRepayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm bg-gray-50"
                  placeholder="0.00" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dark transition-colors">{t('loans_submitPayment')}</button>
                <button type="button" onClick={() => setShowRepayModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors">{t('common_cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editLoan && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col" onClick={() => setEditLoan(null)}>
          <div className="w-full flex-1 p-6 md:p-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/30"><FiEdit2 /></div>
              <h3 className="text-lg font-bold text-text-dark">{t('loans_editLoan')}</h3>
            </div>
            <form onSubmit={handleEdit}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('loans_loanType')}</label>
                <select required value={editForm.loanType} onChange={e => setEditForm({ ...editForm, loanType: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm bg-white">
                  {LOAN_TYPES.map(loanType => <option key={loanType} value={loanType}>{loanType.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common_amount')}</label>
                  <input type="number" required value={editForm.principalAmount} onChange={e => setEditForm({ ...editForm, principalAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('loans_ratePercent')}</label>
                  <input type="number" step="0.1" required value={editForm.interestRate} onChange={e => setEditForm({ ...editForm, interestRate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('loans_termMonths')}</label>
                  <input type="number" required value={editForm.durationMonths} onChange={e => setEditForm({ ...editForm, durationMonths: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">{t('common_save')}</button>
                <button type="button" onClick={() => setEditLoan(null)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">{t('common_cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelId && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col" onClick={() => setCancelId(null)}>
          <div className="w-full flex-1 p-6 md:p-10 flex flex-col justify-center" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/20">
                <FiTrash2 className="text-2xl text-white" />
              </div>
              <h3 className="text-lg font-bold text-text-dark">{t('loans_cancelLoan')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('loans_cancelConfirm')}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCancel} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">{t('loans_yesCancel')}</button>
              <button onClick={() => setCancelId(null)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">{t('common_back')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
