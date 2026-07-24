import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { FiArrowDownCircle, FiArrowUpCircle, FiCheck, FiX, FiDollarSign, FiCreditCard, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface SavingsAccount {
  id: string;
  accountNumber: string;
  memberName: string;
  accountType: string;
  balance: number;
  interestRate: number;
  isActive: boolean;
}

const ACCOUNT_TYPES = ['REGULAR', 'EMERGENCY', 'EDUCATION', 'RETIREMENT', 'GROUP'];

export default function SavingsPage() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchMemberId, setSearchMemberId] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedAccountNumber, setSelectedAccountNumber] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txMethod, setTxMethod] = useState('CASH');
  const [actionMsg, setActionMsg] = useState({ text: '', type: '' });
  const [editAccount, setEditAccount] = useState<SavingsAccount | null>(null);
  const [editType, setEditType] = useState('');
  const [closeId, setCloseId] = useState<string | null>(null);

  const fetchAccounts = async (memberId?: string) => {
    try {
      const url = memberId ? `/savings-accounts/member/${memberId}` : '/savings-accounts';
      const res = await api.get(url);
      setAccounts(res.data);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMemberId) fetchAccounts(searchMemberId);
  };

  const clearSearch = () => {
    setSearchMemberId('');
    fetchAccounts();
  };

  const openDeposit = (acc: SavingsAccount) => {
    setSelectedAccountId(acc.id);
    setSelectedAccountNumber(acc.accountNumber);
    setShowDeposit(true);
    setTxMethod('CASH');
    setActionMsg({ text: '', type: '' });
  };

  const openWithdraw = (acc: SavingsAccount) => {
    setSelectedAccountId(acc.id);
    setSelectedAccountNumber(acc.accountNumber);
    setShowWithdraw(true);
    setTxMethod('CASH');
    setActionMsg({ text: '', type: '' });
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/savings-accounts/${selectedAccountId}/deposit`, null, { params: { amount: txAmount, description: txDesc || 'Deposit', paymentMethod: txMethod } });
      setActionMsg({ text: t('savings_depositSuccessful'), type: 'success' });
      setShowDeposit(false);
      setTxAmount('');
      setTxDesc('');
      setTxMethod('CASH');
      fetchAccounts(searchMemberId || undefined);
    } catch {
      setActionMsg({ text: t('savings_depositFailed'), type: 'error' });
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/savings-accounts/${selectedAccountId}/withdraw`, null, { params: { amount: txAmount, description: txDesc || 'Withdrawal', paymentMethod: txMethod } });
      setActionMsg({ text: t('savings_withdrawalSuccessful'), type: 'success' });
      setShowWithdraw(false);
      setTxAmount('');
      setTxDesc('');
      setTxMethod('CASH');
      fetchAccounts(searchMemberId || undefined);
    } catch {
      setActionMsg({ text: t('savings_withdrawalFailed'), type: 'error' });
    }
  };

  const openEdit = (acc: SavingsAccount) => {
    setEditAccount(acc);
    setEditType(acc.accountType);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccount) return;
    try {
      await api.put(`/savings-accounts/${editAccount.id}`, { accountType: editType });
      setActionMsg({ text: t('savings_accountTypeUpdated'), type: 'success' });
      setEditAccount(null);
      fetchAccounts(searchMemberId || undefined);
    } catch {
      setActionMsg({ text: t('savings_updateFailed'), type: 'error' });
    }
  };

  const handleClose = async () => {
    if (!closeId) return;
    try {
      await api.delete(`/savings-accounts/${closeId}`);
      setActionMsg({ text: t('savings_accountClosed'), type: 'success' });
      setCloseId(null);
      fetchAccounts(searchMemberId || undefined);
    } catch {
      setActionMsg({ text: t('savings_closeFailed'), type: 'error' });
    }
  };

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
        <span className="text-sm text-gray-500">{t('savings_loadingAccounts')}</span>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-text-dark dark:text-slate-100">{t('savings_title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{accounts.length} {t('savings_accounts')} · ${totalBalance.toLocaleString()} {t('savings_totalBalance')}</p>
        </div>
        <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
          <input type="text" placeholder={t('savings_searchByMemberId')} value={searchMemberId} onChange={e => setSearchMemberId(e.target.value)}
            className="px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all" />
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-all">{t('savings_search')}</button>
          {searchMemberId && (
            <button type="button" onClick={clearSearch} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">{t('savings_clear')}</button>
          )}
        </form>
      </div>

      {actionMsg.text && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
          actionMsg.type === 'success' ? 'bg-primary-100 text-primary border border-primary-100' : 'bg-gray-100 text-gray-700 border border-gray-200'
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
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('savings_accountNumber')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('savings_member')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('savings_type')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('savings_balance')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('savings_rate')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('savings_status')}</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-text-soft uppercase tracking-wider">{t('savings_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {accounts.map((acc, i) => (
                <tr key={acc.id} className={`hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-primary-50/40 dark:bg-slate-700/40'}`}>
                  <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{acc.accountNumber}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-700">{acc.memberName}</td>
                  <td className="px-4 py-3.5 text-sm"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-primary">{acc.accountType}</span></td>
                  <td className="px-4 py-3.5 text-sm font-bold text-gray-900">ETB {Number(acc.balance).toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-700">{acc.interestRate}%</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${acc.isActive ? 'bg-primary-100 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                      {acc.isActive ? t('savings_active') : t('savings_inactive')}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openDeposit(acc)} title={t('savings_deposit')} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center justify-center transition-colors">
                        <FiArrowDownCircle className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openWithdraw(acc)} title={t('savings_withdraw')} className="p-1.5 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 flex items-center justify-center transition-colors">
                        <FiArrowUpCircle className="w-3.5 h-3.5" />
                      </button>
                      {acc.isActive && (
                        <button onClick={() => openEdit(acc)} title={t('savings_edit')} className="p-1.5 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 flex items-center justify-center transition-colors">
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {acc.isActive && (
                        <button onClick={() => setCloseId(acc.id)} title={t('savings_close')} className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center justify-center transition-colors">
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-0">
                  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/20">
                      <FiDollarSign className="text-3xl text-white" />
                    </div>
                    <p className="text-gray-500 text-base font-medium">{t('savings_noAccounts')}</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDeposit && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col" onClick={() => setShowDeposit(false)}>
          <div className="w-full flex-1 p-6 md:p-10 flex flex-col justify-center" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/30"><FiDollarSign /></div>
              <div>
                <h3 className="text-lg font-bold text-text-dark">{t('savings_depositTitle')}</h3>
                <p className="text-xs text-gray-500">{selectedAccountNumber}</p>
              </div>
            </div>
            <form onSubmit={handleDeposit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('savings_amount')}</label>
                <input type="number" step="0.01" min="0.01" required value={txAmount} onChange={e => setTxAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" placeholder="0.00" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('savings_description')}</label>
                <input type="text" value={txDesc} onChange={e => setTxDesc(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('savings_paymentMethod')}</label>
                <select value={txMethod} onChange={e => setTxMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm bg-white">
                  <option value="CASH">{t('loans_cash')}</option>
                  <option value="BANK_TRANSFER">{t('loans_bankTransfer')}</option>
                  <option value="MOBILE_MONEY">{t('loans_mobileMoney')}</option>
                  <option value="TELEBIRR">{t('loans_telebirr')}</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">{t('savings_deposit')}</button>
                <button type="button" onClick={() => setShowDeposit(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">{t('savings_cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col" onClick={() => setShowWithdraw(false)}>
          <div className="w-full flex-1 p-6 md:p-10 flex flex-col justify-center" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/30"><FiCreditCard /></div>
              <div>
                <h3 className="text-lg font-bold text-text-dark">{t('savings_withdrawTitle')}</h3>
                <p className="text-xs text-gray-500">{selectedAccountNumber}</p>
              </div>
            </div>
            <form onSubmit={handleWithdraw}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('savings_amount')}</label>
                <input type="number" step="0.01" min="0.01" required value={txAmount} onChange={e => setTxAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" placeholder="0.00" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('savings_description')}</label>
                <input type="text" value={txDesc} onChange={e => setTxDesc(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('savings_paymentMethod')}</label>
                <select value={txMethod} onChange={e => setTxMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm bg-white">
                  <option value="CASH">{t('loans_cash')}</option>
                  <option value="BANK_TRANSFER">{t('loans_bankTransfer')}</option>
                  <option value="MOBILE_MONEY">{t('loans_mobileMoney')}</option>
                  <option value="TELEBIRR">{t('loans_telebirr')}</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">{t('savings_withdraw')}</button>
                <button type="button" onClick={() => setShowWithdraw(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">{t('savings_cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editAccount && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col" onClick={() => setEditAccount(null)}>
          <div className="w-full flex-1 p-6 md:p-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/30"><FiEdit2 /></div>
              <h3 className="text-lg font-bold text-text-dark">{t('savings_editAccountType')}</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">{editAccount.accountNumber}</p>
            <form onSubmit={handleEdit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('savings_accountType')}</label>
                <select required value={editType} onChange={e => setEditType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm bg-white">
                  {ACCOUNT_TYPES.map(acct => <option key={acct} value={acct}>{acct}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">{t('savings_save')}</button>
                <button type="button" onClick={() => setEditAccount(null)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">{t('savings_cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {closeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setCloseId(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-blue-50 dark:border-slate-700 p-6 w-full max-w-xs mx-4" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiTrash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-text-dark">{t('savings_closeAccount')}</h3>
              <p className="text-xs text-gray-500 mt-1">{t('savings_closeConfirm')}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleClose} className="flex-1 px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600 transition-colors">{t('savings_yesClose')}</button>
              <button onClick={() => setCloseId(null)} className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors">{t('savings_back')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
