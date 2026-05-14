
import React, { useState, useEffect } from 'react';
import { CategoryInfo, TransactionType, Transaction, Account } from '../types';
import { X, Plus, Calendar, CreditCard, Repeat, Zap } from 'lucide-react';

const calculateFifthBusinessDay = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  let businessDaysCount = 0;
  let day = 1;
  
  while (businessDaysCount < 5) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Contamos segunda a sábado (domingo = 0)
    if (dayOfWeek !== 0) {
      businessDaysCount++;
    }
    
    if (businessDaysCount < 5) day++;
  }
  
  const result = new Date(year, month, day);
  return result.toISOString().split('T')[0];
};

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>, id?: string) => void;
  onClose: () => void;
  initialData?: Partial<Transaction>;
  categories: CategoryInfo[];
  accounts: Account[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onClose, initialData, categories, accounts }) => {
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [type, setType] = useState<TransactionType>(initialData?.type || 'EXPENSE');
  const [category, setCategory] = useState<string>(initialData?.category || categories[0]?.name || 'Outros');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState<string>(initialData?.accountId || accounts[0]?.id || '');
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [attachmentUrl, setAttachmentUrl] = useState(initialData?.attachmentUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.description !== undefined) setDescription(initialData.description);
      if (initialData.type !== undefined) setType(initialData.type);
      if (initialData.category !== undefined) setCategory(initialData.category);
      if (initialData.date !== undefined) setDate(initialData.date);
      if (initialData.amount !== undefined) setAmount(initialData.amount.toString());
      if (initialData.accountId !== undefined) setAccountId(initialData.accountId);
      if (initialData.isRecurring !== undefined) setIsRecurring(initialData.isRecurring);
      if (initialData.attachmentUrl !== undefined) setAttachmentUrl(initialData.attachmentUrl);
    }
  }, [initialData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const { dataService } = await import('../services/dataService');
    const url = await dataService.uploadAttachment(file);
    if (url) {
      setAttachmentUrl(url);
    }
    setIsUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !accountId) return;

    onSubmit({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
      accountId,
      isRecurring,
      attachmentUrl
    }, initialData?.id);
    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border dark:border-slate-800">
        <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex justify-between items-center p-6 border-b dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {initialData?.id ? 'Editar Transação' : 'Nova Entrada'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Valor de Destaque */}
          <div className="text-center py-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor</label>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-slate-400">R$</span>
              <input 
                type="number" 
                step="0.01"
                className="w-40 text-4xl font-black bg-transparent text-center outline-none border-b-2 border-transparent focus:border-indigo-500 transition-all dark:text-white"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Descrição</label>
            <input 
              autoFocus
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-semibold"
              placeholder="O que você comprou ou recebeu?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tipo</label>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('EXPENSE')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === 'EXPENSE' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500'}`}
                >
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setType('INCOME')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === 'INCOME' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-500'}`}
                >
                  Receita
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Data</label>
              <div className="flex gap-1.5">
                <div className="relative flex-1 min-w-0">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input 
                    type="date" 
                    className="w-full pl-8 pr-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => setDate(calculateFifthBusinessDay())}
                  className="px-2 bg-indigo-600 text-white rounded-xl flex flex-col items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-600/10 shrink-0"
                  title="5º Dia Útil"
                >
                  <Zap className="w-3 h-3 mb-0.5" />
                  <span className="text-[7px] font-black uppercase">5º DU</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Conta / Carteira</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-semibold outline-none appearance-none"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Categoria</label>
              <select 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-semibold outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
            <div className="flex items-center gap-3">
              <Repeat className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-xs font-bold dark:text-slate-200">Repetir mensalmente?</p>
                <p className="text-[10px] text-slate-500">Transformar em conta recorrente</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-10 h-5 rounded-full transition-colors relative ${isRecurring ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isRecurring ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed dark:border-slate-700">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Enviando...</span>
                </div>
              ) : attachmentUrl ? (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold truncate">Comprovante Anexado</p>
                    <button type="button" onClick={() => setAttachmentUrl('')} className="text-[10px] text-rose-500 font-bold uppercase hover:underline">Remover</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-2">
                    <Zap className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anexar Comprovante (Opcional)</span>
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
                </div>
              )}
            </label>
          </div>


          <button 
            type="submit" 
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Confirmar
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
