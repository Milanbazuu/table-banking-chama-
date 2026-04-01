import React, { useMemo } from 'react';
import { useChamaStore } from '../../store/useChamaStore';
import { 
  Activity, 
  PieChart as PieIcon
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
} from 'recharts';
import { Member } from '../../types/chama';

export default function Overview() {
  const { members } = useChamaStore();

  const matrixData = useMemo(() => {
    const months = [
      { name: 'Jan', key: 'monthlyContributions' },
      { name: 'Feb', key: 'febTargetContributionJanLoanRepayment' },
      { name: 'Mar', key: 'expectedMarchContributions' },
      { name: 'Apr', key: 'expectedContributionsLoanRepay10thAprilMpesa' }
    ];

    return months.map((m) => {
      let total = 0;
      if (m.name === 'Jan') {
        total = members.reduce((sum, member) => sum + (member.monthlyContributions?.jan || 0), 0);
      } else {
        total = members.reduce((sum, member) => {
          const val = member[m.key as keyof Member];
          return sum + (typeof val === 'number' ? val : 0);
        }, 0);
      }
      
      return {
        name: m.name,
        total: total,
        target: total * 1.1 // Static target for visual representation
      };
    });
  }, [members]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-50 shadow-xl shadow-slate-200/30 overflow-hidden relative group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">Capital Matrix Flow</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Consolidated Contribution Trends</p>
            </div>
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
               <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Matrix Actual</div>
               <div className="flex items-center gap-2 text-slate-400"><div className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Target Line</div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={matrixData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                    padding: '20px'
                  }} 
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <h4 className="text-lg font-black mb-8 flex items-center gap-3">
            <PieIcon className="text-indigo-400" />
            Audit Snapshot
          </h4>
          <div className="space-y-8">
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-2">Verified Members</p>
              <div className="flex items-end justify-between">
                <h3 className="text-4xl font-black tracking-tighter">{members.length}</h3>
                <Activity size={24} className="text-emerald-400 mb-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-indigo-300">Data Health</p>
                  <p className="text-xl font-black">Stable</p>
               </div>
               <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-indigo-300">Audit Rank</p>
                  <p className="text-xl font-black">Tier 1</p>
               </div>
            </div>
          </div>
          
          <div className="mt-12">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
              <span className="text-indigo-300">Q1 Verification</span>
              <span className="text-white">Complete</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full w-[100%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}