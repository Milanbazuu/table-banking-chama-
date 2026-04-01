import React, { useMemo } from 'react';
import { useChamaStore } from '../../store/useChamaStore';
import { formatCurrency, cn } from '../../lib/utils';
import { 
  TrendingUp, 
  Wallet, 
  HandCoins, 
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Info
} from 'lucide-react';

export default function MemberDashboard({ memberId }: { memberId: string }) {
  const { members, transactions, loans, settings } = useChamaStore();
  const member = members.find(m => m.id === memberId);

  const stats = useMemo(() => {
    if (!member) return null;
    
    const mTransactions = transactions.filter(t => t.memberId === memberId);
    const mLoans = loans.filter(l => l.memberId === memberId);
    const activeLoan = mLoans.find(l => l.status === 'OPEN' || l.status === 'Open');
    
    const totalContributed = mTransactions
      .filter(t => t.type === 'CONTRIBUTION')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalRepaid = mTransactions
      .filter(t => (t.type === 'REPAYMENT' || t.type === 'LOAN_REPAYMENT'))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      shareCapital: member.shares * settings.shareValue,
      totalContributed: member.contributionsToDate || totalContributed,
      loanBalance: activeLoan ? activeLoan.balance : 0,
      totalRepaid,
      activeLoan,
      recentTransactions: mTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
    };
  }, [member, transactions, loans, settings]);

  if (!stats || !member) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 group hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">Shares</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Share Capital Value</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{formatCurrency(stats.shareCapital)}</h3>
          <p className="text-xs font-bold text-slate-500 mt-2">{member.shares} total shares held</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 group hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Wallet size={24} />
            </div>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Savings</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Contributions</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{formatCurrency(stats.totalContributed)}</h3>
          <p className="text-xs font-bold text-slate-500 mt-2">Personal savings growth</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 group hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-slate-800 text-amber-400 rounded-2xl">
              <HandCoins size={24} />
            </div>
            <span className="text-[10px] font-black text-amber-400 bg-slate-800 px-3 py-1 rounded-full uppercase">Liability</span>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Loan Balance</p>
          <h3 className="text-3xl font-black text-white tracking-tighter">{formatCurrency(stats.loanBalance)}</h3>
          <p className="text-xs font-bold text-slate-400 mt-2">
            {stats.activeLoan ? `Due: ${new Date().toLocaleDateString()}` : 'No active loans'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Recent Activity</h3>
            <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="space-y-6">
            {stats.recentTransactions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-400 font-bold italic">No recent transactions found.</p>
              </div>
            ) : (
              stats.recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "p-3 rounded-2xl",
                      t.type === 'CONTRIBUTION' ? "bg-emerald-50 text-emerald-600" : 
                      (t.type === 'REPAYMENT' || t.type === 'LOAN_REPAYMENT') ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-600"
                    )}>
                      {t.type === 'CONTRIBUTION' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{t.type.replace(/_/g, ' ')}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Calendar size={10} /> {new Date(t.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-black tracking-tight",
                      t.type === 'CONTRIBUTION' ? "text-emerald-600" : "text-slate-900"
                    )}>
                      {t.type === 'CONTRIBUTION' ? '+' : ''}{formatCurrency(t.amount)}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">REF: {t.reference || 'SYSTEM'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Loan Info / Status Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-10 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-sm font-black text-emerald-200 uppercase tracking-widest mb-2">Loan Eligibility</h3>
                <h4 className="text-3xl font-black tracking-tighter mb-4">You are eligible for up to {formatCurrency(stats.shareCapital * 3)}</h4>
                <p className="text-sm font-bold text-emerald-100/80 mb-8 max-w-xs">Based on your current share capital and contribution history, you qualify for a quick loan.</p>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">Processing Time</p>
                    <p className="text-xs font-bold text-white">Instant Approval</p>
                  </div>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
             <div className="flex items-center gap-4 mb-6">
               <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Info size={20} />
               </div>
               <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Member Notices</h4>
             </div>
             <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-bold text-slate-600 leading-relaxed">
                  Next contribution of <span className="text-slate-900 font-black">KES 2,000</span> is due by the 10th of next month.
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-bold text-slate-600 leading-relaxed">
                  Interest rates for current period are fixed at <span className="text-slate-900 font-black">10%</span>.
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}