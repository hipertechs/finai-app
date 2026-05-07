
export type TransactionType = 'INCOME' | 'EXPENSE';
export type AccountType = 'BANK' | 'CASH' | 'CREDIT_CARD' | 'INVESTMENT';
export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  iconName: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  iconName: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: TransactionType;
  accountId: string;
  isRecurring?: boolean;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'MONTHLY';
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  iconName: string;
  color: string;
}

export interface Debt {
  id: string;
  name: string;
  creditor: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: number;
  color?: string;
}

// Container para os dados de um usuário específico
export interface UserFinancialData {
  transactions: Transaction[];
  accounts: Account[];
  goals: Goal[];
  budgets: Budget[];
  categories: CategoryInfo[];
}
