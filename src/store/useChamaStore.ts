import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Member, Transaction, Loan, ChamaSettings } from '../types/chama';
import { calculateMemberDue } from '../lib/calculations';
import { SEED_DATA } from '../lib/seed';

interface ChamaState {
  members: Member[];
  transactions: Transaction[];
  loans: Loan[];
  settings: ChamaSettings;
  isDemoData: boolean;
  lastBackup: string | null;
  lastUpdated: string;
  editingMemberId: string | null;
  setEditingMemberId: (id: string | null) => void;
  addMember: (member: Member) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  addTransaction: (transaction: Transaction) => void;
  addLoan: (loan: Loan) => void;
  updateLoan: (id: string, loan: Partial<Loan>) => void;
  updateSettings: (settings: Partial<ChamaSettings>) => void;
  allocateMpesaPayment: (data: { 
    memberId: string; 
    amount: number; 
    reference: string; 
    date: string;
    mpesaCharges?: number;
  }) => void;
  resetData: () => void;
  seedData: () => void;
  importData: (data: any) => void;
  exportData: () => string;
}

const DEFAULT_SETTINGS: ChamaSettings = {
  shareValue: 2000,
  registrationFee: 1000,
  interestRate: 0.1,
  paymentDeadlineDay: 10,
  minMonthsForInterest: 5,
  payoutMonth: 11,
};

