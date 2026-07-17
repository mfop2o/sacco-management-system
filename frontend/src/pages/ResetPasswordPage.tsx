import { useState, type FormEvent } from 'react';
import { FiAlertTriangle, FiCheck, FiLock } from 'react-icons/fi';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) { setError(t('reset.invalidToken')); return; }
    if (password.length < 6) { setError(t('reset.passwordLength')); return; }
    if (password !== confirm) { setError(t('reset.passwordMismatch')); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('reset.failed'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 45%, #e0f2fe 100%)' }}>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-blue-200/60 border border-white/80 p-8 max-w-sm w-full text-center">
          <FiAlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600">{t('reset.invalidToken')}</p>
          <Link to="/login" className="mt-4 inline-block text-sm font-bold text-primary hover:text-primary-dark">{t('common.back')}</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 45%, #e0f2fe 100%)' }}>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-blue-200/60 border border-white/80 p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-lg font-black text-gray-900 mb-2">{t('reset.success')}</h2>
          <p className="text-sm text-gray-500 mb-6">{t('reset.successDesc')}</p>
          <button onClick={() => navigate('/login')} className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/30">
            {t('login.signIn')}
          </button>
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
              <FiLock className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">{t('reset.title')}</h1>
            <p className="mt-1 text-xs text-gray-400">{t('reset.subtitle')}</p>
          </div>
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs text-red-600">
              <FiAlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-password" className="block text-xs font-semibold text-gray-700 mb-1.5">{t('common.password')}</label>
              <input id="reset-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoFocus placeholder={t('common.password')} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white" />
            </div>
            <div>
              <label htmlFor="reset-confirm" className="block text-xs font-semibold text-gray-700 mb-1.5">{t('reset.confirmPassword')}</label>
              <input id="reset-confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={6} placeholder={t('reset.confirmPassword')} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white" />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-primary/30">
              {loading ? t('common.loading') : t('reset.resetButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
