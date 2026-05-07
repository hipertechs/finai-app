
import React, { useState } from 'react';
import { Transaction } from '../types';
import { ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle, Info } from 'lucide-react';

interface FinancialCalendarProps {
  transactions: Transaction[];
  darkMode: boolean;
}

const FinancialCalendar: React.FC<FinancialCalendarProps> = ({ transactions, darkMode }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = daysInMonth(year, month);
  const firstDay = startDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const getDayKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getTransactionsForDay = (dayKey: string) => {
    return transactions.filter(t => t.date === dayKey);
  };

  const dayElements = [];
  // Espaços vazios antes do primeiro dia
  for (let i = 0; i < firstDay; i++) {
    dayElements.push(<div key={`empty-${i}`} className="h-24 md:h-32 border-b border-r dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10" />);
  }

  // Dias do mês
  for (let d = 1; d <= days; d++) {
    const dayKey = getDayKey(d);
    const dayTxs = getTransactionsForDay(dayKey);
    const income = dayTxs.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expenses = dayTxs.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    const isToday = new Date().toISOString().split('T')[0] === dayKey;
    const isSelected = selectedDay === dayKey;

    dayElements.push(
      <div 
        key={d} 
        onClick={() => setSelectedDay(dayKey)}
        className={`h-24 md:h-32 border-b border-r dark:border-slate-800 p-2 transition-all cursor-pointer group relative ${
          isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
        }`}
      >
        <span className={`text-xs font-bold ${isToday ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-400 group-hover:text-slate-600'}`}>
          {d}
        </span>
        
        <div className="mt-2 space-y-1 overflow-hidden">
          {income > 0 && (
            <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-1 rounded truncate">
              <span className="hidden md:inline">+</span>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(income)}
            </div>
          )}
          {expenses > 0 && (
            <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-1 rounded truncate">
              <span className="hidden md:inline">-</span>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(expenses)}
            </div>
          )}
        </div>

        {dayTxs.length > 0 && (
          <div className="absolute bottom-1 right-1 flex gap-0.5">
            {dayTxs.slice(0, 3).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-indigo-300" />
            ))}
          </div>
        )}
      </div>
    );
  }

  const selectedTxs = selectedDay ? getTransactionsForDay(selectedDay) : [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      {/* Calendar Grid */}
      <div className={`flex-1 rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-black/20' : 'bg-white border-slate-100 shadow-xl'}`}>
        <div className="p-6 flex justify-between items-center border-b dark:border-slate-800">
          <div>
            <h3 className="text-xl font-black">{monthNames[month]}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{year}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center border-b dark:border-slate-800">
          {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"].map(d => (
            <div key={d} className="py-3 text-[10px] font-black text-slate-400 tracking-tighter">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {dayElements}
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="w-full lg:w-80 space-y-4">
        <div className={`p-6 rounded-3xl border sticky top-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
          <h4 className="font-bold mb-6 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500" />
            Detalhes do Dia
          </h4>
          
          {selectedDay ? (
            <div className="space-y-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {new Date(selectedDay + 'T00:00:00').toLocaleDateString('pt-BR', { dateStyle: 'full' })}
              </p>
              
              <div className="space-y-3">
                {selectedTxs.length === 0 ? (
                  <p className="text-sm text-slate-400 italic py-4">Nenhuma transação registrada para este dia.</p>
                ) : (
                  selectedTxs.map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                      <div>
                        <p className="text-xs font-bold">{tx.description}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-black">{tx.category}</p>
                      </div>
                      <p className={`text-xs font-black ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {selectedTxs.length > 0 && (
                <div className="pt-4 border-t dark:border-slate-800 mt-4">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1">
                    <span>Balanço Diário</span>
                    <span className={selectedTxs.reduce((acc, t) => t.type === 'INCOME' ? acc + t.amount : acc - t.amount, 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedTxs.reduce((acc, t) => t.type === 'INCOME' ? acc + t.amount : acc - t.amount, 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <ArrowUpCircle className="w-6 h-6 opacity-20" />
              </div>
              <p className="text-sm text-slate-400 font-medium">Selecione um dia no calendário para ver os detalhes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialCalendar;
