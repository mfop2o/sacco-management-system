export interface Member {
  id: string;
  membershipNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  nationalId: string;
  status: string;
  joinedDate: string;
  savingsBalance?: number;
}

export interface Loan {
  id: string;
  loanNumber: string;
  memberId: string;
  memberName: string;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  durationMonths: number;
  status: string;
  outstandingBalance: number;
  applicationDate: string;
  approvalDate: string;
  disbursementDate: string;
}

export interface SavingsAccount {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  interestRate: number;
  isActive: boolean;
  openedDate: string;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  transactionType: string;
  amount: number;
  description: string;
  transactionDate: string;
  status: string;
}

export interface MemberFinancialSummary {
  memberId: string;
  membershipNumber: string;
  fullName: string;
  totalSavings: number;
  totalShares: number;
  totalLoansOutstanding: number;
}