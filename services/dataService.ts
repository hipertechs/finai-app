import { supabase } from './supabaseClient';
import { Transaction, Account, Goal, Budget, Debt } from '../types';

export const dataService = {
  // ACCOUNTS
  async getAccounts(): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*');
    if (error) {
      console.error('Erro ao buscar contas:', error);
      return [];
    }
    return data || [];
  },

  async saveAccount(account: Omit<Account, 'id'>): Promise<Account | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('accounts')
      .insert([{ ...account, user_id: user.id }])
      .select();
    
    if (error) {
      console.error('Erro ao salvar conta:', error);
      return null;
    }
    return data?.[0] || null;
  },

  async updateAccount(id: string, balance: number): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update({ balance })
      .eq('id', id);
    if (error) console.error('Erro ao atualizar saldo:', error);
  },

  async deleteAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);
    if (error) console.error('Erro ao deletar conta:', error);
  },

  // TRANSACTIONS
  async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    if (error) {
      console.error('Erro ao buscar transações:', error);
      return [];
    }
    return data || [];
  },

  async saveTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: user.id }])
      .select();
    
    if (error) {
      console.error('Erro ao salvar transação:', error);
      return null;
    }
    return data?.[0] || null;
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) console.error('Erro ao deletar transação:', error);
  },

  // GOALS
  async getGoals(): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*');
    if (error) return [];
    return data || [];
  },

  async saveGoal(goal: Omit<Goal, 'id'>): Promise<Goal | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('goals')
      .insert([{ ...goal, user_id: user.id }])
      .select();
    return data?.[0] || null;
  },

  async updateGoal(id: string, currentAmount: number): Promise<void> {
    await supabase.from('goals').update({ current_amount: currentAmount }).eq('id', id);
  },

  async deleteGoal(id: string): Promise<void> {
    await supabase.from('goals').delete().eq('id', id);
  },

  // BUDGETS
  async getBudgets(): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*');
    if (error) return [];
    return data || [];
  },

  async saveBudget(budget: Omit<Budget, 'id'>): Promise<Budget | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('budgets')
      .insert([{ ...budget, user_id: user.id }])
      .select();
    return data?.[0] || null;
  },

  async deleteBudget(id: string): Promise<void> {
    await supabase.from('budgets').delete().eq('id', id);
  },

  // DEBTS
  async getDebts(): Promise<Debt[]> {
    const { data, error } = await supabase
      .from('debts')
      .select('*');
    if (error) {
      console.error('Erro ao buscar dívidas:', error);
      return [];
    }
    return (data || []).map(d => ({
      id: d.id,
      name: d.name,
      creditor: d.creditor,
      balance: Number(d.balance),
      interestRate: Number(d.interest_rate),
      minimumPayment: Number(d.minimum_payment),
      dueDate: d.due_date,
      color: d.color
    }));
  },

  async saveDebt(debt: Omit<Debt, 'id'>): Promise<Debt | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const dbDebt = {
      user_id: user.id,
      name: debt.name,
      creditor: debt.creditor,
      balance: debt.balance,
      interest_rate: debt.interestRate,
      minimum_payment: debt.minimumPayment,
      due_date: debt.dueDate,
      color: debt.color
    };

    const { data, error } = await supabase
      .from('debts')
      .insert([dbDebt])
      .select();
    
    if (error) {
      console.error('Erro ao salvar dívida:', error);
      return null;
    }

    const d = data?.[0];
    return d ? {
      id: d.id,
      name: d.name,
      creditor: d.creditor,
      balance: Number(d.balance),
      interestRate: Number(d.interest_rate),
      minimumPayment: Number(d.minimum_payment),
      dueDate: d.due_date,
      color: d.color
    } : null;
  },

  async deleteDebt(id: string): Promise<void> {
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id);
    if (error) console.error('Erro ao deletar dívida:', error);
  }
};
