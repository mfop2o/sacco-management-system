import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiEdit2, FiEye, FiTrash2, FiUsers, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
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
      setMsg({ text: t('members_memberUpdated'), type: 'success' });
      setEditMember(null);
      fetchMembers();
    } catch {
      setMsg({ text: t('members_updateFailed'), type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/members/${deleteId}`);
      setMsg({ text: t('members_memberArchived'), type: 'success' });
      setDeleteId(null);
      fetchMembers();
    } catch {
      setMsg({ text: t('members_deleteFailed'), type: 'error' });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-bold text-text-dark dark:text-slate-100">{t('members_title')}</h2>
        </div>
        <button onClick={() => setShowRegister(!showRegister)} className="px-3.5 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center gap-1.5">
          <span>{showRegister ? <FiX className="w-3 h-3" /> : '+'}</span>
          {showRegister ? t('common_close') : t('members_register')}
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
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('members_memberNumber')}</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('members_name')}</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('members_phone')}</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('members_email')}</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('members_status')}</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('members_joined')}</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-semibold text-text-soft uppercase tracking-wider">{t('members_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {members.map((member, i) => (
                <tr key={member.id} className={`hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-primary-50/40 dark:bg-slate-700/40'}`}>
                  <td className="px-3 py-2.5 text-xs font-medium text-gray-900">{member.membershipNumber}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-700">{member.firstName} {member.lastName}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-700">{member.phone}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{member.email || '-'}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${member.status === 'ACTIVE' ? 'bg-primary-100 text-primary' :
                      member.status === 'SUSPENDED' ? 'bg-gray-100 text-gray-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>{member.status}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{member.joinedDate}</td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/members/${member.id}`} title={t('members_view')} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center justify-center transition-colors">
                        <FiEye className="w-3.5 h-3.5" />
                      </Link>
                      <button onClick={() => openEdit(member)} title={t('members_edit')} className="p-1.5 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 flex items-center justify-center transition-colors">
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(member.id)} title={t('members_delete')} className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center justify-center transition-colors">
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-0">
                  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/20">
                      <FiUsers className="text-3xl text-white" />
                    </div>
                    <p className="text-gray-500 text-base font-medium">{t('members_noMembers')}</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editMember && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col" onClick={() => setEditMember(null)}>
          <div className="w-full flex-1 p-6 md:p-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-md shadow-primary/30"><FiEdit2 className="w-4 h-4" /></div>
              <h3 className="text-sm font-bold text-text-dark">{t('members_editMember')}</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">{editMember.firstName} {editMember.lastName} ({editMember.membershipNumber})</p>
            <form onSubmit={handleEdit}>
              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('members_phone')}</label>
                <input type="text" required value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-xs" />
              </div>
              <div className="mb-3.5">
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('members_email')}</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-xs" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 px-3 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-dark transition-colors">{t('common_save')}</button>
                <button type="button" onClick={() => setEditMember(null)} className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors">{t('common_cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col" onClick={() => setDeleteId(null)}>
          <div className="w-full flex-1 p-6 md:p-10 flex flex-col justify-center" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-3">
              <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-primary/20">
                <FiTrash2 className="text-lg text-white" />
              </div>
              <h3 className="text-sm font-bold text-text-dark">{t('members_archive')}</h3>
              <p className="text-xs text-gray-500 mt-1">{t('members_archiveConfirm')}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="flex-1 px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600 transition-colors">{t('members_archive')}</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors">{t('common_cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
