import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiAlertCircle, FiBarChart2, FiCheck, FiChevronRight,
    FiCreditCard, FiDollarSign, FiEdit2, FiEye,
    FiLock, FiPlus, FiSave, FiSettings, FiShield,
    FiTrash2, FiUnlock, FiUsers, FiX
} from 'react-icons/fi';
import api from '../services/api';

interface Permission {
    id: string;
    resource: string;
    action: string;
    description: string;
}

interface RoleData {
    id: string;
    name: string;
    description: string;
    system: boolean;
    active: boolean;
    permissions: Permission[];
    createdAt: string;
    updatedAt: string;
}

type TabType = 'overview' | 'matrix';

const MODULES = ['members', 'loans', 'savings', 'transactions', 'users', 'reports', 'settings'] as const;
const ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'DISBURSE', 'DEPOSIT', 'WITHDRAW', 'GENERATE'] as const;

const MODULE_ICONS: Record<string, React.ElementType> = {
    members: FiUsers, loans: FiDollarSign, savings: FiSave,
    transactions: FiCreditCard, users: FiShield, reports: FiBarChart2, settings: FiSettings,
};

export default function RolesPage() {
    const { t } = useTranslation();
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [selected, setSelected] = useState<RoleData | null>(null);
    const [tab, setTab] = useState<TabType>('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newPermIds, setNewPermIds] = useState<string[]>([]);
    const [savingCreate, setSavingCreate] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editPermIds, setEditPermIds] = useState<string[]>([]);
    const [savingEdit, setSavingEdit] = useState(false);

    const flash = (msg: string) => { setSuccessMsg(msg); setError(''); };
    const flashErr = (msg: string) => { setError(msg); setSuccessMsg(''); };

    const fetchRoles = useCallback(async () => {
        try {
            const res = await api.get('/roles');
            const data = res.data as RoleData[];
            setRoles(data);
            setSelected(prev => {
                if (!prev && data.length > 0) return data[0];
                if (prev) return data.find(r => r.id === prev.id) ?? data[0] ?? null;
                return null;
            });
        } catch {
            flashErr(t('common_loading'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    const fetchPermissions = useCallback(async () => {
        try {
            const res = await api.get('/permissions');
            setAllPermissions(res.data as Permission[]);
        } catch { /* permissions may come embedded in roles */ }
    }, []);

    useEffect(() => { fetchRoles(); fetchPermissions(); }, []);

    useEffect(() => {
        if (!successMsg) return;
        const timer = setTimeout(() => setSuccessMsg(''), 3000);
        return () => clearTimeout(timer);
    }, [successMsg]);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setSavingCreate(true);
        try {
            const res = await api.post('/roles', { name: newName.trim(), description: newDesc.trim(), permissionIds: newPermIds });
            setRoles(prev => [...prev, res.data]);
            setSelected(res.data);
            setShowCreate(false); setNewName(''); setNewDesc(''); setNewPermIds([]);
            flash(t('roles_createSuccess'));
        } catch (e: any) {
            flashErr(e.response?.data?.message || t('roles_createFailed'));
        } finally { setSavingCreate(false); }
    };

    const handleUpdate = async () => {
        if (!selected) return;
        setSavingEdit(true);
        try {
            const res = await api.put(`/roles/${selected.id}`, {
                name: editName.trim() !== selected.name ? editName.trim() : undefined,
                description: editDesc.trim() !== (selected.description || '') ? editDesc.trim() : undefined,
                permissionIds: editPermIds,
            });
            const updated = res.data as RoleData;
            setRoles(prev => prev.map(r => r.id === updated.id ? updated : r));
            setSelected(updated); setEditMode(false);
            flash(t('roles_updateSuccess'));
        } catch (e: any) {
            flashErr(e.response?.data?.message || t('roles_updateFailed'));
        } finally { setSavingEdit(false); }
    };

    const handleDelete = async (role: RoleData) => {
        if (role.system) { flashErr(t('roles_noAccess')); return; }
        if (!window.confirm(t('roles_deleteConfirm'))) return;
        try {
            await api.delete(`/roles/${role.id}`);
            const remaining = roles.filter(r => r.id !== role.id);
            setRoles(remaining);
            setSelected(selected?.id === role.id ? remaining[0] ?? null : selected);
            flash(t('roles_deleteSuccess'));
        } catch (e: any) { flashErr(e.response?.data?.message || t('roles_deleteFailed')); }
    };

    const enterEditMode = () => {
        if (!selected) return;
        setEditName(selected.name);
        setEditDesc(selected.description || '');
        setEditPermIds(selected.permissions.map(p => p.id));
        setEditMode(true);
    };

    const togglePerm = (permId: string, forCreate: boolean) => {
        if (forCreate) setNewPermIds(prev => prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]);
        else setEditPermIds(prev => prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]);
    };

    const modulePerms = (mod: string) => allPermissions.filter(p => p.resource === mod);
    const hasPerm = (role: RoleData, res: string, act: string) => role.permissions.some(p => p.resource === res && p.action === act);
    const countAccess = (role: RoleData, level: 'full' | 'read' | 'none') => {
        let n = 0;
        for (const mod of MODULES) {
            const mp = modulePerms(mod);
            if (level === 'full') n += mp.filter(p => hasPerm(role, mod, p.action)).length;
            else if (level === 'read') { if (hasPerm(role, mod, 'READ') && mp.filter(p => hasPerm(role, mod, p.action)).length === 1) n++; }
            else n += mp.filter(p => !hasPerm(role, mod, p.action)).length;
        }
        return n;
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div className="mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-black text-text-dark dark:text-slate-100">{t('roles_title')}</h2>
                    <p className="text-sm text-text-soft mt-1">{roles.length} {t('roles_rolesDefined')}</p>
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all text-sm font-bold shadow-md shadow-primary/20">
                    <FiPlus className="w-4 h-4" />{t('common_create')} {t('roles_title')}
                </button>
            </div>

            {successMsg && (
                <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm font-semibold text-green-700 flex items-center gap-2">
                    <FiCheck className="w-4 h-4 shrink-0" />{successMsg}
                </div>
            )}
            {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-700 flex items-center gap-2">
                    <FiAlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
            )}

            {/* Create modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col" onClick={() => setShowCreate(false)}>
                    <div className="w-full flex-1 p-6 md:p-10" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-black text-text-dark">{t('common_create')} {t('roles_title')}</h3>
                            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-primary-50 rounded-lg transition-colors">
                                <FiX className="w-5 h-5 text-text-soft" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-text-soft uppercase tracking-wider mb-1 block">{t('common_name')} *</label>
                                <input value={newName} onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g. BRANCH_AUDITOR"
                                    className="w-full px-3 py-2.5 rounded-xl border border-blue-100 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-soft uppercase tracking-wider mb-1 block">{t('common_description')}</label>
                                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2}
                                    className="w-full px-3 py-2.5 rounded-xl border border-blue-100 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
                            </div>
                            {allPermissions.length > 0 && (
                                <div>
                                    <label className="text-xs font-bold text-text-soft uppercase tracking-wider mb-2 block">{t('roles_permissionMatrix')}</label>
                                    <div className="max-h-56 overflow-y-auto space-y-1 border border-blue-50 dark:border-slate-600 rounded-xl p-2">
                                        {MODULES.map(mod => {
                                            const mp = modulePerms(mod);
                                            if (mp.length === 0) return null;
                                            return (
                                                <div key={mod}>
                                                    <p className="text-[10px] font-bold text-text-soft uppercase tracking-widest px-2 pt-2 pb-1 capitalize">{mod}</p>
                                                    <div className="flex flex-wrap gap-1 px-2 pb-2">
                                                        {mp.map(perm => (
                                                            <label key={perm.id} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer text-xs font-semibold border transition-all ${newPermIds.includes(perm.id)
                                                                ? 'bg-primary text-white border-primary'
                                                                : 'bg-primary-50 text-text-mid border-primary-100 hover:border-primary'
                                                                }`}>
                                                                <input type="checkbox" checked={newPermIds.includes(perm.id)} onChange={() => togglePerm(perm.id, true)} className="sr-only" />
                                                                {perm.action}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowCreate(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-blue-100 text-sm font-bold text-text-soft hover:bg-primary-50 transition-all">
                                    {t('common_cancel')}
                                </button>
                                <button onClick={handleCreate} disabled={!newName.trim() || savingCreate}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20">
                                    {savingCreate ? t('common_loading') : t('common_save')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left: role list */}
                <div className="lg:col-span-1 space-y-2">
                    {roles.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/20">
                                <FiShield className="text-3xl text-white" />
                            </div>
                            <p className="text-gray-500 text-base font-medium">{t('common_noData')}</p>
                        </div>
                    )}
                    {roles.map(role => (
                        <button key={role.id}
                            onClick={() => { setSelected(role); setTab('overview'); setEditMode(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all text-left group ${selected?.id === role.id
                                ? 'bg-primary border-primary shadow-md shadow-primary/20'
                                : 'bg-white dark:bg-slate-800 border-blue-50 dark:border-slate-700 hover:border-primary-100 hover:bg-primary-50 shadow-sm'
                                }`}>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${selected?.id === role.id ? 'bg-white/20' : 'bg-primary-50'}`}>
                                <FiShield className={`w-4 h-4 ${selected?.id === role.id ? 'text-white' : 'text-primary'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate ${selected?.id === role.id ? 'text-white' : 'text-text-dark'}`}>{role.name}</p>
                                <p className={`text-[11px] truncate mt-0.5 ${selected?.id === role.id ? 'text-white/70' : 'text-text-soft'}`}>{role.description || ''}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                {role.system && <FiLock className={`w-3 h-3 ${selected?.id === role.id ? 'text-white/60' : 'text-text-soft'}`} />}
                                <FiChevronRight className={`w-4 h-4 shrink-0 ${selected?.id === role.id ? 'text-white rotate-90' : 'text-text-soft group-hover:text-primary'}`} />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Right: detail panel */}
                {selected && (
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-blue-50 dark:border-slate-700 shadow-sm overflow-hidden">

                        {/* Role header */}
                        <div className="bg-gradient-to-r from-primary/10 to-primary-50 dark:from-primary/20 dark:to-slate-700 px-6 py-5 border-b border-blue-100 dark:border-slate-700">
                            <div className="flex items-start justify-between gap-4">
                                {editMode ? (
                                    <div className="flex-1 space-y-2">
                                        <input value={editName} onChange={e => setEditName(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-blue-100 text-lg font-black text-text-dark bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                        <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2}
                                            className="w-full px-3 py-2 rounded-xl border border-blue-100 text-sm text-text-mid bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                                            <FiShield className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-text-dark">{selected.name}</h3>
                                            <p className="text-xs text-text-soft mt-0.5">{selected.description || t('common_noData')}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 shrink-0">
                                    {!editMode && !selected.system && (
                                        <button onClick={enterEditMode} className="p-2 rounded-xl hover:bg-white/60 text-primary transition-all" title={t('common_edit')}>
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    {!editMode && !selected.system && (
                                        <button onClick={() => handleDelete(selected)} className="p-2 rounded-xl hover:bg-white/60 text-red-500 transition-all" title={t('common_delete')}>
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${selected.system ? 'bg-primary text-white border-primary' : 'bg-primary-50 text-primary border-primary-100'}`}>
                                        {selected.system ? t('roles_readOnly') : t('common_edit')}
                                    </span>
                                </div>
                            </div>
                            {editMode && (
                                <div className="flex gap-3 mt-4">
                                    <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-xl border border-blue-100 text-sm font-bold text-text-soft hover:bg-white/60 transition-all">{t('common_cancel')}</button>
                                    <button onClick={handleUpdate} disabled={savingEdit} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-all disabled:opacity-50 shadow-md shadow-primary/20">
                                        {savingEdit ? t('common_loading') : t('common_save')}
                                    </button>
                                </div>
                            )}
                            {/* Quick stats */}
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                {[
                                    { label: t('roles_fullAccess'), count: countAccess(selected, 'full'), icon: FiUnlock },
                                    { label: t('roles_readOnly'), count: countAccess(selected, 'read'), icon: FiEye },
                                    { label: t('roles_noAccess'), count: countAccess(selected, 'none'), icon: FiLock },
                                ].map(s => (
                                    <div key={s.label} className="bg-white dark:bg-slate-700 rounded-xl px-3 py-2.5 flex items-center gap-2 border border-blue-50 dark:border-slate-600">
                                        <s.icon className="w-3.5 h-3.5 shrink-0 text-primary" />
                                        <div>
                                            <p className="text-base font-black text-text-dark leading-none">{s.count}</p>
                                            <p className="text-[10px] text-text-soft mt-0.5">{s.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-blue-50 dark:border-slate-700 px-6">
                            {(['overview', 'matrix'] as const).map(tb => (
                                <button key={tb} onClick={() => setTab(tb)}
                                    className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all -mb-px ${tab === tb ? 'border-primary text-primary' : 'border-transparent text-text-soft hover:text-primary'
                                        }`}>
                                    {tb === 'overview' ? t('roles_overview') : t('roles_permissionMatrix')}
                                </button>
                            ))}
                        </div>

                        {/* Overview tab */}
                        {tab === 'overview' && (
                            <div className="p-6 space-y-3">
                                <p className="text-xs font-bold text-text-soft uppercase tracking-widest mb-3">{t('roles_moduleSummary')}</p>
                                {MODULES.map(mod => {
                                    const mp = modulePerms(mod);
                                    const granted = mp.filter(p => editMode ? editPermIds.includes(p.id) : hasPerm(selected, mod, p.action));
                                    const Icon = MODULE_ICONS[mod] || FiShield;
                                    return (
                                        <div key={mod} className="flex items-center gap-4 p-3 rounded-xl border border-blue-50 dark:border-slate-700 hover:bg-primary-50/40 transition-colors">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${granted.length > 0 ? 'bg-primary-50' : 'bg-gray-50 dark:bg-slate-700'}`}>
                                                <Icon className={`w-4 h-4 ${granted.length > 0 ? 'text-primary' : 'text-text-soft'}`} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-text-dark capitalize">{mod}</p>
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {editMode ? (
                                                        mp.map(perm => (
                                                            <label key={perm.id} className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase cursor-pointer border transition-all ${editPermIds.includes(perm.id) ? 'bg-primary text-white border-primary' : 'bg-primary-50 text-text-soft border-primary-100 hover:border-primary'
                                                                }`}>
                                                                <input type="checkbox" checked={editPermIds.includes(perm.id)} onChange={() => togglePerm(perm.id, false)} className="sr-only" />
                                                                {perm.action}
                                                            </label>
                                                        ))
                                                    ) : (
                                                        granted.length > 0
                                                            ? granted.map(p => (
                                                                <span key={p.id} className="px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-primary-100 text-primary">{p.action}</span>
                                                            ))
                                                            : <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-text-soft">{t('roles_noAccess')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Matrix tab */}
                        {tab === 'matrix' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-primary-50 dark:bg-slate-700 border-b border-primary-100 dark:border-slate-600">
                                            <th className="px-4 py-2.5 text-left text-xs font-bold text-text-soft uppercase tracking-wider">{t('roles_module')}</th>
                                            {ACTIONS.map(a => (
                                                <th key={a} className="px-3 py-2.5 text-center text-xs font-bold text-text-soft uppercase tracking-wider">{a}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-50 dark:divide-slate-700">
                                        {MODULES.map(mod => {
                                            const mp = modulePerms(mod);
                                            return (
                                                <tr key={mod} className="hover:bg-primary-50/40 dark:hover:bg-slate-700/40 transition-colors">
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-2">
                                                            {(() => { const Icon = MODULE_ICONS[mod] || FiShield; return <Icon className="w-3.5 h-3.5 text-primary shrink-0" />; })()}
                                                            <span className="text-xs font-semibold text-text-dark capitalize">{mod}</span>
                                                        </div>
                                                    </td>
                                                    {ACTIONS.map(action => {
                                                        const perm = mp.find(p => p.action === action);
                                                        const checked = perm && (editMode ? editPermIds.includes(perm.id) : hasPerm(selected, mod, action));
                                                        return (
                                                            <td key={action} className="px-3 py-2.5 text-center">
                                                                {perm ? (
                                                                    editMode ? (
                                                                        <input type="checkbox" checked={!!checked} onChange={() => togglePerm(perm.id, false)}
                                                                            className="rounded border-blue-200 text-primary focus:ring-primary/30 cursor-pointer" />
                                                                    ) : (
                                                                        checked
                                                                            ? <FiCheck className="w-3.5 h-3.5 text-primary mx-auto" />
                                                                            : <FiX className="w-3.5 h-3.5 text-text-soft mx-auto" />
                                                                    )
                                                                ) : <span className="text-[10px] text-text-soft">—</span>}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
