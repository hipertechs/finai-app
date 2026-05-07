import React, { useState, useMemo } from 'react';
import { Debt } from '../types';
import { Tag, Plus, Target, TrendingDown, ArrowUpRight, ShieldCheck, XCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { dataService } from '../services/dataService';

interface DebtsDashboardProps {
  darkMode: boolean;
  debts: Debt[];
  setDebts: React.Dispatch<React.SetStateAction<Debt[]>>;
}

const DebtsDashboard: React.FC<DebtsDashboardProps> = ({ darkMode, debts, setDebts }) => {
  const [strategy, setStrategy] = useState<'SNOWBALL' | 'AVALANCHE'>('AVALANCHE');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newDebt, setNewDebt] = useState<Partial<Debt>>({
    name: '',
    creditor: '',
    balance: 0,
    interestRate: 0,
    minimumPayment: 0,
    dueDate: 1,
  });

  const totalDebt = useMemo(() => debts.reduce((acc, d) => acc + d.balance, 0), [debts]);
  const totalMinPayment = useMemo(() => debts.reduce((acc, d) => acc + d.minimumPayment, 0), [debts]);

  const orderedDebts = useMemo(() => {
    const list = [...debts];
    if (strategy === 'SNOWBALL') {
      return list.sort((a, b) => a.balance - b.balance);
    } else {
      return list.sort((a, b) => b.interestRate - a.interestRate);
    }
  }, [debts, strategy]);

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.balance || !newDebt.minimumPayment) return;
    
    const d: Omit<Debt, 'id'> = {
      name: newDebt.name!,
      creditor: newDebt.creditor || '',
      balance: Number(newDebt.balance),
      interestRate: Number(newDebt.interestRate) || 0,
      minimumPayment: Number(newDebt.minimumPayment),
      dueDate: Number(newDebt.dueDate) || 1,
    };

    const savedDebt = await dataService.saveDebt(d);
    if (savedDebt) {
      setDebts(prev => [...prev, savedDebt]);
      setShowAddForm(false);
      setNewDebt({ name: '', creditor: '', balance: 0, interestRate: 0, minimumPayment: 0, dueDate: 1 });
    }
  };

  const handleDelete = async (id: string) => {
    await dataService.deleteDebt(id);
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  // Mock Forecast
  const forecastData = useMemo(() => {
    let currentBalance = totalDebt;
    const payment = Math.max(totalMinPayment, totalDebt * 0.05); // Assume at least 5% or min payment
    const data = [];
    const today = new Date();
    
    for (let i = 0; i <= 12; i++) {
      const futureDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      data.push({
        month: futureDate.toISOString().substring(0, 7),
        balance: Math.max(0, currentBalance),
      });
      currentBalance -= payment;
      if (currentBalance < 0) currentBalance = 0;
    }
    return data;
  }, [totalDebt, totalMinPayment]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Controle de Dívidas</h2>
          <p className="text-slate-500 font-medium">Plano estratégico para sua liberdade financeira.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Adicionar Dívida
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-[2rem] border relative overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
              <TrendingDown className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dívida Total</p>
            <h3 className="text-3xl font-black mb-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDebt)}</h3>
          </div>
        </div>

        <div className={`p-6 rounded-[2rem] border relative overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pagamento Mínimo (Mês)</p>
            <h3 className="text-3xl font-black mb-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalMinPayment)}</h3>
          </div>
        </div>

        <div className={`p-6 rounded-[2rem] border relative overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estratégia Atual</p>
            <select 
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as any)}
              className={`text-xl font-black bg-transparent outline-none cursor-pointer ${darkMode ? 'text-white' : 'text-slate-900'}`}
            >
              <option value="AVALANCHE">Avalanche</option>
              <option value="SNOWBALL">Bola de Neve</option>
            </select>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {strategy === 'AVALANCHE' ? 'Foco nas maiores taxas de juros (mais econômico).' : 'Foco nos menores saldos (vitórias rápidas).'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className={`p-6 rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Tag className="w-5 h-5 text-rose-500" /> Suas Dívidas (Ordem de Pagamento)</h3>
            
            {orderedDebts.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Nenhuma dívida registrada. Parabéns!</p>
            ) : (
              <div className="space-y-3">
                {orderedDebts.map((debt, index) => (
                  <div key={debt.id} className={`p-4 rounded-2xl border flex items-center justify-between ${index === 0 ? (darkMode ? 'bg-rose-900/20 border-rose-500/30' : 'bg-rose-50 border-rose-200') : (darkMode ? 'border-slate-800' : 'border-slate-100')}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold">{debt.name} <span className="text-xs font-normal text-slate-500">({debt.creditor})</span></p>
                        <p className="text-xs font-medium text-slate-500">Juros: {debt.interestRate}% ao ano | Venc: dia {debt.dueDate}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="font-black text-rose-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(debt.balance)}</p>
                        <p className="text-xs font-medium text-slate-500">Min: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(debt.minimumPayment)}</p>
                      </div>
                      <button onClick={() => handleDelete(debt.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`p-6 rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ArrowUpRight className="w-5 h-5 text-indigo-500" /> Projeção de Quitação</h3>
          <p className="text-sm text-slate-500 font-medium mb-6">Simulação de redução do saldo devedor assumindo pagamentos mensais baseados no mínimo configurado.</p>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(val) => new Date(val + '-01').toLocaleDateString('pt-BR', { month: 'short' })} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val), 'Saldo Devedor']}
                />
                <Area type="monotone" dataKey="balance" stroke="#e11d48" fillOpacity={1} fill="url(#colorDebt)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-6 rounded-[2rem] shadow-2xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <h3 className="text-xl font-bold mb-6">Adicionar Dívida</h3>
            <form onSubmit={handleAddDebt} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Nome da Dívida</label>
                <input required type="text" value={newDebt.name} onChange={e => setNewDebt({ ...newDebt, name: e.target.value })} className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} placeholder="Ex: Financiamento Carro" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Credor</label>
                  <input type="text" value={newDebt.creditor} onChange={e => setNewDebt({ ...newDebt, creditor: e.target.value })} className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} placeholder="Ex: Banco Itaú" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Dia do Venc.</label>
                  <input required type="number" min="1" max="31" value={newDebt.dueDate} onChange={e => setNewDebt({ ...newDebt, dueDate: Number(e.target.value) })} className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Saldo Devedor Atual (R$)</label>
                <input required type="number" step="0.01" value={newDebt.balance || ''} onChange={e => setNewDebt({ ...newDebt, balance: Number(e.target.value) })} className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} placeholder="0,00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Taxa de Juros (% a.a.)</label>
                  <input required type="number" step="0.1" value={newDebt.interestRate || ''} onChange={e => setNewDebt({ ...newDebt, interestRate: Number(e.target.value) })} className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} placeholder="0,0" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Pagamento Mín. (R$)</label>
                  <input required type="number" step="0.01" value={newDebt.minimumPayment || ''} onChange={e => setNewDebt({ ...newDebt, minimumPayment: Number(e.target.value) })} className={`w-full p-3 rounded-xl border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} placeholder="0,00" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddForm(false)} className={`flex-1 py-3 rounded-xl font-bold ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white">Salvar Dívida</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtsDashboard;
