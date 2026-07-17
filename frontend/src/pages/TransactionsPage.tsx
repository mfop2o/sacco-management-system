import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface Transaction {
  id: string;
  transactionNumber: string;
  transactionType: string;
  amount: number;
  description: string;
  transactionDate: string;
  status: string;
  paymentMethod: string;
}

export default function TransactionsPage() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [searchType, setSearchType] = useState<'member' | 'account' | 'loan'>('member');
  const [searched, setSearched] = useState(false);

  const fetchTransactions = async () => {
    if (!searchId) return;
    setLoading(true);
    setSearched(true);
    try {
      const endpoint = searchType === 'member'
        ? `/transactions/member/${searchId}`
        : searchType === 'account'
          ? `/transactions/account/${searchId}`
          : `/transactions/loan/${searchId}`;
      const res = await api.get(endpoint);
      setTransactions(res.data);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); fetchTransactions(); };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-text-dark dark:text-slate-100">{t('transactions_title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('transactions_subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-50 dark:border-slate-700 p-5 mb-6 flex gap-3 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('transactions_searchBy')}</label>
          <select value={searchType} onChange={e => setSearchType(e.target.value as any)}
            className="px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all bg-white">
            <option value="member">{t('transactions_memberId')}</option>
            <option value="account">{t('transactions_accountId')}</option>
            <option value="loan">{t('transactions_loanId')}</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{searchType === 'member' ? t('transactions_memberId') : searchType === 'account' ? t('transactions_accountId') : t('transactions_loanId')}</label>
          <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} placeholder={searchType === 'member' ? t('transactions_enterMemberId') : searchType === 'account' ? t('transactions_enterAccountId') : t('transactions_enterLoanId')}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all" />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
          {loading ? t('transactions_searching') : t('transactions_search')}
        </button>
      </form>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-50 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-50 dark:bg-slate-700 border-b border-blue-100 dark:border-slate-600">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('transactions_txNumber')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('transactions_type')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('transactions_amount')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('transactions_description')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('transactions_date')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('transactions_status')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('transactions_method')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {transactions.map((tx, i) => (
                <tr key={tx.id} className={`hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-primary-50/40 dark:bg-slate-700/40'}`}>
                  <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{tx.transactionNumber}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-700">{tx.transactionType.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-gray-900">${Number(tx.amount).toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 max-w-[200px] truncate">{tx.description || '-'}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tx.status === 'COMPLETED' ? 'bg-primary-100 text-primary' :
                      tx.status === 'PENDING' ? 'bg-gray-100 text-gray-700' :
                      'bg-gray-200 text-gray-700'
                    }`}>{tx.status}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{tx.paymentMethod?.replace(/_/g, ' ') || '-'}</td>
                </tr>
              ))}
              {!searched && <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">{t('transactions_searchPrompt')}</td></tr>}
              {searched && transactions.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">{t('transactions_noTransactions')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
