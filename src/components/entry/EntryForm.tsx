import React, { useState } from 'react';
import { ChamaData, Transaction, Loan } from '../../types/chama';
import { toast } from 'sonner';

export function EntryForm({ data, onAdd }: { data: ChamaData, onAdd: (tx: Transaction, loan?: Loan) => void }) {
  const [rows, setRows] = useState<any[]>([{ id: '1', memberId: '', type: 'CONTRIBUTION', amount: '', date: '2024-01-01' }]);
  
  const submit = () => { 
    rows.forEach(r => { 
      if (r.memberId) {
        const d = new Date(r.date);
        onAdd({ 
          id: Math.random().toString(), 
          memberId: r.memberId, 
          amount: parseFloat(r.amount), 
          type: r.type as any, 
          date: r.date,
          month: d.getMonth() + 1,
          year: d.getFullYear()
        }, undefined); 
      }
    }); 
    toast.success('Saved'); 
  };
  
  return (
    <div className="bg-white p-8 rounded-2xl">
      <button onClick={() => setRows([...rows, {id: Math.random().toString(), memberId: '', type: 'CONTRIBUTION', amount: '', date: '2024-01-01'}])}>
        Add Row
      </button>
      <button onClick={submit} className="ml-4">
        Save All
      </button>
      <table className="w-full mt-4">
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>
                <select 
                  value={r.memberId} 
                  onChange={e => setRows(rows.map(x => x.id === r.id ? {...x, memberId: e.target.value} : x))}
                >
                  <option value="">Select Member</option>
                  {data.members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </td>
              <td>
                <input 
                  type="number" 
                  value={r.amount} 
                  onChange={e => setRows(rows.map(x => x.id === r.id ? {...x, amount: e.target.value} : x))} 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}