import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { FiDollarSign, FiCheck, FiX, FiClock, FiCalendar, FiCreditCard } from 'react-icons/fi';

interface Loan {
  id: string;
  loanNumber: string;
  memberId: string;
  memberName: string;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  durationMonths: number;
  status: string;
  outstandingBalance: number;
  arrearsAmount: number;
  applicationDate: string;
}

interface AmortizationRow {
  id: string;
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  outstandingBalance: number;
  paidAmount: number;
  status: string;
  paidDate: string | null;
}

interface PaymentTx {
  id: string;
  transactionNumber: string;
  transactionType: string;
  amount: number;
  description: string;
  transactionDate: string;
  status: string;
  paymentMethod: string;
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

export default function LoanPaymentPage() {
  const { t } = useTranslation();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [schedule, setSchedule] = useState<AmortizationRow[]>([]);
  const [transactions, setTransactions] = useState<PaymentTx[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payLoanId, setPayLoanId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState('CASH');
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await api.get('/members/me');
        const member = meRes.data;
        setMemberId(member.id);
        const loansRes = await api.get(`/loans/member/${member.id}`);
        setLoans(loansRes.data);
      } catch {
        setLoans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectLoan = async (loan: Loan) => {
    setSelectedLoan(loan);
    setScheduleLoading(true);
    setSchedule([]);
    setTransactions([]);
    try {
      const [schRes, txRes] = await Promise.all([
        api.get(`/loans/${loan.id}/schedule`),
        api.get(`/loans/${loan.id}/transactions`),
      ]);
      setSchedule(schRes.data);
      setTransactions(txRes.data);
    } catch {
      setSchedule([]);
      setTransactions([]);
    } finally {
      setScheduleLoading(false);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payLoanId) return;
    setSubmitting(true);
    setPayError('');
    setPaySuccess('');
    try {
      const methodMap: Record<string, string> = { CBE: 'BANK_TRANSFER', AWASH: 'BANK_TRANSFER', COOP: 'BANK_TRANSFER' };
      const backendMethod = methodMap[payMethod] || payMethod;
      await api.post(`/loans/${payLoanId}/repay`, null, { params: { amount: payAmount, paymentMethod: backendMethod } });
      setPaySuccess(t('loans_repaymentSuccess'));
      setPayAmount('');
      setPayLoanId(null);
      setPayMethod('CASH');
      const loansRes = await api.get(`/loans/member/${memberId}`);
      setLoans(loansRes.data);
      if (selectedLoan) {
        const updated = loansRes.data.find((l: Loan) => l.id === selectedLoan.id);
        if (updated) selectLoan(updated);
      }
    } catch (err: any) {
      setPayError(err.response?.data?.message || t('loans_repaymentFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
        <span className="text-sm text-gray-500">{t('loans_loadingLoans')}</span>
      </div>
    </div>
  );

  const activeLoans = loans.filter(l => !['CLOSED', 'DEFAULTED', 'DRAFT'].includes(l.status));

  const getMethodLabel = (method: string) => {
    const map: Record<string, string> = {
      CASH: t('loans_cash'), TELEBIRR: t('loans_telebirr'), BANK_TRANSFER: t('loans_bankTransfer'),
      MOBILE_MONEY: t('loans_mobileMoney'), SALARY_DEDUCTION: 'Salary Deduction',
      AUTO_DEBIT: 'Auto Debit', CHECK: 'Check',
    };
    return map[method] || method;
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-text-dark dark:text-slate-100">{t('loans_loanPayments')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('loans_loanPaymentsSubtitle')}</p>
      </div>

      {paySuccess && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary-100 bg-blue-100 px-4 py-3 text-sm text-primary">
          <FiCheck className="h-4 w-4 shrink-0" /> {paySuccess}
        </div>
      )}
      {payError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiX className="h-4 w-4 shrink-0" /> {payError}
        </div>
      )}

      {loans.length === 0 ? (
        <div className="rounded-2xl border border-blue-50 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/20">
            <FiDollarSign className="text-3xl text-white" />
          </div>
          <p className="text-gray-500 text-lg font-medium">{t('loans_noLoansYet')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* Loan list sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-blue-50 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
              <div className="border-b border-gray-100 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900">{t('loans_yourLoans')}</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {loans.map(loan => (
                  <button
                    key={loan.id}
                    onClick={() => selectLoan(loan)}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-primary-50 ${
                      selectedLoan?.id === loan.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{loan.loanNumber}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[loan.status] || 'bg-gray-100 text-gray-600'}`}>
                        {loan.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{loan.loanType.replace(/_/g, ' ')}</span>
                      <span className="text-xs font-medium text-gray-700">${Number(loan.outstandingBalance).toLocaleString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loan detail panel */}
          <div className="lg:col-span-2">
            {!selectedLoan ? (
              <div className="flex items-center justify-center rounded-2xl border border-blue-50 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm py-20">
                <div className="text-center">
                  <FiDollarSign className="mx-auto text-3xl text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">{t('loans_selectLoanToView')}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Loan summary card */}
                <div className="rounded-2xl border border-blue-50 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{selectedLoan.loanNumber}</h3>
                      <p className="text-xs text-gray-500">{selectedLoan.loanType.replace(/_/g, ' ')} &middot; {selectedLoan.durationMonths} months &middot; {selectedLoan.interestRate}% APR</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColors[selectedLoan.status] || 'bg-gray-100 text-gray-600'}`}>
                      {selectedLoan.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500">{t('loans_principal')}</p>
                      <p className="text-sm font-semibold text-gray-900">${Number(selectedLoan.principalAmount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t('loans_outstanding')}</p>
                      <p className="text-sm font-semibold text-gray-900">${Number(selectedLoan.outstandingBalance).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t('loans_arrears')}</p>
                      <p className={`text-sm font-semibold ${selectedLoan.arrearsAmount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        ${Number(selectedLoan.arrearsAmount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t('loans_applied')}</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedLoan.applicationDate ? new Date(selectedLoan.applicationDate).toLocaleDateString() : '-'}</p>
                    </div>
                  </div>
                  {activeLoans.some(l => l.id === selectedLoan.id) && (
                    <button
                      onClick={() => setPayLoanId(selectedLoan.id)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                    >
                      <FiCreditCard className="h-4 w-4" /> {t('loans_makePayment')}
                    </button>
                  )}
                </div>

                {/* Amortization Schedule */}
                <div className="rounded-2xl border border-blue-50 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                  <div className="border-b border-gray-100 px-5 py-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <FiCalendar className="h-4 w-4 text-gray-400" /> {t('loans_paymentSchedule')}
                    </h3>
                  </div>
                  {scheduleLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <svg className="h-6 w-6 animate-spin text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-text-soft uppercase">{t('loans_installment')}</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-text-soft uppercase">{t('loans_dueDate')}</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-soft uppercase">{t('loans_principal')}</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-soft uppercase">{t('common_interest')}</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-soft uppercase">{t('common_total')}</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-soft uppercase">{t('loans_balance')}</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold text-text-soft uppercase">{t('loans_status')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                          {schedule.map(row => (
                            <tr key={row.id} className={`hover:bg-gray-50 ${row.status === 'PAID' ? 'text-gray-400' : ''}`}>
                              <td className="px-4 py-2.5 text-sm text-gray-700">{row.installmentNumber}</td>
                              <td className="px-4 py-2.5 text-sm text-gray-700">{new Date(row.dueDate).toLocaleDateString()}</td>
                              <td className="px-4 py-2.5 text-right text-sm text-gray-700">${Number(row.principalAmount).toLocaleString()}</td>
                              <td className="px-4 py-2.5 text-right text-sm text-gray-700">${Number(row.interestAmount).toLocaleString()}</td>
                              <td className="px-4 py-2.5 text-right text-sm font-medium text-gray-900">${Number(row.totalAmount).toLocaleString()}</td>
                              <td className="px-4 py-2.5 text-right text-sm text-gray-700">${Number(row.outstandingBalance).toLocaleString()}</td>
                              <td className="px-4 py-2.5 text-center">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                  row.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {row.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {schedule.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">{t('loans_noSchedule')}</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Payment History */}
                <div className="rounded-2xl border border-blue-50 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                  <div className="border-b border-gray-100 px-5 py-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <FiClock className="h-4 w-4 text-gray-400" /> {t('loans_paymentHistory')}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-text-soft uppercase">{t('common_date')}</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-text-soft uppercase">{t('common_reference')}</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-text-soft uppercase">{t('common_method')}</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold text-text-soft uppercase">{t('loans_amount')}</th>
                          <th className="px-4 py-2.5 text-center text-xs font-semibold text-text-soft uppercase">{t('loans_status')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {transactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5 text-sm text-gray-700">{tx.transactionDate ? new Date(tx.transactionDate).toLocaleString() : '-'}</td>
                            <td className="px-4 py-2.5 text-sm text-gray-700">{tx.transactionNumber}</td>
                            <td className="px-4 py-2.5 text-sm text-gray-700">{getMethodLabel(tx.paymentMethod)}</td>
                            <td className="px-4 py-2.5 text-right text-sm font-medium text-gray-900">${Number(tx.amount).toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                              }`}>{tx.status}</span>
                            </td>
                          </tr>
                        ))}
                        {transactions.length === 0 && (
                          <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">{t('loans_noPayments')}</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Make Payment Modal */}
      {payLoanId && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col" onClick={() => { setPayLoanId(null); setPayError(''); setPaySuccess(''); setPayMethod('CASH'); }}>
          <div className="w-full flex-1 p-6 md:p-10 flex flex-col justify-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-text-dark mb-1">{t('loans_makePayment')}</h3>
            <p className="mb-4 text-sm text-gray-500">{t('repayment_enterAmount')}</p>
            <form onSubmit={handlePay}>
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('loans_paymentAmount')}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-medium text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2.5 pl-8 pr-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
              </div>
              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-gray-700">{t('loans_paymentMethod')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'CASH', label: t('loans_cash'), icon: '💵' },
                    { value: 'TELEBIRR', label: t('loans_telebirr'), icon: '📱' },
                    { value: 'CBE', label: t('loans_cbe'), icon: '🏦' },
                    { value: 'AWASH', label: t('loans_awash'), icon: '🏦' },
                    { value: 'COOP', label: t('loans_coop'), icon: '🏦' },
                  ].map(m => (
                    <label key={m.value} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-all ${
                      payMethod === m.value ? 'border-blue-800 bg-primary-50 text-blue-800' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}>
                      <input type="radio" name="payMethod" value={m.value} checked={payMethod === m.value}
                        onChange={e => setPayMethod(e.target.value)} className="sr-only" />
                      <span>{m.icon}</span>
                      <span className="font-medium">{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting}
                  className="flex-1 rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? t('common_processing') : t('loans_submitPayment')}
                </button>
                <button type="button" onClick={() => { setPayLoanId(null); setPayError(''); setPaySuccess(''); setPayMethod('CASH'); }}
                  className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  {t('common_cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
