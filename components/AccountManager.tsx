import React, { useState } from 'react';
import { X, Plus, Wallet, CreditCard, Landmark, Trash2, Check, Banknote, Search, TrendingUp } from 'lucide-react';
import { Account } from '../types';

interface AccountManagerProps {
  accounts: Account[];
  onClose: () => void;
  onAdd: (account: Omit<Account, 'id'>) => void;
  onDelete: (id: string) => void;
}

const BANK_TEMPLATES = [
  { name: 'Banco do Brasil', domain: 'bb.com.br', color: 'bg-yellow-400' },
  { name: 'Banestes', domain: 'banestes.com.br', color: 'bg-blue-600' },
  { name: 'Bradesco', domain: 'bradesco.com.br', color: 'bg-rose-600' },
  { name: 'BTG Pactual', domain: 'btgpactual.com', color: 'bg-blue-950' },
  { name: 'C6 Bank', domain: 'c6bank.com.br', color: 'bg-slate-900' },
  { name: 'Caixa', domain: 'caixa.gov.br', color: 'bg-blue-700' },
  { name: 'Cresol', domain: 'cresol.com.br', color: 'bg-emerald-600' },
  { name: 'Inter', domain: 'bancointer.com.br', color: 'bg-orange-600' },
  { name: 'Itaú', domain: 'itau.com.br', color: 'bg-orange-500' },
  { name: 'Mercado Pago', domain: 'mercadopago.com.br', color: 'bg-blue-400' },
  { name: 'Nubank', domain: 'nubank.com.br', color: 'bg-purple-600' },
  { name: 'PagBank', domain: 'pagseguro.uol.com.br', color: 'bg-emerald-500' },
  { name: 'PicPay', domain: 'picpay.com', color: 'bg-emerald-400' },
  { name: 'Santander', domain: 'santander.com.br', color: 'bg-red-600' },
  { name: 'Sicredi', domain: 'sicredi.com.br', color: 'bg-emerald-700' },
].sort((a, b) => a.name.localeCompare(b.name));

const getLogoUrl = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

const AccountManager: React.FC<AccountManagerProps> = ({ accounts, onClose, onAdd, onDelete }) => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<Account['type']>('BANK');
  const [selectedColor, setSelectedColor] = useState('bg-indigo-600');
  const [currentDomain, setCurrentDomain] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;
    onAdd({
      name,
      balance: parseFloat(balance),
      type,
      color: selectedColor,
      iconName: type === 'INVESTMENT' ? 'TrendingUp' : type === 'CREDIT_CARD' ? 'CreditCard' : 'Wallet',
      creditLimit: type === 'CREDIT_CARD' ? parseFloat(creditLimit) : undefined,
      closingDay: type === 'CREDIT_CARD' ? parseInt(closingDay) : undefined,
      dueDay: type === 'CREDIT_CARD' ? parseInt(dueDay) : undefined
    });
    setName('');
    setBalance('');
    setCreditLimit('');
    setClosingDay('');
    setDueDay('');
    setCurrentDomain('');
  };

  const applyTemplate = (template: typeof BANK_TEMPLATES[0]) => {
    setName(template.name);
    setSelectedColor(template.color);
    setCurrentDomain(template.domain);
    setType('BANK');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-5xl shadow-2xl border dark:border-slate-800 flex flex-col h-[85vh] overflow-hidden">
        <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Contas & Cartões</h2>
            <p className="text-sm text-slate-500 font-medium">Instituições financeiras organizadas e atualizadas.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar de Seleção de Bancos */}
          <div className="w-64 border-r dark:border-slate-800 overflow-y-auto p-4 bg-slate-50/30 dark:bg-slate-900/50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Lista de Bancos</h3>
            <div className="space-y-1">
              {BANK_TEMPLATES.map(bank => (
                <button
                  key={bank.name}
                  onClick={() => applyTemplate(bank)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                    name === bank.name ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    <img src={getLogoUrl(bank.domain)} alt={bank.name} className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-xs font-bold truncate">{bank.name}</span>
                </button>
              ))}
              <button 
                onClick={() => { setName(''); setCurrentDomain(''); setSelectedColor('bg-slate-600'); }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all mt-4 border border-dashed dark:border-slate-700"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 text-slate-500" />
                </div>
                <span className="text-xs font-bold">Outro / Manual</span>
              </button>
            </div>
          </div>

          {/* Área Principal */}
          <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-12">
            {/* Formulário */}
            <div className="w-full md:w-80 space-y-8">
              <form onSubmit={handleAdd} className="space-y-6">
                <div className="p-6 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-xl overflow-hidden">
                      {currentDomain ? (
                        <img src={getLogoUrl(currentDomain)} className="w-10 h-10 object-contain" />
                      ) : (
                        <Wallet className="w-6 h-6 text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black truncate">{name || 'Nova Conta'}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{type}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <input 
                      type="text" placeholder="Nome da Instituição"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                      value={name} onChange={(e) => setName(e.target.value)} required
                    />
                    
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-semibold outline-none"
                      value={type} onChange={(e) => setType(e.target.value as any)}
                    >
                      <option value="BANK">Conta Corrente</option>
                      <option value="CREDIT_CARD">Cartão de Crédito</option>
                      <option value="INVESTMENT">Investimento</option>
                    </select>

                    <input 
                      type="number" placeholder={type === 'CREDIT_CARD' ? 'Fatura Atual' : 'Saldo Atual'}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                      value={balance} onChange={(e) => setBalance(e.target.value)} required
                    />

                    {type === 'CREDIT_CARD' && (
                      <div className="space-y-4 pt-2 border-t dark:border-slate-800">
                        <input 
                          type="number" placeholder="Limite do Cartão"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                          value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input 
                            type="number" placeholder="Dia Fechamento"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                            value={closingDay} onChange={(e) => setClosingDay(e.target.value)}
                          />
                          <input 
                            type="number" placeholder="Dia Vencimento"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                            value={dueDay} onChange={(e) => setDueDay(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                
                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Confirmar Conta
                </button>
              </form>
            </div>

            {/* Listagem de Contas */}
            <div className="flex-1 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Suas Contas Ativas</h3>
              <div className="space-y-3">
                {accounts.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed dark:border-slate-800 rounded-[2.5rem]">
                    <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm text-slate-400 font-medium">Nenhuma conta cadastrada ainda.</p>
                  </div>
                ) : (
                  accounts.map(acc => {
                    const template = BANK_TEMPLATES.find(t => t.name === acc.name);
                    const logo = template ? getLogoUrl(template.domain) : null;
                    
                    return (
                      <div key={acc.id} className="flex items-center justify-between p-4 rounded-3xl border dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white border dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-sm">
                            {logo ? (
                              <img src={logo} alt={acc.name} className="w-8 h-8 object-contain" />
                            ) : (
                              <div className={`w-full h-full ${acc.color} flex items-center justify-center text-white`}>
                                <Wallet className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black">{acc.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{acc.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <p className={`text-sm font-black ${acc.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)}
                          </p>
                          <button 
                            onClick={() => onDelete(acc.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManager;
