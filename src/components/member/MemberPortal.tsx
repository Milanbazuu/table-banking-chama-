import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  HandCoins, 
  Wallet, 
  FileText, 
  LogOut,
  Bell,
  ArrowUpRight,
  ArrowDownLeft,
  Info
} from 'lucide-react';
import { useChamaStore } from '../../store/useChamaStore';
import { formatCurrency, cn } from '../../lib/utils';
import MemberDashboard from './MemberDashboard';
import LoanRequestForm from './LoanRequestForm';
import PaymentModule from './PaymentModule';
import MemberStatement from '../members/MemberStatement';

interface MemberPortalProps {
  memberId: string;
  onLogout: () => void;
}

export default function MemberPortal({ memberId, onLogout }: MemberPortalProps) {
  const { members } = useChamaStore();
  const member = members.find(m => m.id === memberId);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'loans' | 'payments' | 'statement'>('dashboard');
  const [showStatement, setShowStatement] = useState(false);

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-md w-full border border-slate-100">
           <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info size={32} />
           </div>
           <h2 className="text-2xl font-black text-slate-900 mb-2">MEMBER NOT FOUND</h2>
           <p className="text-slate-500 font-bold mb-8">We couldn't find a member record associated with this account.</p>
           <button 
             onClick={onLogout}
             className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all"
           >
             Go Back to Login
           </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'loans', label: 'Loan Portal', icon: HandCoins },
    { id: 'payments', label: 'Make Payment', icon: Wallet },
    { id: 'statement', label: 'My Statement', icon: FileText },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MemberDashboard memberId={memberId} />;
      case 'loans':
        return <LoanRequestForm memberId={memberId} />;
      case 'payments':
        return <PaymentModule memberId={memberId} />;
      case 'statement':
        return (
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">OFFICIAL STATEMENT</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Generate and download your certified financial record</p>
              </div>
              <button 
                onClick={() => setShowStatement(true)}
                className="flex items-center justify-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
              >
                <FileText size={18} />
                Open Statement Viewer
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Statement Info</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                        <span className="text-sm font-bold text-slate-600">Period</span>
                        <span className="text-sm font-black text-slate-900 uppercase">Year to Date (2024)</span>
                     </div>
                     <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                        <span className="text-sm font-bold text-slate-600">Verification</span>
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md uppercase">System Verified</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-600">Last Transaction</span>
                        <span className="text-sm font-black text-slate-900">Today</span>
                     </div>
                  </div>
               </div>
               
               <div className="p-8 bg-emerald-900 text-white rounded-3xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Member Support</h3>
                    <p className="text-sm font-bold text-emerald-100 mb-6">Need help understanding your statement? Contact the treasurer directly.</p>
                    <button className="bg-white text-emerald-900 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-50 transition-colors">
                      Chat with Treasurer
                    </button>
                  </div>
                  <div className="absolute -right-4 -bottom-4 text-emerald-800/50 transform group-hover:scale-110 transition-transform duration-500">
                    <Bell size={120} />
                  </div>
               </div>
            </div>
          </div>
        );
      default:
        return <MemberDashboard memberId={memberId} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white border-r border-slate-100 p-8 flex flex-col h-auto md:h-screen md:sticky md:top-0">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-100">
            {member.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-black text-slate-900 tracking-tighter leading-none">{member.name}</h1>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1">ID: {member.memberNumber}</p>
          </div>
        </div>

        <nav className="space-y-3 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === 'statement') setShowStatement(false);
              }}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300",
                activeTab === item.id 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-0.5' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon size={20} strokeWidth={2.5} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={20} strokeWidth={2.5} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Welcome Back,</p>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Member Portal</h2>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</p>
                <p className="text-xs font-bold text-emerald-600">Connected & Secured</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <Bell size={20} />
              </div>
            </div>
          </div>

          {renderContent()}
        </div>
      </main>

      {/* Statement Modal Overlay */}
      {showStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300 print:p-0 print:bg-white print:z-[1000]">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden h-[90vh] animate-in zoom-in-95 duration-200 print:h-auto print:rounded-none print:shadow-none print:overflow-visible relative">
            <button 
              onClick={() => setShowStatement(false)} 
              className="absolute top-8 right-8 p-3 bg-slate-100 hover:bg-rose-500 hover:text-white rounded-full text-slate-400 z-[60] print:hidden transition-all shadow-lg"
            >
              <LogOut size={24} className="rotate-180" />
            </button>
            <MemberStatement memberId={memberId} onClose={() => setShowStatement(false)} />
          </div>
        </div>
      )}
    </div>
  );
}