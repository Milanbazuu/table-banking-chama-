import React, { useState } from 'react';
import { useChamaStore } from '../../store/useChamaStore';
import { TransactionType } from '../../types/chama';
import { X, CheckCircle2, AlertCircle, Smartphone, Calculator, History } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, cn } from '../../lib/utils';
import { parseMpesaSMS, calculateMpesaCharge } from '../../lib/mpesa';

export default function TransactionForm({ onClose }: { onClose: () => void }) {
  const { members, settings, addTransaction, addLoan, loans, updateLoan, allocateMpesaPayment } = useChamaStore();
  const [memberId, setMemberId] = useState('');
  const [type, setType] = useState<TransactionType | 'MPESA_AUTO'>('CONTRIBUTION');
  const [amount, setAmount] = useState('');
  const [mpesaCharges, setMpesaCharges] = useState('');
  const [reference, setReference] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [mpesaSMS, setMpesaSMS] = useState('');

  const selectedMember = members.find(m => m.id === memberId);
  const openLoans = loans.filter(l => l.memberId === memberId && l.status === 'OPEN');

  const handleMpesaParse = () => {
    const data = parseMpesaSMS(mpesaSMS);
    if (data) {
      setAmount(data.amount.toString());
      setReference(data.receipt);
      setMpesaCharges(calculateMpesaCharge(data.amount).toString());
      
      // Try to match member by phone
      const matchedMember = members.find(m => m.phoneNumber.replace(/[^0-9]/g, '').endsWith(data.phone.slice(-9)));
      if (matchedMember) {
        setMemberId(matchedMember.id);
        toast.success(`Matched member: ${matchedMember.name}`);
      }
    } else {
      toast.error('Could not parse M-Pesa SMS');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amount) { toast.error('Missing fields'); return; }
    const numAmount = parseFloat(amount);
    const numCharges = parseFloat(mpesaCharges || '0');
    const now = new Date();

    if (type === 'MPESA_AUTO') {
      allocateMpesaPayment({
        memberId,
        amount: numAmount,
        reference,
        date: now.toISOString(),
        mpesaCharges: numCharges
      });
      toast.success('Payment allocated automatically across dues');
    } else if (type === 'LOAN_DISBURSEMENT') {
      const loanId = crypto.randomUUID();
      addLoan({ id: loanId, memberId, principal: numAmount, interestRate: settings.interestRate, balance: numAmount, status: 'OPEN', createdAt: now.toISOString(), updatedAt: now.toISOString() });
      addTransaction({ id: crypto.randomUUID(), memberId, type: 'LOAN_DISBURSEMENT', amount: numAmount, mpesaCharges: numCharges, date: now.toISOString(), month: now.getMonth(), year: now.getFullYear(), loanId, reference });
      toast.success('Loan disbursed');
    } else if (type === 'REPAYMENT') {
      if (!selectedLoanId) { toast.error('Select loan'); return; }
      const loan = loans.find(l => l.id === selectedLoanId);
      if (loan) {
        const newBalance = Math.max(0, loan.balance - numAmount);
        updateLoan(loan.id, { balance: newBalance, status: newBalance <= 0 ? 'CLOSED' : 'OPEN', updatedAt: now.toISOString() });
      }
      addTransaction({ id: crypto.randomUUID(), memberId, type: 'REPAYMENT', amount: numAmount, mpesaCharges: numCharges, date: now.toISOString(), month: now.getMonth(), year: now.getFullYear(), loanId: selectedLoanId, reference });
      toast.success('Repayment recorded');
    } else {
      addTransaction({ id: crypto.randomUUID(), memberId, type, amount: numAmount, mpesaCharges: numCharges, date: now.toISOString(), month: now.getMonth(), year: now.getFullYear(), reference });
      toast.success('Transaction recorded');
    }
    
    onClose();
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh] bg-slate-50/50">
      <div className="p-8 border-b-2 border-slate-100 flex items-center justify-between bg-white">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Transaction</h2>
          <p className="text-sm text-slate-500 font-medium">Record payments, loans, or auto-allocate M-Pesa</p>
        </div>
        <button onClick={onClose} className="p-4 hover:bg-slate-100 rounded-[2rem] transition-all text-slate-400">
          <X className="w-6 h-6" strokeWidth={2.5} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="space-y-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-black text-slate-900">M-Pesa Integration</h3>
          </div>
          <div className="space-y-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Paste M-Pesa SMS to auto-fill</p>
            <div className="flex gap-3">
              <textarea 
                value={mpesaSMS}
                onChange={(e) => setMpesaSMS(e.target.value)}
                className="flex-1 min-h-[100px] p-4 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                placeholder="SJK1234567 Confirmed. Ksh2,500.00 received from..."
              />
              <button 
                type="button"
                onClick={handleMpesaParse}
                className="px-6 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all"
              >
                Parse
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as any)} 
              className="w-full h-14 px-6 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900 transition-all"
              required
            >
              <option value="MPESA_AUTO">✨ Auto-Allocate Payment</option>
              <option value="CONTRIBUTION">Monthly Contribution</option>
              <option value="REPAYMENT">Loan Repayment</option>
              <option value="LOAN_DISBURSEMENT">Disburse Loan</option>
              <option value="REG_FEE">Registration Fee</option>
              <option value="PENALTY">Penalty / Fine</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Member</label>
            <select 
              value={memberId} 
              onChange={(e) => setMemberId(e.target.value)} 
              className="w-full h-14 px-6 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900 transition-all"
              required
            >
              <option value="">Select Member</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.memberNumber} - {m.name}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (KES)</label>
            <div className="relative">
               <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">KSH</span>
               <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="w-full h-14 pl-16 pr-6 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                required 
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">M-Pesa Charges</label>
            <input 
              type="number" 
              value={mpesaCharges} 
              onChange={(e) => setMpesaCharges(e.target.value)} 
              className="w-full h-14 px-6 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
            />
          </div>

          <div className="space-y-3 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">M-Pesa Reference / Receipt</label>
            <input 
              type="text" 
              value={reference} 
              onChange={(e) => setReference(e.target.value)} 
              className="w-full h-14 px-6 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
              placeholder="e.g. SJK1234567"
            />
          </div>

          {type === 'REPAYMENT' && (
            <div className="space-y-3 md:col-span-2 animate-in slide-in-from-left-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Active Loan</label>
              <select 
                value={selectedLoanId} 
                onChange={(e) => setSelectedLoanId(e.target.value)} 
                className="w-full h-14 px-6 bg-orange-50 border-2 border-orange-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-900"
                required
              >
                <option value="">Choose Loan to Repay</option>
                {openLoans.map(l => (
                  <option key={l.id} value={l.id}>
                    Loan ID: {l.id.slice(0,8)} - Bal: {formatCurrency(l.balance)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedMember && (
          <div className="p-6 bg-indigo-600 rounded-[2.5rem] flex items-start gap-4 text-white shadow-xl shadow-indigo-200">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-lg tracking-tight">Summary for {selectedMember.name}</p>
              <p className="text-indigo-100 font-medium opacity-90">Member Number: {selectedMember.memberNumber}</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-3 rounded-xl">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Monthly Target</p>
                  <p className="font-bold">{formatCurrency(selectedMember.shares * settings.shareValue)}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-xl">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Current Status</p>
                  <p className="font-bold">{selectedMember.status}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      <div className="p-8 border-t-2 border-slate-100 bg-white flex gap-4">
        <button 
          type="button" 
          onClick={onClose} 
          className="flex-1 h-14 rounded-2xl border-2 border-slate-100 font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
        <button 
          onClick={handleSubmit} 
          className="flex-1 h-14 rounded-2xl bg-indigo-600 font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          Process Transaction
        </button>
      </div>
    </div>
  );
}