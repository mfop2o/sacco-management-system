import { useEffect, useState } from 'react';
import { FiCheck, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MemberRegistration from '../components/MemberRegistration';
import api from '../services/api';

interface Member {
  id: string;
  membershipNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: string;
  joinedDate: string;
}

export default function MemberListPage() {
  const { t } = useTranslation();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ phone: '', email: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchMembers = async () => {
    try {
      const res = await api.get('/members');
      setMembers(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const openEdit = (m: Member) => {
    setEditMember(m);
    setEditForm({ phone: m.phone, email: m.email || '' });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMember) return;
    try {
      await api.patch(`/members/${editMember.id}`, editForm);
      setMsg({ text: t('members.memberUpdated'), type: 'success' });
      setEditMember(null);
      fetchMembers();
    } catch {
      setMsg({ text: t('members.updateFailed'), type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/members/${deleteId}`);
      setMsg({ text: t('members.memberArchived'), type: 'success' });
      setDeleteId(null);
      fetchMembers();
    } catch {
      setMsg({ text: t('members.deleteFailed'), type: 'error' });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-text-dark dark:text-slate-100">{t('members.title')}</h2>
        </div>
        <button onClick={() => setShowRegister(!showRegister)} className="px-5 py-2.5 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
          <span>{showRegister ? <FiX /> : '+'}</span>
          {showRegister ? t('common.close') : t('members.register')}
        </button>
      </div>

      {msg.text && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${msg.type === 'success' ? 'bg-primary-100 text-primary border border-primary-100' : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}>
          <span>{msg.type === 'success' ? <FiCheck className="inline" /> : <FiX className="inline" />}</span>
          {msg.text}
        </div>
      )}

      {showRegister && <div className="mb-8"><MemberRegistration onSuccess={fetchMembers} /></div>}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-50 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-50 dark:bg-slate-700 border-b border-blue-100 dark:border-slate-600">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('members.memberNumber')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('members.name')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('members.phone')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('members.email')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('members.status')}</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-soft uppercase tracking-wider">{t('members.joined')}</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-text-soft uppercase tracking-wider">{t('members.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {members.map((member, i) => (
                <tr key={member.id} className={`hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-primary-50/40 dark:bg-slate-700/40'}`}>
                  <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{member.membershipNumber}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-700">{member.firstName} {member.lastName}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-700">{member.phone}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{member.email || '-'}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.status === 'ACTIVE' ? 'bg-primary-100 text-primary' :
                      member.status === 'SUSPENDED' ? 'bg-gray-100 text-gray-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>{member.status}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{member.joinedDate}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/members/${member.id}`} className="px-3 py-1.5 text-xs font-semibold bg-primary-100 text-primary rounded-xl hover:bg-primary-200">
                        {t('members.view')}
                      </Link>
                      <button onClick={() => openEdit(member)} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
                        <FiEdit2 className="inline mr-1" />{t('members.edit')}
                      </button>
                      <button onClick={() => setDeleteId(member.id)} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
                        <FiTrash2 className="inline mr-1" />{t('members.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">{t('members.noMembers')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editMember && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setEditMember(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary"><FiEdit2 /></div>
              <h3 className="text-lg font-bold text-text-dark">{t('members.editMember')}</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">{editMember.firstName} {editMember.lastName} ({editMember.membershipNumber})</p>
            <form onSubmit={handleEdit}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('members.phone')}</label>
                <input type="text" required value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('members.email')}</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dark transition-colors">{t('common.save')}</button>
                <button type="button" onClick={() => setEditMember(null)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setDeleteId(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiTrash2 className="text-2xl text-gray-700" />
              </div>
              <h3 className="text-lg font-bold text-text-dark">{t('members.archive')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('members.archiveConfirm')}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dark transition-colors">{t('members.archive')}</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
