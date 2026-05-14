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
    return (data || []).map(acc => ({
      id: acc.id,
      name: acc.name,
      type: acc.type,
      balance: Number(acc.balance),
      color: acc.color,
      iconName: acc.icon_name,
      creditLimit: acc.credit_limit ? Number(acc.credit_limit) : undefined,
      closingDay: acc.closing_day,
      dueDay: acc.due_day
    }));
  },

  async saveAccount(account: Omit<Account, 'id'>): Promise<Account | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('accounts')
      .insert([{ 
        name: account.name,
        type: account.type,
        balance: account.balance,
        color: account.color,
        icon_name: account.iconName,
        credit_limit: account.creditLimit,
        closing_day: account.closingDay,
        due_day: account.dueDay,
        user_id: user.id 
      }])
      .select();
    
    if (error) {
      console.error('Erro ao salvar conta:', error);
      return null;
    }
    
    const acc = data?.[0];
    return acc ? {
      id: acc.id,
      name: acc.name,
      type: acc.type,
      balance: Number(acc.balance),
      color: acc.color,
      iconName: acc.icon_name,
      creditLimit: acc.credit_limit ? Number(acc.credit_limit) : undefined,
      closingDay: acc.closing_day,
      dueDay: acc.due_day
    } : null;
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
    return (data || []).map(t => ({
      id: t.id,
      description: t.description,
      amount: Number(t.amount),
      date: t.date,
      type: t.type,
      category: t.category,
      accountId: t.account_id,
      isRecurring: t.is_recurring,
      attachmentUrl: t.attachment_url
    }));
  },

  async saveTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('transactions')
      .insert([{ 
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        type: transaction.type,
        category: transaction.category,
        account_id: transaction.accountId,
        is_recurring: transaction.isRecurring,
        attachment_url: transaction.attachmentUrl,
        user_id: user.id 
      }])
      .select();
    
    if (error) {
      console.error('ERRO SUPABASE (saveTransaction):', error);
      alert('Erro ao salvar transação: ' + error.message);
      return null;
    }

    const t = data?.[0];
    if (!t) {
       console.error('ERRO: Supabase não retornou a transação salva.');
       return null;
    }
    
    return {
      id: t.id,
      description: t.description,
      amount: Number(t.amount),
      date: t.date,
      type: t.type,
      category: t.category,
      accountId: t.account_id
    };
  },

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | null> {
    const updateData: any = {};
    if (transaction.description) updateData.description = transaction.description;
    if (transaction.amount !== undefined) updateData.amount = transaction.amount;
    if (transaction.date) updateData.date = transaction.date;
    if (transaction.type) updateData.type = transaction.type;
    if (transaction.category) updateData.category = transaction.category;
    if (transaction.accountId) updateData.account_id = transaction.accountId;

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Erro ao atualizar transação:', error);
      return null;
    }

    const t = data?.[0];
    return t ? {
      id: t.id,
      description: t.description,
      amount: Number(t.amount),
      date: t.date,
      type: t.type,
      category: t.category,
      accountId: t.account_id,
      attachmentUrl: t.attachment_url
    } : null;
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
    if (error) {
      console.error('Erro ao buscar metas:', error);
      return [];
    }
    return (data || []).map(g => ({
      id: g.id,
      name: g.name,
      targetAmount: Number(g.target_amount),
      currentAmount: Number(g.current_amount),
      deadline: g.deadline,
      iconName: g.icon_name,
      color: g.color
    }));
  },

  async saveGoal(goal: Omit<Goal, 'id'>): Promise<Goal | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('goals')
      .insert([{ 
        name: goal.name,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount,
        deadline: goal.deadline,
        icon_name: goal.iconName,
        color: goal.color,
        user_id: user.id 
      }])
      .select();
    
    if (error) {
      console.error('Erro ao salvar meta:', error);
      return null;
    }

    const g = data?.[0];
    return g ? {
      id: g.id,
      name: g.name,
      targetAmount: Number(g.target_amount),
      currentAmount: Number(g.current_amount),
      deadline: g.deadline,
      iconName: g.icon_name,
      color: g.color
    } : null;
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
    if (error) {
      console.error('Erro ao buscar orçamentos:', error);
      return [];
    }
    return (data || []).map(b => ({
      id: b.id,
      category: b.category,
      limit: Number(b.limit),
      period: b.period
    }));
  },

  async saveBudget(budget: Omit<Budget, 'id'>): Promise<Budget | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('budgets')
      .insert([{ 
        category: budget.category,
        limit: budget.limit,
        period: budget.period,
        user_id: user.id 
      }])
      .select();
    
    if (error) {
      console.error('Erro ao salvar orçamento:', error);
      return null;
    }

    const b = data?.[0];
    return b ? {
      id: b.id,
      category: b.category,
      limit: Number(b.limit),
      period: b.period
    } : null;
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
  },

  async sendReportEmail(reportData: any): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
      const response = await fetch('/api/send-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportData,
          userEmail: user.email,
          userName: user.user_metadata?.name || user.email
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao enviar e-mail via Vercel:', error);
      return false;
    }
  },

  // ATTACHMENTS
  async uploadAttachment(file: File): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

    return publicUrl;
  }
};
