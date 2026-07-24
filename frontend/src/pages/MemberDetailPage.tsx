import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiClipboard, FiCreditCard, FiDollarSign, FiX } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

interface MemberData {
  id: string;
  membershipNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: string;
  joinedDate: string;
}

interface SavingsAccount {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  interestRate: number;
  isActive: boolean;
  openedDate: string;
}

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

interface Transaction {
  id: string;
  transactionNumber: string;
  transactionType: string;
  amount: number;
  description: string;
  transactionDate: string;
  status: string;
}

const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-primary-100 text-primary',
  APPROVED: 'bg-primary-100 text-primary',
  DISBURSED: 'bg-primary-100 text-primary',
  REPAYMENT: 'bg-primary-100 text-primary',
  CLOSED: 'bg-gray-100 text-gray-500',
  DEFAULTED: 'bg-gray-200 text-gray-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  UNDER_REVIEW: 'bg-gray-100 text-gray-700',
};

export default function MemberDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [member, setMember] = useState<MemberData | null>(null);
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txMsg, setTxMsg] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState<'loans' | 'transactions'>('loans');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [memRes, accRes, loanRes, txnRes] = await Promise.all([
          api.get(`/members/${id}`),
          api.get(`/savings-accounts/member/${id}`),
          api.get(`/loans/member/${id}`),
          api.get(`/transactions/member/${id}`),
        ]);
        setMember(memRes.data);
        setAccounts(Array.isArray(accRes.data) ? accRes.data : []);
        setLoans(Array.isArray(loanRes.data) ? loanRes.data : []);
        setTransactions(Array.isArray(txnRes.data) ? txnRes.data : []);
      } catch {
        setError(t('members_loadFailed'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/savings-accounts/${selectedAccountId}/deposit`, null, { params: { amount: txAmount, description: txDesc || 'Deposit' } });
      setTxMsg({ text: t('members_depositSuccessful'), type: 'success' });
      setShowDeposit(false);
      setTxAmount('');
      setTxDesc('');
      const accRes = await api.get(`/savings-accounts/member/${id}`);
      setAccounts(Array.isArray(accRes.data) ? accRes.data : []);
    } catch {
      setTxMsg({ text: t('members_depositFailed'), type: 'error' });
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/savings-accounts/${selectedAccountId}/withdraw`, null, { params: { amount: txAmount, description: txDesc || 'Withdrawal' } });
      setTxMsg({ text: t('members_withdrawalSuccessful'), type: 'success' });
      setShowWithdraw(false);
      setTxAmount('');
      setTxDesc('');
      const accRes = await api.get(`/savings-accounts/member/${id}`);
      setAccounts(Array.isArray(accRes.data) ? accRes.data : []);
    } catch {
      setTxMsg({ text: t('members_withdrawalFailed'), type: 'error' });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
    </div>
  );

  if (error) return <div className="text-center py-20 text-gray-700">{error}</div>;
  if (!member) return <div className="text-center py-20 text-gray-500">{t('members_memberNotFound')}</div>;

  const totalSavings = accounts.reduce((s, a) => s + Number(a.balance), 0);

  return (
    <div>
      <div className="mb-6">
        <Link to="/members" className="text-sm text-gray-500 hover:text-blue-800 transition-colors">&larr; {t('members_backToMembers')}</Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-50 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-800 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20">
            {member.firstName[0]}{member.lastName[0]}
          </div>
          <div>
            <h2 className="text-2xl font-black text-text-dark dark:text-slate-100">{member.firstName} {member.lastName}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-500">{member.membershipNumber}</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.status === 'ACTIVE' ? 'bg-primary-100 text-primary' : 'bg-gray-100 text-gray-500'
                }`}>{member.status}</span>
            </div>
          </div>
        </div>
        <Link to={`/loans/apply?memberId=${member.id}`} className="px-4 py-2 bg-primary text-white rounded-2xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
          {t('members_applyForLoan')}
        </Link>
      </div>

      {txMsg.text && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${txMsg.type === 'success' ? 'bg-primary-100 text-primary border border-primary-100' : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}>
          <span>{txMsg.type === 'success' ? <FiCheck className="inline" /> : <FiX className="inline" />}</span>
          {txMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-50 dark:border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('members_memberInfo')}</h3>
          <dl className="space-y-3">
            {[
              [t('members_membershipNumber'), member.membershipNumber],
              [t('members_phone'), member.phone],
              [t('members_email'), member.email || '-'],
              [t('members_joined'), member.joinedDate],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between items-center">
                <dt className="text-sm text-gray-500">{label as string}</dt>
                <dd className="text-sm font-medium text-gray-900">{value as string}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-50 dark:border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('members_savingsAccounts')}</h3>
          {accounts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">{t('members_noAccounts')}</p>
          ) : (
            <div className="space-y-3">
              {accounts.map(acc => (
                <div key={acc.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs text-gray-500">{acc.accountNumber}</span>
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${acc.isActive ? 'bg-primary-100 text-primary' : 'bg-gray-100 text-gray-500'
                        }`}>{acc.accountType}</span>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900">ETB {Number(acc.balance).toLocaleString()}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setSelectedAccountId(acc.id); setShowDeposit(true); setTxMsg({ text: '', type: '' }); }}
                      className="flex-1 px-3 py-1.5 text-xs font-semibold bg-primary-100 text-primary rounded-xl hover:bg-primary-200">{t('members_deposit')}</button>
                    <button onClick={() => { setSelectedAccountId(acc.id); setShowWithdraw(true); setTxMsg({ text: '', type: '' }); }}
                      className="flex-1 px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">{t('members_withdraw')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-50 dark:border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('members_summary')}</h3>
          <div className="space-y-4">
            <div className="bg-primary-50 rounded-xl p-4">
              <p className="text-xs text-blue-900 font-medium">{t('members_totalSavings')}</p>
              <p className="text-2xl font-black text-text-dark dark:text-slate-100 mt-1">ETB {totalSavings.toLocaleString()}</p>
            </div>
            <div className="bg-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-600 font-medium">{t('members_activeLoans')}</p>
              <p className="text-2xl font-black text-text-dark dark:text-slate-100 mt-1">{loans.filter(l => !['CLOSED', 'DEFAULTED'].includes(l.status)).length}</p>
            </div>
            <div className="bg-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-600 font-medium">{t('members_outstanding')}</p>
              <p className="text-2xl font-black text-text-dark dark:text-slate-100 mt-1">ETB {loans.reduce((s, l) => s + Number(l.outstandingBalance), 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-50 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4 border-b border-gray-200 pb-4">
          <h3 className="text-lg font-bold text-text-dark">{t('members_loansAndTransactions')}</h3>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setActiveTab('loans')} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'loans' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t('members_loans')}</button>
            <button onClick={() => setActiveTab('transactions')} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'transactions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t('members_transactions')}</button>
          </div>
        </div>

        {activeTab === 'loans' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-soft uppercase">{t('loans_loanNumber')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-soft uppercase">{t('common_type')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-soft uppercase">{t('loans_amount')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-soft uppercase">{t('common_balance')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-soft uppercase">{t('common_status')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-soft uppercase">{t('common_date')}</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {loans.map(loan => (
                  <tr key={loan.id} className="hover:bg-primary-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{loan.loanNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{loan.loanType.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">ETB {Number(loan.principalAmount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">ETB {Number(loan.outstandingBalance).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[loan.status] || 'bg-gray-50'}`}>{loan.status.replace(/_/g, ' ')}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{loan.applicationDate}</td>
                  </tr>
                ))}
                {loans.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">{t('members_noLoans')}</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-soft uppercase">{t('transactions_txNumber')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-soft uppercase">{t('common_type')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-soft uppercase">{t('common_amount')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-soft uppercase">{t('transactions_description')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-soft uppercase">{t('common_date')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-soft uppercase">{t('common_status')}</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-primary-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{tx.transactionNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{tx.transactionType.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">ETB {Number(tx.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{tx.description || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.status === 'COMPLETED' ? 'bg-primary-100 text-primary' : tx.status === 'PENDING' ? 'bg-gray-100 text-gray-700' : 'bg-gray-200 text-gray-700'}`}>{tx.status}</span></td>
                  </tr>
                ))}
                {transactions.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">{t('members_noTransactions')}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal show={showDeposit} onClose={() => setShowDeposit(false)} title={t('members_depositToAccount')} type="deposit">
        <form onSubmit={handleDeposit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common_amount')}</label>
            <input type="number" step="0.01" min="0.01" required value={txAmount} onChange={e => setTxAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" placeholder="0.00" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common_description')}</label>
            <input type="text" value={txDesc} onChange={e => setTxDesc(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dark transition-colors">{t('members_deposit')}</button>
            <button type="button" onClick={() => setShowDeposit(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors">{t('common_cancel')}</button>
          </div>
        </form>
      </Modal>

      <Modal show={showWithdraw} onClose={() => setShowWithdraw(false)} title={t('members_withdrawFromAccount')} type="withdraw">
        <form onSubmit={handleWithdraw}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common_amount')}</label>
            <input type="number" step="0.01" min="0.01" required value={txAmount} onChange={e => setTxAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" placeholder="0.00" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common_description')}</label>
            <input type="text" value={txDesc} onChange={e => setTxDesc(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dark transition-colors">{t('members_withdraw')}</button>
            <button type="button" onClick={() => setShowWithdraw(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors">{t('common_cancel')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Modal({ show, onClose, title, type, children }: { show: boolean; onClose: () => void; title: string; type?: string; children: React.ReactNode }) {
  if (!show) return null;
  const icons: Record<string, React.ReactNode> = { deposit: <FiDollarSign />, withdraw: <FiCreditCard />, approve: <FiCheck />, disburse: <FiCreditCard /> };
  const colors: Record<string, string> = { deposit: 'bg-blue-100', withdraw: 'bg-gray-100' };
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col" onClick={onClose}>
      <div className="w-full flex-1 p-6 md:p-10 flex flex-col justify-center" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          {type && <div className={`w-10 h-10 ${colors[type] || 'bg-gray-50'} rounded-xl flex items-center justify-center text-blue-800`}>{icons[type] || <FiClipboard />}</div>}
          <div>
            <h3 className="text-lg font-bold text-text-dark">{title}</h3>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
