import React, { useRef } from 'react';
import { useChamaStore } from '../../store/useChamaStore';
import { toast } from 'sonner';
import { 
  Settings2, 
  Database, 
  ShieldAlert, 
  FileJson, 
  UploadCloud, 
  Trash2, 
  Info
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

export default function SystemSettings() {
  const { settings, updateSettings, exportData, importData, resetData, seedData } = useChamaStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (field: string, value: any) => {
    updateSettings({ [field]: value });
    toast.success('Configuration updated');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        importData(content);
        toast.success('System restored successfully');
      } catch (error) {
        toast.error('Restoration failed: Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('WARNING: This will permanently delete all member and financial records. This action cannot be undone.')) {
      resetData();
      toast.error('System wiped successfully');
    }
  };

  return (
    <div className="max-w-4xl space-y-12">
      {/* Financial Parameters */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
            <Settings2 size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Financial Governance</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global Configuration & Rules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Share Unit Value (KSh)</Label>
              <Input 
                type="number" 
                value={settings.shareValue}
                onChange={(e) => handleUpdate('shareValue', parseInt(e.target.value))}
                className="rounded-2xl border-slate-100 font-black h-12 text-lg focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Registration Fee (KSh)</Label>
              <Input 
                type="number" 
                value={settings.registrationFee}
                onChange={(e) => handleUpdate('registrationFee', parseInt(e.target.value))}
                className="rounded-2xl border-slate-100 font-black h-12 text-lg focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Monthly Interest Rate (%)</Label>
              <Input 
                type="number" 
                step="0.01"
                value={settings.interestRate * 100}
                onChange={(e) => handleUpdate('interestRate', parseFloat(e.target.value) / 100)}
                className="rounded-2xl border-slate-100 font-black h-12 text-lg focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Monthly Deadline (Day of Month)</Label>
              <Input 
                type="number" 
                min="1" 
                max="31"
                value={settings.paymentDeadlineDay}
                onChange={(e) => handleUpdate('paymentDeadlineDay', parseInt(e.target.value))}
                className="rounded-2xl border-slate-100 font-black h-12 text-lg focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Data Sovereignty */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
            <Database size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Data Sovereignty</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Backup, Recovery & Migration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-6">
            <div className="flex items-center gap-4 text-emerald-600 mb-4">
              <FileJson size={32} />
              <h4 className="font-black uppercase tracking-widest text-sm">Export & Archive</h4>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Generate a encrypted JSON snapshot of your entire system. This includes members, loans, and all transaction history.
            </p>
            <Button 
              onClick={() => {
                const data = exportData();
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chama-full-backup-${new Date().toISOString()}.json`;
                a.click();
                toast.success('Secure backup generated');
              }}
              className="w-full rounded-2xl h-12 bg-slate-900 font-black uppercase tracking-widest text-xs"
            >
              Generate Backup
            </Button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-6">
            <div className="flex items-center gap-4 text-indigo-600 mb-4">
              <UploadCloud size={32} />
              <h4 className="font-black uppercase tracking-widest text-sm">Restore System</h4>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Restore the entire database from a previously generated backup file. This will overwrite all current local data.
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleImport}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full rounded-2xl h-12 border-2 border-indigo-100 text-indigo-600 font-black uppercase tracking-widest text-xs"
            >
              Load Snapshot
            </Button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Security Protocols</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sensitive Operations</p>
          </div>
        </div>

        <div className="bg-rose-50/50 p-8 rounded-[2.5rem] border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-4">
            <Info className="text-rose-500 mt-1 shrink-0" size={20} />
            <div className="max-w-md">
              <h4 className="text-rose-900 font-black text-sm uppercase tracking-widest mb-1">Factory Reset</h4>
              <p className="text-xs text-rose-600/80 font-bold leading-relaxed">
                Wipe all records. Use this only if you intend to start the chama from scratch or are moving to a new environment.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <Button 
                onClick={seedData}
                variant="outline"
                className="bg-white border-rose-200 text-rose-600 font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl hover:bg-rose-50"
              >
                Re-Seed Demo
              </Button>
              <Button 
                onClick={handleReset}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl shadow-lg shadow-rose-200"
              >
                <Trash2 size={14} className="mr-2" />
                Wipe Data
              </Button>
          </div>
        </div>
      </section>
    </div>
  );
}