export const useChamaStore = create<ChamaState>()(
  persist(
    (set, get) => ({
      members: [],
      transactions: [],
      loans: [],
      settings: DEFAULT_SETTINGS,
      isDemoData: false,
      lastBackup: null,
      lastUpdated: new Date().toISOString(),
      editingMemberId: null,

      setEditingMemberId: (id) => set({ editingMemberId: id }),
      
      addMember: (member) => set((state) => ({ 
        members: [...state.members, member],
        isDemoData: false,
        lastUpdated: new Date().toISOString()
      })),
      
      updateMember: (id, memberData) => set((state) => ({
        isDemoData: false,
        lastUpdated: new Date().toISOString(),
        members: state.members.map((m) => {
          if (m.id === id) {
            const updated = { ...m, ...memberData };
            // Ensure deep merge for monthly contributions if provided
            if (memberData.monthlyContributions) {
              updated.monthlyContributions = {
                ...(m.monthlyContributions || {}),
                ...memberData.monthlyContributions
              };
            }
            return updated;
          }
          return m;
        })
      })),
      
      addTransaction: (transaction) => set((state) => {
        const newState = {
          ...state,
          transactions: [...state.transactions, transaction],
          isDemoData: false,
          lastUpdated: new Date().toISOString()
        };

        // Side effect: If transaction is a repayment, update the loan balance
        if ((transaction.type === 'REPAYMENT' || transaction.type === 'LOAN_REPAYMENT') && transaction.loanId) {
          newState.loans = state.loans.map(l => {
            if (l.id === transaction.loanId) {
              const newBalance = Math.max(0, l.balance - transaction.amount);
              return {
                ...l,
                balance: newBalance,
                status: newBalance <= 0 ? 'CLOSED' : 'OPEN',
                updatedAt: new Date().toISOString()
              };
            }
            return l;
          });
        }

        return newState;
      }),
      
      addLoan: (loan) => set((state) => ({ 
        loans: [...state.loans, loan],
        isDemoData: false,
        lastUpdated: new Date().toISOString()
      })),
      
      updateLoan: (id, loanData) => set((state) => ({
        isDemoData: false,
        lastUpdated: new Date().toISOString(),
        loans: state.loans.map((l) => (l.id === id ? { ...l, ...loanData } : l))
      })),
      
      updateSettings: (settings) => set((state) => ({ 
        settings: { ...state.settings, ...settings },
        lastUpdated: new Date().toISOString()
      })),
      
      allocateMpesaPayment: ({ memberId, amount, reference, date, mpesaCharges = 0 }) => {
        const { members, transactions, loans, settings } = get();
        const member = members.find(m => m.id === memberId);
        if (!member) return;

        const dues = calculateMemberDue(member, transactions, loans, settings, new Date(date));
        let remaining = amount;
        const newTransactions: Transaction[] = [];
        const dateObj = new Date(date);
        const month = dateObj.getMonth();
        const year = dateObj.getFullYear();

        // 1. Registration Fee
        if (!member.isRegistered && (dues.regFeeDue || 0) > 0 && remaining > 0) {
          const pay = Math.min(remaining, dues.regFeeDue || 0);
          newTransactions.push({
            id: crypto.randomUUID(),
            memberId,
            amount: pay,
            type: 'REG_FEE',
            date,
            month,
            year,
            reference,
            description: `M-Pesa Auto-Allocation: Registration Fee`
          });
          remaining -= pay;
          if (remaining >= 0 && pay >= (dues.regFeeDue || 0)) {
            set(state => ({
              members: state.members.map(m => m.id === memberId ? { ...m, isRegistered: true } : m)
            }));
          }
        }

        // 2. Interest
        if ((dues.interestDue || 0) > 0 && remaining > 0) {
          const pay = Math.min(remaining, dues.interestDue || 0);
          newTransactions.push({
            id: crypto.randomUUID(),
            memberId,
            amount: pay,
            type: 'INTEREST',
            date,
            month,
            year,
            reference,
            description: `M-Pesa Auto-Allocation: Interest`
          });
          remaining -= pay;
        }

        // 3. Contributions
        if ((dues.contributionsDue || 0) > 0 && remaining > 0) {
          const pay = Math.min(remaining, dues.contributionsDue || 0);
          newTransactions.push({
            id: crypto.randomUUID(),
            memberId,
            amount: pay,
            type: 'CONTRIBUTION',
            date,
            month,
            year,
            reference,
            description: `M-Pesa Auto-Allocation: Contribution`
          });
          remaining -= pay;
        }

        // 4. Loans
        const openLoans = loans.filter(l => l.memberId === memberId && (l.status === 'OPEN' || l.status === 'Open'));
        let updatedLoans = [...loans];
        for (const loan of openLoans) {
          if (remaining <= 0) break;
          const pay = Math.min(remaining, loan.balance);
          newTransactions.push({
            id: crypto.randomUUID(),
            memberId,
            amount: pay,
            type: 'REPAYMENT',
            date,
            month,
            year,
            loanId: loan.id,
            reference,
            description: `M-Pesa Auto-Allocation: Loan Repayment`
          });
          
          const newBalance = loan.balance - pay;
          updatedLoans = updatedLoans.map(l => l.id === loan.id ? { 
            ...l, 
            balance: newBalance, 
            status: newBalance <= 0 ? 'CLOSED' : 'OPEN',
            updatedAt: new Date().toISOString()
          } : l);
          
          remaining -= pay;
        }

        // 5. Excess
        if (remaining > 0) {
          newTransactions.push({
            id: crypto.randomUUID(),
            memberId,
            amount: remaining,
            type: 'CONTRIBUTION',
            date,
            month,
            year,
            reference,
            description: `M-Pesa Auto-Allocation: Excess Funds`
          });
        }

        set(state => ({
          isDemoData: false,
          lastUpdated: new Date().toISOString(),
          transactions: [...state.transactions, ...newTransactions],
          loans: updatedLoans
        }));
      },

      seedData: () => set({
        members: [...SEED_DATA.members],
        transactions: [...SEED_DATA.transactions],
        loans: [...SEED_DATA.loans],
        settings: { ...DEFAULT_SETTINGS },
        isDemoData: true,
        lastUpdated: new Date().toISOString()
      }),

      importData: (dataInput) => {
        let data = dataInput;
        if (typeof dataInput === 'string') {
          try {
            data = JSON.parse(dataInput);
          } catch (e) {
            console.error('Failed to parse import data', e);
            return;
          }
        }
        set({
          members: data.members || [],
          transactions: data.transactions || [],
          loans: data.loans || [],
          settings: data.settings || DEFAULT_SETTINGS,
          isDemoData: false,
          lastBackup: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      },

      exportData: () => {
        const state = get();
        const data = {
          members: state.members,
          transactions: state.transactions,
          loans: state.loans,
          settings: state.settings,
          exportedAt: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
      },

      resetData: () => {
        localStorage.removeItem('chama-pro-storage-v2');
        set({ 
          members: [], 
          transactions: [], 
          loans: [], 
          settings: DEFAULT_SETTINGS,
          isDemoData: false,
          lastBackup: null,
          lastUpdated: new Date().toISOString()
        });
      },
    }),
    { name: 'chama-pro-storage-v2' }
  )
);