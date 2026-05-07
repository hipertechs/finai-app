
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User, UserRole } from '../types';
import { X, UserPlus, Trash2, Shield, User as UserIcon, Lock, Check, Mail, Edit2 } from 'lucide-react';

interface UserManagerProps {
  onClose: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [success, setSuccess] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await authService.getUsers();
    setUsers(data);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !email) return;

    if (editingId) {
      // Modo Edição
      const updateData: any = { name, username, email, role };
      if (password) updateData.password = password; 
      
      await authService.updateUser(editingId, updateData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEditingId(null);
        resetForm();
      }, 1500);
    } else {
      // Modo Criação
      if (!password) return;
      const newUser = await authService.createUser({ name, username, email, password, role });
      if (newUser) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          resetForm();
        }, 1500);
      } else {
        alert('Erro ao criar usuário. Verifique se o e-mail já existe.');
      }
    }
    await fetchUsers();
  };

  const resetForm = () => {
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('USER');
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setName(user.name);
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);
    setPassword(''); // Não mostra a senha antiga por segurança
  };

  const handleDelete = async (id: string) => {
    if (id === 'admin-01') return;
    if (confirm('Tem certeza que deseja excluir este usuário e todos os seus dados?')) {
      await authService.deleteUser(id);
      await fetchUsers();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl shadow-2xl border dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-xl text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Gestão de Usuários</h2>
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Controle de Acesso</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                {editingId ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              {editingId && (
                <button onClick={() => { setEditingId(null); resetForm(); }} className="text-[10px] font-bold text-rose-500 uppercase">Cancelar</button>
              )}
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" placeholder="Nome Completo"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                    value={name} onChange={(e) => setName(e.target.value)} required
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" placeholder="E-mail"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                    value={email} onChange={(e) => setEmail(e.target.value)} required
                  />
                </div>
                <input 
                  type="text" placeholder="Username"
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  value={username} onChange={(e) => setUsername(e.target.value)} required
                />
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    placeholder={editingId ? "Deixe em branco para manter" : "Senha"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                    value={password} onChange={(e) => setPassword(e.target.value)} required={!editingId}
                  />
                </div>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm font-semibold outline-none"
                  value={role} onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="USER">Usuário Comum</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <button 
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${success ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                {success ? (
                  <><Check className="w-4 h-4" /> {editingId ? 'Salvo' : 'Criado'}</>
                ) : (
                  editingId ? <><Edit2 className="w-4 h-4" /> Atualizar Usuário</> : <><UserPlus className="w-4 h-4" /> Criar Usuário</>
                )}
              </button>
            </form>
          </div>

          {/* Lista */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Usuários do Sistema</h3>
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border transition-all group ${editingId === u.id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'dark:border-slate-700'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{u.name}</p>
                      {u.role === 'ADMIN' && <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[8px] font-black rounded uppercase">Admin</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{u.email}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => startEdit(u)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {u.id !== 'admin-01' && (
                      <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManager;
