import React, { useState } from 'react';
import { useChamaStore } from '../../store/useChamaStore';
import { formatCurrency, cn } from '../../lib/utils';
import { 
  Send, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

export default function LoanRequestForm({ memberId }: { memberId: string }) {
  const { members, settings, addLoan } = useChamaStore();
  const member = members.find(m => m.id === memberId);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [term, setTerm] = useState('1'); // months
  const [submitted, setSubmitted] = useState(false);

  if (!member) return null;

  const maxEligible = (member.shares * settings.shareValue) * 3;
  const requestedAmount = parseFloat(amount) || 0;
  const interest = requestedAmount * settings.interestRate;
  const totalRepayable = requestedAmount + interest;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (requestedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (requestedAmount > maxEligible) {
      toast.error(`Amount exceeds your maximum eligibility of ${formatCurrency(maxEligible)}`);
      return;
    }

    // In a real app, this would be a "Loan Request" table.
    // Here we'll simulate an immediate approval as per UI flow or just log it.
    
    const newLoan = {
      id: crypto.randomUUID(),
      memberId,
      principal: requestedAmount,
      balance: totalRepayable,
      interestRate: settings.interestRate,
      status: 'OPEN' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'Quick Loan',
      date: new Date().toISOString()
    };

    addLoan(newLoan);
    setSubmitted(true);
    toast.success('Loan request submitted and approved!');
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-50">
           <CheckCircle2 size={48} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">SUCCESS!</h2>
        <p className="text-slate-500 font-bold mb-10 max-w-md mx-auto">
          Your loan request for <span className="text-emerald-600">{formatCurrency(requestedAmount)}</span> has been processed. 
          The funds will be disbursed to your registered M-Pesa number shortly.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          Return to Portal
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Briefcase size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">APPLY FOR LOAN</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instant disbursement to your phone</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Requested Amount (KES)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-slate-900 font-black focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Repayment Period</label>
                <select 
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-slate-900 font-black focus:border-indigo-500 focus:bg-white outline-none transition-all"
                >
                  <option value="1">1 Month</option>
                  <option value="2">2 Months</option>
                  <option value="3">3 Months</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Loan Purpose</label>
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly explain what the funds will be used for..."
                rows={3}
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-slate-900 font-black focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 resize-none"
              />
            </div>

            <div className="p-8 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-start gap-4">
               <div className="p-2 bg-indigo-600 text-white rounded-lg mt-1">
                 <Info size={16} />
               </div>
               <div className="space-y-2">
                 <p className="text-xs font-black text-indigo-900 uppercase tracking-wide">Repayment Estimate</p>
                 <p className="text-sm font-bold text-indigo-700 leading-relaxed">
                   Based on your selection, you will repay <span className="font-black">{formatCurrency(totalRepayable)}</span>. 
                   Interest of {settings.interestRate * 100}% (<span className="font-black">{formatCurrency(interest)}</span>) applies.
                 </p>
               </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Send size={18} />
              Submit Application
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Eligibility Status</h3>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Max Amount</p>
              <p className="text-3xl font-black tracking-tighter">{formatCurrency(maxEligible)}</p>
            </div>
            
            <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-black uppercase">
                 <span className="text-slate-500">Utilization</span>
                 <span className="text-white">{Math.min(100, Math.round((requestedAmount / maxEligible) * 100))}%</span>
               </div>
               <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-emerald-500 transition-all duration-500" 
                   style={{ width: `${Math.min(100, (requestedAmount / maxEligible) * 100)}%` }}
                 />
               </div>
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-xs font-bold text-slate-300">Active membership</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-xs font-bold text-slate-300">Share capital threshold met</span>
              </div>
              <div className="flex items-center gap-3">
                {requestedAmount > maxEligible ? (
                   <AlertCircle size={16} className="text-rose-500" />
                ) : (
                   <CheckCircle2 size={16} className="text-emerald-500" />
                )}
                <span className={cn("text-xs font-bold", requestedAmount > maxEligible ? "text-rose-400" : "text-slate-300")}>
                  Requested within limit
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
             <HelpCircle size={14} /> Frequently Asked
           </h3>
           <div className="space-y-4">
             <div className="space-y-1">
               <p className="text-[10px] font-black text-slate-900 uppercase">When do I get the money?</p>
               <p className="text-xs font-bold text-slate-500">Funds are typically sent within 5-10 minutes of approval.</p>
             </div>
             <div className="space-y-1">
               <p className="text-[10px] font-black text-slate-900 uppercase">Can I pay early?</p>
               <p className="text-xs font-bold text-slate-500">Yes! Early repayments reduce your interest burden for future loans.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}