import { useState, type FormEvent } from 'react';
import { FiAlertTriangle, FiArrowLeft, FiCheck, FiMail } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError(t('forgot.emailRequired')); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError(t('common.tryAgain'));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 45%, #e0f2fe 100%)' }}>
        <div className="relative z-10 w-full max-w-sm">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-blue-200/60 border border-white/80 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-lg font-black text-gray-900 mb-2">{t('forgot.emailSent')}</h2>
            <p className="text-sm text-gray-500 mb-6">{t('forgot.emailSentDesc')}</p>
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors">
              <FiArrowLeft className="w-4 h-4" /> {t('common.back')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 45%, #e0f2fe 100%)' }}>
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-50 blur-3xl" style={{ background: 'radial-gradient(circle, #93c5fd, transparent)' }} />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-blue-200/60 border border-white/80 p-8">
          <div className="flex flex-col items-center mb-7">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
              <FiMail className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">{t('forgot.title')}</h1>
            <p className="mt-1 text-xs text-gray-400 text-center">{t('forgot.subtitle')}</p>
          </div>
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs text-red-600">
              <FiAlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="block text-xs font-semibold text-gray-700 mb-1.5">{t('common.email')}</label>
              <input id="forgot-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus placeholder={t('common.email')} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white" />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-primary/30">
              {loading ? t('common.loading') : t('forgot.sendResetLink')}
            </button>
          </form>
          <div className="mt-5 text-center">
            <Link to="/login" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors">
              <FiArrowLeft className="w-3.5 h-3.5" /> {t('common.back')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
