import { ChamaData, Transaction, Loan } from '../types/chama';
import { format, parseISO, addMonths } from 'date-fns';

export const calculateAllocation = (paymentAmount: number, memberId: string, data: ChamaData) => {
  let remaining = paymentAmount;
  const allocations = { interest: 0, mpesa: 0, principal: 0, contribution: 0 };
  
  // Settings check for mpesa charge
  const mpesaNeeded = 0; // Simplified
  allocations.mpesa = Math.min(remaining, mpesaNeeded);
  remaining -= allocations.mpesa;
  
  const openLoans = data.loans.filter(l => l.memberId === memberId && (l.status === 'OPEN' || l.status === 'Open')).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  for (const loan of openLoans) {
    const balance = loan.balance || loan.remainingBalance || 0;
    const interest = balance * (loan.interestRate / 100);
    const payInterest = Math.min(remaining, interest);
    allocations.interest += payInterest;
    remaining -= payInterest;
    if (remaining <= 0) break;
  }
  
  for (const loan of openLoans) {
    const balance = loan.balance || loan.remainingBalance || 0;
    const payPrincipal = Math.min(remaining, balance);
    allocations.principal += payPrincipal;
    remaining -= payPrincipal;
    if (remaining <= 0) break;
  }
  
  allocations.contribution = remaining;
  return allocations;
};

export const getMemberStats = (memberId: string, data: ChamaData) => {
  const member = data.members.find(m => m.id === memberId);
  if (!member) return null;
  
  const mTransactions = data.transactions.filter(t => t.memberId === memberId);
  const mLoans = data.loans.filter(l => l.memberId === memberId);
  
  const totalContributed = mTransactions.filter(t => t.type === 'CONTRIBUTION' || t.category === 'Contribution').reduce((sum, t) => sum + t.amount, 0);
  const outstandingLoans = mLoans.filter(l => l.status === 'OPEN' || l.status === 'Open').reduce((sum, l) => sum + (l.balance || l.remainingBalance || 0), 0);
  
  const activityMonths = new Set(mTransactions.filter(t => t.type === 'REPAYMENT' || t.type === 'LOAN_DISBURSEMENT' || t.category === 'Loan Repayment').map(t => {
    const dateStr = t.date.includes('T') ? t.date : `${t.date}T00:00:00`;
    return format(parseISO(dateStr), 'yyyy-MM');
  })).size;
  
  return { ...member, totalContributed, outstandingLoans, loanCount: mLoans.length, isDividendEligible: activityMonths >= 5 };
};

export const generateLoanId = (memberNumber: string, count: number) => `LN-${memberNumber}-${(count + 1).toString().padStart(3, '0')}`;

export const runEndOfMonthProcess = (data: ChamaData, targetMonth: string) => {
  const newLoans: Loan[] = [];
  data.members.forEach(member => {
    const sharePrice = data.settings.shareValue || data.settings.sharePrice || 0;
    const expected = member.shares * sharePrice;
    const paid = data.transactions.filter(t => t.memberId === member.id && (t.type === 'CONTRIBUTION' || t.category === 'Contribution') && t.date.startsWith(targetMonth)).reduce((sum, t) => sum + t.amount, 0);
    
    if (paid < expected) {
      const diff = expected - paid;
      const loanId = generateLoanId(member.memberNumber, data.loans.filter(l => l.memberId === member.id).length + newLoans.filter(l => l.memberId === member.id).length);
      const now = new Date();
      newLoans.push({ 
        id: loanId, 
        memberId: member.id, 
        principal: diff, 
        balance: diff, 
        remainingBalance: diff,
        interestRate: data.settings.interestRate, 
        status: 'OPEN', 
        createdAt: format(addMonths(parseISO(`${targetMonth}-01`), 0), 'yyyy-MM-dd'),
        updatedAt: now.toISOString(),
        date: format(new Date(), 'yyyy-MM-dd')
      });
    }
  });
  return { ...data, loans: [...data.loans, ...newLoans] };
};