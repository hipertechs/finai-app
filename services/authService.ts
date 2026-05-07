import { User } from '../types';
import { supabase } from './supabaseClient';

const SESSION_KEY = 'finai_session';

export const authService = {
  // Inicializa o sistema (não mais necessário para Supabase, mas mantido para compatibilidade)
  init() {
    // Supabase gerencia a sessão automaticamente via cookies/localStorage
  },

  async getUsers(): Promise<User[]> {
    // Em um sistema real, você buscaria de uma tabela 'profiles' ou similar
    // Por enquanto, vamos retornar o usuário atual se logado
    const user = await this.getCurrentUser();
    return user ? [user] : [];
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User | null> {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password || '',
      options: {
        data: {
          name: userData.name,
          username: userData.username,
          role: userData.role,
        }
      }
    });

    if (error || !data.user) return null;

    return {
      id: data.user.id,
      name: userData.name,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      createdAt: data.user.created_at
    };
  },

  async login(emailOrUsername: string, password: string): Promise<User | null> {
    let email = emailOrUsername;
    if (!email.includes('@')) {
      email = `${emailOrUsername}@finai.com`;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) return null;

    const user: User = {
      id: data.user.id,
      name: data.user.user_metadata.name || 'Usuário',
      username: data.user.user_metadata.username || email.split('@')[0],
      email: data.user.email || '',
      role: data.user.user_metadata.role || 'USER',
      createdAt: data.user.created_at
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.removeItem(SESSION_KEY);
  },

  async updateProfile(name: string): Promise<User> {
    const { data, error } = await supabase.auth.updateUser({
      data: { name: name }
    });
    if (error || !data.user) throw error || new Error("Erro ao atualizar perfil");

    return {
      id: data.user.id,
      name: data.user.user_metadata.name || 'Usuário',
      username: data.user.user_metadata.username || data.user.email?.split('@')[0] || '',
      email: data.user.email || '',
      role: data.user.user_metadata.role || 'USER',
      createdAt: data.user.created_at
    };
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return {
      id: user.id,
      name: user.user_metadata.name || 'Usuário',
      username: user.user_metadata.username || user.email?.split('@')[0] || '',
      email: user.email || '',
      role: user.user_metadata.role || 'USER',
      createdAt: user.created_at
    };
  },

  async deleteUser(id: string): Promise<boolean> {
    // Nota: Supabase Auth não permite deletar usuários via Client SDK por segurança (requer Service Role)
    // Vamos apenas remover a referência local e os dados por enquanto
    localStorage.removeItem(`finai_data_${id}`);
    return true;
  },

  async updateUser(id: string, data: Partial<User>): Promise<boolean> {
    const { error } = await supabase.auth.updateUser({
      data: {
        name: data.name,
        username: data.username,
        role: data.role,
      }
    });
    return !error;
  },

  async seedAdmin(): Promise<void> {
    const adminEmail = 'admin@finai.com';
    const adminPass = 'admin123';
    
    const { data, error } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPass,
      options: {
        data: {
          name: 'Administrador Principal',
          username: 'admin',
          role: 'ADMIN',
        }
      }
    });

    if (error) {
      console.log('Seed Admin: Usuário já pode existir ou erro na criação:', error.message);
    } else {
      console.log('Seed Admin: Usuário admin@finai.com criado com sucesso!');
    }
  },

  async sendPasswordReset(email: string): Promise<boolean> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return !error;
  },

  async resetPassword(newPassword: string): Promise<boolean> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return !error;
  }
};
