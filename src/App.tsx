import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BadgeDollarSign, 
  FileText, 
  Settings as SettingsIcon,
  Menu,
  X,
  Plus,
  ShieldCheck,
  Zap,
  UserCircle,
  ArrowRightLeft
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import Dashboard from './components/Dashboard';
import MemberManager from './components/MemberManager';
import TransactionForm from './components/transactions/TransactionForm';
import MemberStatement from './components/members/MemberStatement';
import SettingsPage from './components/settings/SettingsPage';
import MemberPortal from './components/member/MemberPortal';
import { useChamaStore } from './store/useChamaStore';
import { cn } from './lib/utils';

type UserRole = 'admin' | 'member';

export default function App() {
  const { members, seedData, lastUpdated, isDemoData } = useChamaStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  // Role-based state
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);

  const LOGO_URL = "https://storage.googleapis.com/dala-prod-public-storage/attachments/67bbe8f1-a4f5-4f56-bab0-27d166de3e5b/1775068373148_file_00000000527c71fdac25ec67942e4ae4__1_.png";
  const BRAND_NAME = "TUJENGE SAVINGS CIRCLE";
  const TAGLINE = "Save Together. Grow Together.";

  useEffect(() => {
    const stored = localStorage.getItem('chama-pro-storage-v2');
    if (!stored && members.length === 0) {
      seedData();
      toast.info('Tujenge Savings Circle Matrix loaded successfully.');
    }
  }, [members.length, seedData]);

  // If switched to member role and no member is selected, pick the first one
  useEffect(() => {
    if (userRole === 'member' && !currentMemberId && members.length > 0) {
      setCurrentMemberId(members[0].id);
    }
  }, [userRole, currentMemberId, members]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'ledger', label: 'Financial Matrix', icon: FileText },
    { id: 'settings', label: 'System Settings', icon: SettingsIcon },
  ];

  const handleSwitchRole = () => {
    if (userRole === 'admin') {
      setUserRole('member');
      toast.success('Switched to Member Portal View');
    } else {
      setUserRole('admin');
      toast.success('Switched to Admin Dashboard');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'ledger':
        return <Dashboard />;
      case 'members':
        return <MemberManager onSelectMember={(id) => setSelectedMemberId(id)} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  // Render Member Portal if role is member
  if (userRole === 'member' && currentMemberId) {
    return (
      <>
        <Toaster position="top-center" richColors closeButton />
        <MemberPortal 
          memberId={currentMemberId} 
          onLogout={() => setUserRole('admin')} 
        />
        {/* Role Switcher for Demo Purposes */}
        <button 
          onClick={handleSwitchRole}
          className="fixed bottom-8 right-8 bg-slate-900/10 hover:bg-slate-900/20 text-slate-900 p-4 rounded-full backdrop-blur-sm transition-all border border-slate-900/10 z-[100] group"
          title="Switch to Admin View"
        >
          <ArrowRightLeft size={24} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans selection:bg-emerald-100 tracking-tight">
      <Toaster position="top-center" richColors closeButton />
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="TUJENGE Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tighter text-sm leading-none">{BRAND_NAME}</span>
            <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">{TAGLINE}</span>
          </div>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-slate-100 rounded-lg">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-0 z-40 transform transition-transform duration-500 ease-in-out bg-white border-r w-72 md:relative md:translate-x-0 shadow-2xl md:shadow-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-12 hidden md:flex">
             <img src={LOGO_URL} alt="TUJENGE Logo" className="w-14 h-14 object-contain transform hover:scale-110 transition-transform" />
            <div>
              <span className="font-black text-xl text-slate-900 tracking-tighter block leading-none">{BRAND_NAME}</span>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1 block">{TAGLINE}</span>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 -translate-y-0.5' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                {item.label}
              </button>
            ))}

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button 
                onClick={handleSwitchRole}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <UserCircle size={22} strokeWidth={2.5} />
                Switch to Member View
              </button>
            </div>
          </nav>

          <div className="mt-auto space-y-4">
             {/* Data Integrity Status */}
             <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Local Sync</span>
                   <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase">Active</span>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                      <ShieldCheck size={14} />
                   </div>
                   <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-white uppercase truncate">Database Verified</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase truncate">Last: {new Date(lastUpdated).toLocaleTimeString()}</p>
                   </div>
                </div>
             </div>

             <button 
              onClick={() => setIsTransactionFormOpen(true)}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
              New Entry
            </button>

            <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black">
                TR
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">Treasurer</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tujenge Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        <div className="min-h-screen py-10 md:py-16 px-4 md:px-10">
          {renderContent()}
        </div>
        
        {/* Simple Footer with Branding */}
        <footer className="p-10 flex flex-col items-center justify-center gap-4 border-t border-slate-200 bg-white">
          <img src={LOGO_URL} alt="TUJENGE Logo" className="w-12 h-12 object-contain opacity-50" />
          <div className="text-center">
            <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">{BRAND_NAME}</p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{TAGLINE}</p>
            <p className="text-[9px] text-slate-400 mt-2">&copy; {new Date().getFullYear()} All Rights Reserved</p>
          </div>
        </footer>
      </main>

      {/* Overlays */}
      {isTransactionFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <TransactionForm onClose={() => setIsTransactionFormOpen(false)} />
          </div>
        </div>
      )}

      {selectedMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300 print:p-0 print:bg-white print:z-[1000]">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden h-[90vh] animate-in zoom-in-95 duration-200 print:h-auto print:rounded-none print:shadow-none print:overflow-visible relative">
            <button 
              onClick={() => setSelectedMemberId(null)} 
              className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-rose-500 rounded-full text-white z-[60] print:hidden transition-all"
            >
              <X size={24} />
            </button>
            <MemberStatement memberId={selectedMemberId} onClose={() => setSelectedMemberId(null)} />
          </div>
        </div>
      )}
    </div>
  );
}