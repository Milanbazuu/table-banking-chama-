import React, { useState } from 'react';
import { Member, Transaction, Loan, ChamaSettings } from '../types';
import { Search, Printer, Download, ArrowRightLeft } from 'lucide-react';

interface Props {
  members: Member[];
  transactions: Transaction[];
  loans: Loan[];
  settings: ChamaSettings;
}

export default function MemberLedger({ members, transactions, loans, settings }: Props) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  const selectedMember = members.find(m => m.id === selectedMemberId);
  
  const memberTransactions = transactions
    .filter(t => t.memberId === selectedMemberId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const memberLoans = loans.filter(l => l.memberId === selectedMemberId);

  const stats = {
    contributions: memberTransactions.filter(t => t.category === 'Contribution').reduce((s, t) => s + t.amount, 0),
    repayments: memberTransactions.filter(t => t.category === 'Loan Repayment').reduce((s, t) => s + t.amount, 0),
    balance: memberLoans.reduce((s, l) => s + l.remainingBalance, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Member Statements</h1>
          <p className="text-slate-500">View detailed financial history for individual members.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-slate-50 font-semibold text-slate-600 transition-colors">
            <Printer size={18} />
            Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-slate-50 font-semibold text-slate-600 transition-colors">
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="max-w-md">
          <label className="text-sm font-semibold text-slate-700 block mb-2">Search Member</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              value={selectedMemberId}
              onChange={e => setSelectedMemberId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            >
              <option value="">-- Select a Member to View Statement --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.memberNumber})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedMember ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                {selectedMember.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{selectedMember.name}</h3>
              <p className="text-slate-500 text-sm font-medium">{selectedMember.memberNumber}</p>
              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-left">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Shares</p>
                  <p className="font-bold text-slate-800">{selectedMember.initialShares}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Joined</p>
                  <p className="font-bold text-slate-800">{new Date(selectedMember.registrationDate).getFullYear()}</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg">
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Current Debt Balance</p>
              <h4 className="text-3xl font-extrabold mb-4">KSH {stats.balance.toLocaleString()}</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Total Contributed</span>
                  <span className="font-bold">KSH {stats.contributions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Total Repaid</span>
                  <span className="font-bold">KSH {stats.repayments.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-slate-50/50">
                <h4 className="font-bold text-slate-800">Transaction History</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Description</th>
                      <th className="px-6 py-4 font-semibold">Ref</th>
                      <th className="px-6 py-4 font-semibold text-right">Debit</th>
                      <th className="px-6 py-4 font-semibold text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {memberTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No transactions found for this member.</td>
                      </tr>
                    ) : (
                      memberTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-700">{t.category}</span>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-400">{t.reference || '-'}</td>
                          <td className="px-6 py-4 text-right text-rose-600 font-medium">
                            {t.category === 'Loan Disbursement' || t.category === 'Penalty' ? `KSH ${t.amount.toLocaleString()}` : ''}
                          </td>
                          <td className="px-6 py-4 text-right text-emerald-600 font-bold">
                            {t.category === 'Contribution' || t.category === 'Loan Repayment' || t.category === 'Reg Fee' ? `KSH ${t.amount.toLocaleString()}` : ''}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
                <ArrowRightLeft size={20} />
                <h4>Active Loans Breakdown</h4>
              </div>
              <div className="space-y-4">
                {memberLoans.filter(l => l.status === 'Open').length === 0 ? (
                  <p className="text-slate-400 text-sm italic">No open loans.</p>
                ) : (
                  memberLoans.filter(l => l.status === 'Open').map(l => (
                    <div key={l.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-slate-50">
                      <div>
                        <p className="font-bold text-slate-900">{l.loanNumber}</p>
                        <p className="text-xs text-slate-500">Issued: {new Date(l.disbursementDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-indigo-700">KSH {l.remainingBalance.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold italic">Due by {new Date(l.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-2xl border border-dashed text-center">
          <Search size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-400">Select a member to view their ledger</h3>
          <p className="text-slate-400 max-w-sm mx-auto mt-2">All contributions, loans, and penalty history will be displayed here in a comprehensive statement format.</p>
        </div>
      )}
    </div>
  );
}