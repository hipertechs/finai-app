
import React, { useState } from 'react';
import { Goal } from '../types';
import { X, Plus, Trash2, Target, Calendar, DollarSign } from 'lucide-react';

interface GoalManagerProps {
  goals: Goal[];
  onAdd: (goal: Omit<Goal, 'id'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, currentAmount: number) => void;
  onClose: () => void;
}

const GoalManager: React.FC<GoalManagerProps> = ({ goals, onAdd, onDelete, onUpdate, onClose }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleAdd = () => {
    if (!name || !targetAmount || !deadline) return;
    onAdd({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      deadline,
      iconName: 'Target',
      color: 'text-indigo-500'
    });
    setName('');
    setTargetAmount('');
    setDeadline('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-emerald-600 text-white">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <h2 className="text-xl font-bold">Minhas Metas</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border dark:border-slate-700">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nova Meta</p>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Objetivo (ex: Viagem, Carro)"
                className="w-full px-4 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-900 text-sm font-semibold outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number" 
                  placeholder="Valor Alvo"
                  className="px-4 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-900 text-sm font-bold outline-none"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
                <input 
                  type="date" 
                  className="px-4 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-900 text-sm font-semibold outline-none"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <button 
                onClick={handleAdd}
                className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Criar Meta
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Em andamento</p>
            {goals.map(goal => {
              const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
              return (
                <div key={goal.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 space-y-3 group transition-all hover:border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{goal.name}</p>
                        <p className="text-[10px] text-slate-400">Até {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <button onClick={() => onDelete(goal.id)} className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.currentAmount)}
                        <span className="text-slate-400 font-normal ml-1">de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(goal.targetAmount)}</span>
                      </p>
                      <p className="text-[10px] font-black text-emerald-600">{Math.round(progress)}%</p>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Adicionar valor..."
                      className="flex-1 px-3 py-1.5 rounded-lg border dark:border-slate-600 dark:bg-slate-900 text-xs outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = parseFloat((e.target as HTMLInputElement).value);
                          if (!isNaN(val)) {
                            onUpdate(goal.id, goal.currentAmount + val);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <div className="px-2 py-1.5 bg-slate-50 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalManager;
