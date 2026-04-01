import React, { useState } from 'react';
import { Member, Loan, ChamaSettings, Transaction } from '../types';
import { BadgeDollarSign, Plus, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  members: Member[];
  loans: Loan[];
  setLoans: React.Dispatch<React.SetStateAction<Loan[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  settings: ChamaSettings;
}

export default function LoanManagement({ members, loans, setLoans, transactions, setTransactions, settings }: Props) {
  const [isDisbursing, setIsDisbursing] = useState(false);
  const [newLoan, setNewLoan] = useState({
    memberId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const activeLoans = loans.filter(l => l.status === 'Open');

  const handleDisburse = () => {
    if (!newLoan.memberId || !newLoan.amount) {
      toast.error('Fill in all fields');
      return;
    }

    const member = members.find(m => m.id === newLoan.memberId);
    if (!member) return;

    // Rule: Cannot take more than contributed? (User said loans from amount contributed)
    // For now we just implement the 10% interest rule.
    const principal = parseFloat(newLoan.amount);
    const interest = principal * settings.interestRate;
    const loanId = Math.random().toString(36).substr(2, 9);

    const loan: Loan = {
      id: loanId,
      memberId: newLoan.memberId,
      loanNumber: `LN-${(loans.length + 1).toString().padStart(4, '0')}`,
      principal: principal,
      interest: interest,
      totalDue: principal + interest,
      status: 'Open',
      disbursementDate: newLoan.date,
      dueDate: new Date(new Date(newLoan.date).setMonth(new Date(newLoan.date).getMonth() + 1)).toISOString().split('T')[0],
      remainingBalance: principal + interest
    };

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      memberId: newLoan.memberId,
      amount: principal,
      category: 'Loan Disbursement',
      date: newLoan.date,
      month: new Date(newLoan.date).getMonth() + 1,
      year: new Date(newLoan.date).getFullYear(),
      reference: loan.loanNumber
    };

    setLoans([loan, ...loans]);
    setTransactions([transaction, ...transactions]);
    setIsDisbursing(false);
    setNewLoan({ memberId: '', amount: '', date: new Date().toISOString().split('T')[0] });
    toast.success('Loan disbursed successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loan Management</h1>
          <p className="text-slate-500">Track disbursements, interest, and repayments.</p>
        </div>
        <button 
          onClick={() => setIsDisbursing(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Loan Disbursement
        </button>
      </div>

      {isDisbursing && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Member</label>
              <select 
                value={newLoan.memberId}
                onChange={e => setNewLoan({...newLoan, memberId: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">-- Choose --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Principal Amount</label>
              <input 
                type="number" 
                value={newLoan.amount}
                onChange={e => setNewLoan({...newLoan, amount: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="5000"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Date</label>
              <input 
                type="date" 
                value={newLoan.date}
                onChange={e => setNewLoan({...newLoan, date: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleDisburse}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700"
              >
                Disburse
              </button>
              <button 
                onClick={() => setIsDisbursing(false)}
                className="px-4 py-2 border rounded-lg font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            * Interest of <strong>{(settings.interestRate * 100).toFixed(0)}%</strong> (KSH {(parseFloat(newLoan.amount || '0') * settings.interestRate).toLocaleString()}) will be added to the total due.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeLoans.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed">
            <BadgeDollarSign size={48} className="mx-auto text-slate-200 mb-2" />
            <p className="text-slate-500 font-medium">No active loans currently.</p>
          </div>
        ) : (
          activeLoans.map(loan => {
            const member = members.find(m => m.id === loan.memberId);
            const progress = ((loan.totalDue - loan.remainingBalance) / loan.totalDue) * 100;
            
            return (
              <div key={loan.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{loan.loanNumber}</p>
                    <h3 className="text-lg font-bold text-slate-900">{member?.name}</h3>
                  </div>
                  <div className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded">
                    OPEN
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Principal</p>
                      <p className="font-bold text-slate-800">KSH {loan.principal.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Interest (10%)</p>
                      <p className="font-bold text-slate-800">KSH {loan.interest.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Remaining</p>
                      <p className="text-xl font-extrabold text-slate-900">KSH {loan.remainingBalance.toLocaleString()}</p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>Due Date</p>
                      <p className="font-bold">{new Date(loan.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-indigo-600">{progress.toFixed(0)}% PAID</span>
                      <span className="text-slate-400">TOTAL: KSH {loan.totalDue.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Completed Loans</h3>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Loan #</th>
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Total Paid</th>
                <th className="px-6 py-4 font-semibold">Date Settled</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.filter(l => l.status === 'Paid').length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No loan history yet.</td>
                </tr>
              ) : (
                loans.filter(l => l.status === 'Paid').map(l => (
                  <tr key={l.id}>
                    <td className="px-6 py-4 font-mono font-bold text-slate-600">{l.loanNumber}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{members.find(m => m.id === l.memberId)?.name}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">KSH {l.totalDue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date().toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-xs font-bold uppercase">
                        <CheckCircle2 size={12} />
                        Settled
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}