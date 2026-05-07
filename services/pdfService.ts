
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

export const exportPremiumReportPDF = async (
  reportData: any,
  userName: string
) => {
  const doc = new jsPDF();
  const indigo = [79, 70, 229];
  const slate = [100, 116, 139];
  const emerald = [16, 185, 129];
  const rose = [244, 63, 94];

  // Header Background
  doc.setFillColor(indigo[0], indigo[1], indigo[2]);
  doc.rect(0, 0, 210, 40, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('RELATÓRIO PERSONALIZADO', 14, 15);
  doc.setFontSize(22);
  doc.text(`Olá, ${userName}!`, 14, 25);
  doc.setFontSize(12);
  doc.text(`Resumo Financeiro de ${reportData.month}`, 14, 32);

  let currentY = 55;

  // Principal Stats Cards
  doc.setDrawColor(241, 245, 249);
  doc.setFillColor(240, 253, 244); // Greenish
  doc.roundedRect(14, currentY, 58, 25, 3, 3, 'FD');
  doc.setFillColor(254, 242, 242); // Reddish
  doc.roundedRect(76, currentY, 58, 25, 3, 3, 'FD');
  doc.setFillColor(238, 242, 255); // Bluish
  doc.roundedRect(138, currentY, 58, 25, 3, 3, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(21, 128, 61);
  doc.text('RECEITAS', 18, currentY + 8);
  doc.setTextColor(185, 28, 28);
  doc.text('DESPESAS', 80, currentY + 8);
  doc.setTextColor(67, 56, 202);
  doc.text('SALDO', 142, currentY + 8);

  doc.setFontSize(12);
  doc.setTextColor(22, 101, 52);
  doc.text(reportData.income, 18, currentY + 18);
  doc.setTextColor(153, 27, 27);
  doc.text(reportData.expenses, 80, currentY + 18);
  doc.setTextColor(55, 48, 163);
  doc.text(reportData.balance, 142, currentY + 18);

  currentY += 40;

  // Performance Analysis
  if (reportData.performance) {
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(240, 240, 240);
    doc.roundedRect(14, currentY, 182, 30, 3, 3, 'FD');
    
    doc.setFontSize(12);
    doc.setTextColor(99, 102, 241);
    doc.text('Análise de Performance', 18, currentY + 10);
    
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Taxa de Poupança: ${reportData.performance.savingsRate}%`, 18, currentY + 18);
    doc.text(`Independência: ${reportData.performance.survivalMonths} meses de reserva`, 18, currentY + 24);
    
    currentY += 40;
  }

  // AI Advice
  if (reportData.aiAdvice) {
    doc.setFillColor(245, 243, 255);
    doc.setDrawColor(139, 92, 246);
    doc.roundedRect(14, currentY, 182, 35, 3, 3, 'FD');
    
    doc.setFontSize(12);
    doc.setTextColor(124, 58, 237);
    doc.text('Recomendação Inteligente (IA)', 18, currentY + 10);
    
    doc.setFontSize(9);
    doc.setTextColor(76, 29, 149);
    const splitText = doc.splitTextToSize(`"${reportData.aiAdvice}"`, 170);
    doc.text(splitText, 18, currentY + 18);
    
    currentY += 45;
  }

  // Debts
  if (reportData.debts && reportData.debts.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text('Controle de Dívidas', 14, currentY);
    
    const debtRows = reportData.debts.map((d: any) => [
      d.name,
      d.balance,
      d.dueDate
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Dívida', 'Valor', 'Vencimento']],
      body: debtRows,
      theme: 'striped',
      headStyles: { fillColor: [71, 85, 105] },
      styles: { fontSize: 10 }
    });
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(248, 250, 252);
  doc.rect(0, pageHeight - 15, 210, 15, 'F');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Enviado via FinAI Intelligent System • ${new Date().toLocaleDateString('pt-BR')}`, 105, pageHeight - 7, { align: 'center' });

  doc.save(`Relatorio_Premium_${reportData.month.replace(' ', '_')}.pdf`);
};
