import React, { useRef } from 'react';
import { useChamaStore } from '../../store/useChamaStore';
import { 
  Save, 
  AlertTriangle, 
  RefreshCcw, 
  Sparkles, 
  Download, 
  UploadCloud, 
  ShieldCheck,
  Database,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function SettingsPage() {
  const { 
    settings, 
    updateSettings, 
    resetData, 
    seedData, 
    exportData, 
    importData, 
    lastUpdated 
  } = useChamaStore();
  
  const [formData, setFormData] = React.useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    toast.success('System parameters updated successfully');
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chama-full-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    toast.success('System snapshot generated and downloaded');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        importData(content);
        toast.success('System restored from snapshot');
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        toast.error('Restoration failed: Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('WARNING: This will permanently clear all records. This action cannot be undone. Proceed?')) { 
      resetData(); 
      toast.info('System database cleared'); 
    }
  };

  const handleRestoreSeed = () => {
    if (confirm('Restore to baseline demo data? Current changes will be overwritten.')) {
      seedData();
      toast.success('System records restored to baseline');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 px-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-indigo-600 font-black uppercase tracking-[0.3em] text-[10px]">
            <ShieldCheck size={16} />
            System Governance
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Configuration Hub</h1>
          <p className="text-slate-500 font-medium italic">Last system update: {format(new Date(lastUpdated), 'PPP p')}</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
            onClick={handleExport}
            className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            <Download size={16} />
            Export Backup
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border-2 border-slate-100 text-slate-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <UploadCloud size={16} />
            Import Snapshot
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".json" 
            onChange={handleImport}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Financial Settings Form */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/30 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl" />
             
             <div className="flex items-center gap-4 mb-10 relative z-10">
               <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                 <Save size={24} />
               </div>
               <div>
                 <h3 className="text-xl font-black text-slate-900">Financial Rules</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global calculation parameters</p>
               </div>
             </div>

             <form onSubmit={handleSave} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Share Unit Value (KES)</label>
                    <input 
                      type="number" 
                      value={formData.shareValue} 
                      onChange={e => setFormData({...formData, shareValue: parseFloat(e.target.value)})} 
                      className="w-full h-16 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-black text-lg transition-all shadow-sm" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Registration Fee (KES)</label>
                    <input 
                      type="number" 
                      value={formData.registrationFee} 
                      onChange={e => setFormData({...formData, registrationFee: parseFloat(e.target.value)})} 
                      className="w-full h-16 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-black text-lg transition-all shadow-sm" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Interest Rate (%)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={formData.interestRate * 100} 
                      onChange={e => setFormData({...formData, interestRate: parseFloat(e.target.value) / 100})} 
                      className="w-full h-16 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-black text-lg transition-all shadow-sm" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Deadline (Day)</label>
                    <input 
                      type="number" 
                      max="28" 
                      min="1" 
                      value={formData.paymentDeadlineDay} 
                      onChange={e => setFormData({...formData, paymentDeadlineDay: parseInt(e.target.value)})} 
                      className="w-full h-16 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-black text-lg transition-all shadow-sm" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full h-18 rounded-[2rem] bg-indigo-600 font-black uppercase tracking-[0.2em] text-[10px] text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-200/50 flex items-center justify-center gap-3 transition-all active:scale-[0.98] py-6"
                >
                  <Save className="w-5 h-5" strokeWidth={3} /> Commit New System Rules
                </button>
             </form>
          </div>

          {/* Informational Panel */}
          <div className="bg-indigo-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.2),transparent)] pointer-events-none" />
             <div className="flex items-start gap-6 relative z-10">
               <div className="bg-white/10 p-4 rounded-2xl">
                 <Info className="text-indigo-400" size={28} />
               </div>
               <div>
                 <h4 className="text-xl font-black mb-4">Update Protocol</h4>
                 <p className="text-indigo-200/80 text-sm leading-relaxed font-medium">
                    Calculations are updated in real-time. When you modify share prices or interest rates, the system re-evaluates all pending dues and loan balances starting from the next transaction cycle.
                 </p>
                 <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Automatic Reconciliation</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Encrypted State Storage</span>
                    </div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Maintenance Panel */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/30 space-y-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                 <Database size={24} />
               </div>
               <div>
                 <h3 className="text-xl font-black text-slate-900">Maintenance</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data integrity tools</p>
               </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleRestoreSeed}
                className="w-full h-16 rounded-2xl bg-emerald-50 text-emerald-700 font-black uppercase tracking-widest text-[10px] hover:bg-emerald-100 transition-all flex items-center justify-center gap-3 border border-emerald-100"
              >
                <Sparkles size={16} /> Restore Demo State
              </button>

              <div className="pt-8 border-t border-slate-100 space-y-6">
                <div className="flex items-center gap-3 text-rose-600">
                  <AlertTriangle size={20} />
                  <span className="font-black uppercase tracking-widest text-[10px]">Danger Zone</span>
                </div>
                
                <p className="text-slate-400 text-xs font-bold leading-relaxed">
                  Purging the database is permanent. Ensure you have a backup snapshot before proceeding.
                </p>

                <button 
                  onClick={handleReset}
                  className="w-full h-16 rounded-2xl bg-rose-50 text-rose-600 font-black uppercase tracking-widest text-[10px] hover:bg-rose-100 transition-all flex items-center justify-center gap-3 border border-rose-100"
                >
                  <RefreshCcw size={16} /> Wipe All Records
                </button>
              </div>
            </div>
          </div>
          
          {/* System Health Status Widget */}
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl space-y-8">
             <h4 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400">Service Health</h4>
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Database State</span>
                   <span className="text-emerald-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Optimized
                   </span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Local Storage</span>
                   <span className="text-indigo-400 font-black text-[10px] uppercase tracking-widest">Persistent</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Member Base</span>
                   <span className="text-white font-black text-xs tracking-widest">{useChamaStore.getState().members.length} Units</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}