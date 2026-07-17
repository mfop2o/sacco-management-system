import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FiX, FiCheck, FiEdit2, FiSlash, FiUserPlus } from 'react-icons/fi';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string;
}

const ROLES = ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'TELLER', 'ACCOUNTANT', 'MEMBER', 'AUDITOR'];

export default function UsersPage() {
  const { t } = useTranslation();
  const { user: currentUser, hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '', phone: '', role: 'TELLER' });
  const [editForm, setEditForm] = useState({ email: '', firstName: '', lastName: '', phone: '', role: 'TELLER' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/users', form);
      setSuccess(t('users_createSuccess'));
      setShowCreate(false);
      setForm({ username: '', email: '', password: '', firstName: '', lastName: '', phone: '', role: 'TELLER' });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || t('users_createFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm(t('users_deactivateConfirm'))) return;
    try {
      await api.put(`/users/${id}/deactivate`);
      fetchUsers();
    } catch {
      setError(t('users_deactivateFailed'));
    }
  };

  const openEdit = (user: User) => {
    setEditUserId(user.id);
    setEditForm({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: user.role
    });
    setShowEdit(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserId) return;
    setSubmitting(true);
    setError('');
    try {
      await api.put(`/users/${editUserId}`, editForm);
      setSuccess(t('users_createSuccess').replace('created', 'updated')); // Temporary workaround if translation doesn't exist
      setShowEdit(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || t('users_createFailed').replace('create', 'update'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
        <span className="text-sm text-gray-500">{t('users_loadingUsers')}</span>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-text-dark dark:text-slate-100">{t('users_title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{users.length} {users.length === 1 ? t('users_user') : t('users_users')} {t('users_inSystem')}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
          <FiUserPlus /> {t('users_createUser')}
        </button>
      </div>

      {error && <div className="mb-4 px-4 py-3 bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-sm flex items-center gap-2"><FiX />{error}</div>}
      {success && <div className="mb-4 px-4 py-3 bg-blue-100 border border-primary-100 text-blue-800 rounded-xl text-sm flex items-center gap-2"><FiCheck />{success}</div>}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-50 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-50 dark:bg-slate-700 border-b border-blue-100 dark:border-slate-600">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('users_username')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('users_fullName')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('users_email')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('users_role')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('users_status')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('users_lastLogin')}</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-text-soft uppercase tracking-wider">{t('users_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {users.map((u, i) => (
                <tr key={u.id} className={`hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-primary-50/40 dark:bg-slate-700/40'}`}>
                  <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{u.username}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-700">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-primary">
                      {u.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-primary-100 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isActive ? <FiCheck className="inline" /> : <FiX className="inline" />}
                      {u.isActive ? t('users_active') : t('users_inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                  <td className="px-3 py-2.5 text-right">
                    {hasRole(['SUPER_ADMIN']) && currentUser?.username !== u.username && (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)} title={t('common_edit') || 'Edit'} className="p-1.5 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 flex items-center justify-center transition-colors">
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        {u.isActive && (
                          <button onClick={() => handleDeactivate(u.id)} title={t('users_deactivate')} className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center justify-center transition-colors">
                            <FiSlash className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-0">
                  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/20">
                      <FiUserPlus className="text-3xl text-white" />
                    </div>
                    <p className="text-gray-500 text-base font-medium">{t('users_noUsers')}</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col">
          <div className="w-full flex-1 p-6 md:p-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/30"><FiUserPlus /></div>
              <h3 className="text-lg font-bold text-text-dark">{t('users_createUserTitle')}</h3>
            </div>
            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_usernameRequired')}</label>
                  <input type="text" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_emailRequired')}</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_firstNameRequired')}</label>
                  <input type="text" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_lastNameRequired')}</label>
                  <input type="text" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_passwordRequired')}</label>
                  <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_phone')}</label>
                  <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_roleRequired')}</label>
                  <select required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm bg-white">
                    {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50 transition-all">
                  {submitting ? t('users_creating') : t('users_createUser')}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">{t('users_cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col">
          <div className="w-full flex-1 p-6 md:p-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/30"><FiUserPlus /></div>
              <h3 className="text-lg font-bold text-text-dark">{t('common_edit') || 'Edit User'}</h3>
            </div>
            <form onSubmit={handleEdit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_emailRequired')}</label>
                  <input type="email" required value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_firstNameRequired')}</label>
                  <input type="text" required value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_lastNameRequired')}</label>
                  <input type="text" required value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_phone')}</label>
                  <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_roleRequired')}</label>
                  <select required value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm bg-white">
                    {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50 transition-all">
                  {submitting ? t('common_loading') || 'Loading...' : t('common_save') || 'Save'}
                </button>
                <button type="button" onClick={() => setShowEdit(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">{t('users_cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
