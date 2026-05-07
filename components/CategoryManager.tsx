
import React, { useState } from 'react';
import { CategoryInfo } from '../types';
import { X, Plus, Trash2, Edit2, Check, Save } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface CategoryManagerProps {
  categories: CategoryInfo[];
  onAdd: (category: Omit<CategoryInfo, 'id'>) => void;
  onUpdate: (id: string, category: Omit<CategoryInfo, 'id'>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAdd, onUpdate, onDelete, onClose }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    onAdd({ name: newCategoryName.trim(), iconName: 'Tag' });
    setNewCategoryName('');
  };

  const handleStartEdit = (cat: CategoryInfo) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    const cat = categories.find(c => c.id === id);
    if (cat) {
      onUpdate(id, { name: editName.trim(), iconName: cat.iconName });
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200 border dark:border-slate-800">
        <div className="flex justify-between items-center p-6 border-b dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Gerenciar Categorias</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nova categoria..."
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 group">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    {/* @ts-ignore */}
                    {React.createElement(LucideIcons[cat.iconName] || LucideIcons.Tag, { className: "w-4 h-4" })}
                  </div>
                  {editingId === cat.id ? (
                    <input 
                      autoFocus
                      className="flex-1 bg-transparent border-b border-indigo-500 outline-none text-sm font-semibold text-slate-800 dark:text-slate-100"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(cat.id)}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{cat.name}</span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingId === cat.id ? (
                    <button 
                      onClick={() => handleSaveEdit(cat.id)}
                      className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => onDelete(cat.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
