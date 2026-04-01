import React, { useState } from 'react';
import { useChamaStore } from '../../store/useChamaStore';
import { formatCurrency, cn } from '../../lib/utils';
import { User, ShieldCheck, CreditCard, Hash, Phone, ArrowRight, Edit3, Save, X, UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Member } from '../../types/chama';
import { toast } from 'sonner';

export function MemberList({ onSelectMember }: { onSelectMember?: (id: string) => void }) {
  const { members, settings, updateMember } = useChamaStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Member>>({});

  const handleStartEdit = (e: React.MouseEvent, member: Member) => {
    e.stopPropagation();
    setEditingId(member.id);
    setEditFormData({
      name: member.name,
      phoneNumber: member.phoneNumber,
      shares: member.shares,
      memberNumber: member.memberNumber,
      isRegistered: member.isRegistered
    });
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingId) return;
    
    updateMember(editingId, editFormData);
    setEditingId(null);
    toast.success('Member updated successfully');
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleFormClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {members.map((member) => (
        <div 
          key={member.id} 
          onClick={() => !editingId && onSelectMember?.(member.id)}
          className={cn(
            "bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 transition-all group relative overflow-hidden",
            !editingId && "hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer"
          )}
        >
          {/* Decorative background element */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-50/50 rounded-full group-hover:scale-125 transition-transform duration-700 -z-0" />
          
          {editingId === member.id ? (
            <div className="relative z-10 space-y-4" onClick={handleFormClick}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-slate-900 text-lg">Quick Edit</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={handleSave} 
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                  >
                    <Save size={18} />
                  </button>
                  <button 
                    onClick={handleCancel} 
                    className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-indigo-500 outline-none font-bold text-sm"
                    value={editFormData.name}
                    onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-indigo-500 outline-none font-bold text-sm"
                    value={editFormData.phoneNumber}
                    onChange={e => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Shares</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-indigo-500 outline-none font-bold text-sm"
                      value={editFormData.shares}
                      onChange={e => setEditFormData({...editFormData, shares: parseInt(e.target.value)})}
                    />
                  </div>
                   <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                    <label className="flex items-center gap-2 h-[42px] px-4 bg-slate-50 rounded-xl cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={editFormData.isRegistered}
                        onChange={e => setEditFormData({...editFormData, isRegistered: e.target.checked})}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Verified</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xl leading-tight group-hover:text-indigo-600 transition-colors">
                      {member.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md uppercase tracking-tighter">
                        <Hash size={10} />
                        {member.memberNumber}
                      </span>
                      {member.isRegistered ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 size={10} strokeWidth={3} />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black text-rose-600 uppercase tracking-tighter bg-rose-50 px-2 py-0.5 rounded-md">
                          <AlertCircle size={10} strokeWidth={3} />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => handleStartEdit(e, member)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  <Edit3 size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50 relative z-10">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <CreditCard size={12} strokeWidth={2.5} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Equity Value</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">
                    {formatCurrency(member.shares * settings.shareValue)}
                  </p>
                  <p className="text-[10px] text-indigo-500 font-bold">{member.shares} Units</p>
                </div>
                <div className="text-right space-y-1.5">
                  <div className="flex items-center justify-end gap-1.5 text-slate-400">
                    <Phone size={12} strokeWidth={2.5} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Contact</span>
                  </div>
                  <p className="text-sm font-black text-slate-900 tracking-tight">
                    {member.phoneNumber}
                  </p>
                  <span className={cn(
                    "inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mt-1",
                    member.status === 'ACTIVE' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                  )}>
                    {member.status}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between relative z-10">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-xl border-4 border-white bg-slate-100 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-black text-indigo-600 uppercase tracking-[0.15em] group-hover:translate-x-1 transition-transform">
                  Detailed Statement
                  <ArrowRight size={14} strokeWidth={3} />
                </div>
              </div>
            </>
          )}
        </div>
      ))}

      {members.length === 0 && (
        <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
            <User size={48} strokeWidth={1} />
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-900">No Members Found</h4>
            <p className="text-slate-500 font-medium max-w-xs">Start building your community by adding members to your Chama.</p>
          </div>
        </div>
      )}
    </div>
  );
}