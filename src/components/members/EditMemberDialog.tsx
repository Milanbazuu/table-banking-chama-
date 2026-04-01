import React, { useState, useEffect } from 'react';
import { useChamaStore } from '../../store/useChamaStore';
import { Member } from '../../types/chama';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calculator, User, Database, History, Landmark, ShieldCheck } from 'lucide-react';

interface EditMemberDialogProps {
  member: Member;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMemberDialog({ member, open, onOpenChange }: EditMemberDialogProps) {
  const { updateMember } = useChamaStore();
  const [formData, setFormData] = useState<Partial<Member>>({ ...member });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({ ...member });
    }
  }, [member, open]);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      // Simulate a small delay for visual feedback of "saving"
      await new Promise(resolve => setTimeout(resolve, 600));
      updateMember(member.id, formData);
      toast.success(`${member.name}'s matrix fields updated successfully!`, {
        description: "The financial matrix has been recalculated.",
        icon: <ShieldCheck className="text-emerald-500" />
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update member records.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof Member, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMonthlyChange = (month: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      monthlyContributions: {
        ...(prev.monthlyContributions || {}),
        [month]: numValue
      }
    }));
  };

  const Field = ({ label, field, type = "number", placeholder }: { label: string, field: keyof Member, type?: string, placeholder?: string }) => (
    <div className="space-y-2.5">
      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.1em] flex justify-between items-center">
        {label}
        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[8px]">ID: {field}</span>
      </Label>
      <Input 
        type={type}
        placeholder={placeholder}
        value={(formData as any)[field] ?? ''} 
        onChange={e => handleChange(field, type === 'number' ? (e.target.value === '' ? 0 : parseFloat(e.target.value)) : e.target.value)}
        className="rounded-2xl border-slate-100 bg-slate-50/50 py-6 font-bold focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0 overflow-hidden bg-white border-none rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.15)] ring-1 ring-slate-100">
        <DialogHeader className="p-10 pb-6 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/20 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                <Database className="text-emerald-400" size={24} />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight">Financial Matrix Adjustment</DialogTitle>
            </div>
            <DialogDescription className="text-slate-400 text-base font-medium leading-relaxed">
              Manually override financial indicators for <span className="text-white font-black underline decoration-emerald-500/50 underline-offset-4">{member.name}</span>. 
              Values entered here directly impact the TUJENGE financial matrix.
            </DialogDescription>
          </div>
        </DialogHeader>

        <Tabs defaultValue="matrix1" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-10 py-4 bg-slate-50 border-b border-slate-100">
            <TabsList className="bg-slate-200/50 p-1.5 rounded-2xl gap-2 h-auto flex-wrap">
              <TabsTrigger value="personal" className="flex-1 min-w-[120px] rounded-xl font-black uppercase text-[9px] tracking-widest px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-emerald-600">
                <User size={14} className="mr-2" /> Identity
              </TabsTrigger>
              <TabsTrigger value="matrix1" className="flex-1 min-w-[120px] rounded-xl font-black uppercase text-[9px] tracking-widest px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-emerald-600">
                <Landmark size={14} className="mr-2" /> Q1 Financials
              </TabsTrigger>
              <TabsTrigger value="matrix2" className="flex-1 min-w-[120px] rounded-xl font-black uppercase text-[9px] tracking-widest px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-emerald-600">
                <Calculator size={14} className="mr-2" /> Q2 Audit
              </TabsTrigger>
              <TabsTrigger value="monthly" className="flex-1 min-w-[120px] rounded-xl font-black uppercase text-[9px] tracking-widest px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-emerald-600">
                <History size={14} className="mr-2" /> Historical
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-10">
            <TabsContent value="personal" className="mt-0 space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="grid grid-cols-2 gap-8">
                <Field label="Full Legal Name" field="name" type="text" />
                <Field label="Member ID" field="memberNumber" type="text" />
                <Field label="Mobile Phone" field="phoneNumber" type="text" />
                <Field label="Investment Units (Shares)" field="shares" />
                <Field label="Registration Fee Amount" field="registrationFee" />
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Audit Verification Status</Label>
                  <select 
                    value={formData.isRegistered ? 'true' : 'false'}
                    onChange={e => handleChange('isRegistered', e.target.value === 'true')}
                    className="w-full h-14 px-8 rounded-2xl border-2 border-slate-50 bg-slate-50/50 text-sm font-black focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                  >
                    <option value="true">VERIFIED & ACTIVE</option>
                    <option value="false">PENDING RECONCILIATION</option>
                  </select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="matrix1" className="mt-0 space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                <Field label="Contrib to Date" field="contributionsToDate" />
                <Field label="Actual Contrib" field="actualContributions" />
                <Field label="Jan loans" field="janLoans" />
                <Field label="Feb target Contribution + Jan loan repayment" field="febTargetContributionJanLoanRepayment" />
                <Field label="Jan Loan + Feb Repay" field="janLoansFebRepaymentBy10th" />
                <Field label="Feb Deficit + Mpesa" field="febDeficitBy10thPlusMpesa" />
                <Field label="Jan Mpesa Charge" field="janMpesaCharge" />
                <Field label="Charge Deficit" field="chargeDeficit" />
                <Field label="Feb Disbursed" field="febDisbursedLoan" />
              </div>
            </TabsContent>

            <TabsContent value="matrix2" className="mt-0 space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                <Field label="Total loans (Jan deficit+ Feb disbursement)" field="totalLoansJanDeficitFebDisbursement" />
                <Field label="Exp March Input" field="expectedMarchContributions" />
                <Field label="Total to pay by 10th March midnight (Mpesa inclusive)" field="totalToPayBy10thMarchMidnight" />
                <Field label="March repayment to date" field="marchRepaymentToDate" />
                <Field label="March repayment Deficit" field="marchRepaymentDeficit" />
                <Field label="April Loans + Deficit" field="aprilLoansDeficitMarch" />
                <Field label="Exp April Total" field="expectedContributionsLoanRepay10thAprilMpesa" />
                <Field label="April Repay Recv" field="aprilRepaymentToDate" />
                <Field label="Final Deficit Apr" field="deficitApril" />
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="mt-0 animate-in fade-in zoom-in-95 duration-300">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map(month => (
                  <div key={month} className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{month} Deposit</Label>
                    <Input 
                      type="number"
                      value={formData.monthlyContributions?.[month as keyof typeof formData.monthlyContributions] || 0} 
                      onChange={e => handleMonthlyChange(month, e.target.value)}
                      className="rounded-xl border-slate-50 bg-slate-50/50 py-5 font-black focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="p-10 pt-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase italic">Changes are persisted to local secure storage.</p>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 border-slate-200 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={isSaving}
              className="rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] h-12 px-10 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center gap-2"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ShieldCheck size={16} />
              )}
              {isSaving ? 'Processing...' : 'Commit Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}