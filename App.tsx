
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  Plus, 
  LayoutDashboard,
  RefreshCcw,
  FileDown,
  Tag,
  XCircle,
  Home,
  DollarSign,
  Settings2,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowRightLeft,
  ChevronDown,
  History,
  Moon,
  Sun,
  ShoppingBag,
  Edit2,
  Trash2,
  Bot,
  Sparkles as SparklesIcon,
  CreditCard,
  Repeat,
  Upload,
  Bell,
  LogOut,
  Users,
  Mail,
  Zap,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  DownloadCloud,
  FileUp
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import { Tooltip } from 'react-tooltip';
import { Transaction, CategoryInfo, Account, Goal, Budget, User, UserFinancialData, Debt } from './types';
import { DEFAULT_CATEGORIES, INITIAL_TRANSACTIONS, INITIAL_ACCOUNTS, INITIAL_GOALS, INITIAL_BUDGETS } from './constants';
import StatCard from './components/StatCard';
import TransactionForm from './components/TransactionForm';
import ImportModal from './components/ImportModal';
import CategoryManager from './components/CategoryManager';
import Sidebar from './components/Sidebar';
import AccountManager from './components/AccountManager';
import BudgetManager from './components/BudgetManager';
import GoalManager from './components/GoalManager';
import UserManager from './components/UserManager';
import FinancialCalendar from './components/FinancialCalendar';
import Login from './components/Login';
import NotificationCenter, { Notification, NotificationType } from './components/NotificationCenter';
import DebtsDashboard from './components/DebtsDashboard';
import { exportMonthToPDF, exportFullHistoryToPDF } from './services/pdfService';
import { getFinancialAdvice } from './services/geminiService';
import { authService } from './services/authService';
import { dataService } from './services/dataService';
import * as LucideIcons from 'lucide-react';

const CategoryIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  // @ts-ignore
  const Icon = LucideIcons[name] || LucideIcons.Tag;
  return <Icon className={className || "w-4 h-4"} />;
};

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const App: React.FC = () => {
  // --- AUTH STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initial Auth Check
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Tenta criar o admin automaticamente (seed)
        await authService.seedAdmin();
        
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Erro ao verificar sessão:', err);
      } finally {
        setAuthLoading(false);
      }
    };
    checkUser();
  }, []);

  // --- APP STATE ---
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('finai_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>(DEFAULT_CATEGORIES);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const [debts, setDebts] = useState<Debt[]>([]);
  const [showReportConfig, setShowReportConfig] = useState(false);
  const [reportOptions, setReportOptions] = useState({
    performance: true,
    aiAdvice: true,
    debts: true
  });

  
  // --- LOAD USER DATA FROM SUPABASE ---
  useEffect(() => {
    if (currentUser) {
      const loadAllData = async () => {
        setIsSyncing(true);
        try {
          const [dbTransactions, dbAccounts, dbGoals, dbBudgets, dbDebts] = await Promise.all([
            dataService.getTransactions(),
            dataService.getAccounts(),
            dataService.getGoals(),
            dataService.getBudgets(),
            dataService.getDebts()
          ]);

          setTransactions(dbTransactions);
          setAccounts(dbAccounts);
          setGoals(dbGoals);
          setBudgets(dbBudgets);
          setDebts(dbDebts);
          
          addNotification('Dados carregados do Supabase!', 'success');
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
          addNotification('Erro ao carregar dados da nuvem.', 'error');
        } finally {
          setIsSyncing(false);
        }
      };
      loadAllData();
    }
  }, [currentUser]);

  // Salva apenas tema localmente
  useEffect(() => {
    localStorage.setItem('finai_theme', darkMode ? 'dark' : 'light');
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // --- NOTIFICATIONS ---
  const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  // --- MODAL STATES ---
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'performance' | 'calendar' | 'debts'>('overview');
  const [formInitialData, setFormInitialData] = useState<Partial<Transaction> | undefined>(undefined);
  const [aiAdvice, setAiAdvice] = useState<string>('Analisando seu perfil financeiro...');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- COMPUTED DATA ---
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
    const totalInvested = accounts.filter(a => a.type === 'INVESTMENT').reduce((acc, a) => acc + a.balance, 0);
    return { income, expenses, balance: totalBalance, savings: totalInvested };
  }, [transactions, accounts]);

  // --- ADVANCED PERFORMANCE METRICS ---
  const performanceStats = useMemo(() => {
    // 1. Taxa de Poupança (Savings Rate)
    const savingsRate = stats.income > 0 ? ((stats.income - stats.expenses) / stats.income) * 100 : 0;
    
    // 2. Média Mensal de Gastos (últimos 3 meses ou todos)
    const monthlyReportsMap: Record<string, { income: number; expenses: number }> = {};
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      if (!monthlyReportsMap[month]) monthlyReportsMap[month] = { income: 0, expenses: 0 };
      if (t.type === 'INCOME') monthlyReportsMap[month].income += t.amount;
      else monthlyReportsMap[month].expenses += t.amount;
    });
    
    const months = Object.keys(monthlyReportsMap);
    const avgMonthlyExpense = months.length > 0 
      ? Object.values(monthlyReportsMap).reduce((acc, m) => acc + m.expenses, 0) / months.length 
      : 0;
    const avgMonthlySavings = months.length > 0
      ? Object.values(monthlyReportsMap).reduce((acc, m) => acc + (m.income - m.expenses), 0) / months.length
      : 0;

    // 3. Meses de Sobrevivência (Independência Financeira Curta)
    const survivalMonths = avgMonthlyExpense > 0 ? stats.balance / avgMonthlyExpense : 0;

    // 4. Projeção de 6 Meses
    const forecastData = [];
    let projectedBalance = stats.balance;
    const today = new Date();
    
    for (let i = 0; i <= 6; i++) {
      const futureDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      forecastData.push({
        month: futureDate.toISOString().substring(0, 7),
        balance: Math.max(0, projectedBalance),
      });
      projectedBalance += avgMonthlySavings;
    }

    return {
      savingsRate,
      avgMonthlyExpense,
      avgMonthlySavings,
      survivalMonths,
      forecastData
    };
  }, [transactions, stats]);

  const categoryData = useMemo(() => {
    const expenseCategoryMap: Record<string, number> = {};
    transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
      expenseCategoryMap[t.category] = (expenseCategoryMap[t.category] || 0) + t.amount;
    });
    return Object.entries(expenseCategoryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const monthlyReports = useMemo(() => {
    const reports: Record<string, { income: number; expenses: number; categories: Record<string, number> }> = {};
    transactions.forEach(t => {
      const monthKey = t.date.substring(0, 7);
      if (!reports[monthKey]) reports[monthKey] = { income: 0, expenses: 0, categories: {} };
      if (t.type === 'INCOME') reports[monthKey].income += t.amount;
      else {
        reports[monthKey].expenses += t.amount;
        reports[monthKey].categories[t.category] = (reports[monthKey].categories[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(reports).sort((a, b) => a[0].localeCompare(b[0])).map(([month, data]) => ({ month, ...data }));
  }, [transactions]);

  // --- HANDLERS ---
  const handleSaveTransaction = async (newTx: Omit<Transaction, 'id'>, id?: string) => {
    if (id) {
      const oldTx = transactions.find(t => t.id === id);
      const updatedTx = await dataService.updateTransaction(id, newTx);
      
      if (updatedTx) {
        setTransactions(prev => prev.map(t => t.id === id ? updatedTx : t));
        
        // Ajusta saldo se o valor ou tipo mudou
        if (oldTx) {
          const account = accounts.find(a => a.id === newTx.accountId);
          if (account) {
            // Reverte o antigo e aplica o novo
            let balanceAdjustment = 0;
            if (oldTx.type === 'INCOME') balanceAdjustment -= oldTx.amount;
            else balanceAdjustment += oldTx.amount;

            if (newTx.type === 'INCOME') balanceAdjustment += newTx.amount;
            else balanceAdjustment -= newTx.amount;

            const newBalance = account.balance + balanceAdjustment;
            await dataService.updateAccount(account.id, newBalance);
            setAccounts(prev => prev.map(acc => acc.id === account.id ? { ...acc, balance: newBalance } : acc));
          }
        }
        addNotification('Transação atualizada!', 'success');
      }
    } else {
      const savedTx = await dataService.saveTransaction(newTx);
      if (savedTx) {
        setTransactions(prev => [savedTx, ...prev]);
        
        const account = accounts.find(a => a.id === newTx.accountId);
        if (account) {
          const newBalance = newTx.type === 'INCOME' ? account.balance + newTx.amount : account.balance - newTx.amount;
          await dataService.updateAccount(account.id, newBalance);
          setAccounts(prev => prev.map(acc => acc.id === account.id ? { ...acc, balance: newBalance } : acc));
        }
        
        addNotification('Transação salva com sucesso!', 'success');
      } else {
        addNotification('Falha ao salvar transação.', 'error');
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      await dataService.deleteTransaction(id);
      
      // Reverte saldo da conta
      const account = accounts.find(a => a.id === tx.accountId);
      if (account) {
        const newBalance = tx.type === 'INCOME' ? account.balance - tx.amount : account.balance + tx.amount;
        await dataService.updateAccount(account.id, newBalance);
        setAccounts(prev => prev.map(acc => acc.id === account.id ? { ...acc, balance: newBalance } : acc));
      }

      setTransactions(prev => prev.filter(t => t.id !== id));
      addNotification('Transação removida do Supabase.', 'info');
    }
  };

  const handleImportTransactions = (newTransactions: Omit<Transaction, 'id'>[]) => {
    // Importação em lote para Supabase pode ser implementada depois
    addNotification('Importação em lote via Supabase em desenvolvimento.', 'warning');
  };

  const handleAddAccount = async (acc: Omit<Account, 'id'>) => {
    const savedAcc = await dataService.saveAccount(acc);
    if (savedAcc) {
      setAccounts(prev => [...prev, savedAcc]);
      addNotification('Nova conta criada no Supabase!', 'success');
    }
  };

  const handleUpdateGoal = async (id: string, current: number) => {
    await dataService.updateGoal(id, current);
    const goal = goals.find(g => g.id === id);
    if (goal && current >= goal.targetAmount && goal.currentAmount < goal.targetAmount) addNotification(`Meta "${goal.name}" atingida! 🎉`, 'success');
    setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: current } : g));
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  const handleSendEmailReport = async () => {
    if (!currentUser) return;
    
    addNotification('Preparando relatório...', 'info');
    
    const reportData: any = {
      month: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      income: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.income),
      expenses: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.expenses),
      balance: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.balance)
    };

    if (reportOptions.performance) {
      reportData.performance = {
        savingsRate: performanceStats.savingsRate.toFixed(1),
        survivalMonths: performanceStats.survivalMonths.toFixed(1)
      };
    }

    if (reportOptions.aiAdvice) {
      reportData.aiAdvice = aiAdvice;
    }

    if (reportOptions.debts) {
      reportData.debts = debts.map(d => ({
        name: d.name,
        balance: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.balance),
        dueDate: d.dueDate
      }));
    }

    const success = await dataService.sendReportEmail(reportData);
    
    if (success) {
      addNotification('Relatório completo enviado com sucesso!', 'success');
      setShowReportConfig(false);
    } else {
      addNotification('Erro ao enviar e-mail. Verifique o Resend.', 'error');
    }
  };

  const handleExportData = () => {
    const allData = {
      transactions,
      accounts,
      categories,
      goals,
      budgets,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finai_backup_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('Backup exportado com sucesso!', 'success');
  };

  const handleImportFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.transactions) setTransactions(data.transactions);
        if (data.accounts) setAccounts(data.accounts);
        if (data.categories) setCategories(data.categories);
        if (data.goals) setGoals(data.goals);
        if (data.budgets) setBudgets(data.budgets);
        addNotification('Backup restaurado com sucesso!', 'success');
      } catch (err) {
        addNotification('Erro ao ler arquivo de backup.', 'error');
      }
    };
    reader.readAsText(file);
  };


  const fetchAdvice = async () => {
    if (transactions.length === 0) return;
    setIsAiLoading(true);
    try {
      const advice = await getFinancialAdvice(transactions);
      setAiAdvice(advice);
    } catch (error) {
      setAiAdvice("Continue focado nos seus objetivos!");
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => { if (currentUser) fetchAdvice(); }, [currentUser]);

  // --- AUTH GUARD ---
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Carregando FinAI...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Login onLoginSuccess={setCurrentUser} />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Tooltip id="main-tooltip" style={{ borderRadius: '8px', fontSize: '12px', zIndex: 100 }} />
      <NotificationCenter notifications={notifications} removeNotification={removeNotification} />
      
      <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab}
        darkMode={darkMode} setDarkMode={setDarkMode}
        onOpenCategories={() => setShowCategoryModal(true)}
        onOpenGoals={() => setShowGoalModal(true)}
        onOpenAccounts={() => setShowAccountModal(true)}
        onOpenBudgets={() => setShowBudgetModal(true)}
        onOpenImport={() => setShowImportModal(true)}
        onOpenNewTransaction={() => { setFormInitialData(undefined); setShowForm(true); }}
        isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}
        user={currentUser} onOpenUsers={() => setShowUserModal(true)} onLogout={handleLogout}
      />

      <main className={`transition-all duration-300 pt-16 lg:pt-0 ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          
          {activeTab === 'overview' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black tracking-tight">Olá, {currentUser.name.split(' ')[0]}! 👋</h2>
                  <p className="text-slate-500 font-medium">Sua visão geral financeira de hoje.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Receitas" value={stats.income} icon={<TrendingUp className="w-5 h-5" />} color="emerald" />
                <StatCard title="Despesas" value={stats.expenses} icon={<TrendingDown className="w-5 h-5" />} color="rose" />
                <StatCard title="Saldo Total" value={stats.balance} icon={<Wallet className="w-5 h-5" />} color="indigo" />
                <StatCard title="Investido" value={stats.savings} icon={<TrendingUp className="w-5 h-5" />} color="amber" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* AI Advisor Card */}
                  <div className={`p-6 rounded-3xl shadow-xl border ${darkMode ? 'bg-indigo-950/40 border-indigo-500/20' : 'bg-indigo-600 border-indigo-500 text-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5" />
                        <h3 className="font-bold">Advisor Inteligente</h3>
                      </div>
                      <button onClick={fetchAdvice} disabled={isAiLoading} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <RefreshCcw className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{aiAdvice}</p>
                  </div>

                  {/* Transactions Table */}
                  <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><History className="w-5 h-5 text-indigo-500" /> Atividades Recentes</h3>
                    <div className="space-y-1">
                      {transactions.slice(0, 5).map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'INCOME' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                              <CategoryIcon name={categories.find(c => c.name === tx.category)?.iconName || 'Tag'} />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{tx.description}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{tx.category}</p>
                            </div>
                          </div>
                          <p className={`text-sm font-black ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}`}>
                            {tx.type === 'INCOME' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <h3 className="font-bold mb-4">Contas</h3>
                    {accounts.map(acc => (
                      <div key={acc.id} className="flex justify-between items-center py-2 border-b dark:border-slate-800 last:border-0">
                        <span className="text-xs font-bold">{acc.name}</span>
                        <span className="text-xs font-black">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tight">Análise de Performance</h2>
                <p className="text-slate-500 font-medium">Métricas estratégicas e projeções de futuro.</p>
              </div>

              {/* Performance Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Savings Rate Card */}
                <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                      <Zap className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Savings Rate</p>
                    <h3 className="text-4xl font-black mb-2">{performanceStats.savingsRate.toFixed(1)}%</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Você está guardando {performanceStats.savingsRate.toFixed(1)}% do que ganha. {performanceStats.savingsRate > 20 ? 'Excelente performance!' : 'Tente chegar aos 20%.'}</p>
                    <div className="mt-6 w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${performanceStats.savingsRate}%` }} />
                    </div>
                  </div>
                </div>

                {/* Survival Card */}
                <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Independência Curta</p>
                    <h3 className="text-4xl font-black mb-2">{performanceStats.survivalMonths.toFixed(1)} meses</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Se você parar hoje, seu saldo cobre {performanceStats.survivalMonths.toFixed(1)} meses do seu padrão de vida atual.</p>
                  </div>
                </div>

                {/* Efficiency Card */}
                <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
                   <div className="relative z-10">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                      <Activity className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Média de Economia</p>
                    <h3 className="text-4xl font-black mb-2">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(performanceStats.avgMonthlySavings)}</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Em média, seu patrimônio cresce este valor todos os meses.</p>
                  </div>
                </div>
              </div>

              {/* Wealth Projection Chart */}
              <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2"><ArrowUpRight className="w-6 h-6 text-indigo-500" /> Projeção de Patrimônio (6 Meses)</h3>
                    <p className="text-sm text-slate-500 font-medium">Baseado na sua economia média de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(performanceStats.avgMonthlySavings)}/mês.</p>
                  </div>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceStats.forecastData}>
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} tickFormatter={(val) => new Date(val + '-01').toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                        formatter={(val: number) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val), 'Saldo Projetado']}
                      />
                      <Area type="monotone" dataKey="balance" stroke="#6366f1" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={4} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'debts' && (
            <DebtsDashboard darkMode={darkMode} debts={debts} setDebts={setDebts} />
          )}

          {activeTab === 'calendar' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tight">Calendário de Fluxo</h2>
                <p className="text-slate-500 font-medium">Visualize suas entradas e saídas no tempo.</p>
              </div>
              <FinancialCalendar 
                transactions={transactions} 
                darkMode={darkMode} 
                onEdit={(tx) => { setFormInitialData(tx); setShowForm(true); }}
                onDelete={handleDeleteTransaction}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black tracking-tight">Relatórios</h2>
                  <p className="text-slate-500 font-medium">Histórico e tendências.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowReportConfig(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"><Mail className="w-4 h-4" /> E-mail</button>
                  <button onClick={() => exportFullHistoryToPDF(monthlyReports, transactions, true, 'trends-chart-container')} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-xl"><FileDown className="w-4 h-4" /> PDF</button>
                </div>
              </div>
              <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div id="trends-chart-container" className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyReports}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="income" name="Receita" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={3} />
                      <Area type="monotone" dataKey="expenses" name="Despesa" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showForm && <TransactionForm onSubmit={handleSaveTransaction} onClose={() => setShowForm(false)} initialData={formInitialData} categories={categories} accounts={accounts} />}
      {showCategoryModal && <CategoryManager categories={categories} onClose={() => setShowCategoryModal(false)} onAdd={(c) => setCategories(p => [...p, { ...c, id: Math.random().toString() }])} onDelete={(id) => setCategories(p => p.filter(c => c.id !== id))} onUpdate={(id, c) => setCategories(p => p.map(x => x.id === id ? { ...c, id } : x))} />}
      {showAccountModal && <AccountManager accounts={accounts} onClose={() => setShowAccountModal(false)} onAdd={async (acc) => {
        const saved = await dataService.saveAccount(acc);
        if (saved) setAccounts(p => [...p, saved]);
      }} onDelete={async (id) => {
        await dataService.deleteAccount(id);
        setAccounts(p => p.filter(a => a.id !== id));
      }} />}
      {showBudgetModal && <BudgetManager budgets={budgets} categories={categories} onClose={() => setShowBudgetModal(false)} onAdd={async (b) => {
        const saved = await dataService.saveBudget(b);
        if (saved) setBudgets(p => [...p, saved]);
      }} onDelete={async (id) => {
        await dataService.deleteBudget(id);
        setBudgets(p => p.filter(b => b.id !== id));
      }} />}
      {showGoalModal && <GoalManager goals={goals} onClose={() => setShowGoalModal(false)} onAdd={async (g) => {
        const saved = await dataService.saveGoal(g);
        if (saved) setGoals(p => [...p, saved]);
      }} onDelete={async (id) => {
        await dataService.deleteGoal(id);
        setGoals(p => p.filter(g => g.id !== id));
      }} onUpdate={handleUpdateGoal} />}
      {showUserModal && <UserManager onClose={() => setShowUserModal(false)} />}
      {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} onImport={handleImportTransactions} />}
      


      <style>{`
        .animate-in { animation: fade-in 0.4s ease-out; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      {showReportConfig && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-[2.5rem] border p-8 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-2xl'}`}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black">Configurar Relatório</h3>
                <p className="text-sm text-slate-500 font-medium">Escolha o que incluir no seu e-mail.</p>
              </div>
              <button onClick={() => setShowReportConfig(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <label className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all">
                <input type="checkbox" checked={reportOptions.performance} onChange={(e) => setReportOptions({ ...reportOptions, performance: e.target.checked })} className="w-5 h-5 accent-indigo-600" />
                <div>
                  <p className="text-sm font-bold">Análise de Performance</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Resumo de economia e independência</p>
                </div>
              </label>

              <label className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all">
                <input type="checkbox" checked={reportOptions.aiAdvice} onChange={(e) => setReportOptions({ ...reportOptions, aiAdvice: e.target.checked })} className="w-5 h-5 accent-indigo-600" />
                <div>
                  <p className="text-sm font-bold">Recomendação da IA</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Conselhos inteligentes do Gemini</p>
                </div>
              </label>

              <label className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all">
                <input type="checkbox" checked={reportOptions.debts} onChange={(e) => setReportOptions({ ...reportOptions, debts: e.target.checked })} className="w-5 h-5 accent-indigo-600" />
                <div>
                  <p className="text-sm font-bold">Controle de Dívidas</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Resumo de pendências e parcelas</p>
                </div>
              </label>
            </div>

            <button onClick={handleSendEmailReport} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Mail className="w-5 h-5" />
              Enviar Relatório Agora
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
