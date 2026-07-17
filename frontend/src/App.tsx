import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import DashboardPage from './pages/DashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoanApplicationPage from './pages/LoanApplicationPage';
import LoanApprovalPage from './pages/LoanApprovalPage';
import LoanListPage from './pages/LoanListPage';
import LoanPaymentPage from './pages/LoanPaymentPage';
import LoginPage from './pages/LoginPage';
import MemberDetailPage from './pages/MemberDetailPage';
import MemberListPage from './pages/MemberListPage';
import MyLoansPage from './pages/MyLoansPage';
import RepaymentPage from './pages/RepaymentPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RolesPage from './pages/RolesPage';
import SavingsPage from './pages/SavingsPage';
import TransactionsPage from './pages/TransactionsPage';
import UsersPage from './pages/UsersPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/members" element={<MemberListPage />} />
            <Route path="/members/:id" element={<MemberDetailPage />} />
            <Route path="/loans" element={<LoanListPage />} />
            <Route path="/loans/apply" element={<LoanApplicationPage />} />
            <Route path="/loans/pay" element={<LoanPaymentPage />} />
            <Route path="/repayment" element={<RepaymentPage />} />
            <Route path="/my-loans" element={<MyLoansPage />} />
            <Route path="/loans/approval" element={<LoanApprovalPage />} />
            <Route path="/savings" element={<SavingsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/users" element={
              <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN']}><UsersPage /></ProtectedRoute>
            } />
            <Route path="/roles" element={
              <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'SYSTEM_ADMIN']}><RolesPage /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
