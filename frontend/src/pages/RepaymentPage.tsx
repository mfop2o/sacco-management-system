
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiAlertCircle, FiCheck, FiCheckCircle, FiChevronRight, FiX } from 'react-icons/fi';
import api from '../services/api';

interface Loan {
    id: string;
    loanNumber: string;
    loanType: string;
    principalAmount: number;
    outstandingBalance: number;
    arrearsAmount: number;
    status: string;
    durationMonths: number;
    interestRate: number;
}

type Step = 'select-loan' | 'select-method' | 'enter-amount' | 'confirm' | 'done';

const METHODS = [
    {
        id: 'TELEBIRR',
        label: 'Telebirr',
        subtitle: 'Ethio Telecom mobile money',
        backend: 'MOBILE_MONEY',
        color: 'from-[#0070C0] to-[#00AEEF]',
        textColor: 'text-white',
        logo: (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white font-black text-sm">T</span>
                </div>
                <span className="text-white font-black text-base tracking-wide">telebirr</span>
            </div>
        ),
    },
    {
        id: 'CBE',
        label: 'Commercial Bank of Ethiopia',
        subtitle: 'CBE Birr / Branch transfer',
        backend: 'BANK_TRANSFER',
        color: 'from-[#006633] to-[#009933]',
        textColor: 'text-white',
        logo: (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white font-black text-sm">CBE</span>
                </div>
                <div className="leading-tight">
                    <p className="text-white font-black text-xs tracking-wide">COMMERCIAL BANK</p>
                    <p className="text-white/80 font-semibold text-[10px] tracking-widest">OF ETHIOPIA</p>
                </div>
            </div>
        ),
    },
    {
        id: 'AWASH',
        label: 'Awash Bank',
        subtitle: 'Awash Bank transfer',
        backend: 'BANK_TRANSFER',
        color: 'from-[#C8102E] to-[#E83050]',
        textColor: 'text-white',
        logo: (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white font-black text-sm">A</span>
                </div>
                <span className="text-white font-black text-base tracking-wide">Awash Bank</span>
            </div>
        ),
    },
    {
        id: 'COOP',
        label: 'Cooperative Bank of Oromia',
        subtitle: 'Coopay / Branch transfer',
        backend: 'BANK_TRANSFER',
        color: 'from-[#004B8D] to-[#0072CE]',
        textColor: 'text-white',
        logo: (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white font-black text-[10px]">COOP</span>
                </div>
                <div className="leading-tight">
                    <p className="text-white font-black text-xs">COOPERATIVE BANK</p>
                    <p className="text-white/80 text-[10px] font-semibold">OF OROMIA</p>
                </div>
            </div>
        ),
    },
];

