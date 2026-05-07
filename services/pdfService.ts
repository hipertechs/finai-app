
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Transaction } from '../types';

export const exportMonthToPDF = async (
  month: string,
  data: { income: number; expenses: number; investments: number; categories: Record<string, number> },
  transactions: Transaction[],
  includeChart: boolean = false,
  chartElementId?: string
) => {
  const doc = new jsPDF();
  const monthName = new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // Header
  doc.setFontSize(22);
  doc.setTextColor(99, 102, 241); // Indigo-600
  doc.text('FinAI - Relatório Mensal', 14, 22);
  
  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(formattedMonth, 14, 32);

  // Summary Cards
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(14, 40, 58, 25, 3, 3, 'FD');
  doc.roundedRect(76, 40, 58, 25, 3, 3, 'FD');
  doc.roundedRect(138, 40, 58, 25, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('RECEITA TOTAL', 18, 48);
  doc.text('DESPESA TOTAL', 80, 48);
  doc.text('SALDO FINAL', 142, 48);

  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129); // Emerald-500
  doc.text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.income), 18, 58);
  
  doc.setTextColor(244, 63, 94); // Rose-500
  doc.text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.expenses), 80, 58);
  
  const balance = data.income - data.expenses;
  if (balance >= 0) {
    doc.setTextColor(16, 185, 129);
  } else {
    doc.setTextColor(244, 63, 94);
  }
  doc.text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance), 142, 58);

  let currentY = 80;

  // Optional Chart Inclusion
  if (includeChart && chartElementId) {
    const chartElement = document.getElementById(chartElementId);
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          backgroundColor: null,
          logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 180;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text('Distribuição de Gastos', 14, currentY);
        doc.addImage(imgData, 'PNG', 15, currentY + 5, imgWidth, imgHeight);
        currentY += imgHeight + 20;
      } catch (err) {
        console.error('Error capturing chart:', err);
      }
    }
  }

  // Categories Table
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('Gastos por Categoria', 14, currentY);

  const categoryRows = Object.entries(data.categories)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([name, value]) => [
      name,
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number),
      `${Math.round(((value as number) / data.expenses) * 100)}%`
    ]);

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Categoria', 'Valor', '% do Total']],
    body: categoryRows,
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 10, cellPadding: 5 },
  });

  // Transactions Table
  const finalY = (doc as any).lastAutoTable.finalY;
  
  // Check if we need a new page
  if (finalY > 240) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY = finalY + 15;
  }

  doc.setFontSize(16);
  doc.text('Lista de Transações', 14, currentY);

  const monthTransactions = transactions
    .filter(t => t.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(t => [
      new Date(t.date).toLocaleDateString('pt-BR'),
      t.description,
      t.category,
      t.type === 'INCOME' ? 'Receita' : 'Despesa',
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)
    ]);

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
    body: monthTransactions,
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105] },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      4: { halign: 'right', fontStyle: 'bold' }
    }
  });

  doc.save(`Relatorio_FinAI_${month}.pdf`);
};

export const exportFullHistoryToPDF = async (
  monthlyReports: any[],
  transactions: Transaction[],
  includeChart: boolean = false,
  chartElementId?: string
) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(99, 102, 241);
  doc.text('FinAI - Histórico Completo', 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 30);

  let currentY = 45;

  // Optional Chart Inclusion
  if (includeChart && chartElementId) {
    const chartElement = document.getElementById(chartElementId);
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          backgroundColor: null,
          logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 180;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text('Evolução Mensal', 14, currentY);
        doc.addImage(imgData, 'PNG', 15, currentY + 5, imgWidth, imgHeight);
        currentY += imgHeight + 20;
      } catch (err) {
        console.error('Error capturing chart:', err);
      }
    }
  }

  // Summary Table
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text('Resumo Mensal', 14, currentY);

  const summaryRows = monthlyReports.map(r => [
    new Date(r.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.income),
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.expenses),
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.income - r.expenses)
  ]);

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Mês', 'Receitas', 'Despesas', 'Saldo']],
    body: summaryRows,
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 10 },
  });

  doc.save('Historico_Completo_FinAI.pdf');
};
