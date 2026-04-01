import React, { useState, useEffect } from 'react';
import { Member, Transaction, Loan, ChamaSettings, TransactionCategory } from '../types';
import { Save, Plus, Trash2, Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
  members: Member[];
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  loans: Loan[];
  setLoans: React.Dispatch<React.SetStateAction<Loan[]>>;
  settings: ChamaSettings;
}

export default function TransactionSheet({ members, transactions, setTransactions, loans, setLoans, settings }: Props) {
  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    category: 'Contribution' as TransactionCategory,
    date: new Date().toISOString().split('T')[0],
    reference: '',
    loanId: ''
  });

  const [bulkEntries, setBulkEntries] = useState<any[]>([]);
  const [isDecember, setIsDecember] = useState(false);

  useEffect(() => {
    const selectedMonth = new Date(formData.date).getMonth() + 1;
    setIsDecember(selectedMonth === settings.payoutMonth);
  }, [formData.date, settings.payoutMonth]);

  const handleAddEntry = () => {
    if (!formData.memberId || !formData.amount) {
      toast.error('Please select a member and enter an amount');
      return;
    }

    if (isDecember && formData.category === 'Contribution') {
      toast.warning('December is a Payout month. No contributions allowed, only clearing dues.');
      return;
    }

    const member = members.find(m => m.id === formData.memberId);
    if (!member) return;

    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      memberId: formData.memberId,
      memberName: member.name,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      reference: formData.reference,
      loanId: formData.loanId
    };

    setBulkEntries([newEntry, ...bulkEntries]);
    setFormData({
      ...formData,
      amount: '',
      reference: '',
      loanId: ''
    });
  };

  const handleSaveAll = () => {
    if (bulkEntries.length === 0) return;

    const newTransactions: Transaction[] = bulkEntries.map(entry => {
      const date = new Date(entry.date);
      return {
        id: entry.id,
        memberId: entry.memberId,
        amount: entry.amount,
        category: entry.category,
        date: entry.date,
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        reference: entry.reference
      };
    });

    setTransactions(prev => [...newTransactions, ...prev]);

    // Allocation Logic for Loan Repayment
    setLoans(currentLoans => {
      const updatedLoans = [...currentLoans];
      newTransactions.forEach(t => {
        if (t.category === 'Loan Repayment') {
          // Find the oldest open loan for this member
          const loanIndex = updatedLoans.findIndex(l => l.memberId === t.memberId && l.status === 'Open');
          if (loanIndex !== -1) {
            const loan = { ...updatedLoans[loanIndex] };
            loan.remainingBalance -= t.amount;
            if (loan.remainingBalance <= 0) {
              loan.status = 'Paid';
              loan.remainingBalance = 0;
            }
            updatedLoans[loanIndex] = loan;
          }
        }
      });
      return updatedLoans;
    });

    setBulkEntries([]);
    toast.success(`${newTransactions.length} transactions recorded!`);
  };

  const removeEntry = (id: string) => {
    setBulkEntries(bulkEntries.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">One-Sheet Data Entry</h1>
          <p className="text-slate-500 font-medium">Batch process all monthly transactions effortlessly.</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center gap-3 text-amber-800 text-sm font-bold shadow-sm">
          <Calendar size={18} />
          <span>Deadline: 10th Midnight</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-fit">
          <h3 className="font-black text-slate-900 mb-8 flex items-center gap-2 uppercase text-xs tracking-widest">
            <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center">
              <Plus size={14} />
            </div>
            Quick Entry Form
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Member Name</label>
              <select 
                value={formData.memberId}
                onChange={e => setFormData({...formData, memberId: e.target.value})}
                className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold"
              >
                <option value="">-- Choose --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.memberNumber})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Transaction Type</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as TransactionCategory})}
                className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold"
              >
                <option value="Contribution">Monthly Contribution</option>
                <option value="Loan Repayment">Loan Repayment</option>
                <option value="Reg Fee">Registration Fee (1,000)</option>
                <option value="Penalty">Interest / Fine</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Amount (KSH)</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-indigo-600">KSH</span>
                <input 
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full pl-14 pr-4 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:border-indigo-500 focus:bg-white transition-all outline-none font-black text-xl"
                  placeholder="0.00"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Include M-Pesa withdrawal charges in amount.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Date</label>
                <input 
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-slate-100 rounded-xl bg-slate-50 font-bold text-xs"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">M-Pesa Code</label>
                <input 
                  type="text"
                  value={formData.reference}
                  onChange={e => setFormData({...formData, reference: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-slate-100 rounded-xl bg-slate-50 font-bold text-xs"
                  placeholder="S6A7B8..."
                />
              </div>
            </div>

            {isDecember && formData.category === 'Contribution' && (
              <div className="bg-rose-50 p-4 rounded-2xl flex gap-3 border border-rose-100 items-start">
                <AlertTriangle className="text-rose-600 shrink-0" size={18} />
                <p className="text-[10px] font-bold text-rose-800 leading-relaxed">
                  DECEMBER PAYOUT MONTH: Contributions are not accepted. Use this period to clear pending loans and interest only.
                </p>
              </div>
            )}

            <button 
              onClick={handleAddEntry}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add to Queue
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Batch Queue</h3>
                  <p className="text-xs font-bold text-slate-400">{bulkEntries.length} items ready to post</p>
                </div>
              </div>
              <button 
                onClick={handleSaveAll}
                disabled={bulkEntries.length === 0}
                className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black transition-all ${
                  bulkEntries.length > 0 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-200 active:scale-95' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                <Save size={18} />
                Post & Sync Ledger
              </button>
            </div>
            
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <TableRow>
                    <TableHead className="px-8 py-4">Member Account</TableHead>
                    <TableHead className="px-8 py-4">Transaction Details</TableHead>
                    <TableHead className="px-8 py-4 text-right">Value (KSH)</TableHead>
                    <TableHead className="px-8 py-4 text-center">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-50">
                  {bulkEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="px-8 py-32 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-slate-200">
                            <Plus className="text-slate-200" size={32} />
                          </div>
                          <p className="font-black text-slate-300 uppercase tracking-widest">No pending transactions</p>
                          <p className="text-xs text-slate-400 font-medium mt-2">Entries added to the form will appear here for verification</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    bulkEntries.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm">
                              {entry.memberName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 leading-none mb-1">{entry.memberName}</p>
                              <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">MEMBER NO: 00{entry.id.slice(0,2)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <div className="flex flex-col gap-1.5">
                            <span className={`w-fit px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${
                              entry.category === 'Contribution' ? 'bg-emerald-100 text-emerald-700' :
                              entry.category === 'Loan Repayment' ? 'bg-indigo-100 text-indigo-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {entry.category}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{entry.date}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-right">
                          <p className="font-black text-slate-900 text-lg">KSH {entry.amount.toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-slate-400 font-mono">{entry.reference || 'MPESA-REF-PENDING'}</p>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-center">
                          <button 
                            onClick={() => removeEntry(entry.id)}
                            className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
                          >
                            <Trash2 size={16} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}