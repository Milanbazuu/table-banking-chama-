import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Landmark, 
  Database,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  Zap,
  Info,
  X,
  FileDown
} from 'lucide-react';
import { useChamaStore } from '../../store/useChamaStore';
import { formatCurrency, cn } from '../../lib/utils';
import { MemberFinancialTable } from './MemberFinancialTable';
import { EditMemberDialog } from '../members/EditMemberDialog';
import MemberStatement from '../members/MemberStatement';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export default function Dashboard() {
  const { 
    members, 
    transactions, 
    settings,
    seedData, 
    exportData, 
    importData, 
    isDemoData, 
    lastUpdated 
  } = useChamaStore();

  const [isExporting, setIsExporting] = useState(false);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<string | null>(null);
  const [viewingMemberId, setViewingMemberId] = useState<string | null>(null);

  const LOGO_URL = "https://storage.googleapis.com/dala-prod-public-storage/attachments/67bbe8f1-a4f5-4f56-bab0-27d166de3e5b/1775068373148_file_00000000527c71fdac25ec67942e4ae4__1_.png";

  const matrixTotals = useMemo(() => {
    return members.reduce((acc, m) => {
      const jan = (m.monthlyContributions?.jan || 0);
      const feb = (m.monthlyContributions?.feb || 0);
      const mar = (m.monthlyContributions?.mar || 0);
      const apr = (m.monthlyContributions?.apr || 0);
      
      return {
        contributions: acc.contributions + (m.contributionsToDate || (jan + feb + mar + apr)),
        loans: acc.loans + (m.totalLoansJanDeficitFebDisbursement || 0),
        deficits: acc.deficits + (m.deficitApril || 0),
        shares: acc.shares + (m.shares * settings.shareValue)
      };
    }, { contributions: 0, loans: 0, deficits: 0, shares: 0 });
  }, [members, settings.shareValue]);

  const stats = [
    { label: 'Total Pool (Shares)', value: matrixTotals.shares, icon: Landmark, color: 'emerald', trend: 'Verified' },
    { label: 'Paid Contributions', value: matrixTotals.contributions, icon: Wallet, color: 'emerald', trend: 'Active' },
    { label: 'Loans Outstanding', value: matrixTotals.loans, icon: TrendingUp, color: 'rose', trend: 'Period End' },
    { label: 'Total Deficits', value: matrixTotals.deficits, icon: AlertTriangle, color: 'rose', trend: 'April Target' },
  ];

  const handleExport = () => {
    setIsExporting(true);
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tujenge-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExporting(false);
    toast.success("Tujenge backup downloaded successfully!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        importData(data);
        toast.success("Data restored successfully from backup");
      } catch (err) {
        toast.error("Invalid backup file format");
      }
    };
    reader.readAsText(file);
  };

  const editingMember = members.find(m => m.id === selectedMemberForEdit);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header & Reliability Notice */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <img src={LOGO_URL} alt="Logo" className="w-20 h-20 object-contain hidden md:block" />
           <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Financial Summary</h1>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Verified</span>
              </div>
            </div>
            <p className="text-slate-500 font-bold flex items-center gap-2">
              <Database size={16} className="text-emerald-400" />
              Last Matrix Update: <span className="text-slate-900">{new Date(lastUpdated).toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="rounded-2xl border-slate-200 font-black uppercase text-[10px] tracking-widest px-6 h-12 hover:bg-slate-50"
          >
            <Download size={16} className="mr-2" />
            Backup Matrix
          </Button>
          <div className="relative">
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImport} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
            <Button 
              variant="outline" 
              className="rounded-2xl border-slate-200 font-black uppercase text-[10px] tracking-widest px-6 h-12 hover:bg-slate-50"
            >
              <Upload size={16} className="mr-2" />
              Restore Matrix
            </Button>
          </div>
          <Button 
            variant="default" 
            onClick={seedData}
            className="rounded-2xl bg-emerald-600 font-black uppercase text-[10px] tracking-widest px-6 h-12 shadow-xl shadow-emerald-200"
          >
            <RefreshCw size={16} className="mr-2" />
            Reset to Baseline
          </Button>
        </div>
      </div>

      {/* Persistence Warning if Demo */}
      {isDemoData && (
        <div className="bg-emerald-50 border-2 border-emerald-200 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <Zap size={24} />
            </div>
            <div>
              <h4 className="font-black text-emerald-900 uppercase tracking-tight">Viewing Official Baseline</h4>
              <p className="text-sm font-bold text-emerald-700/80">You are currently viewing the Tujenge Savings Circle baseline audit matrix. Any changes are stored locally.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleExport} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
               Backup Now
             </button>
          </div>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6",
                stat.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                stat.color === 'rose' && "bg-rose-50 text-rose-600",
              )}><stat.icon size={28} /></div>
              <span className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", 
                stat.color === 'rose' ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
              )}>{stat.trend}</span>
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{formatCurrency(stat.value)}</h3>
          </div>
        ))}
      </div>

      {/* Matrix Table */}
      <div className="space-y-8 pt-8 border-t border-slate-100">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <FileDown size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Member Financial Matrix</h2>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Closing: March/April 2024</p>
            </div>
          </div>
        </div>
        <MemberFinancialTable 
          onEditMember={(id) => setSelectedMemberForEdit(id)}
          onViewMember={(id) => setViewingMemberId(id)}
        />
      </div>

      {/* Modals */}
      {editingMember && (
        <EditMemberDialog 
          member={editingMember} 
          open={!!selectedMemberForEdit}
          onOpenChange={(open) => !open && setSelectedMemberForEdit(null)} 
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