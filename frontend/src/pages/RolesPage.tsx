
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiAlertCircle, FiBarChart2, FiCheck, FiChevronRight,
    FiCreditCard, FiDollarSign,
    FiEye,
    FiLock, FiSave, FiSettings, FiShield, FiUnlock,
    FiUsers, FiX
} from 'react-icons/fi';

// ── Permission definitions ─────────────────────────────────────────────────
type Access = 'full' | 'read' | 'limited' | 'none';

interface Permission {
    module: string;
    icon: React.ElementType;
    actions: {
        view: Access;
        create: Access;
        edit: Access;
        delete: Access;
        approve: Access;
    };
}

interface RoleDef {
    id: string;
    label: string;
    description: string;
    color: string;          // tailwind bg class for badge
    textColor: string;
    permissions: Permission[];
}

// Helper to build a permission row quickly
const p = (module: string, icon: React.ElementType,
    view: Access, create: Access, edit: Access, del: Access, approve: Access
): Permission => ({ module, icon, actions: { view, create, edit, delete: del, approve } });

// ── Access badge cell ────────────────────────────────────────────────────
const AccessCell = ({ access }: { access: Access }) => {
    const { t } = useTranslation();
    if (access === 'full') return <span className="inline-flex items-center gap-1 text-xs font-bold text-primary"><FiCheck className="w-3 h-3" />{t('roles.full')}</span>;
    if (access === 'read') return <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-mid"><FiEye className="w-3 h-3" />{t('roles.read')}</span>;
    if (access === 'limited') return <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-200"><FiUnlock className="w-3 h-3" />{t('roles.limited')}</span>;
    return <span className="inline-flex items-center gap-1 text-xs text-text-soft"><FiX className="w-3 h-3" />{t('roles.none')}</span>;
};

