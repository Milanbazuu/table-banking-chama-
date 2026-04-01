import React, { useState, useMemo, useRef } from 'react';
import { useChamaStore } from '../../store/useChamaStore';
import { formatCurrency } from '../../lib/utils';
import { Member } from '../../types/chama';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { 
  Share2, 
  Download, 
  Calendar, 
  Wallet, 
  AlertCircle, 
  CheckCircle2,
  TrendingUp,
  Fingerprint
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';

interface ShareMemberSnapshotProps {
  memberId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function ShareMemberSnapshot({ memberId, isOpen, onClose }: ShareMemberSnapshotProps) {
  const { members, transactions, settings } = useChamaStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [customExpected, setCustomExpected] = useState<string>('');
  const [customDeficit, setCustomDeficit] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const member = useMemo(() => members.find(m => m.id === memberId), [members, memberId]);

  // Calculate default values for selected month
  const financialData = useMemo(() => {
    if (!member) return null;

    const mTransactions = transactions.filter(t => t.memberId === member.id);
    
    // Monthly target based on shares
    const monthlyTarget = member.shares * (settings.shareValue || 0);
    
    // Amount paid for that month
    const paidInMonth = mTransactions
      .filter(t => t.month === selectedMonth && t.year === 2024 && t.type === 'CONTRIBUTION')
      .reduce((sum, t) => sum + t.amount, 0);

    // Deficit for that month
    const deficit = Math.max(0, monthlyTarget - paidInMonth);

    // Some specific fields from the matrix if they match the month
    // This is a simplified mapping for the demo/enterprise look
    let matrixExpected = monthlyTarget;
    let matrixDeficit = deficit;

    // For March/April which have specific fields in the user's request
    if (selectedMonth === 2) { // March
      matrixExpected = member.totalToPayBy10thMarchMidnight || monthlyTarget;
      matrixDeficit = member.marchRepaymentDeficit || deficit;
    } else if (selectedMonth === 3) { // April
      matrixExpected = member.expectedContributionsLoanRepay10thAprilMpesa || monthlyTarget;
      matrixDeficit = member.deficitApril || deficit;
    }

    return {
      expected: matrixExpected,
      paid: paidInMonth,
      deficit: matrixDeficit,
    };
  }, [member, selectedMonth, transactions, settings]);

  // Set custom values when financialData changes or month changes
  React.useEffect(() => {
    if (financialData) {
      setCustomExpected(financialData.expected.toString());
      setCustomDeficit(financialData.deficit.toString());
    }
  }, [financialData]);

  const handleCapture = async () => {
    if (!cardRef.current) return;
    
    setIsCapturing(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        style: {
          borderRadius: '24px',
        }
      });
      
      const link = document.createElement('a');
      link.download = `Tujenge-Snapshot-${member?.memberNumber}-${MONTHS[selectedMonth]}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Financial snapshot generated successfully!');
    } catch (err) {
      console.error('Snapshot error:', err);
      toast.error('Failed to generate snapshot image.');
    } finally {
      setIsCapturing(false);
    }
  };

  if (!member || !financialData) return null;

  const expectedVal = parseFloat(customExpected) || 0;
  const deficitVal = parseFloat(customDeficit) || 0;
  const status = deficitVal > 0 ? 'DEFICIT' : 'CLEAR';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-slate-50/50 border-none shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Share2 className="text-emerald-600" />
            Share Member Snapshot
          </DialogTitle>
          <DialogDescription className="font-medium text-slate-500">
            Generate a professional enterprise-grade financial summary for {member.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <div className="space-y-4 md:col-span-1">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Month</Label>
              <Select 
                value={selectedMonth.toString()} 
                onValueChange={(val) => setSelectedMonth(parseInt(val))}
              >
                <SelectTrigger className="bg-white border-slate-200 rounded-xl font-bold">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, idx) => (
                    <SelectItem key={idx} value={idx.toString()} className="font-bold">
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expected (Ksh)</Label>
              <Input 
                type="number"
                value={customExpected}
                onChange={(e) => setCustomExpected(e.target.value)}
                className="bg-white border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deficit (Ksh)</Label>
              <Input 
                type="number"
                value={customDeficit}
                onChange={(e) => setCustomDeficit(e.target.value)}
                className="bg-white border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div className="pt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-1">
                <TrendingUp size={12} /> Pro Tip
              </p>
              <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                Adjust the expected amount or deficit manually if needed for the snapshot. These changes only apply to this shareable image.
              </p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Live Preview (Enterprise Ledger Style)</Label>
            
            {/* THE SNAPSHOT CARD */}
            <div 
              ref={cardRef}
              className="relative aspect-[4/5] w-full bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col"
              style={{ minHeight: '400px' }}
            >
              {/* BRAND HEADER */}
              <div className="h-32 bg-slate-900 p-8 flex justify-between items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/10 rounded-full -ml-12 -mb-12" />
                
                <div className="relative z-10">
                  <h1 className="text-emerald-400 font-black text-xl tracking-tighter uppercase leading-none">
                    Tujenge<br/><span className="text-white">Savings Circle</span>
                  </h1>
                  <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] mt-2">Enterprise Financial Ledger</p>
                </div>
                
                <div className="text-right z-10">
                  <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-white text-[9px] font-black uppercase tracking-widest backdrop-blur-sm">
                    {MONTHS[selectedMonth]} 2024
                  </span>
                </div>
              </div>

              {/* MEMBER IDENTITY */}
              <div className="px-8 -mt-6 relative z-20">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <Fingerprint size={24} />
                    </div>
                    <div>
                      <h2 className="text-slate-900 font-black text-lg leading-none">{member.name}</h2>
                      <p className="text-slate-400 text-xs font-bold mt-1">MEM ID: {member.memberNumber}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    status === 'CLEAR' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {status}
                  </div>
                </div>
              </div>

              {/* MAIN METRICS */}
              <div className="flex-1 p-8 pt-6 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Expected Payment</p>
                    <p className="text-2xl font-black text-slate-900">{formatCurrency(expectedVal)}</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${status === 'CLEAR' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${status === 'CLEAR' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {status === 'CLEAR' ? 'Surplus / Paid' : 'Current Deficit'}
                    </p>
                    <p className={`text-2xl font-black ${status === 'CLEAR' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {formatCurrency(deficitVal)}
                    </p>
                  </div>
                </div>

                <div className="flex-1 border-t border-dashed border-slate-200 pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500">Statement Date</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">{new Date().toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500">Preferred Method</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">M-PESA (LIPA NA CHAMA)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500">Record Verification</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 uppercase">SYSTEM AUDITED</span>
                    </div>
                  </div>
                </div>

                {/* FOOTER CALL TO ACTION */}
                <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Attention Required</p>
                    <p className="text-[10px] font-bold text-white">Please clear deficits before the 10th</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xs">
                    TC
                  </div>
                </div>
              </div>

              {/* WATERMARK ACCENT */}
              <div className="absolute bottom-0 right-0 p-8 opacity-5">
                <Fingerprint size={120} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-0 bg-white p-6 -mx-6 -mb-6 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} className="rounded-xl font-bold">
            Cancel
          </Button>
          <Button 
            onClick={handleCapture} 
            disabled={isCapturing}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black gap-2"
          >
            {isCapturing ? 'Processing...' : (
              <>
                <Download size={18} />
                Download Snapshot
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}