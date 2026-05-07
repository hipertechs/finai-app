
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';
import { Wallet, Lock, User as UserIcon, LogIn, AlertCircle, RefreshCcw, Mail } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Novo campo para email
  const [name, setName] = useState(''); // Novo campo para nome
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Toggle entre Login/Register
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmailSent, setRecoveryEmailSent] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(window.location.hash.includes('type=recovery'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        // --- FLUXO DE REGISTRO ---
        const { data, error: regError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              username,
              role: 'USER', // Usuários criados pelo app são USER por padrão
            }
          }
        });

        if (regError) {
          setError(`Erro no cadastro: ${regError.message}`);
          setLoading(false);
          return;
        }

        if (data.user) {
          // Se o e-mail estiver desativado no Supabase, o usuário já pode logar
          if (data.session) {
            setError('Conta criada e logada com sucesso!');
            // Opcional: auto-login se houver sessão imediata
          } else {
            setError('Conta criada! Agora você já pode entrar.');
          }
          setIsRegistering(false);
          // Limpa campos após sucesso
          setEmail('');
          setName('');
          setPassword('');
        }
      } else {
        if (isRecovering) {
          const success = await authService.sendPasswordReset(email);
          if (success) {
            setRecoveryEmailSent(true);
            setError('');
          } else {
            setError('Erro ao enviar e-mail de recuperação. Verifique o endereço.');
          }
          setLoading(false);
          return;
        }

        if (isResettingPassword) {
          const success = await authService.resetPassword(password);
          if (success) {
            setError('Senha alterada com sucesso! Agora você já pode entrar.');
            setIsResettingPassword(false);
            setRecoveryEmailSent(false);
            setIsRecovering(false);
            // Limpa o hash da URL
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            setError('Erro ao alterar senha. Tente novamente.');
          }
          setLoading(false);
          return;
        }

        // --- FLUXO DE LOGIN ---
        const user = await authService.login(username, password);

        if (!user) {
          setError('Erro de Login: Verifique suas credenciais. Se você acabou de criar a conta, verifique seu e-mail para confirmar o cadastro.');
          setLoading(false);
          return;
        }

        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(`Erro inesperado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl mx-auto mb-4 border-4 border-white dark:border-slate-800 transition-transform hover:scale-105 duration-500">
            <img src="/logo.png" alt="FinAI Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">FinAI</h1>
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2 ml-1">Intelligent Finance</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-500">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold dark:text-white">
              {isResettingPassword ? 'Criar nova senha' : 
               isRecovering ? 'Recuperar Acesso' :
               isRegistering ? 'Criar nova conta' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-sm text-slate-400">
              {isResettingPassword ? 'Digite sua nova senha abaixo' :
               isRecovering ? 'Enviaremos um link para o seu e-mail' :
               isRegistering ? 'Preencha os dados para começar' : 'Entre para acessar seus dados'}
            </p>
          </div>

          {recoveryEmailSent && isRecovering && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold animate-in fade-in">
              E-mail de recuperação enviado! Verifique sua caixa de entrada e clique no link para resetar sua senha.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-semibold dark:text-white"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">E-mail Real</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-semibold dark:text-white"
                      placeholder="exemplo@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {!isRegistering && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Usuário ou E-mail</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-semibold dark:text-white"
                    placeholder="Nome de usuário ou e-mail"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {isRegistering && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome de Usuário</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">@</span>
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-semibold dark:text-white"
                    placeholder="usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {!isRegistering && !isResettingPassword && isRecovering && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">E-mail da Conta</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-semibold dark:text-white"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {!isRecovering && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  {isResettingPassword ? 'Nova Senha' : 'Senha'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-semibold dark:text-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {!isRegistering && !isResettingPassword && (
                  <div className="text-right mt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsRecovering(true)}
                      className="text-[10px] font-bold text-slate-400 hover:text-indigo-500 uppercase tracking-widest"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-bold animate-in fade-in duration-300">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCcw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> {isRegistering ? 'Criar Conta Agora' : 'Entrar no Sistema'}
                </>
              )}
            </button>

            <div className="text-center mt-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setIsRecovering(false);
                  setIsResettingPassword(false);
                  setError('');
                }}
                className="text-xs font-bold text-indigo-500 hover:underline block w-full"
              >
                {isRegistering ? 'Já tenho uma conta. Entrar' : 'Não tem conta? Criar uma agora'}
              </button>
              
              {(isRecovering || isResettingPassword) && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRecovering(false);
                    setIsResettingPassword(false);
                    setError('');
                  }}
                  className="text-xs font-bold text-slate-400 hover:underline block w-full"
                >
                  Voltar para o Login
                </button>
              )}
            </div>
          </form>

          <div className="mt-8 text-center pt-8 border-t dark:border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Precisa de acesso?</p>
            <p className="text-xs text-slate-500 mt-1">Contate o administrador do sistema.</p>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          FinAI &copy; 2026 • Intelligent Finance System
        </p>
      </div>
    </div>
  );
};

export default Login;
