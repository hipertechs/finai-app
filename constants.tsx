
import { CategoryInfo, Account, Goal, Budget } from './types';

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  { id: 'cat-1', name: 'Alimentação', iconName: 'Utensils' },
  { id: 'cat-2', name: 'Moradia', iconName: 'Home' },
  { id: 'cat-3', name: 'Transporte', iconName: 'Car' },
  { id: 'cat-4', name: 'Mercado', iconName: 'ShoppingBag' },
  { id: 'cat-5', name: 'Lazer', iconName: 'Palmtree' },
  { id: 'cat-6', name: 'Saúde', iconName: 'Stethoscope' },
  { id: 'cat-7', name: 'Educação', iconName: 'Book' },
  { id: 'cat-8', name: 'Assinaturas', iconName: 'Tv' },
  { id: 'cat-9', name: 'Compras', iconName: 'Shirt' },
  { id: 'cat-10', name: 'Investimento', iconName: 'TrendingUp' },
  { id: 'cat-11', name: 'Salário/Renda', iconName: 'DollarSign' },
  { id: 'cat-12', name: 'Outros', iconName: 'PlusCircle' },
];

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc1', name: 'Nubank', type: 'BANK', balance: 5240.50, color: 'bg-purple-600', iconName: 'Wallet' },
  { id: 'acc2', name: 'Carteira', type: 'CASH', balance: 150, color: 'bg-emerald-500', iconName: 'Banknote' },
  { id: 'acc3', name: 'XP Investimentos', type: 'INVESTMENT', balance: 12500, color: 'bg-slate-900', iconName: 'TrendingUp' },
  { id: 'acc4', name: 'Cartão Inter', type: 'CREDIT_CARD', balance: 0, color: 'bg-orange-500', iconName: 'CreditCard' },
];

export const INITIAL_GOALS: Goal[] = [
  { id: 'g1', name: 'Reserva de Emergência', targetAmount: 30000, currentAmount: 12500, deadline: '2026-12-31', iconName: 'Shield', color: 'text-emerald-500' },
  { id: 'g2', name: 'Viagem Europa', targetAmount: 25000, currentAmount: 5200, deadline: '2027-06-15', iconName: 'Plane', color: 'text-indigo-500' },
  { id: 'g3', name: 'Novo MacBook Pro', targetAmount: 18000, currentAmount: 2500, deadline: '2026-09-01', iconName: 'Laptop', color: 'text-slate-500' },
];

export const INITIAL_BUDGETS: Budget[] = [
  { id: 'b1', category: 'Alimentação', limit: 1200, period: 'MONTHLY' },
  { id: 'b2', category: 'Lazer', limit: 600, period: 'MONTHLY' },
  { id: 'b3', category: 'Mercado', limit: 1000, period: 'MONTHLY' },
  { id: 'b4', category: 'Transporte', limit: 500, period: 'MONTHLY' },
];

export const INITIAL_TRANSACTIONS: any[] = [
  // --- MAIO 2026 ---
  { id: 't20', description: 'Salário Mensal', amount: 9500, date: '2026-05-05', type: 'INCOME', category: 'Salário/Renda', accountId: 'acc1' },
  { id: 't21', description: 'Aluguel Loft', amount: 2800, date: '2026-05-01', type: 'EXPENSE', category: 'Moradia', accountId: 'acc1' },
  { id: 't22', description: 'Supermercado Mensal', amount: 950, date: '2026-05-02', type: 'EXPENSE', category: 'Mercado', accountId: 'acc1' },
  { id: 't23', description: 'Aporte Ações BBAS3', amount: 2000, date: '2026-05-03', type: 'EXPENSE', category: 'Investimento', accountId: 'acc3' },
  { id: 't24', description: 'Jantar Comemorativo', amount: 350, date: '2026-05-04', type: 'EXPENSE', category: 'Alimentação', accountId: 'acc1' },
  { id: 't25', description: 'Combustível', amount: 220, date: '2026-05-04', type: 'EXPENSE', category: 'Transporte', accountId: 'acc1' },
  { id: 't26', description: 'Netflix + Spotify', amount: 85.90, date: '2026-05-05', type: 'EXPENSE', category: 'Assinaturas', accountId: 'acc1' },
  
  // --- ABRIL 2026 ---
  { id: 't1', description: 'Salário Abril', amount: 9500, date: '2026-04-05', type: 'INCOME', category: 'Salário/Renda', accountId: 'acc1' },
  { id: 't2', description: 'Aluguel Abril', amount: 2800, date: '2026-04-01', type: 'EXPENSE', category: 'Moradia', accountId: 'acc1' },
  { id: 't3', description: 'Supermercado', amount: 1100, date: '2026-04-03', type: 'EXPENSE', category: 'Mercado', accountId: 'acc1' },
  { id: 't4', description: 'Tesouro Direto', amount: 1500, date: '2026-04-10', type: 'EXPENSE', category: 'Investimento', accountId: 'acc3' },
  { id: 't5', description: 'Freelance Design', amount: 2400, date: '2026-04-15', type: 'INCOME', category: 'Salário/Renda', accountId: 'acc1' },
  { id: 't6', description: 'Manutenção Carro', amount: 1200, date: '2026-04-18', type: 'EXPENSE', category: 'Transporte', accountId: 'acc1' },
  { id: 't7', description: 'Shopping Roupas', amount: 450, date: '2026-04-20', type: 'EXPENSE', category: 'Compras', accountId: 'acc1' },
  { id: 't8', description: 'Curso de Inglês', amount: 320, date: '2026-04-22', type: 'EXPENSE', category: 'Educação', accountId: 'acc1' },
  { id: 't9', description: 'Pizza Final de Semana', amount: 120, date: '2026-04-25', type: 'EXPENSE', category: 'Alimentação', accountId: 'acc1' },
  { id: 't10', description: 'Farmácia', amount: 95, date: '2026-04-28', type: 'EXPENSE', category: 'Saúde', accountId: 'acc1' },
];
