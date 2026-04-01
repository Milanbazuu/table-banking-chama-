export interface Member {
  id: string;
  memberNumber: string;
  name: string;
  phoneNumber: string;
  registrationDate: string;
  initialShares: number;
}

export type TransactionCategory = 'Contribution' | 'Loan Repayment' | 'Reg Fee' | 'Loan Disbursement' | 'Mpesa Charge' | 'Penalty';

export interface Transaction {
  id: string;
  memberId: string;
  amount: number;
  category: TransactionCategory;
  date: string;
  month: number;
  year: number;
  reference?: string; // Mpesa code or Loan ID
  notes?: string;
}

export interface Loan {
  id: string;
  memberId: string;
  loanNumber: string;
  principal: number;
  interest: number;
  totalDue: number;
  status: 'Open' | 'Paid' | 'Defaulted';
  disbursementDate: string;
  dueDate: string;
  remainingBalance: number;
}

export interface ChamaSettings {
  sharePrice: number;
  regFee: number;
  interestRate: number;
  deadlineDay: number;
  mpesaChargePercent: number;
  startMonth: number;
  endMonth: number;
  payoutMonth: number;
}