import { useState } from 'react';
import { FiAlertTriangle, FiEye, FiEyeOff, FiLock, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

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
          // try axios-like error
          const maybeErr = e as { response?: { data?: { message?: unknown } } };
          if (maybeErr.response && maybeErr.response.data && maybeErr.response.data.message) {
            return String(maybeErr.response.data.message);
          }
        }
        if (err instanceof Error) return err.message;
        return defaultMsg;
      };

      setError(getMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #D4EAFF 0%, #EBF4FD 50%, #D6EAFF 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/40 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-300/30 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-200/50 p-8 border border-blue-50">

          {/* Logo + heading */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-2xl font-black text-white">H</span>
            </div>
            <h1 className="text-2xl font-black text-text-dark tracking-tight">{t('login.title')}</h1>
            <p className="mt-1.5 text-sm text-text-soft">{t('login.subtitle')}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <FiAlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-text-dark mb-1.5">
                {t('login.emailOrUsername')}
              </label>
              <div className="relative">
                <FiUser className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-text-soft" />
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                  placeholder={t('login.placeholderEmail')}
                  className="w-full rounded-2xl border border-blue-100 bg-primary-50 py-2.5 pr-4 pl-10 text-sm text-text-dark placeholder:text-text-soft outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-text-dark">{t('login.password')}</label>
                <button type="button" className="text-xs text-primary hover:text-primary-dark font-medium transition-colors">
                  {t('login.forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <FiLock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-text-soft" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder={t('login.placeholderPassword')}
                  className="w-full rounded-2xl border border-blue-100 bg-primary-50 py-2.5 pr-11 pl-10 text-sm text-text-dark placeholder:text-text-soft outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-text-soft hover:text-primary transition-colors"
                >
                  {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white transition-all hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-primary/30 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('login.signingIn')}
                </span>
              ) : t('login.signIn')}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-soft mt-5">
          &copy; {new Date().getFullYear()} {t('login.footer')}
        </p>
      </div>
    </div>
  );
}