// ── Permission matrix for a single role ─────────────────────────────────
function PermissionMatrix({ role }: { role: RoleDef }) {
    const { t } = useTranslation();
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-primary-50 border-b border-primary-100">
                        <th className="px-4 py-2.5 text-left text-xs font-bold text-text-soft uppercase tracking-wider">{t('roles.module')}</th>
                        {[t('roles.view'), t('roles.create'), t('roles.edit'), t('roles.delete'), t('roles.approve')].map(a => (
                            <th key={a} className="px-3 py-2.5 text-center text-xs font-bold text-text-soft uppercase tracking-wider">{a}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                    {role.permissions.map(perm => (
                        <tr key={perm.module} className="hover:bg-primary-50/40 transition-colors">
                            <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                    <perm.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span className="text-xs font-semibold text-text-dark">{perm.module}</span>
                                </div>
                            </td>
                            <td className="px-3 py-2.5 text-center"><AccessCell access={perm.actions.view} /></td>
                            <td className="px-3 py-2.5 text-center"><AccessCell access={perm.actions.create} /></td>
                            <td className="px-3 py-2.5 text-center"><AccessCell access={perm.actions.edit} /></td>
                            <td className="px-3 py-2.5 text-center"><AccessCell access={perm.actions.delete} /></td>
                            <td className="px-3 py-2.5 text-center"><AccessCell access={perm.actions.approve} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ── Main page ────────────────────────────────────────────────────────────
export default function RolesPage() {
    const { t } = useTranslation();

    const ROLES: RoleDef[] = [
        {
            id: 'SUPER_ADMIN',
            label: t('roles.superAdmin'),
            description: t('roles.superAdminDesc'),
            color: 'bg-primary',
            textColor: 'text-white',
            permissions: [
                p('Members', FiUsers, 'full', 'full', 'full', 'full', 'full'),
                p('Loans', FiDollarSign, 'full', 'full', 'full', 'full', 'full'),
                p('Savings', FiSave, 'full', 'full', 'full', 'full', 'full'),
                p('Transactions', FiCreditCard, 'full', 'full', 'full', 'full', 'full'),
                p('Users', FiShield, 'full', 'full', 'full', 'full', 'full'),
                p('Reports', FiBarChart2, 'full', 'full', 'full', 'full', 'full'),
                p('Settings', FiSettings, 'full', 'full', 'full', 'full', 'full'),
            ],
        },
        {
            id: 'SYSTEM_ADMIN',
            label: t('roles.systemAdmin'),
            description: t('roles.systemAdminDesc'),
            color: 'bg-primary',
            textColor: 'text-white',
            permissions: [
                p('Members', FiUsers, 'full', 'full', 'full', 'full', 'full'),
                p('Loans', FiDollarSign, 'full', 'full', 'full', 'full', 'full'),
                p('Savings', FiSave, 'full', 'full', 'full', 'full', 'full'),
                p('Transactions', FiCreditCard, 'full', 'full', 'full', 'full', 'full'),
                p('Users', FiShield, 'full', 'full', 'full', 'limited', 'none'),
                p('Reports', FiBarChart2, 'full', 'full', 'full', 'full', 'full'),
                p('Settings', FiSettings, 'read', 'none', 'limited', 'none', 'none'),
            ],
        },
        {
            id: 'BRANCH_MANAGER',
            label: t('roles.branchManager'),
            description: t('roles.branchManagerDesc'),
            color: 'bg-primary-200',
            textColor: 'text-primary',
            permissions: [
                p('Members', FiUsers, 'full', 'full', 'full', 'limited', 'full'),
                p('Loans', FiDollarSign, 'full', 'full', 'full', 'none', 'full'),
                p('Savings', FiSave, 'full', 'full', 'full', 'none', 'full'),
                p('Transactions', FiCreditCard, 'full', 'full', 'none', 'none', 'none'),
                p('Users', FiShield, 'read', 'none', 'none', 'none', 'none'),
                p('Reports', FiBarChart2, 'full', 'full', 'full', 'none', 'none'),
                p('Settings', FiSettings, 'none', 'none', 'none', 'none', 'none'),
            ],
        },
        {
            id: 'LOAN_OFFICER',
            label: t('roles.loanOfficer'),
            description: t('roles.loanOfficerDesc'),
            color: 'bg-primary-200',
            textColor: 'text-primary',
            permissions: [
                p('Members', FiUsers, 'full', 'none', 'limited', 'none', 'none'),
                p('Loans', FiDollarSign, 'full', 'full', 'full', 'none', 'limited'),
                p('Savings', FiSave, 'read', 'none', 'none', 'none', 'none'),
                p('Transactions', FiCreditCard, 'read', 'none', 'none', 'none', 'none'),
                p('Users', FiShield, 'none', 'none', 'none', 'none', 'none'),
                p('Reports', FiBarChart2, 'limited', 'none', 'none', 'none', 'none'),
                p('Settings', FiSettings, 'none', 'none', 'none', 'none', 'none'),
            ],
        },
        {
            id: 'TELLER',
            label: t('roles.teller'),
            description: t('roles.tellerDesc'),
            color: 'bg-primary-100',
            textColor: 'text-primary',
            permissions: [
                p('Members', FiUsers, 'read', 'none', 'none', 'none', 'none'),
                p('Loans', FiDollarSign, 'read', 'none', 'none', 'none', 'none'),
                p('Savings', FiSave, 'full', 'full', 'none', 'none', 'none'),
                p('Transactions', FiCreditCard, 'full', 'full', 'none', 'none', 'none'),
                p('Users', FiShield, 'none', 'none', 'none', 'none', 'none'),
                p('Reports', FiBarChart2, 'limited', 'none', 'none', 'none', 'none'),
                p('Settings', FiSettings, 'none', 'none', 'none', 'none', 'none'),
            ],
        },
        {
            id: 'ACCOUNTANT',
            label: t('roles.accountant'),
            description: t('roles.accountantDesc'),
            color: 'bg-primary-100',
            textColor: 'text-primary',
            permissions: [
                p('Members', FiUsers, 'read', 'none', 'none', 'none', 'none'),
                p('Loans', FiDollarSign, 'full', 'none', 'none', 'none', 'none'),
                p('Savings', FiSave, 'full', 'none', 'none', 'none', 'none'),
                p('Transactions', FiCreditCard, 'full', 'full', 'none', 'none', 'none'),
                p('Users', FiShield, 'none', 'none', 'none', 'none', 'none'),
                p('Reports', FiBarChart2, 'full', 'full', 'full', 'none', 'none'),
                p('Settings', FiSettings, 'none', 'none', 'none', 'none', 'none'),
            ],
        },
        {
            id: 'AUDITOR',
            label: t('roles.auditor'),
            description: t('roles.auditorDesc'),
            color: 'bg-primary-50',
            textColor: 'text-primary',
            permissions: [
                p('Members', FiUsers, 'read', 'none', 'none', 'none', 'none'),
                p('Loans', FiDollarSign, 'read', 'none', 'none', 'none', 'none'),
                p('Savings', FiSave, 'read', 'none', 'none', 'none', 'none'),
                p('Transactions', FiCreditCard, 'read', 'none', 'none', 'none', 'none'),
                p('Users', FiShield, 'read', 'none', 'none', 'none', 'none'),
                p('Reports', FiBarChart2, 'full', 'none', 'none', 'none', 'none'),
                p('Settings', FiSettings, 'none', 'none', 'none', 'none', 'none'),
            ],
        },
        {
            id: 'MEMBER',
            label: t('roles.member'),
            description: t('roles.memberDesc'),
            color: 'bg-primary-50',
            textColor: 'text-primary',
            permissions: [
                p('Members', FiUsers, 'limited', 'none', 'none', 'none', 'none'),
                p('Loans', FiDollarSign, 'limited', 'full', 'none', 'none', 'none'),
                p('Savings', FiSave, 'limited', 'none', 'none', 'none', 'none'),
                p('Transactions', FiCreditCard, 'limited', 'none', 'none', 'none', 'none'),
                p('Users', FiShield, 'none', 'none', 'none', 'none', 'none'),
                p('Reports', FiBarChart2, 'none', 'none', 'none', 'none', 'none'),
                p('Settings', FiSettings, 'none', 'none', 'none', 'none', 'none'),
            ],
        },
    ];

    const [selected, setSelected] = useState<RoleDef>(ROLES[0]);
    const [tab, setTab] = useState<'overview' | 'matrix'>('overview');

    // summary counts for a role
    const countAccess = (role: RoleDef, level: Access) =>
        role.permissions.reduce((n, perm) =>
            n + Object.values(perm.actions).filter(a => a === level).length, 0);

    return (
        <div>
            {/* Header */}
            <div className="mb-7">
                <h2 className="text-2xl font-black text-text-dark dark:text-slate-100">{t('roles.title')}</h2>
                <p className="text-sm text-text-soft mt-1">
                    {ROLES.length} {t('roles.rolesDefined')} · {t('roles.clickToView')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Left: role list ── */}
                <div className="lg:col-span-1 space-y-2">
                    {ROLES.map(role => (
                        <button
                            key={role.id}
                            onClick={() => { setSelected(role); setTab('overview'); }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all text-left group
                ${selected.id === role.id
                                    ? 'bg-primary border-primary shadow-md shadow-primary/20'
                                    : 'bg-white border-blue-50 hover:border-primary-100 hover:bg-primary-50 shadow-sm shadow-blue-100'}`}
                        >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                ${selected.id === role.id ? 'bg-white/20' : 'bg-primary-50'}`}>
                                <FiShield className={`w-4 h-4 ${selected.id === role.id ? 'text-white' : 'text-primary'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate ${selected.id === role.id ? 'text-white' : 'text-text-dark'}`}>
                                    {role.label}
                                </p>
                                <p className={`text-[11px] truncate mt-0.5 ${selected.id === role.id ? 'text-white/70' : 'text-text-soft'}`}>
                                    {role.id}
                                </p>
                            </div>
                            <FiChevronRight className={`w-4 h-4 shrink-0 transition-transform
                ${selected.id === role.id ? 'text-white rotate-90' : 'text-text-soft group-hover:text-primary'}`} />
                        </button>
                    ))}
                </div>

                {/* ── Right: detail panel ── */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-blue-50 shadow-sm shadow-blue-100 overflow-hidden">

                    {/* Role header */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary-50 px-6 py-5 border-b border-blue-100">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                                    <FiShield className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-text-dark">{selected.label}</h3>
                                    <code className="text-xs text-text-soft font-mono">{selected.id}</code>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${selected.color} ${selected.textColor} border border-primary-100`}>
                                {selected.id}
                            </span>
                        </div>
                        <p className="text-sm text-text-mid mt-3">{selected.description}</p>

                        {/* Quick stats */}
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {[
                                { label: t('roles.fullAccess'), count: countAccess(selected, 'full'), icon: FiUnlock, cls: 'text-primary bg-primary-50' },
                                { label: t('roles.readOnly'), count: countAccess(selected, 'read'), icon: FiEye, cls: 'text-text-mid bg-primary-50' },
                                { label: t('roles.noAccess'), count: countAccess(selected, 'none'), icon: FiLock, cls: 'text-text-soft bg-primary-50' },
                            ].map(s => (
                                <div key={s.label} className="bg-white rounded-xl px-3 py-2.5 flex items-center gap-2 border border-blue-50">
                                    <s.icon className={`w-3.5 h-3.5 shrink-0 ${s.cls.split(' ')[0]}`} />
                                    <div>
                                        <p className="text-base font-black text-text-dark leading-none">{s.count}</p>
                                        <p className="text-[10px] text-text-soft mt-0.5">{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-blue-50 px-6">
                        {(['overview', 'matrix'] as const).map(tb => (
                            <button key={tb} onClick={() => setTab(tb)}
                                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all -mb-px
                  ${tab === tb ? 'border-primary text-primary' : 'border-transparent text-text-soft hover:text-primary'}`}>
                                {tb === 'overview' ? t('roles.overview') : t('roles.permissionMatrix')}
                            </button>
                        ))}
                    </div>

                    {/* Tab: overview */}
                    {tab === 'overview' && (
                        <div className="p-6 space-y-4">
                            <p className="text-xs font-bold text-text-soft uppercase tracking-widest mb-3">{t('roles.moduleAccessSummary')}</p>
                            {selected.permissions.map(perm => {
                                const accessLevels = Object.values(perm.actions);
                                const fullCount = accessLevels.filter(a => a === 'full').length;
                                const readCount = accessLevels.filter(a => a === 'read').length;
                                const limitedCount = accessLevels.filter(a => a === 'limited').length;
                                const noneCount = accessLevels.filter(a => a === 'none').length;
                                const hasAny = fullCount + readCount + limitedCount > 0;
                                return (
                                    <div key={perm.module} className="flex items-center gap-4 p-3 rounded-xl border border-blue-50 hover:bg-primary-50/40 transition-colors">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${hasAny ? 'bg-primary-50' : 'bg-gray-50'}`}>
                                            <perm.icon className={`w-4 h-4 ${hasAny ? 'text-primary' : 'text-text-soft'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-text-dark">{perm.module}</p>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {(['view', 'create', 'edit', 'delete', 'approve'] as const).map(action => {
                                                    const val = perm.actions[action as keyof typeof perm.actions];
                                                    if (val === 'none') return null;
                                                    return (
                                                        <span key={action} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide
                              ${val === 'full' ? 'bg-primary-100 text-primary'
                                                                : val === 'read' ? 'bg-primary-50 text-text-mid'
                                                                    : 'bg-primary-50 text-primary-200'}`}>
                                                            {action}
                                                        </span>
                                                    );
                                                })}
                                                {noneCount === 5 && (
                                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-text-soft">
                                                        <FiAlertCircle className="w-2.5 h-2.5" /> {t('roles.noAccessLabel')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Tab: matrix */}
                    {tab === 'matrix' && (
                        <div className="p-0">
                            <PermissionMatrix role={selected} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
