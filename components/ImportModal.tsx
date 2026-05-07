
import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Check, AlertCircle, ArrowRight, Table } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface ImportModalProps {
  onClose: () => void;
  onImport: (transactions: Omit<Transaction, 'id'>[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Por favor, selecione um arquivo CSV válido.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      
      if (lines.length < 2) {
        setError('O arquivo está vazio ou não possui dados suficientes.');
        return;
      }

      // Detecta separador (, ou ;)
      const firstLine = lines[0];
      const separator = firstLine.includes(';') ? ';' : ',';
      
      const headers = firstLine.split(separator).map(h => h.trim().toLowerCase());
      const data = lines.slice(1).map(line => {
        const values = line.split(separator).map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index];
        });
        return obj;
      });

      setPreview(data.slice(0, 5)); // Mostra as primeiras 5 linhas
      processData(data, headers);
    };
    reader.readAsText(file);
  };

  const [processedTransactions, setProcessedTransactions] = useState<Omit<Transaction, 'id'>[]>([]);

  const processData = (rawRows: any[], headers: string[]) => {
    const dateIdx = headers.findIndex(h => h.includes('data') || h.includes('date'));
    const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('hist') || h.includes('nome') || h.includes('payee'));
    const amountIdx = headers.findIndex(h => h.includes('valor') || h.includes('quant') || h.includes('amount'));
    const catIdx = headers.findIndex(h => h.includes('cat'));

    if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) {
      setError('O arquivo deve conter as colunas: Data, Descrição e Valor.');
      return;
    }

    const transactions: Omit<Transaction, 'id'>[] = rawRows.map(row => {
      const rowValues = Object.values(row) as string[];
      let rawAmount = rowValues[amountIdx].replace('R$', '').replace(/\s/g, '');
      
      // Suporte a formatos: 1.234,56 ou 1234.56 ou -1234.56
      if (rawAmount.includes(',') && rawAmount.includes('.')) {
        rawAmount = rawAmount.replace(/\./g, '').replace(',', '.');
      } else if (rawAmount.includes(',')) {
        rawAmount = rawAmount.replace(',', '.');
      }

      const amount = parseFloat(rawAmount);
      
      return {
        description: rowValues[descIdx] || 'Sem descrição',
        amount: Math.abs(amount),
        type: (amount >= 0 ? 'INCOME' : 'EXPENSE') as TransactionType,
        date: formatDate(rowValues[dateIdx]),
        category: catIdx !== -1 ? (rowValues[catIdx] || 'Outros') : 'Outros',
        accountId: 'acc1',
        isRecurring: false
      };
    }).filter(t => !isNaN(t.amount) && t.date);

    setProcessedTransactions(transactions);
  };

  const downloadTemplate = () => {
    const csvContent = "data;descricao;valor;categoria\n05/05/2026;Salario Mensal;5000.00;Salario\n06/05/2026;Aluguel;-1200.00;Moradia\n07/05/2026;Supermercado;-350.50;Alimentacao";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_finai.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (rawDate: string) => {
    // Tenta lidar com DD/MM/YYYY ou YYYY-MM-DD
    if (rawDate.includes('/')) {
      const parts = rawDate.split('/');
      if (parts[0].length === 4) return rawDate.replace(/\//g, '-'); // YYYY/MM/DD
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`; // DD/MM/YYYY
    }
    return rawDate;
  };

  const handleConfirm = () => {
    if (processedTransactions.length > 0) {
      onImport(processedTransactions);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl border dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Importar Dados</h2>
              <p className="text-sm text-slate-500 font-medium">Carregue seu extrato bancário em CSV.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all cursor-pointer group"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold mb-1">Clique para selecionar seu arquivo</h3>
              <p className="text-sm text-slate-400 mb-6">Arraste seu extrato .csv aqui (Nubank, Itaú, etc)</p>
              
              <button 
                onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                <Table className="w-3 h-3 text-indigo-500" /> Baixar Modelo Padrão
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold">{file.name}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase">{processedTransactions.length} transações encontradas</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="text-[10px] font-black text-rose-500 uppercase">Trocar Arquivo</button>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-2xl text-rose-600">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prévia dos Dados</h4>
                <div className="border dark:border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase">Data</th>
                        <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase">Descrição</th>
                        <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-800">
                      {processedTransactions.slice(0, 5).map((t, i) => (
                        <tr key={i} className="text-xs">
                          <td className="px-4 py-3 font-semibold">{t.date}</td>
                          <td className="px-4 py-3 font-semibold truncate max-w-[150px]">{t.description}</td>
                          <td className={`px-4 py-3 font-black ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            R$ {t.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {processedTransactions.length > 5 && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/30 text-center text-[10px] font-bold text-slate-400">
                      + {processedTransactions.length - 5} transações restantes
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-800 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!file || processedTransactions.length === 0}
            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
          >
            Confirmar Importação <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
