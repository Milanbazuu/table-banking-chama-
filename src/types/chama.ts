export type Member = {
  id: string;
  memberNumber: string;
  name: string;
  phoneNumber: string;
  registrationDate: string;
  isRegistered: boolean;
  shares: number;
  status: 'ACTIVE' | 'INACTIVE';
  
  // Per-member overrides
  registrationFee?: number;
  
  // Monthly tracking breakdown
  monthlyContributions?: {
    jan?: number;
    feb?: number;
    mar?: number;
    apr?: number;
    may?: number;
    jun?: number;
    jul?: number;
    aug?: number;
    sep?: number;
    oct?: number;
    nov?: number;
    dec?: number;
  };

  // Matrix Fields (Provided by User)
  contributionsToDate?: number;
  actualContributions?: number;
  janLoans?: number;
  febTargetContributionJanLoanRepayment?: number;
  janLoansFebRepaymentBy10th?: number;
  febDeficitBy10thPlusMpesa?: number;
  janMpesaCharge?: number;
  chargeDeficit?: number;
  febDisbursedLoan?: number;
  totalLoansJanDeficitFebDisbursement?: number;
  expectedMarchContributions?: number;
  totalToPayBy10thMarchMidnight?: number;
  marchRepaymentToDate?: number;
  marchRepaymentDeficit?: number;
  aprilLoansDeficitMarch?: number;
  expectedContributionsLoanRepay10thAprilMpesa?: number;
  aprilRepaymentToDate?: number;
  deficitApril?: number;
  
  loanHistory?: Array<{ 
    loanId: string; 
    status: 'open' | 'closed'; 
    balance: number; 
    disbursedAmount: number; 
    repaidAmount: number; 
  }>;
};

export type TransactionType = 
  | 'CONTRIBUTION' 
  | 'LOAN_DISBURSEMENT' 
  | 'REPAYMENT' 
  | 'REG_FEE' 
  | 'MPESA_CHARGE' 
  | 'PENALTY' 
  | 'INTEREST'
  | 'LOAN_REPAYMENT';

export type Transaction = {
  id: string;
  memberId: string;
  date: string;
  amount: number;
  type: TransactionType;
  loanId?: string;
  isLate?: boolean;
  mpesaCharges?: number;
  month: number;
  year: number;
  reference?: string; 
  mpesaPhone?: string;
  description?: string;
  category?: string; 
};

export type Loan = {
  id: string;
  memberId: string;
  principal: number;
  balance: number;
  interestRate: number;
  status: 'OPEN' | 'CLOSED' | 'Open' | 'Closed'; 
  createdAt: string;
  updatedAt: string;
  type?: string;
  date?: string;
  remainingBalance?: number; 
};

export interface ChamaSettings {
  shareValue: number;
  registrationFee: number;
  interestRate: number;
  paymentDeadlineDay: number;
  minMonthsForInterest: number;
  payoutMonth: number;
  adminMpesaCharge?: boolean;
  
  // Compatibility fields
  sharePrice?: number;
  regFee?: number;
}

export type SystemSettings = ChamaSettings;

export type ChamaData = {
  members: Member[];
  transactions: Transaction[];
  loans: Loan[];
  settings: SystemSettings;
};