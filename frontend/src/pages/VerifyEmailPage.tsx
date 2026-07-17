import { useEffect, useState } from 'react';
import { FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { t } = useTranslation();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('verify.invalidToken'));
      return;
    }

    api.post('/auth/verify-email', { token })
      .then(() => {
        setStatus('success');
        setMessage(t('verify.success'));
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(err.response?.data?.message || t('verify.failed'));
      });
  }, [token, t]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 45%, #e0f2fe 100%)' }}>
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-blue-200/60 border border-white/80 p-8 max-w-sm w-full text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <svg className="h-8 w-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500">{t('common.loading')}</p>
          </div>
        )}
        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-lg font-black text-gray-900 mb-2">{t('verify.title')}</h2>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <Link to="/login" className="inline-block w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/30">
              {t('login.signIn')}
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <FiAlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-black text-gray-900 mb-2">{t('verify.failedTitle')}</h2>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <Link to="/login" className="inline-block text-sm font-bold text-primary hover:text-primary-dark">{t('common.back')}</Link>
          </>
        )}
      </div>
    </div>
  );
}