export default function RepaymentPage() {
    const { t } = useTranslation();
    const [step, setStep] = useState<Step>('select-loan');
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<typeof METHODS[0] | null>(null);
    const [amount, setAmount] = useState('');
    const [reference, setReference] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const meRes = await api.get('/members/me');
                const loansRes = await api.get(`/loans/member/${meRes.data.id}`);
                const active = (loansRes.data as Loan[]).filter(
                    l => ['DISBURSED', 'REPAYMENT', 'APPROVED'].includes(l.status)
                );
                setLoans(active);
            } catch {
                // non-member roles load all active loans
                try {
                    const res = await api.get('/loans');
                    const active = (res.data as Loan[]).filter(
                        l => ['DISBURSED', 'REPAYMENT'].includes(l.status)
                    );
                    setLoans(active);
                } catch { setLoans([]); }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSubmit = async () => {
        if (!selectedLoan || !selectedMethod || !amount) return;
        setSubmitting(true);
        setError('');
        try {
            await api.post(`/loans/${selectedLoan.id}/repay`, null, {
                params: { amount, paymentMethod: selectedMethod.backend },
            });
            setStep('done');
        } catch (err: any) {
            setError(err.response?.data?.message || t('loans.repaymentFailed'));
        } finally {
            setSubmitting(false);
        }
    };

    const reset = () => {
        setStep('select-loan');
        setSelectedLoan(null);
        setSelectedMethod(null);
        setAmount('');
        setReference('');
        setError('');
    };

    // ── Step indicator ──────────────────────────────────────────────
    const STEPS: { key: Step; label: string }[] = [
        { key: 'select-loan', label: t('repayment.stepsLoan') },
        { key: 'select-method', label: t('repayment.stepsMethod') },
        { key: 'enter-amount', label: t('repayment.stepsAmount') },
        { key: 'confirm', label: t('repayment.stepsConfirm') },
    ];
    const stepIdx = STEPS.findIndex(s => s.key === step);

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-7">
                <h2 className="text-2xl font-black text-text-dark dark:text-slate-100">{t('repayment.title')}</h2>
                <p className="text-sm text-text-soft mt-1">{t('repayment.subtitle')}</p>
            </div>

            {/* Step indicator */}
            {step !== 'done' && (
                <div className="flex items-center gap-0 mb-8">
                    {STEPS.map((s, i) => (
                        <div key={s.key} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center gap-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i < stepIdx ? 'bg-primary border-primary text-white'
                                    : i === stepIdx ? 'bg-primary border-primary text-white shadow-md shadow-primary/30'
                                        : 'bg-white border-primary-100 text-text-soft'
                                    }`}>
                                    {i < stepIdx ? <FiCheck className="w-3.5 h-3.5" /> : i + 1}
                                </div>
                                <span className={`text-[10px] font-semibold uppercase tracking-wider ${i <= stepIdx ? 'text-primary' : 'text-text-soft'}`}>
                                    {s.label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all ${i < stepIdx ? 'bg-primary' : 'bg-primary-100'}`} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Step: select loan ── */}
            {step === 'select-loan' && (
                <div className="bg-white rounded-2xl border border-blue-50 shadow-sm shadow-blue-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-blue-50">
                        <p className="text-sm font-bold text-text-dark">{t('repayment.selectLoan')}</p>
                    </div>
                    {loans.length === 0 ? (
                        <div className="py-16 text-center">
                            <FiAlertCircle className="mx-auto w-8 h-8 text-primary-200 mb-3" />
                            <p className="text-sm text-text-soft">{t('repayment.noActiveLoans')}</p>
                        </div>
                    ) : loans.map(loan => (
                        <button key={loan.id} onClick={() => { setSelectedLoan(loan); setStep('select-method'); }}
                            className="w-full flex items-center justify-between px-6 py-4 border-b border-blue-50 last:border-0 hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors group">
                            <div className="text-left">
                                <p className="text-sm font-bold text-text-dark">{loan.loanNumber}</p>
                                <p className="text-xs text-text-soft mt-0.5">{loan.loanType.replace(/_/g, ' ')} · {loan.interestRate}% · {loan.durationMonths}mo</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xs text-text-soft">{t('repayment.outstanding')}</p>
                                    <p className="text-sm font-black text-text-dark">${Number(loan.outstandingBalance).toLocaleString()}</p>
                                </div>
                                {loan.arrearsAmount > 0 && (
                                    <div className="text-right">
                                        <p className="text-xs text-text-soft">{t('repayment.arrears')}</p>
                                        <p className="text-sm font-bold text-red-500">${Number(loan.arrearsAmount).toLocaleString()}</p>
                                    </div>
                                )}
                                <FiChevronRight className="w-4 h-4 text-text-soft group-hover:text-primary transition-colors" />
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* ── Step: select method ── */}
            {step === 'select-method' && (
                <div className="space-y-4">
                    <p className="text-sm font-bold text-text-dark px-1">{t('repayment.selectMethod')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {METHODS.map(m => (
                            <button key={m.id} onClick={() => { setSelectedMethod(m); setStep('enter-amount'); }}
                                className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
                                <div className={`bg-gradient-to-br ${m.color} p-5 h-28 flex flex-col justify-between`}>
                                    {m.logo}
                                    <div className="flex items-end justify-between">
                                        <p className="text-white/80 text-xs font-medium">{m.subtitle}</p>
                                        <FiChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setStep('select-loan')}
                        className="mt-2 text-sm text-text-soft hover:text-primary transition-colors">
                        {t('common.back')}
                    </button>
                </div>
            )}

            {/* ── Step: enter amount ── */}
            {step === 'enter-amount' && selectedLoan && selectedMethod && (
                <div className="bg-white rounded-2xl border border-blue-50 shadow-sm shadow-blue-100 p-6 space-y-5">
                    {/* Selected method banner */}
                    <div className={`bg-gradient-to-br ${selectedMethod.color} rounded-xl p-4 flex items-center justify-between`}>
                        {selectedMethod.logo}
                        <span className="text-white/80 text-xs font-semibold">{selectedMethod.subtitle}</span>
                    </div>

                    {/* Loan info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { label: t('repayment.loanInfo'), value: selectedLoan.loanNumber },
                            { label: t('repayment.outstanding'), value: `$${Number(selectedLoan.outstandingBalance).toLocaleString()}` },
                            { label: t('repayment.arrears'), value: `$${Number(selectedLoan.arrearsAmount).toLocaleString()}` },
                        ].map(i => (
                            <div key={i.label} className="bg-primary-50 rounded-xl p-3 text-center">
                                <p className="text-[10px] text-text-soft uppercase tracking-wider font-semibold">{i.label}</p>
                                <p className="text-sm font-black text-text-dark mt-0.5">{i.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Amount input */}
                    <div>
                        <label className="block text-sm font-semibold text-text-dark mb-1.5">{t('repayment.enterAmount')}</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-soft font-bold text-sm">$</span>
                            <input type="number" step="0.01" min="0.01"
                                value={amount} onChange={e => setAmount(e.target.value)}
                                placeholder="0.00" autoFocus
                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-primary-100 bg-primary-50 text-text-dark font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all" />
                        </div>
                        <p className="text-xs text-text-soft mt-1.5">
                            {t('repayment.minimum')}: $1.00 · {t('repayment.outstanding')}: <span className="font-semibold text-text-mid">${Number(selectedLoan.outstandingBalance).toLocaleString()}</span>
                        </p>
                    </div>

                    {/* Reference (optional) */}
                    <div>
                        <label className="block text-sm font-semibold text-text-dark mb-1.5">{t('repayment.reference')} <span className="text-text-soft font-normal">({t('repayment.referenceOptional')})</span></label>
                        <input type="text" value={reference} onChange={e => setReference(e.target.value)}
                            placeholder="e.g. TXN-123456"
                            className="w-full px-4 py-2.5 rounded-xl border border-primary-100 bg-primary-50 text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all" />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button onClick={() => setStep('select-method')} className="px-5 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-text-mid hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors">{t('common.back')}</button>
                        <button onClick={() => { if (amount && parseFloat(amount) > 0) setStep('confirm'); }}
                            disabled={!amount || parseFloat(amount) <= 0}
                            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-primary/20">
                            {t('common.continue')}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step: confirm ── */}
            {step === 'confirm' && selectedLoan && selectedMethod && (
                <div className="bg-white rounded-2xl border border-blue-50 shadow-sm shadow-blue-100 p-6 space-y-5">
                    <div className="text-center pb-2">
                        <p className="text-xs font-bold text-text-soft uppercase tracking-widest mb-1">{t('repayment.confirm')}</p>
                        <p className="text-3xl font-black text-text-dark">${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>

                    {/* Summary */}
                    <div className="bg-primary-50 rounded-xl divide-y divide-primary-100">
                        {[
                            { label: t('repayment.loan'), value: selectedLoan.loanNumber },
                            { label: t('repayment.method'), value: selectedMethod.label },
                            { label: t('common.amount'), value: `$${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                            ...(reference ? [{ label: t('common.reference'), value: reference }] : []),
                        ].map(row => (
                            <div key={row.label} className="flex justify-between px-4 py-3">
                                <span className="text-xs font-semibold text-text-soft uppercase tracking-wider">{row.label}</span>
                                <span className="text-sm font-bold text-text-dark">{row.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Method badge */}
                    <div className={`bg-gradient-to-br ${selectedMethod.color} rounded-xl p-3 flex items-center gap-3`}>
                        {selectedMethod.logo}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            <FiX className="w-4 h-4 shrink-0" />{error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button onClick={() => { setStep('enter-amount'); setError(''); }}
                            className="px-5 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-text-mid hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors">
                            {t('common.back')}
                        </button>
                        <button onClick={handleSubmit} disabled={submitting}
                            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark disabled:opacity-50 transition-all shadow-sm shadow-primary/20 flex items-center justify-center gap-2">
                            {submitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    {t('common.processing')}
                                </>
                            ) : t('repayment.confirmPay')}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step: done ── */}
            {step === 'done' && selectedLoan && selectedMethod && (
                <div className="bg-white rounded-2xl border border-blue-50 shadow-sm shadow-blue-100 p-10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto">
                        <FiCheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <p className="text-xl font-black text-text-dark">{t('repayment.success')}</p>
                        <p className="text-sm text-text-soft mt-1">{t('repayment.successSub')}</p>
                    </div>
                    <div className="bg-primary-50 rounded-xl divide-y divide-primary-100 text-left">
                        {[
                            { label: t('repayment.loan'), value: selectedLoan.loanNumber },
                            { label: t('repayment.method'), value: selectedMethod.label },
                            { label: t('common.amount'), value: `$${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                        ].map(row => (
                            <div key={row.label} className="flex justify-between px-4 py-3">
                                <span className="text-xs font-semibold text-text-soft uppercase tracking-wider">{row.label}</span>
                                <span className="text-sm font-bold text-text-dark">{row.value}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={reset}
                        className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20">
                        {t('repayment.makeAnother')}
                    </button>
                </div>
            )}
        </div>
    );
}
