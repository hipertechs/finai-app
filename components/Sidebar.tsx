
import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Tag, 
  Target, 
  RefreshCcw, 
  Wallet,
  Plus,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  PieChart as BudgetIcon,
  Upload,
  CreditCard,
  Users,
  LogOut,
  User as UserIcon,
  TrendingUp,
  Calendar,
  Settings2
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: 'overview' | 'reports' | 'performance' | 'calendar' | 'debts';
  setActiveTab: (tab: 'overview' | 'reports' | 'performance' | 'calendar' | 'debts') => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onOpenCategories: () => void;
  onOpenGoals: () => void;
  onOpenAccounts: () => void;
  onOpenBudgets: () => void;
  onOpenImport: () => void;
  onOpenNewTransaction: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  // Auth Props
  user: User;
  onOpenUsers: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  onOpenCategories,
  onOpenGoals,
  onOpenAccounts,
  onOpenBudgets,
  onOpenImport,
  onOpenNewTransaction,
  isOpen,
  setIsOpen,
  user,
  onOpenUsers,
  onOpenProfile,
  onLogout
}) => {
  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard, tab: 'overview' },
    { id: 'debts', label: 'Controle de Dívidas', icon: Tag, tab: 'debts' },
    { id: 'calendar', label: 'Calendário', icon: Calendar, tab: 'calendar' },
    { id: 'performance', label: 'Performance', icon: TrendingUp, tab: 'performance' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, tab: 'reports' },
  ];

  const toolsItems = [
    { id: 'accounts', label: 'Contas & Cartões', icon: CreditCard, onClick: onOpenAccounts },
    { id: 'budgets', label: 'Orçamentos', icon: BudgetIcon, onClick: onOpenBudgets },
    { id: 'goals', label: 'Metas Financeiras', icon: Target, onClick: onOpenGoals },
    { id: 'categories', label: 'Categorias', icon: Tag, onClick: onOpenCategories },
  ];

  const utilityItems = [
    { id: 'import', label: 'Importar CSV', icon: Upload, onClick: onOpenImport },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed left-4 top-4 bottom-4 z-50 transition-all duration-500 rounded-[2.5rem] border shadow-2xl overflow-hidden flex flex-col ${
          isOpen ? 'w-72 translate-x-0' : 'w-24 -translate-x-[calc(100%+1rem)] lg:translate-x-0'
        } ${
          darkMode 
            ? 'bg-slate-900/90 border-slate-800 backdrop-blur-xl' 
            : 'bg-white/90 border-slate-200 backdrop-blur-xl shadow-indigo-500/10'
        }`}
      >
        {/* Background Gradients for Premium Look */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col h-full z-10">
          {/* Logo Section */}
          <div className="h-24 flex items-center px-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div className={`transition-all duration-500 ${!isOpen && 'lg:opacity-0 lg:scale-95'}`}>
                <span className="block font-black text-2xl tracking-tighter leading-none bg-gradient-to-r from-indigo-500 to-indigo-400 bg-clip-text text-transparent">FinAI</span>
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 opacity-60">Intelligent</span>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8 scrollbar-hide">
            {/* New Transaction Button */}
            <button
              onClick={onOpenNewTransaction}
              className={`w-full group relative flex items-center gap-4 p-4 rounded-3xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 mb-6 ${
                !isOpen && 'lg:justify-center'
              }`}
            >
              <Plus className="w-6 h-6 shrink-0 transition-transform group-hover:rotate-90" />
              <span className={`text-sm transition-all duration-500 whitespace-nowrap ${!isOpen && 'lg:hidden lg:opacity-0'}`}>Nova Entrada</span>
            </button>

            {/* Main Menu */}
            <div className="space-y-2">
              <p className={`px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 opacity-50 ${!isOpen && 'lg:text-center'}`}>
                {isOpen ? 'Overview' : '...'}
              </p>
              <div className="space-y-1.5">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.tab) setActiveTab(item.tab as any);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all group relative ${
                      activeTab === item.tab 
                        ? (darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600') 
                        : (darkMode ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600')
                    } ${!isOpen && 'lg:justify-center'}`}
                  >
                    {activeTab === item.tab && (
                      <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-full" />
                    )}
                    <item.icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${activeTab === item.tab ? 'animate-pulse' : ''}`} />
                    <span className={`font-bold text-sm transition-all duration-500 whitespace-nowrap ${!isOpen && 'lg:hidden lg:opacity-0'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Management Menu */}
            <div className="space-y-2">
              <p className={`px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 opacity-50 ${!isOpen && 'lg:text-center'}`}>
                {isOpen ? 'Management' : '...'}
              </p>
              <div className="space-y-1.5">
                {toolsItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all group ${
                      darkMode ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                    } ${!isOpen && 'lg:justify-center'}`}
                  >
                    <item.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                    <span className={`font-bold text-sm transition-all duration-500 whitespace-nowrap ${!isOpen && 'lg:hidden lg:opacity-0'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
                {user.role === 'ADMIN' && (
                  <button
                    onClick={onOpenUsers}
                    className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all group ${
                      darkMode ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                    } ${!isOpen && 'lg:justify-center'}`}
                  >
                    <Users className="w-5 h-5 shrink-0 text-indigo-500" />
                    <span className={`font-bold text-sm transition-all duration-500 whitespace-nowrap ${!isOpen && 'lg:hidden lg:opacity-0'}`}>
                      Painel Admin
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* System Utilities */}
            <div className="space-y-2">
              <p className={`px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 opacity-50 ${!isOpen && 'lg:text-center'}`}>
                {isOpen ? 'Utilities' : '...'}
              </p>
              <div className="space-y-1.5">
                <button
                  onClick={onOpenImport}
                  className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all group ${
                    darkMode ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                  } ${!isOpen && 'lg:justify-center'}`}
                >
                  <Upload className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                  <span className={`font-bold text-sm transition-all duration-500 whitespace-nowrap ${!isOpen && 'lg:hidden lg:opacity-0'}`}>
                    Importar CSV
                  </span>
                </button>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all group ${
                    darkMode ? 'text-amber-400 hover:bg-amber-400/10' : 'text-slate-500 hover:bg-slate-50 hover:text-amber-600'
                  } ${!isOpen && 'lg:justify-center'}`}
                >
                  {darkMode ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
                  <span className={`font-bold text-sm transition-all duration-500 whitespace-nowrap ${!isOpen && 'lg:hidden lg:opacity-0'}`}>
                    {darkMode ? 'Modo Claro' : 'Modo Escuro'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-4 mt-auto">
            <div className={`p-4 rounded-[2rem] border transition-all ${
              darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100'
            }`}>
              <button 
                onClick={onOpenProfile}
                className={`w-full flex items-center gap-3 transition-all ${!isOpen && 'justify-center'}`}
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-600/20 shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {isOpen && (
                  <div className="overflow-hidden text-left flex-1">
                    <p className="text-sm font-black truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Premium User</p>
                  </div>
                )}
              </button>
              
              {isOpen && (
                <div className="mt-4 pt-4 border-t border-slate-700/20 flex gap-2">
                  <button 
                    onClick={onLogout}
                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Toggle - Desktop */}
          <div className="p-4 hidden lg:block">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all ${
                !isOpen && 'justify-center'
              }`}
            >
              {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              <span className={`text-[10px] font-black uppercase tracking-widest ${!isOpen && 'hidden'}`}>Recolher Menu</span>
            </button>
          </div>
        </div>
      </aside>


      {/* Mobile Header Toggle */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 flex items-center px-4 z-40 transition-colors ${
        darkMode ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-slate-200 shadow-sm'
      }`}>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
        >
          <Plus className="w-6 h-6 rotate-45" />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg">FinAI</span>
          </div>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>
    </>
  );
};

export default Sidebar;
