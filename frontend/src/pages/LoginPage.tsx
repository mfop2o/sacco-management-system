import { useState } from 'react';
import { FiAlertTriangle, FiEye, FiEyeOff, FiLock, FiUser } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const defaultMsg = t('login.invalidCredentials');
      const getMessage = (e: unknown): string => {
        if (typeof e === 'object' && e !== null) {
          const maybeErr = e as { response?: { data?: { message?: unknown } } };
          if (maybeErr.response?.data?.message) {
            return String(maybeErr.response.data.message);
          }
        }
        if (e instanceof Error) return e.message;
        return defaultMsg;
      };
      setError(getMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 45%, #e0f2fe 100%)' }}
    >
      {/* Background blobs */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, #93c5fd, transparent)' }}
      />

      <div
        className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-blue-200/60 border border-white/80 p-8">

          {/* Logo + Heading */}
          <div className="flex flex-col items-center mb-7">
            <img src={logo} alt="SACCO Logo" className="w-14 h-14 rounded-2xl object-contain shadow-lg shadow-primary/30 mb-4" />
            <h1 className="text-xl font-black text-gray-900 tracking-tight">{t('login.title')}</h1>
            <p className="mt-1 text-xs text-gray-400">{t('login.subtitle')}</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs text-red-600">
              <FiAlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                {t('login.emailOrUsername')}
              </label>
              <div className="relative">
                <FiUser className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="login-email"
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                  placeholder={t('login.placeholderEmail')}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-xs font-semibold text-gray-700">
                  {t('login.password')}
                </label>
                <Link to="/forgot-password" className="text-[11px] text-primary hover:text-primary-dark font-medium transition-colors">
                  {t('login.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder={t('login.placeholderPassword')}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff className="h-3.5 w-3.5" /> : <FiEye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-primary/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('login.signingIn')}
                </span>
              ) : (
                t('login.signIn')
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-400 mt-5">
          &copy; {new Date().getFullYear()} {t('login.footer')}
        </p>
      </div>
    </div>
  );
}
