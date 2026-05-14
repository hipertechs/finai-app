
import React, { useState } from 'react';
import { Budget, CategoryInfo, Transaction } from '../types';
import { X, Plus, Trash2, Target } from 'lucide-react';

interface BudgetManagerProps {
  budgets: Budget[];
  categories: CategoryInfo[];
  transactions: Transaction[];
  onAdd: (budget: Omit<Budget, 'id'>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ budgets, categories, transactions, onAdd, onDelete, onClose }) => {
  const [newCategory, setNewCategory] = useState(categories[0]?.name || '');
  const [newLimit, setNewLimit] = useState('');

  const handleAdd = () => {
    if (!newLimit || parseFloat(newLimit) <= 0) return;
    onAdd({
      category: newCategory,
      limit: parseFloat(newLimit),
      period: 'MONTHLY'
    });
    setNewLimit('');
  };

  const getSpentForCategory = (category: string) => {
    return transactions
      .filter(t => t.category === category && t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md shadow-2xl border dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Orçamentos</h2>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Controle de Gastos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Adicionar Novo Orçamento */}
          <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border dark:border-slate-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Definir Novo Limite</p>
            <div className="space-y-3">
              <select 
                className="w-full px-4 py-3 rounded-xl border dark:border-slate-700 dark:bg-slate-900 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Limite Mensal (R$)"
                  className="flex-1 px-4 py-3 rounded-xl border dark:border-slate-700 dark:bg-slate-900 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                />
                <button 
                  onClick={handleAdd}
                  className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-600/20"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Orçamentos */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seu Progresso</p>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Mensal</span>
            </div>
            
            {budgets.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed dark:border-slate-800 rounded-[2rem]">
                <Target className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Nenhum orçamento definido</p>
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.map(budget => {
                  const spent = getSpentForCategory(budget.category);
                  const percent = Math.min((spent / budget.limit) * 100, 100);
                  const isOver = spent > budget.limit;
                  
                  let progressColor = 'bg-emerald-500';
                  if (percent > 90) progressColor = 'bg-rose-500';
                  else if (percent > 70) progressColor = 'bg-amber-500';

                  return (
                    <div key={budget.id} className="p-5 bg-white dark:bg-slate-800/30 rounded-3xl border dark:border-slate-800 hover:border-indigo-500/30 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-black tracking-tight">{budget.category}</p>
                          <p className={`text-[10px] font-bold uppercase ${isOver ? 'text-rose-500' : 'text-slate-400'}`}>
                            {isOver ? 'Limite Excedido' : `${percent.toFixed(0)}% consumido`}
                          </p>
                        </div>
                        <button 
                          onClick={() => onDelete(budget.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${progressColor} transition-all duration-500 ease-out rounded-full shadow-sm`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-black tracking-tight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(spent)}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">
                            de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.limit)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;
