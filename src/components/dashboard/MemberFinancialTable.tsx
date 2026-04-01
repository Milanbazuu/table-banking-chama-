import React, { useMemo } from 'react';
import { useChamaStore } from '../../store/useChamaStore';
import { formatCurrency } from '../../lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableFooter
} from '../ui/table';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Edit3, Eye, Search, AlertCircle, FileDown, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { ShareMemberSnapshot } from '../admin/ShareMemberSnapshot';

interface MemberFinancialTableProps {
  onEditMember?: (id: string) => void;
  onViewMember?: (id: string) => void;
}

export function MemberFinancialTable({ onEditMember, onViewMember }: MemberFinancialTableProps) {
  const { members, transactions, settings } = useChamaStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sharingMemberId, setSharingMemberId] = React.useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.memberNumber.includes(searchTerm)
    );
  }, [members, searchTerm]);

  const reportData = useMemo(() => {
    return filteredMembers.map(member => {
      const mTransactions = transactions.filter(t => t.memberId === member.id);
      
      const getMonthTotal = (monthIndex: number) => {
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;
        const monthKey = months[monthIndex];
        
        if (member.monthlyContributions && member.monthlyContributions[monthKey] !== undefined && member.monthlyContributions[monthKey] !== 0) {
          return member.monthlyContributions[monthKey] || 0;
        }
        
        return mTransactions
          .filter(t => t.month === monthIndex && t.year === 2024 && t.type === 'CONTRIBUTION')
          .reduce((sum, t) => sum + t.amount, 0);
      };

      const monthlyContribTarget = member.shares * (settings.shareValue || 0);
      const jan = getMonthTotal(0);
      const feb = getMonthTotal(1);
      const mar = getMonthTotal(2);
      const apr = getMonthTotal(3);
      const may = getMonthTotal(4);
      const jun = getMonthTotal(5);
      const jul = getMonthTotal(6);
      const aug = getMonthTotal(7);
      const sep = getMonthTotal(8);
      const oct = getMonthTotal(9);
      const nov = getMonthTotal(10);
      const dec = getMonthTotal(11);

      const totalPaidContributions = [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec].reduce((a, b) => a + b, 0);

      return {
        ...member,
        regFee: member.registrationFee !== undefined ? member.registrationFee : settings.registrationFee,
        shares: member.shares,
        contributionsToDate: member.contributionsToDate || totalPaidContributions,
        actualContributions: member.actualContributions || 0,
        target: monthlyContribTarget,
        jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec,
        janLoans: member.janLoans ?? 0,
        febTarget: member.febTargetContributionJanLoanRepayment ?? 0,
        janLoansFebRepay: member.janLoansFebRepaymentBy10th ?? 0,
        febDeficit: member.febDeficitBy10thPlusMpesa ?? 0,
        janMpesa: member.janMpesaCharge ?? 0,
        chargeDeficit: member.chargeDeficit ?? 0,
        febDisbursed: member.febDisbursedLoan ?? 0,
        totalLoansFeb: member.totalLoansJanDeficitFebDisbursement ?? 0,
        expectedMarch: member.expectedMarchContributions ?? 0,
        totalToPayMarch: member.totalToPayBy10thMarchMidnight ?? 0,
        marchRepay: member.marchRepaymentToDate ?? 0,
        marchDeficit: member.marchRepaymentDeficit ?? 0,
        aprilLoansDeficit: member.aprilLoansDeficitMarch ?? 0,
        expectedApril: member.expectedContributionsLoanRepay10thAprilMpesa ?? 0,
        aprilRepay: member.aprilRepaymentToDate ?? 0,
        deficitApril: member.deficitApril ?? 0
      };
    });
  }, [filteredMembers, transactions, settings]);

  const handleDownloadCSV = () => {
    if (reportData.length === 0) {
      toast.error('No data available to export');
      return;
    }

    const headers = [
      'Name', 'Member #', 'Shares', 'Total Contrib', 'Jan', 'Feb', 'Mar', 'Apr', 
      'Jan loans', 'Feb target Contribution + Jan loan repayment', 'Total to pay by 10th March midnight (Mpesa inclusive)', 'March repayment to date', 'March repayment Deficit', 'Total loans (Jan deficit+ Feb disbursement)'
    ];
    
    const rows = reportData.map(r => [
      `"${r.name}"`, r.memberNumber, r.shares, r.contributionsToDate, 
      r.jan, r.feb, r.mar, r.apr,
      r.janLoans, r.febTarget, r.totalToPayMarch, r.marchRepay, r.marchDeficit, r.totalLoansFeb
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join(String.fromCharCode(10));
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'tujenge-financial-matrix.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Matrix exported as CSV');
  };

  const totals = useMemo(() => {
    return reportData.reduce((acc, row) => ({
      regFee: acc.regFee + (row.regFee || 0),
      shares: acc.shares + (row.shares || 0),
      contributionsToDate: acc.contributionsToDate + (row.contributionsToDate || 0),
      actualContributions: acc.actualContributions + (row.actualContributions || 0),
      jan: acc.jan + row.jan,
      feb: acc.feb + row.feb,
      mar: acc.mar + row.mar,
      apr: acc.apr + row.apr,
      may: acc.may + row.may,
      jun: acc.jun + row.jun,
      jul: acc.jul + row.jul,
      aug: acc.aug + row.aug,
      sep: acc.sep + row.sep,
      oct: acc.oct + row.oct,
      nov: acc.nov + row.nov,
      dec: acc.dec + row.dec,
      janLoans: acc.janLoans + row.janLoans,
      febTarget: acc.febTarget + row.febTarget,
      janLoansFebRepay: acc.janLoansFebRepay + row.janLoansFebRepay,
      febDeficit: acc.febDeficit + row.febDeficit,
      janMpesa: acc.janMpesa + row.janMpesa,
      chargeDeficit: acc.chargeDeficit + row.chargeDeficit,
      febDisbursed: acc.febDisbursed + row.febDisbursed,
      totalLoansFeb: acc.totalLoansFeb + row.totalLoansFeb,
      expectedMarch: acc.expectedMarch + row.expectedMarch,
      totalToPayMarch: acc.totalToPayMarch + row.totalToPayMarch,
      marchRepay: acc.marchRepay + row.marchRepay,
      marchDeficit: acc.marchDeficit + row.marchDeficit,
      aprilLoansDeficit: acc.aprilLoansDeficit + row.aprilLoansDeficit,
      expectedApril: acc.expectedApril + row.expectedApril,
      aprilRepay: acc.aprilRepay + row.aprilRepay,
      deficitApril: acc.deficitApril + row.deficitApril,
    }), {
      regFee: 0, shares: 0, contributionsToDate: 0, actualContributions: 0,
      jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
      janLoans: 0, febTarget: 0, janLoansFebRepay: 0, febDeficit: 0, janMpesa: 0, chargeDeficit: 0,
      febDisbursed: 0, totalLoansFeb: 0, expectedMarch: 0, totalToPayMarch: 0, marchRepay: 0,
      marchDeficit: 0, aprilLoansDeficit: 0, expectedApril: 0, aprilRepay: 0, deficitApril: 0
    });
  }, [reportData]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'dec'];

  return (
    <Card className="border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
      <CardHeader className="px-8 py-8 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Tujenge Savings Financial Matrix</CardTitle>
            <p className="text-slate-500 font-medium text-sm">
              Comprehensive ledger of all member allocations and period-end balances.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg"
            >
              <FileDown size={16} />
              Export CSV
            </button>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="overflow-x-auto">
            <Table className="min-w-[4200px]">
              <TableHeader>
                <TableRow className="bg-slate-100/50 hover:bg-slate-100/50">
                  <TableHead className="min-w-[320px] font-black text-slate-900 border-r sticky left-0 bg-slate-50 z-40 text-[10px] uppercase tracking-wider py-6 px-8">
                    Member Name & Actions
                  </TableHead>
                  <TableHead className="text-[10px] font-black text-slate-500 uppercase px-6">Member #</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-500 uppercase px-6">Reg Fee</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-500 uppercase px-6 text-center">Shares</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-500 uppercase px-6">Contrib To Date</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-500 uppercase px-6">Actual Contrib</TableHead>
                  
                  {monthNames.map(m => (
                    <TableHead key={m} className="text-[10px] font-black text-emerald-600 uppercase px-6 text-center bg-emerald-50/30">{m} Contrib</TableHead>
                  ))}

                  {/* USER REQUESTED COLUMNS START */}
                  <TableHead className="text-[10px] font-black text-rose-600 uppercase px-6 border-l-2 border-slate-200 bg-rose-50/30">Jan loans</TableHead>
                  <TableHead className="text-[10px] font-black text-rose-600 uppercase px-6 bg-rose-50/30">Feb target Contribution + Jan loan repayment</TableHead>
                  
                  {/* OTHER COLUMNS */}
                  <TableHead className="text-[10px] font-black text-rose-600 uppercase px-6 bg-rose-50/30">Jan Loan + Feb Repay</TableHead>
                  <TableHead className="text-[10px] font-black text-rose-600 uppercase px-6 font-black bg-rose-100/50">Feb Deficit + Mpesa</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-600 uppercase px-6">Jan Mpesa</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-600 uppercase px-6">Charge Deficit</TableHead>
                  <TableHead className="text-[10px] font-black text-rose-600 uppercase px-6 bg-rose-50/30">Feb Disbursed</TableHead>
                  
                  {/* USER REQUESTED COLUMNS CONTINUED */}
                  <TableHead className="text-[10px] font-black text-rose-600 uppercase px-6 bg-rose-50/30 font-black">Total loans (Jan deficit+ Feb disbursement)</TableHead>
                  <TableHead className="text-[10px] font-black text-emerald-600 uppercase px-6 bg-emerald-50/30">Exp Mar Contrib</TableHead>
                  <TableHead className="text-[10px] font-black text-rose-600 uppercase px-6 bg-rose-50/30 font-black">Total to pay by 10th March midnight (Mpesa inclusive)</TableHead>
                  <TableHead className="text-[10px] font-black text-emerald-600 uppercase px-6 bg-emerald-50/30">March repayment to date</TableHead>
                  <TableHead className="text-[10px] font-black text-rose-600 uppercase px-6 bg-rose-100/50 font-black">March repayment Deficit</TableHead>
                  
                  <TableHead className="text-[10px] font-black text-rose-600 uppercase px-6 bg-rose-50/30">Apr Loans + Deficit</TableHead>
                  <TableHead className="text-[10px] font-black text-emerald-600 uppercase px-6 bg-emerald-50/30 font-black">Exp Apr Total</TableHead>
                  <TableHead className="text-[10px] font-black text-emerald-600 uppercase px-6 bg-emerald-50/30">Apr Repay</TableHead>
                  <TableHead className="text-[10px] font-black text-rose-700 uppercase px-6 bg-rose-200/50 font-black">Deficit April</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={40} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                        <AlertCircle size={48} strokeWidth={1} />
                        <p className="font-black uppercase text-xs tracking-widest">No matching records found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reportData.map((row) => (
                    <TableRow key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                      <TableCell className="font-black text-slate-900 border-r sticky left-0 bg-white z-30 group-hover:bg-slate-50 transition-colors text-sm py-5 px-8 flex items-center justify-between">
                        <span className="truncate max-w-[120px]">{row.name}</span>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button 
                            onClick={() => onEditMember?.(row.id)}
                            title="Edit Member"
                            className="p-2 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"
                          >
                            <Edit3 size={14} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => onViewMember?.(row.id)}
                            title="View Details"
                            className="p-2 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"
                          >
                            <Eye size={14} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => setSharingMemberId(row.id)}
                            title="Share Financial Snapshot"
                            className="p-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl text-emerald-600 transition-all shadow-sm"
                          >
                            <Share2 size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 text-xs font-mono font-bold text-slate-500">{row.memberNumber}</TableCell>
                      <TableCell className="px-6 text-xs font-bold text-slate-700">{formatCurrency(row.regFee)}</TableCell>
                      <TableCell className="px-6 text-xs font-black text-center text-emerald-600">{row.shares}</TableCell>
                      <TableCell className="px-6 text-xs font-black text-slate-900">{formatCurrency(row.contributionsToDate)}</TableCell>
                      <TableCell className="px-6 text-xs font-bold text-emerald-600">{formatCurrency(row.actualContributions)}</TableCell>
                      
                      {[row.jan, row.feb, row.mar, row.apr, row.may, row.jun, row.jul, row.aug, row.sep, row.oct, row.nov, row.dec].map((val, i) => (
                        <TableCell key={i} className="px-6 text-xs font-bold text-center text-slate-600 bg-emerald-50/10">
                          {val > 0 ? formatCurrency(val) : <span className="text-slate-300">-</span>}
                        </TableCell>
                      ))}

                      <TableCell className="px-6 text-xs font-bold text-rose-600 bg-rose-50/20">{formatCurrency(row.janLoans)}</TableCell>
                      <TableCell className="px-6 text-xs font-bold text-rose-600 bg-rose-50/20">{formatCurrency(row.febTarget)}</TableCell>
                      <TableCell className="px-6 text-xs font-bold text-rose-600 bg-rose-50/20">{formatCurrency(row.janLoansFebRepay)}</TableCell>
                      <TableCell className="px-6 text-xs font-black text-rose-700 bg-rose-100/40">{formatCurrency(row.febDeficit)}</TableCell>
                      <TableCell className="px-6 text-xs font-medium text-slate-500">{formatCurrency(row.janMpesa)}</TableCell>
                      <TableCell className="px-6 text-xs font-medium text-slate-500">{formatCurrency(row.chargeDeficit)}</TableCell>
                      <TableCell className="px-6 text-xs font-bold text-rose-600 bg-rose-50/20">{formatCurrency(row.febDisbursed)}</TableCell>
                      <TableCell className="px-6 text-xs font-black text-rose-700 bg-rose-50/20">{formatCurrency(row.totalLoansFeb)}</TableCell>
                      <TableCell className="px-6 text-xs font-bold text-emerald-600 bg-emerald-50/20">{formatCurrency(row.expectedMarch)}</TableCell>
                      <TableCell className="px-6 text-xs font-black text-rose-700 bg-rose-50/20">{formatCurrency(row.totalToPayMarch)}</TableCell>
                      <TableCell className="px-6 text-xs font-bold text-emerald-600 bg-emerald-50/20">{formatCurrency(row.marchRepay)}</TableCell>
                      <TableCell className="px-6 text-xs font-black text-rose-700 bg-rose-100/40">{formatCurrency(row.marchDeficit)}</TableCell>
                      <TableCell className="px-6 text-xs font-bold text-rose-600 bg-rose-50/20">{formatCurrency(row.aprilLoansDeficit)}</TableCell>
                      <TableCell className="px-6 text-xs font-black text-emerald-700 bg-emerald-50/40">{formatCurrency(row.expectedApril)}</TableCell>
                      <TableCell className="px-6 text-xs font-bold text-emerald-600 bg-emerald-50/20">{formatCurrency(row.aprilRepay)}</TableCell>
                      <TableCell className="px-6 text-sm font-black text-rose-800 bg-rose-200/40">{formatCurrency(row.deficitApril)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-slate-900 hover:bg-slate-900 text-white font-black">
                  <TableCell className="sticky left-0 bg-slate-900 z-50 border-r border-slate-700 text-[10px] uppercase tracking-widest py-8 px-8">Grand Totals Matrix</TableCell>
                  <TableCell className="px-6"></TableCell>
                  <TableCell className="px-6 text-xs">{formatCurrency(totals.regFee)}</TableCell>
                  <TableCell className="px-6 text-xs text-center">{totals.shares}</TableCell>
                  <TableCell className="px-6 text-xs">{formatCurrency(totals.contributionsToDate)}</TableCell>
                  <TableCell className="px-6 text-xs text-emerald-400">{formatCurrency(totals.actualContributions)}</TableCell>
                  
                  {[totals.jan, totals.feb, totals.mar, totals.apr, totals.may, totals.jun, totals.jul, totals.aug, totals.sep, totals.oct, totals.nov, totals.dec].map((val, i) => (
                    <TableCell key={i} className="px-6 text-xs text-center text-emerald-300">{formatCurrency(val)}</TableCell>
                  ))}

                  <TableCell className="px-6 text-xs border-l-2 border-slate-700">{formatCurrency(totals.janLoans)}</TableCell>
                  <TableCell className="px-6 text-xs">{formatCurrency(totals.febTarget)}</TableCell>
                  <TableCell className="px-6 text-xs">{formatCurrency(totals.janLoansFebRepay)}</TableCell>
                  <TableCell className="px-6 text-xs text-rose-300">{formatCurrency(totals.febDeficit)}</TableCell>
                  <TableCell className="px-6 text-xs text-slate-400">{formatCurrency(totals.janMpesa)}</TableCell>
                  <TableCell className="px-6 text-xs text-slate-400">{formatCurrency(totals.chargeDeficit)}</TableCell>
                  <TableCell className="px-6 text-xs text-rose-300">{formatCurrency(totals.febDisbursed)}</TableCell>
                  <TableCell className="px-6 text-xs text-rose-300">{formatCurrency(totals.totalLoansFeb)}</TableCell>
                  <TableCell className="px-6 text-xs text-emerald-300">{formatCurrency(totals.expectedMarch)}</TableCell>
                  <TableCell className="px-6 text-xs text-rose-300">{formatCurrency(totals.totalToPayMarch)}</TableCell>
                  <TableCell className="px-6 text-xs text-emerald-400">{formatCurrency(totals.marchRepay)}</TableCell>
                  <TableCell className="px-6 text-xs text-rose-300">{formatCurrency(totals.marchDeficit)}</TableCell>
                  <TableCell className="px-6 text-xs text-rose-300">{formatCurrency(totals.aprilLoansDeficit)}</TableCell>
                  <TableCell className="px-6 text-xs text-emerald-300">{formatCurrency(totals.expectedApril)}</TableCell>
                  <TableCell className="px-6 text-xs text-emerald-400">{formatCurrency(totals.aprilRepay)}</TableCell>
                  <TableCell className="px-6 text-base text-rose-400">{formatCurrency(totals.deficitApril)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>

      <ShareMemberSnapshot 
        memberId={sharingMemberId}
        isOpen={!!sharingMemberId}
        onClose={() => setSharingMemberId(null)}
      />
    </Card>
  );
}