import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { FiCheck, FiX } from 'react-icons/fi';

interface Props {
  onSuccess?: () => void;
}

const MemberRegistration: React.FC<Props> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'MALE',
    phone: '', email: '', nationalId: '', address: '',
    occupation: '', employer: '', emergencyContactName: '', emergencyContactPhone: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('/members', formData);
      setSuccess(true);
      setMessage(t('members.registerSuccess', { number: response.data.membershipNumber }));
      setFormData({
        firstName: '', lastName: '', dateOfBirth: '', gender: 'MALE',
        phone: '', email: '', nationalId: '', address: '',
        occupation: '', employer: '', emergencyContactName: '', emergencyContactPhone: '',
      });
      onSuccess?.();
    } catch (error: any) {
      setSuccess(false);
      setMessage(error.response?.data?.message || t('members.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "mt-1 block w-full px-3.5 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all text-sm";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-50 dark:border-slate-700 p-6">
      <h3 className="text-lg font-bold text-text-dark mb-1">{t('members.registerTitle')}</h3>
      <p className="text-sm text-gray-500 mb-5">{t('members.registerSubtitle')}</p>

      {message && (
        <div className={`p-3 mb-4 rounded-xl text-sm flex items-center gap-2 ${
          success ? 'bg-primary-100 text-primary border border-primary-100' : 'bg-gray-100 text-gray-700 border border-gray-200'
        }`}>
          <span>{success ? <FiCheck /> : <FiX />}</span>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ['firstName', t('members.firstName'), 'text'],
            ['lastName', t('members.lastName'), 'text'],
            ['dateOfBirth', t('members.dateOfBirth'), 'date'],
            ['gender', t('members.gender'), 'select'],
            ['phone', t('common.phone') + ' *', 'tel'],
            ['email', t('common.email'), 'email'],
            ['nationalId', t('members.nationalId'), 'text'],
            ['occupation', t('members.occupation'), 'text'],
          ].map(([name, label, type]) => (
            <div key={name as string}>
              <label className="block text-sm font-medium text-gray-700">{label as string}</label>
              {type === 'select' ? (
                <select name={name as string} value={formData.gender} onChange={handleChange} className={inputClass}>
                  <option value="MALE">{t('members.male')}</option>
                  <option value="FEMALE">{t('members.female')}</option>
                  <option value="OTHER">{t('members.other')}</option>
                </select>
              ) : (
                <input type={type as string} name={name as string} value={(formData as any)[name as string]} onChange={handleChange}
                  required={['firstName', 'lastName', 'dateOfBirth', 'phone', 'nationalId'].includes(name as string)}
                  className={inputClass} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">{t('members.address')}</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('members.emergencyContact')}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" name="emergencyContactName" placeholder={t('common.name')} value={formData.emergencyContactName} onChange={handleChange} className={inputClass} />
            <input type="tel" name="emergencyContactPhone" placeholder={t('common.phone')} value={formData.emergencyContactPhone} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="mt-6 w-full bg-primary text-white py-2.5 px-4 rounded-xl font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary/20">
          {loading ? t('members.registering') : t('members.register')}
        </button>
      </form>
    </div>
  );
};

export default MemberRegistration;
