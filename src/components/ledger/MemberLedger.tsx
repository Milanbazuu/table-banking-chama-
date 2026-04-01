import React, { useState } from 'react';
import { ChamaData } from '../../types/chama';
import { getMemberStats } from '../../utils/logic';
export function Ledger({ data }: { data: ChamaData }) {
  const [id, setId] = useState(data.members[0]?.id || '');
  const stats = id ? getMemberStats(id, data) : null;
  return (<div className="space-y-4"><select value={id} onChange={e => setId(e.target.value)}>{data.members.map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}</select>{stats && <div>Contributed: {stats.totalContributed}</div>}</div>);
}