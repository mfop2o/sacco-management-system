import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enMembers from './locales/en/members.json';
import enLoans from './locales/en/loans.json';
import enSavings from './locales/en/savings.json';
import enTransactions from './locales/en/transactions.json';
import enUsers from './locales/en/users.json';
import enSidebar from './locales/en/sidebar.json';
import enRoles from './locales/en/roles.json';
import enRepayment from './locales/en/repayment.json';
import enTranslation from './locales/en/translation.json';

import amCommon from './locales/am/common.json';
import amDashboard from './locales/am/dashboard.json';
import amMembers from './locales/am/members.json';
import amLoans from './locales/am/loans.json';
import amSavings from './locales/am/savings.json';
import amTransactions from './locales/am/transactions.json';
import amUsers from './locales/am/users.json';
import amSidebar from './locales/am/sidebar.json';
import amRoles from './locales/am/roles.json';
import amRepayment from './locales/am/repayment.json';
import amTranslation from './locales/am/translation.json';

import omCommon from './locales/om/common.json';
import omDashboard from './locales/om/dashboard.json';
import omMembers from './locales/om/members.json';
import omLoans from './locales/om/loans.json';
import omSavings from './locales/om/savings.json';
import omTransactions from './locales/om/transactions.json';
import omUsers from './locales/om/users.json';
import omSidebar from './locales/om/sidebar.json';
import omRoles from './locales/om/roles.json';
import omRepayment from './locales/om/repayment.json';
import omTranslation from './locales/om/translation.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                common: enCommon,
                dashboard: enDashboard,
                members: enMembers,
                loans: enLoans,
                savings: enSavings,
                transactions: enTransactions,
                users: enUsers,
                sidebar: enSidebar,
                roles: enRoles,
                repayment: enRepayment,
                translation: enTranslation,
            },
            am: {
                common: amCommon,
                dashboard: amDashboard,
                members: amMembers,
                loans: amLoans,
                savings: amSavings,
                transactions: amTransactions,
                users: amUsers,
                sidebar: amSidebar,
                roles: amRoles,
                repayment: amRepayment,
                translation: amTranslation,
            },
            om: {
                common: omCommon,
                dashboard: omDashboard,
                members: omMembers,
                loans: omLoans,
                savings: omSavings,
                transactions: omTransactions,
                users: omUsers,
                sidebar: omSidebar,
                roles: omRoles,
                repayment: omRepayment,
                translation: omTranslation,
            },
        },
        ns: ['common', 'dashboard', 'members', 'loans', 'savings', 'transactions', 'users', 'sidebar', 'roles', 'repayment', 'translation'],
        defaultNS: 'translation',
        fallbackLng: 'en',
        lng: localStorage.getItem('i18n_lang') || 'en',
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18n_lang',
        },
    });

export default i18n;
