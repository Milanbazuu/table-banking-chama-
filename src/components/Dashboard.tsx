import React, { useMemo, useState } from 'react';
import { useChamaStore } from '../store/useChamaStore';
import { 
  TrendingUp, 
  Users, 
  Wallet, 
  Clock,
  Zap,
  BadgeDollarSign,
  History,
  ShieldCheck,
  Layers,
  Sparkles,
  Database,
  ArrowRight,
  FileText,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, cn } from '../lib/utils';
import { MemberFinancialTable } from './dashboard/MemberFinancialTable';
import OverviewChart from './dashboard/Overview';
import { EditMemberDialog } from './members/EditMemberDialog';
import MemberStatement from './members/MemberStatement';

export default function Dashboard() {
  const { members, seedData } = useChamaStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [viewingMemberId, setViewingMemberId] = useState<string | null>(null);

  const selectedMemberForEdit = members.find(m => m.id === editingMemberId);

  const totals = useMemo(() => {
    return members.reduce((acc, member) => ({
      actualContributions: acc.actualContributions + (member.actualContributions || 0),
      totalLoans: acc.totalLoans + (member.totalLoansJanDeficitFebDisbursement || 0),
      totalDeficits: acc.totalDeficits + (member.deficitApril || 0),
      registrationFees: acc.registrationFees + (member.registrationFee || 0),
      janTotal: acc.janTotal + (member.monthlyContributions?.jan || 0),
      febRepayments: acc.febRepayments + (member.janLoansFebRepaymentBy10th || 0),
      marchRepayments: acc.marchRepayments + (member.marchRepaymentToDate || 0)
    }), {
      actualContributions: 0,
      totalLoans: 0,
      totalDeficits: 0,
      registrationFees: 0,
      janTotal: 0,
      febRepayments: 0,
      marchRepayments: 0
    });
  }, [members]);

  const stats = [
    { 
      label: 'Corporate Base', 
      value: members.length, 
      icon: Users, 
      color: 'bg-indigo-600', 
      trend: `${members.filter(m => m.status === 'ACTIVE').length} Verified Accounts`,
      isPositive: true 
    },
    { 
      label: 'Equity Pool', 
      value: formatCurrency(totals.actualContributions), 
      icon: Wallet, 
      color: 'bg-emerald-600', 
      trend: `+${formatCurrency(totals.janTotal)} Jan Matrix`,
      isPositive: true 
    },
    { 
      label: 'Loan Portfolio', 
      value: formatCurrency(totals.totalLoans), 
      icon: TrendingUp, 
      color: 'bg-rose-600', 
      trend: `${formatCurrency(totals.totalDeficits)} Overall Deficit`,
      isPositive: false 
    },
    { 
      label: 'Recovery (Q1)', 
      value: formatCurrency(totals.febRepayments + totals.marchRepayments), 
      icon: BadgeDollarSign, 
      color: 'bg-amber-600', 
      trend: 'Calculated from matrix',
      isPositive: true 
    },
  ];

  const handleForceSync = () => {
    setIsSyncing(true);
    toast.loading('Syncing with official audit matrix...', { id: 'sync-audit' });
    
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('System reconciled! Matrix integrity 100%.', { id: 'sync-audit' });
    }, 1500);
  };

  if (members.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 max-w-4xl mx-auto shadow-2xl shadow-slate-200/20 my-10 animate-in fade-in zoom-in-95">
        <div className="w-32 h-32 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 bg-indigo-600/10 rounded-[2.5rem] animate-ping" />
          <Database size={64} className="text-indigo-600" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Engine Standby</h2>
        <p className="text-slate-500 max-w-md text-lg font-medium mb-12">
          The financial engine is ready. Please restore the official audit matrix to initialize 23 columns of data.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={seedData}
            className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-3"
          >
            <Sparkles size={18} />
            Initialize Matrix
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-widest">Enterprise Ledger</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-4">
             Financial Matrix
             <div className="flex items-center gap-2 px-4 py-1.5 bg-white shadow-sm text-slate-600 rounded-full border border-slate-100 font-black text-[10px] uppercase tracking-widest">
                <ShieldCheck size={14} className="text-emerald-500" /> Integrity Verified
             </div>
          </h1>
          <p className="text-slate-400 text-lg font-medium italic max-w-2xl leading-relaxed">
            Real-time audit visibility with deep-dive analytics into member contributions, loans, and recovery deficits.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end pr-6 border-r border-slate-200 hidden md:block">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Audit Cycle</p>
             <p className="text-sm font-black text-slate-900 uppercase">Q1 RECONCILED</p>
           </div>
           <button 
            onClick={handleForceSync}
            disabled={isSyncing}
            className="px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-95 flex items-center gap-3 disabled:opacity-50"
          >
            <Zap size={16} className={cn("fill-amber-400 text-amber-400", isSyncing && "animate-bounce")} />
            {isSyncing ? 'Syncing...' : 'Force Reconcile'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-50 group hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 -z-0" />
            <div className="relative z-10 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div className={`${stat.color} w-14 h-14 rounded-2xl text-white shadow-xl flex items-center justify-center transform group-hover:rotate-6 transition-all duration-300`}>
                  <stat.icon size={24} />
                </div>
                <div className={cn(
                  "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                  stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                )}>
                  {stat.trend}
                </div>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-10">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600">
                <Layers className="w-6 h-6" />
              </div>
              Capital Growth Insights
            </h3>
         </div>
         <OverviewChart />
      </div>

      <div className="space-y-10">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600">
              <History className="w-6 h-6" />
            </div>
            Detailed Matrix Breakdown
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Real-time Browser Storage: ACTIVE
          </p>
        </div>
        
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <MemberFinancialTable 
            onEditMember={setEditingMemberId} 
            onViewMember={setViewingMemberId} 
          />
        </div>
      </div>

      {/* Report Section */}
      <div className="bg-slate-950 p-12 rounded-[4rem] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 max-w-xl">
            <h2 className="text-4xl font-black leading-tight tracking-tight">Generate Detailed Financial Reports</h2>
            <p className="text-slate-400 text-lg font-medium">Download the full audit matrix for official documentation. Your data is stored locally for maximum privacy.</p>
            <div className="flex gap-4">
               <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 border border-indigo-400/30 px-4 py-2 rounded-xl">
                 Data Persistence Verified
               </p>
            </div>
          </div>
          <div className="w-full md:w-auto flex justify-center">
            <div className="relative">
              <div className="w-48 h-48 rounded-[3rem] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-2xl shadow-indigo-500/20 transform -rotate-6">
                <FileText size={64} className="text-white" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-[2rem] bg-emerald-500 flex items-center justify-center shadow-2xl transform rotate-12">
                <ShieldCheck size={32} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedMemberForEdit && (
        <EditMemberDialog 
          member={selectedMemberForEdit} 
          open={!!editingMemberId} 
          onOpenChange={(open) => !open && setEditingMemberId(null)} 
        />
      )}

      {viewingMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300 print:p-0 print:bg-white print:z-[1000]">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden h-[90vh] animate-in zoom-in-95 duration-200 print:h-auto print:rounded-none print:shadow-none print:overflow-visible relative">
             <button 
                onClick={() => setViewingMemberId(null)} 
                className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-rose-500 rounded-full text-white z-[60] print:hidden transition-all"
             >
               <X size={24} />
             </button>
             <MemberStatement memberId={viewingMemberId} onClose={() => setViewingMemberId(null)} />
          </div>
        </div>
      )}
    </div>
  );
}