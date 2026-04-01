import { Member, Transaction, Loan, ChamaSettings } from '../types/chama';

export function calculateMemberDue(member: Member, transactions: Transaction[], loans: Loan[], settings: ChamaSettings, targetDate: Date = new Date()) {
  const currentMonth = targetDate.getMonth();
  const hasPaidRegFee = transactions.some(t => t.memberId === member.id && (t.type === 'REG_FEE' || t.category === 'Reg Fee'));
  let regFeeDue = !hasPaidRegFee && member.status === 'ACTIVE' ? (member.registrationFee || settings.registrationFee || settings.regFee || 0) : 0;
  
  const shareVal = settings.shareValue || settings.sharePrice || 0;
  let totalContributionsExpected = 0;
  for (let m = 0; m <= Math.min(currentMonth, 10); m++) { 
    totalContributionsExpected += member.shares * shareVal; 
  }
  
  const totalContributionsPaid = transactions
    .filter(t => t.memberId === member.id && (t.type === 'CONTRIBUTION' || t.category === 'Contribution'))
    .reduce((sum, t) => sum + t.amount, 0);
    
  const contributionsDue = Math.max(0, totalContributionsExpected - totalContributionsPaid);
  
  const openLoans = loans.filter(l => l.memberId === member.id && (l.status === 'OPEN' || l.status === 'Open'));
  let totalLoanBalance = openLoans.reduce((sum, l) => sum + (l.balance || l.remainingBalance || 0), 0);
  let totalInterestDue = 0;
  
  openLoans.forEach(loan => {
    const loanDate = new Date(loan.createdAt);
    const monthsElapsed = (targetDate.getFullYear() - loanDate.getFullYear()) * 12 + (currentMonth - loanDate.getMonth());
    if (monthsElapsed > 0) { 
      totalInterestDue += (loan.balance || loan.remainingBalance || 0) * settings.interestRate * monthsElapsed; 
    }
  });
  
  return { 
    regFeeDue, 
    contributionsDue, 
    loanPrincipalDue: totalLoanBalance, 
    interestDue: totalInterestDue, 
    totalDue: regFeeDue + contributionsDue + totalLoanBalance + totalInterestDue 
  };
}