import React, { useState } from 'react';
import { useChamaStore } from '../../store/useChamaStore';
import { formatCurrency } from '../../lib/utils';
import { 
  Smartphone, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentModule({ memberId }: { memberId: string }) {
  const { members, allocateMpesaPayment } = useChamaStore();
  const member = members.find(m => m.id === memberId);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'options' | 'input' | 'processing' | 'success'>('options');
  const [method, setMethod] = useState<'MPESA' | 'CARD' | null>(null);

  if (!member) return null;

  const handleInitiate = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setStep('processing');
    
    // Simulate M-Pesa Push
    setTimeout(() => {
      const amt = parseFloat(amount);
      const ref = 'MP' + Math.random().toString(36).substring(7).toUpperCase();
      
      allocateMpesaPayment({
        memberId,
        amount: amt,
        reference: ref,
        date: new Date().toISOString()
      });
      
      setStep('success');
      toast.success('Payment Received Successfully!');
    }, 2500);
  };

  if (step === 'processing') {
    return (
      <div className="bg-white rounded-[2.5rem] p-16 shadow-xl border border-slate-100 flex flex-col items-center justify-center text-center">
         <div className="relative mb-10">
            <div className="w-24 h-24 border-4 border-slate-100 rounded-full animate-spin border-t-emerald-600" />
            <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
               <Smartphone size={32} />
            </div>
         </div>
         <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">Requesting Payment...</h2>
         <p className="text-slate-500 font-bold mb-2">Check your phone for the M-Pesa PIN prompt.</p>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Waiting for transaction confirmation</p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="bg-white rounded-[2.5rem] p-16 shadow-xl border border-slate-100 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-50">
           <CheckCircle2 size={48} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 uppercase">Payment Success!</h2>
        <p className="text-slate-500 font-bold mb-10 max-w-sm mx-auto">
          Your payment of <span className="text-emerald-600 font-black">{formatCurrency(parseFloat(amount))}</span> has been verified and allocated to your account.
        </p>
        <button 
          onClick={() => {
            setStep('options');
            setAmount('');
          }}
          className="bg-slate-900 text-white px-12 py-5 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          Make Another Payment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-10 md:p-16">
          <div className="flex items-center gap-4 mb-12">
             <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Zap size={28} />
             </div>
             <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">DIRECT PAYMENT</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instant contribution & loan repayment</p>
             </div>
          </div>

          {step === 'options' ? (
            <div className="space-y-8">
               <p className="text-sm font-bold text-slate-500">Choose your preferred payment method to proceed:</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <button 
                  onClick={() => { setMethod('MPESA'); setStep('input'); }}
                  className="p-8 rounded-[2rem] border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group text-left"
                 >
                    <div className="flex items-center justify-between mb-6">
                       <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                          <Smartphone size={24} />
                       </div>
                       <ArrowRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">M-PESA Direct</h3>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed">Pay instantly via Safaricom M-Pesa. Auto-allocated to your dues.</p>
                 </button>

                 <button 
                  onClick={() => toast.info('Card payments are currently undergoing maintenance.')}
                  className="p-8 rounded-[2rem] border-2 border-slate-100 hover:border-slate-300 transition-all group text-left opacity-60"
                 >
                    <div className="flex items-center justify-between mb-6">
                       <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl">
                          <CreditCard size={24} />
                       </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Bank / Card</h3>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed">Use VISA or Mastercard. (Feature coming soon)</p>
                 </button>
               </div>
               
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                  <ShieldCheck className="text-emerald-500" size={24} />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure 256-bit encrypted transactions</p>
               </div>
            </div>
          ) : (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount to Pay (KES)</label>
                 <div className="relative">
                   <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">KES</span>
                   <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-[2rem] pl-20 pr-8 py-6 text-3xl font-black text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-200"
                    autoFocus
                   />
                 </div>
               </div>

               <div className="grid grid-cols-3 gap-4">
                  {[2000, 5000, 10000].map(val => (
                    <button 
                      key={val}
                      onClick={() => setAmount(val.toString())}
                      className="py-4 bg-slate-50 rounded-2xl text-xs font-black text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors border-2 border-transparent hover:border-emerald-200"
                    >
                      KES {val.toLocaleString()}
                    </button>
                  ))}
               </div>

               <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                  <Info className="text-amber-600 mt-1 shrink-0" size={18} />
                  <p className="text-xs font-bold text-amber-800 leading-relaxed">
                    By clicking "Pay Now", an M-Pesa STK push will be sent to <span className="font-black">{member.phoneNumber}</span>. 
                    Please ensure your phone is unlocked.
                  </p>
               </div>

               <div className="flex flex-col md:flex-row gap-4">
                 <button 
                  onClick={() => setStep('options')}
                  className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-400 hover:bg-slate-50 transition-colors"
                 >
                    Back
                 </button>
                 <button 
                  onClick={handleInitiate}
                  className="flex-[2] bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all active:scale-95"
                 >
                    Pay Now with M-Pesa
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}