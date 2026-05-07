
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
        className={`fixed top-0 left-0 z-50 h-full transition-all duration-300 border-r ${
          isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'
        } ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-20 flex items-center px-6 border-b dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shrink-0">
                <img src="/src/assets/logo.png" alt="FinAI Logo" className="w-full h-full object-cover" />
              </div>
              <div className={`transition-opacity duration-300 ${!isOpen && 'lg:opacity-0'}`}>
                <span className="block font-black text-lg tracking-tighter leading-none">FinAI</span>
                <span className="block text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Smart Finance</span>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
            {/* New Transaction Button */}
            <button
              onClick={onOpenNewTransaction}
              className={`w-full flex items-center gap-3 p-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 mb-4 ${
                !isOpen && 'lg:justify-center'
              }`}
            >
              <Plus className="w-5 h-5 shrink-0" />
              <span className={`transition-opacity duration-300 ${!isOpen && 'lg:hidden'}`}>Nova Entrada</span>
            </button>

            {/* Main Menu */}
            <div>
              <p className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ${!isOpen && 'lg:text-center'}`}>
                {isOpen ? 'Menu Principal' : '...'}
              </p>
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.tab) setActiveTab(item.tab as any);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                      activeTab === item.tab 
                        ? (darkMode ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600') 
                        : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800')
                    } ${!isOpen && 'lg:justify-center'}`}
                  >
                    <item.icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110`} />
                    <span className={`font-semibold text-sm transition-opacity duration-300 ${!isOpen && 'lg:hidden'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Management Menu */}
            <div>
              <p className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ${!isOpen && 'lg:text-center'}`}>
                {isOpen ? 'Gestão' : '...'}
              </p>
              <div className="space-y-1">
                {toolsItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                      darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    } ${!isOpen && 'lg:justify-center'}`}
                  >
                    <item.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                    <span className={`font-semibold text-sm transition-opacity duration-300 ${!isOpen && 'lg:hidden'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
                {user.role === 'ADMIN' && (
                  <button
                    onClick={onOpenUsers}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                      darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    } ${!isOpen && 'lg:justify-center'}`}
                  >
                    <Users className="w-5 h-5 shrink-0 text-indigo-500" />
                    <span className={`font-semibold text-sm transition-opacity duration-300 ${!isOpen && 'lg:hidden'}`}>
                      Usuários (Admin)
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Utility Menu */}
            <div>
              <p className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ${!isOpen && 'lg:text-center'}`}>
                {isOpen ? 'Utilidades' : '...'}
              </p>
              <div className="space-y-1">
                {utilityItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                      darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    } ${!isOpen && 'lg:justify-center'}`}
                  >
                    <item.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                    <span className={`font-semibold text-sm transition-opacity duration-300 ${!isOpen && 'lg:hidden'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* System Menu */}
            <div className="pt-4 border-t dark:border-slate-800/50">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                  darkMode ? 'text-amber-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50 hover:text-amber-600'
                } ${!isOpen && 'lg:justify-center'}`}
              >
                {darkMode ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
                <span className={`font-semibold text-sm transition-opacity duration-300 ${!isOpen && 'lg:hidden'}`}>
                  Tema {darkMode ? 'Claro' : 'Escuro'}
                </span>
              </button>
              


              <button
                onClick={onLogout}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 ${!isOpen && 'lg:justify-center'}`}
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span className={`font-semibold text-sm transition-opacity duration-300 ${!isOpen && 'lg:hidden'}`}>
                  Sair
                </span>
              </button>
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="p-4 border-t dark:border-slate-800">
            <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 ${!isOpen && 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              {isOpen && (
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate">{user.name}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-tight truncate">{user.role}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Toggle */}
          <div className="px-4 py-2 hidden lg:block">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors ${
                !isOpen && 'justify-center'
              }`}
            >
              {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              <span className={`text-[10px] font-black uppercase tracking-wider ${!isOpen && 'hidden'}`}>Recolher</span>
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
