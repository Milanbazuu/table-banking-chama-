import React, { useState } from 'react';
import { useChamaStore } from '../../store/useChamaStore';
import { formatCurrency, getMonthName, cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight, Search, FileText, Hash, ReceiptText, Smartphone } from 'lucide-react';

export default function TransactionList() {
  const { transactions, members } = useChamaStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter(t => {
    const m = members.find(mem => mem.id === t.memberId);
    return (
      m?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m?.memberNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Ledger</h1>
          <p className="text-slate-500 font-medium italic">Complete history of all contributions, loans, and M-Pesa allocations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-indigo-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            Live Sync Active
          </div>
          <button className="flex items-center gap-2 bg-white border-2 border-slate-100 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <FileText className="w-4 h-4 text-indigo-600" /> 
            Export Ledger
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by member, number or receipt..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border-none bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900" 
            />
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Receipts
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Payments
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
              <tr>
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5">Member Entity</th>
                <th className="px-8 py-5">Transaction Nature</th>
                <th className="px-8 py-5 text-right">Value (KES)</th>
                <th className="px-8 py-5">Audit Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Search size={32} />
                      </div>
                      <p className="text-slate-500 font-bold">No records found for this period.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(t => {
                  const member = members.find(m => m.id === t.memberId);
                  return (
                    <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900">{new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            {member?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{member?.name}</p>
                            <span className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-tighter">
                              <Hash size={10} strokeWidth={3} />
                              {member?.memberNumber}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            t.type === 'CONTRIBUTION' ? "bg-indigo-50 text-indigo-600" :
                            t.type === 'REPAYMENT' ? "bg-emerald-50 text-emerald-600" :
                            t.type === 'LOAN_DISBURSEMENT' ? "bg-rose-50 text-rose-600" :
                            t.type === 'MPESA_CHARGE' ? "bg-orange-50 text-orange-600" :
                            "bg-slate-50 text-slate-600"
                          )}>
                            {t.type === 'LOAN_DISBURSEMENT' || t.type === 'MPESA_CHARGE' ? <ArrowDownRight size={16} strokeWidth={3} /> : <ArrowUpRight size={16} strokeWidth={3} />}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{t.type.replace(/_/g, ' ')}</p>
                            {t.description && <p className="text-[9px] text-slate-400 font-medium leading-none mt-1 line-clamp-1">{t.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={cn(
                          "text-base font-black tracking-tight",
                          t.type === 'LOAN_DISBURSEMENT' || t.type === 'MPESA_CHARGE' ? "text-rose-600" : "text-indigo-600"
                        )}>
                          {t.type === 'LOAN_DISBURSEMENT' || t.type === 'MPESA_CHARGE' ? '-' : '+'}{formatCurrency(t.amount)}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        {t.reference ? (
                          <div className="flex items-center gap-2 group/ref cursor-help">
                            {t.description?.includes('Mpesa') ? <Smartphone size={12} className="text-indigo-600" /> : <ReceiptText size={12} className="text-slate-400" />}
                            <span className="text-[11px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase group-hover/ref:bg-indigo-100 group-hover/ref:text-indigo-700 transition-colors">{t.reference}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-300 font-bold italic uppercase tracking-widest">Internal Ref</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}