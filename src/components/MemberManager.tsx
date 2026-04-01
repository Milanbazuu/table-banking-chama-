import React, { useState, useEffect } from 'react';
import { useChamaStore } from '../store/useChamaStore';
import { Member } from '../types/chama';
import { 
  Search, 
  UserPlus, 
  Phone, 
  Hash, 
  UserCheck, 
  Edit3, 
  X, 
  Save,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface MemberManagerProps {
  onSelectMember?: (id: string) => void;
}

export default function MemberManager({ onSelectMember }: MemberManagerProps) {
  const { members, addMember, updateMember, settings, editingMemberId, setEditingMemberId } = useChamaStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Member>>({
    name: '',
    phoneNumber: '',
    shares: 1,
    memberNumber: '',
    isRegistered: false,
    status: 'ACTIVE',
    registrationFee: 1000,
    contributionsToDate: 0,
    actualContributions: 0,
    janLoans: 0,
    febTargetContributionJanLoanRepayment: 0,
    janLoansFebRepaymentBy10th: 0,
    febDeficitBy10thPlusMpesa: 0,
    janMpesaCharge: 0,
    chargeDeficit: 0,
    febDisbursedLoan: 0,
    totalLoansJanDeficitFebDisbursement: 0,
    expectedMarchContributions: 0,
    totalToPayBy10thMarchMidnight: 0,
    marchRepaymentToDate: 0,
    marchRepaymentDeficit: 0,
    aprilLoansDeficitMarch: 0,
    expectedContributionsLoanRepay10thAprilMpesa: 0,
    aprilRepaymentToDate: 0,
    deficitApril: 0,
    monthlyContributions: { jan: 0, feb: 0, mar: 0, apr: 0 }
  });

  useEffect(() => {
    if (editingMemberId) {
      const member = members.find(m => m.id === editingMemberId);
      if (member) {
        setEditingMember(member);
        setFormData({ ...member });
        setShowAdvanced(true);
      }
    }
  }, [editingMemberId, members]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phoneNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    const member: Member = {
      id: crypto.randomUUID(),
      memberNumber: formData.memberNumber || `${(members.length + 1).toString().padStart(4, '0')}`,
      name: formData.name!,
      phoneNumber: formData.phoneNumber!,
      registrationDate: new Date().toISOString(),
      shares: formData.shares!,
      isRegistered: formData.isRegistered || false,
      status: (formData.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
      ...formData
    } as Member;

    addMember(member);
    setIsAdding(false);
    resetForm();
    toast.success('Member registration successful');
  };

  const handleUpdateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    updateMember(editingMember.id, formData);

    setEditingMember(null);
    setEditingMemberId(null);
    resetForm();
    toast.success('Member details updated successfully');
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      phoneNumber: '', 
      shares: 1, 
      memberNumber: '',
      isRegistered: false,
      status: 'ACTIVE',
      registrationFee: 1000,
      contributionsToDate: 0,
      actualContributions: 0,
      janLoans: 0,
      febTargetContributionJanLoanRepayment: 0,
      janLoansFebRepaymentBy10th: 0,
      febDeficitBy10thPlusMpesa: 0,
      janMpesaCharge: 0,
      chargeDeficit: 0,
      febDisbursedLoan: 0,
      totalLoansJanDeficitFebDisbursement: 0,
      expectedMarchContributions: 0,
      totalToPayBy10thMarchMidnight: 0,
      marchRepaymentToDate: 0,
      marchRepaymentDeficit: 0,
      aprilLoansDeficitMarch: 0,
      expectedContributionsLoanRepay10thAprilMpesa: 0,
      aprilRepaymentToDate: 0,
      deficitApril: 0,
      monthlyContributions: { jan: 0, feb: 0, mar: 0, apr: 0 }
    });
    setShowAdvanced(false);
  };

  const startEditing = (member: Member) => {
    setEditingMemberId(member.id);
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.memberNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phoneNumber.includes(searchTerm)
  );

  const FinancialInput = ({ label, field, type = "number" }: { label: string, field: keyof Member, type?: string }) => (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <input 
        type={type} 
        value={(formData as any)[field] === undefined ? (type === 'number' ? 0 : '') : (formData as any)[field]}
        onChange={e => setFormData({...formData, [field]: type === 'number' ? (e.target.value === '' ? 0 : parseFloat(e.target.value)) : e.target.value})}
        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all text-xs"
      />
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Member Registry</h1>
          <p className="text-slate-500 font-medium text-lg tracking-tight">Managing {members.length} participants in the official ledger.</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingMember(null); setEditingMemberId(null); resetForm(); }}
          className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95 shrink-0"
        >
          <UserPlus size={20} strokeWidth={3} />
          Add New Member
        </button>
      </div>

      {(isAdding || editingMember) && (
        <div className="bg-white p-10 rounded-[3rem] border-2 border-indigo-100 shadow-2xl animate-in fade-in slide-in-from-top-6 relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 -z-0 opacity-40" />
          <div className="flex justify-between items-center mb-8 relative z-10 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                 {editingMember ? <Edit3 size={24} /> : <UserPlus size={24} />}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {editingMember ? `Editing: ${editingMember.name}` : 'New Registration'}
                </h3>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Update profile and historical matrix data</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {editingMember && (
                <button 
                  onClick={() => onSelectMember?.(editingMember.id)}
                  className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                >
                  <Eye size={16} /> View Portfolio
                </button>
              )}
              <button 
                onClick={() => { setIsAdding(false); setEditingMember(null); setEditingMemberId(null); resetForm(); }}
                className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>
          </div>
          
          <form onSubmit={editingMember ? handleUpdateMember : handleAddMember} className="space-y-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-6 md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FinancialInput label="Member Identifier #" field="memberNumber" type="text" />
                  <FinancialInput label="Full Legal Name" field="name" type="text" />
                  <FinancialInput label="Mobile Phone Number" field="phoneNumber" type="text" />
                  <FinancialInput label="Current Shareholding" field="shares" />
                </div>
              </div>
              
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Tier</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE'})}
                    className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all text-sm shadow-sm"
                  >
                    <option value="ACTIVE">ACTIVE PARTICIPANT</option>
                    <option value="INACTIVE">INACTIVE / ON HOLD</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="flex items-center gap-4 cursor-pointer p-5 bg-white rounded-2xl border-2 border-slate-100 hover:border-indigo-100 transition-all shadow-sm">
                    <input 
                      type="checkbox" 
                      checked={formData.isRegistered}
                      onChange={e => setFormData({...formData, isRegistered: e.target.checked})}
                      className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Identity Verified</span>
                      <span className="text-[9px] text-slate-400 font-bold">Registration fee cleared</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-600" />
                  Financial Matrix Override
                </h4>
                <button 
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-[10px] hover:text-indigo-700 transition-colors"
                >
                  {showAdvanced ? 'Collapse Matrix' : 'Expand Matrix Editor'}
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 grid grid-cols-2 md:grid-cols-4 gap-6">
                     <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jan Contrib</label>
                      <input 
                        type="number" 
                        value={formData.monthlyContributions?.jan || 0}
                        onChange={e => setFormData({...formData, monthlyContributions: { ...formData.monthlyContributions, jan: parseFloat(e.target.value) }})}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold transition-all text-xs shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Feb Contrib</label>
                      <input 
                        type="number" 
                        value={formData.monthlyContributions?.feb || 0}
                        onChange={e => setFormData({...formData, monthlyContributions: { ...formData.monthlyContributions, feb: parseFloat(e.target.value) }})}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold transition-all text-xs shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mar Contrib</label>
                      <input 
                        type="number" 
                        value={formData.monthlyContributions?.mar || 0}
                        onChange={e => setFormData({...formData, monthlyContributions: { ...formData.monthlyContributions, mar: parseFloat(e.target.value) }})}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold transition-all text-xs shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Apr Contrib</label>
                      <input 
                        type="number" 
                        value={formData.monthlyContributions?.apr || 0}
                        onChange={e => setFormData({...formData, monthlyContributions: { ...formData.monthlyContributions, apr: parseFloat(e.target.value) }})}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold transition-all text-xs shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner">
                    <FinancialInput label="Reg Fee Total" field="registrationFee" />
                    <FinancialInput label="Historical Contrib" field="contributionsToDate" />
                    <FinancialInput label="Actual Total" field="actualContributions" />
                    <FinancialInput label="Jan Loans" field="janLoans" />
                    <FinancialInput label="Feb Target (C+L)" field="febTargetContributionJanLoanRepayment" />
                    <FinancialInput label="Jan Loan Feb Repay" field="janLoansFebRepaymentBy10th" />
                    <FinancialInput label="Feb Deficit + Mpesa" field="febDeficitBy10thPlusMpesa" />
                    <FinancialInput label="Jan Mpesa Charge" field="janMpesaCharge" />
                    <FinancialInput label="Charge Deficit" field="chargeDeficit" />
                    <FinancialInput label="Feb Disbursed Loan" field="febDisbursedLoan" />
                    <FinancialInput label="Total Loans (Feb)" field="totalLoansJanDeficitFebDisbursement" />
                    <FinancialInput label="Exp Mar Contrib" field="expectedMarchContributions" />
                    <FinancialInput label="Pay by 10th Mar" field="totalToPayBy10thMarchMidnight" />
                    <FinancialInput label="Mar Repay to Date" field="marchRepaymentToDate" />
                    <FinancialInput label="Mar Repay Deficit" field="marchRepaymentDeficit" />
                    <FinancialInput label="Apr Loans + Deficit" field="aprilLoansDeficitMarch" />
                    <FinancialInput label="Exp Apr Total" field="expectedContributionsLoanRepay10thAprilMpesa" />
                    <FinancialInput label="Apr Repay to Date" field="aprilRepaymentToDate" />
                    <FinancialInput label="Deficit April" field="deficitApril" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 border-t border-slate-100 pt-10">
              <button 
                type="submit"
                className="flex-1 bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                {editingMember ? <Save size={20} strokeWidth={3} /> : <UserCheck size={20} strokeWidth={3} />}
                {editingMember ? 'Commit Updates' : 'Confirm Registration'}
              </button>
              <button 
                type="button"
                onClick={() => { setIsAdding(false); setEditingMember(null); setEditingMemberId(null); resetForm(); }}
                className="px-12 py-5 bg-slate-100 text-slate-500 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-10 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="relative w-full md:w-[32rem]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
            <input 
              type="text" 
              placeholder="Filter by name, member number or phone..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 border-2 border-slate-100 bg-white rounded-[2rem] shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-indigo-50 px-6 py-3 rounded-2xl text-indigo-600 text-[11px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
               Records: {filteredMembers.length}
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 text-slate-400 text-[10px] uppercase tracking-[0.3em] font-black">
              <tr>
                <th className="px-10 py-7">Profile Information</th>
                <th className="px-10 py-7 text-center">Capital Allocation</th>
                <th className="px-10 py-7 text-center">Verification Status</th>
                <th className="px-10 py-7 text-right">Direct Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-sans">
              {filteredMembers.map(member => (
                <tr key={member.id} className="hover:bg-indigo-50/40 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border-2 border-white/20">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                           <p className="font-black text-slate-900 text-xl tracking-tight">{member.name}</p>
                           <span className="flex items-center gap-1 text-[11px] font-black bg-slate-900 text-white px-3 py-1 rounded-lg uppercase tracking-widest">
                            <Hash size={12} strokeWidth={3} />
                            {member.memberNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-5 mt-2.5 text-slate-400 font-bold text-xs">
                          <span className="flex items-center gap-2">
                            <Phone size={14} className="text-indigo-400" />
                            {member.phoneNumber}
                          </span>
                          <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                          <span className="flex items-center gap-2 uppercase tracking-widest text-[10px]">
                            Since {new Date(member.registrationDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="inline-flex flex-col items-center bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                      <span className="text-2xl font-black text-slate-900">{member.shares}</span>
                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1">Units Held</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${member.isRegistered ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                      {member.isRegistered ? <CheckCircle2 size={14} strokeWidth={3} /> : <AlertCircle size={14} strokeWidth={3} />}
                      {member.isRegistered ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => startEditing(member)}
                        className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        title="Edit Member Details"
                      >
                        <Edit3 size={18} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => onSelectMember?.(member.id)}
                        className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-100 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                      >
                        Portfolio
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}