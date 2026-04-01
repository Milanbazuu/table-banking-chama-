import React from 'react';
import { ChamaSettings } from '../types';
import { Settings as SettingsIcon, Save, Info, Percent, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  settings: ChamaSettings;
  setSettings: React.Dispatch<React.SetStateAction<ChamaSettings>>;
}

export default function Settings({ settings, setSettings }: Props) {
  const handleSave = () => {
    toast.success('Rules updated successfully! All calculations will now reflect these changes.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Settings & Rules</h1>
          <p className="text-slate-500">Configure the Chama's financial rules and operational parameters.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <DollarSign size={20} className="stroke-[3px]" />
            <h3 className="font-bold text-slate-900">Financial Rules</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Cost per Share (KSH)</label>
              <input 
                type="number"
                value={settings.sharePrice}
                onChange={e => setSettings({...settings, sharePrice: parseInt(e.target.value)})}
                className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Registration Fee (KSH)</label>
              <input 
                type="number"
                value={settings.regFee}
                onChange={e => setSettings({...settings, regFee: parseInt(e.target.value)})}
                className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Interest Rate (%)</label>
              <div className="relative">
                <input 
                  type="number"
                  step="0.01"
                  value={settings.interestRate * 100}
                  onChange={e => setSettings({...settings, interestRate: parseFloat(e.target.value) / 100})}
                  className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Calendar size={20} className="stroke-[3px]" />
            <h3 className="font-bold text-slate-900">Timelines & Cycles</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Monthly Deadline Day</label>
              <select 
                value={settings.deadlineDay}
                onChange={e => setSettings({...settings, deadlineDay: parseInt(e.target.value)})}
                className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              >
                {[...Array(28)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}th of Month</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Payout Month</label>
              <select 
                value={settings.payoutMonth}
                onChange={e => setSettings({...settings, payoutMonth: parseInt(e.target.value)})}
                className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              >
                <option value={11}>November</option>
                <option value={12}>December</option>
              </select>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
            <Info className="text-amber-600 shrink-0" size={20} />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Note:</strong> Changes to interest rates and deadlines will apply to new transactions and roll-overs from the next billing cycle. Existing loans will maintain their original rates.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 bg-indigo-50 p-8 rounded-2xl border border-indigo-100">
          <div className="flex items-start gap-4">
            <div className="bg-indigo-600 p-3 rounded-xl text-white">
              <Percent size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-indigo-900 mb-2">Interest Distribution Logic</h3>
              <p className="text-indigo-800/80 max-w-3xl leading-relaxed">
                As per user requirement: Interest earned from loans is distributed amongst active shares in December. 
                <strong> Eligibility:</strong> Members must have taken loans and repaid consistently for at least 5 months to qualify for interest distribution.
                Members who do not meet this criteria will receive only their contributions back.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}