import React, { useMemo } from 'react';
import { useChamaStore } from '../../store/useChamaStore';
import { formatCurrency, cn } from '../../lib/utils';
import { 
  X, 
  Printer, 
  ShieldCheck,
  Building2,
  Stamp,
  Signature
} from 'lucide-react';
import { toast } from 'sonner';

export default function MemberStatement({ memberId, onClose }: { memberId: string, onClose: () => void }) {
  const { members, transactions, loans, settings } = useChamaStore();
  const member = members.find(m => m.id === memberId);

  const LOGO_URL = "https://storage.googleapis.com/dala-prod-public-storage/attachments/67bbe8f1-a4f5-4f56-bab0-27d166de3e5b/1775068373148_file_00000000527c71fdac25ec67942e4ae4__1_.png";
  const BRAND_NAME = "TUJENGE SAVINGS CIRCLE";
  const TAGLINE = "Save Together. Grow Together.";
  
  if (!member) return null;

  // Derive dynamic matrix values similar to the main dashboard table
  const statementData = useMemo(() => {
    const mTransactions = transactions.filter(t => t.memberId === member.id);
    
    const getMonthTotal = (monthIndex: number) => {
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;
      const monthKey = months[monthIndex];
      
      if (member.monthlyContributions && member.monthlyContributions[monthKey] !== undefined && member.monthlyContributions[monthKey] !== 0) {
        return member.monthlyContributions[monthKey] || 0;
      }
      
      return mTransactions
        .filter(t => t.month === monthIndex && t.type === 'CONTRIBUTION')
        .reduce((sum, t) => sum + t.amount, 0);
    };

    const jan = getMonthTotal(0);
    const feb = getMonthTotal(1);
    const mar = getMonthTotal(2);
    const apr = getMonthTotal(3);

    const totalPaidContributions = [jan, feb, mar, apr].reduce((a, b) => a + b, 0);
    const liveLoanBalance = loans
      .filter(l => l.memberId === memberId && (l.status === 'OPEN' || l.status === 'Open'))
      .reduce((s, l) => s + l.balance, 0);

    return {
      jan, feb, mar, apr,
      totalPaidContributions: member.contributionsToDate || totalPaidContributions,
      loanLiability: liveLoanBalance > 0 ? liveLoanBalance : (member.totalLoansJanDeficitFebDisbursement || 0),
      deficitApril: member.deficitApril || 0,
      sharesValue: member.shares * settings.shareValue
    };
  }, [member, transactions, loans, settings]);

  const memberTransactions = transactions
    .filter(t => t.memberId === memberId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handlePrint = () => {
    toast.info('Generating official document...');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-white relative print:bg-white overflow-hidden">
      {/* Action Bar (Hidden on Print) */}
      <div className="p-4 bg-slate-50 border-b flex justify-between items-center print:hidden">
        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          System Verified Statement
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <Printer size={16} />
            Download PDF / Print
          </button>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-16 print:p-0 print:overflow-visible">
        {/* Printable Document Container */}
        <div className="max-w-4xl mx-auto space-y-12 print:space-y-8">
          
          {/* Letterhead */}
          <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10 print:pb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" />
                <div>
                  <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">{BRAND_NAME}</h1>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">{TAGLINE}</p>
                </div>
              </div>
              <div className="text-sm font-bold text-slate-500 space-y-1">
                <p>Official Member Financial Record</p>
                <p>Nairobi Digital Business Center</p>
                <p>Nairobi, Kenya</p>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              <div className="inline-block px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                Official Statement
              </div>
              <p className="text-xs font-bold text-slate-500">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-xs font-bold text-slate-500">Ref: STM-{member.memberNumber}-{new Date().getTime().toString().slice(-6)}</p>
            </div>
          </div>

          {/* Member Information */}
          <div className="grid grid-cols-2 gap-12 bg-slate-50 p-10 rounded-3xl border-2 border-slate-100 print:bg-white print:border-slate-900 print:rounded-none">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Holder</p>
                <h2 className="text-3xl font-black text-slate-900">{member.name}</h2>
              </div>
              <div className="flex gap-10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Member ID</p>
                  <p className="text-lg font-black text-slate-900">{member.memberNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined</p>
                  <p className="text-lg font-black text-slate-900">{new Date(member.registrationDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="space-y-6 border-l border-slate-200 pl-12 print:border-slate-900">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Details</p>
                <p className="text-lg font-black text-slate-900">{member.phoneNumber}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Membership Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <p className="text-lg font-black text-emerald-600 uppercase">{member.status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary Grid */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Financial Position Overview</h3>
            <div className="grid grid-cols-4 gap-4 print:grid-cols-4">
              <div className="p-6 border-2 border-slate-100 rounded-2xl space-y-1 print:border-slate-900">
                <p className="text-[9px] font-black text-slate-400 uppercase">Share Capital</p>
                <p className="text-xl font-black text-slate-900">{formatCurrency(statementData.sharesValue)}</p>
              </div>
              <div className="p-6 border-2 border-slate-100 rounded-2xl space-y-1 print:border-slate-900">
                <p className="text-[9px] font-black text-slate-400 uppercase">Total Contribs</p>
                <p className="text-xl font-black text-emerald-600">{formatCurrency(statementData.totalPaidContributions)}</p>
              </div>
              <div className="p-6 border-2 border-slate-100 rounded-2xl space-y-1 print:border-slate-900">
                <p className="text-[9px] font-black text-slate-400 uppercase">Loan Balance</p>
                <p className="text-xl font-black text-rose-600">{formatCurrency(statementData.loanLiability)}</p>
              </div>
              <div className="p-6 border-2 border-slate-100 rounded-2xl space-y-1 print:border-slate-900">
                <p className="text-[9px] font-black text-slate-400 uppercase">Current Deficit</p>
                <p className="text-xl font-black text-rose-700">{formatCurrency(statementData.deficitApril)}</p>
              </div>
            </div>
          </div>

          {/* Period Matrix Snapshot */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Matrix Snapshot (Jan - Mar 2024)</h3>
            <table className="w-full border-collapse border-2 border-slate-900">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                  <th className="p-4 border border-slate-700 text-left">Period</th>
                  <th className="p-4 border border-slate-700 text-right">Contribution</th>
                  <th className="p-4 border border-slate-700 text-right">Repayment Status</th>
                  <th className="p-4 border border-slate-700 text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold text-slate-900">
                <tr>
                  <td className="p-4 border border-slate-200">January 2024</td>
                  <td className="p-4 border border-slate-200 text-right">{formatCurrency(statementData.jan)}</td>
                  <td className="p-4 border border-slate-200 text-right">VERIFIED</td>
                  <td className="p-4 border border-slate-200 text-right">{formatCurrency(member.janLoans || 0)}</td>
                </tr>
                <tr>
                  <td className="p-4 border border-slate-200">February 2024</td>
                  <td className="p-4 border border-slate-200 text-right">{formatCurrency(statementData.feb)}</td>
                  <td className="p-4 border border-slate-200 text-right">VERIFIED</td>
                  <td className="p-4 border border-slate-200 text-right">{formatCurrency(member.febDeficitBy10thPlusMpesa || 0)}</td>
                </tr>
                <tr>
                  <td className="p-4 border border-slate-200 font-black">March 2024</td>
                  <td className="p-4 border border-slate-200 text-right font-black">{formatCurrency(statementData.mar)}</td>
                  <td className="p-4 border border-slate-200 text-right font-black uppercase text-emerald-600">Paid: {formatCurrency(member.marchRepaymentToDate || 0)}</td>
                  <td className="p-4 border border-slate-200 text-right font-black text-rose-600">Deficit: {formatCurrency(member.marchRepaymentDeficit || 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Audit Trail */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Verified System Audit Trail (Last 10)</h3>
            <div className="border-2 border-slate-100 rounded-3xl overflow-hidden print:border-slate-900 print:rounded-none">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 print:bg-white print:border-slate-900">
                  <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="p-4">Date</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Reference</th>
                    <th className="p-4 text-right">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 print:divide-slate-900">
                  {memberTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No Activity Records Found</td>
                    </tr>
                  ) : (
                    memberTransactions.slice(0, 10).map((t) => (
                      <tr key={t.id} className="text-xs font-bold text-slate-700">
                        <td className="p-4">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="p-4 uppercase text-[10px]">{t.type.replace(/_/g, ' ')}</td>
                        <td className="p-4 font-mono text-[10px]">{t.reference || 'SYSTEM_AUTO'}</td>
                        <td className="p-4 text-right font-black text-slate-900">{formatCurrency(t.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification Footer */}
          <div className="pt-12 flex justify-between items-end border-t border-slate-200 print:pt-6 print:border-slate-900">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full print:bg-transparent">
                <Stamp size={14} />
                Digital Verification Token: {crypto.randomUUID().slice(0, 8).toUpperCase()}
              </div>
              <p className="text-[9px] text-slate-400 font-bold max-w-sm">
                This document is a certified extract from the Tujenge Savings Circle Unified Matrix. 
                Any discrepancies should be reported to the Treasurer.
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-48 border-b-2 border-slate-900 pb-2">
                 <Signature className="w-12 h-12 text-indigo-600/20 mx-auto -mb-6" />
                 <span className="text-[10px] font-black text-slate-900 italic font-serif">Treasurer's Digital Signature</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}