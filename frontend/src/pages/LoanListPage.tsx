import { useEffect, useState } from 'react';
import { FiCheck, FiCreditCard, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const [repayLoanId, setRepayLoanId] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState('');
  const [showDisburseModal, setShowDisburseModal] = useState('');
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

  useEffect(() => { fetchLoans(); }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/loans/${id}/approve`);
      setActionMsg({ text: t('loans.approvedSuccess'), type: 'success' });
      setShowApproveModal('');
      fetchLoans();
    } catch {
      setActionMsg({ text: t('loans.approveFailed'), type: 'error' });
    }
  };

  const handleDisburse = async (id: string) => {
    try {
      await api.put(`/loans/${id}/disburse`);
      setActionMsg({ text: t('loans.disbursedSuccess'), type: 'success' });
      setShowDisburseModal('');
      fetchLoans();
    } catch {
      setActionMsg({ text: t('loans.disburseFailed'), type: 'error' });
    }
  };

  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/loans/${repayLoanId}/repay`, null, { params: { amount: repayAmount } });
      setActionMsg({ text: t('loans.repaymentSuccess'), type: 'success' });
      setShowRepayModal(false);
      setRepayLoanId('');
      setRepayAmount('');
      fetchLoans();
    } catch {
      setActionMsg({ text: t('loans.repaymentFailed'), type: 'error' });
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
      setActionMsg({ text: t('loans.loanUpdated'), type: 'success' });
      setEditLoan(null);
      fetchLoans();
    } catch {
      setActionMsg({ text: t('loans.updateFailed'), type: 'error' });
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      await api.delete(`/loans/${cancelId}`);
      setActionMsg({ text: t('loans.loanCancelled'), type: 'success' });
      setCancelId(null);
      fetchLoans();
    } catch {
      setActionMsg({ text: t('loans.cancelFailed'), type: 'error' });
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-text-dark dark:text-slate-100">{t('loans.title')}</h2>
        </div>
        <button onClick={() => navigate('/loans/apply')} className="px-5 py-2.5 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
          <span>+</span> {t('loans.apply')}
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
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans.loanNumber')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans.member')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans.type')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans.amount')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans.rate')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans.term')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans.status')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans.balance')}</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-text-soft uppercase tracking-wider">{t('loans.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loans.map((loan, i) => (
                <tr key={loan.id} className={`hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-primary-50/40 dark:bg-slate-700/40'}`}>
                  <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{loan.loanNumber}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-700">{loan.memberName}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-700">{loan.loanType.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-900 font-medium">${Number(loan.principalAmount).toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-700">{loan.interestRate}%</td>
                  <td className="px-4 py-3.5 text-sm text-gray-700">{loan.durationMonths}m</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[loan.status] || 'bg-gray-100 text-gray-600'}`}>
                      {loan.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium text-gray-900">${Number(loan.outstandingBalance).toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {loan.status === 'SUBMITTED' && (
                        <button onClick={() => setShowApproveModal(loan.id)} className="px-3 py-1.5 text-xs font-semibold bg-primary-100 text-primary rounded-xl hover:bg-primary-200">{t('loans.approve')}</button>
                      )}
                      {loan.status === 'APPROVED' && (
                        <button onClick={() => setShowDisburseModal(loan.id)} className="px-3 py-1.5 text-xs font-semibold bg-primary-100 text-primary rounded-xl hover:bg-primary-200">{t('loans.disburse')}</button>
                      )}
                      {(loan.status === 'DISBURSED' || loan.status === 'REPAYMENT') && (
                        <button onClick={() => { setRepayLoanId(loan.id); setShowRepayModal(true); }} className="px-3 py-1.5 text-xs font-semibold bg-primary-100 text-primary rounded-xl hover:bg-primary-200">{t('loans.repay')}</button>
                      )}
                      {canEdit(loan.status) && hasRole(['SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER']) && (
                        <button onClick={() => openEdit(loan)} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
                          <FiEdit2 className="inline mr-1" />{t('loans.edit')}
                        </button>
                      )}
                      {canEdit(loan.status) && hasRole(['SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER']) && (
                        <button onClick={() => setCancelId(loan.id)} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
                          <FiTrash2 className="inline mr-1" />{t('loans.cancel')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {loans.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-500">{t('loans.noLoans')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showApproveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowApproveModal('')}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiCheck className="text-2xl text-primary" />
              </div>
              <h3 className="text-lg font-bold text-text-dark">{t('loans.approveLoan')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('loans.approveConfirm')}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleApprove(showApproveModal)} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dark transition-colors">{t('loans.yesApprove')}</button>
              <button onClick={() => setShowApproveModal('')} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {showDisburseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowDisburseModal('')}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiCreditCard className="text-2xl text-primary" />
              </div>
              <h3 className="text-lg font-bold text-text-dark">{t('loans.disburseLoan')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('loans.disburseConfirm')}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleDisburse(showDisburseModal)} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dark transition-colors">{t('loans.yesDisburse')}</button>
              <button onClick={() => setShowDisburseModal('')} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {showRepayModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowRepayModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-text-dark mb-1">{t('loans.recordRepayment')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('loans.enterPaymentAmount')}</p>
            <form onSubmit={handleRepay}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.amount')}</label>
                <input type="number" step="0.01" min="0.01" required value={repayAmount} onChange={e => setRepayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm bg-gray-50"
                  placeholder="0.00" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dark transition-colors">{t('loans.submitPayment')}</button>
                <button type="button" onClick={() => setShowRepayModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editLoan && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setEditLoan(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary"><FiEdit2 /></div>
              <h3 className="text-lg font-bold text-text-dark">{t('loans.editLoan')}</h3>
            </div>
            <form onSubmit={handleEdit}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('loans.loanType')}</label>
                <select required value={editForm.loanType} onChange={e => setEditForm({ ...editForm, loanType: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm bg-white">
                  {LOAN_TYPES.map(loanType => <option key={loanType} value={loanType}>{loanType.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.amount')}</label>
                  <input type="number" required value={editForm.principalAmount} onChange={e => setEditForm({ ...editForm, principalAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('loans.ratePercent')}</label>
                  <input type="number" step="0.1" required value={editForm.interestRate} onChange={e => setEditForm({ ...editForm, interestRate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('loans.termMonths')}</label>
                  <input type="number" required value={editForm.durationMonths} onChange={e => setEditForm({ ...editForm, durationMonths: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">{t('common.save')}</button>
                <button type="button" onClick={() => setEditLoan(null)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setCancelId(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiTrash2 className="text-2xl text-gray-700" />
              </div>
              <h3 className="text-lg font-bold text-text-dark">{t('loans.cancelLoan')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('loans.cancelConfirm')}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCancel} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">{t('loans.yesCancel')}</button>
              <button onClick={() => setCancelId(null)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">{t('common.back')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
