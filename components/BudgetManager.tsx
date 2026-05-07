
import React, { useState } from 'react';
import { Budget, CategoryInfo } from '../types';
import { X, Plus, Trash2, Target } from 'lucide-react';

interface BudgetManagerProps {
  budgets: Budget[];
  categories: CategoryInfo[];
  onAdd: (budget: Omit<Budget, 'id'>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ budgets, categories, onAdd, onDelete, onClose }) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <h2 className="text-xl font-bold">Gerenciar Orçamentos</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Adicionar Novo Orçamento */}
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border dark:border-slate-700">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Novo Limite Mensal</p>
            <div className="flex flex-col gap-3">
              <select 
                className="w-full px-4 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-900 text-sm font-semibold outline-none"
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
                  placeholder="Limite (R$)"
                  className="flex-1 px-4 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-900 text-sm font-bold outline-none"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                />
                <button 
                  onClick={handleAdd}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Orçamentos */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Orçamentos Ativos</p>
            {budgets.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm italic">Nenhum orçamento definido.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {budgets.map(budget => (
                  <div key={budget.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 hover:border-indigo-200 transition-all group">
                    <div>
                      <p className="text-sm font-bold">{budget.category}</p>
                      <p className="text-xs text-indigo-600 font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.limit)}/mês</p>
                    </div>
                    <button 
                      onClick={() => onDelete(budget.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;
