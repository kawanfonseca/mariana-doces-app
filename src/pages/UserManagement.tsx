import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Users, UserPlus, Shield, ShieldCheck, X, RefreshCw } from 'lucide-react';
import { usersService, User, CreateUserData } from '@/services/users';
import { useAuthStore } from '@/store/auth';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const currentUser = useAuthStore((s) => s.user);

  // Form state
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'OPERATOR',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersService.getUsers();
      if (response.success) {
        setUsers(response.users);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await usersService.createUser(formData);
      toast.success('Usuário criado com sucesso!');
      setShowCreateForm(false);
      setFormData({ name: '', email: '', password: '', role: 'OPERATOR' });
      await loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar usuário');
    } finally {
      setFormLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'ADMIN' | 'OPERATOR') => {
    if (userId === currentUser?.id) {
      toast.error('Você não pode alterar seu próprio cargo');
      return;
    }
    setActionLoading(userId);
    try {
      await usersService.updateUser(userId, { role: newRole });
      toast.success(`Cargo alterado para ${newRole === 'ADMIN' ? 'Administrador' : 'Operador'}`);
      await loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao alterar cargo');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    if (userId === currentUser?.id) {
      toast.error('Você não pode desativar sua própria conta');
      return;
    }
    setActionLoading(userId);
    try {
      await usersService.updateUser(userId, { active: !currentActive });
      toast.success(currentActive ? 'Usuário desativado' : 'Usuário ativado');
      await loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao alterar status');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const activeCount = users.filter((u) => u.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie os usuários e permissões do sistema
          </p>
        </div>
        <div className="flex space-x-2">
          <button onClick={loadUsers} className="btn-outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </button>
          <button onClick={() => setShowCreateForm(true)} className="btn-primary">
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-content p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-purple-600">{adminCount}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Criar Novo Usuário</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'OPERATOR' })
                  }
                  className="input"
                >
                  <option value="OPERATOR">Operador</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={formLoading} className="btn-primary">
                  {formLoading ? 'Criando...' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Usuários Cadastrados</h3>
        </div>
        <div className="card-content">
          {users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum usuário cadastrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const isSelf = user.id === currentUser?.id;
                    const isLoading = actionLoading === user.id;

                    return (
                      <tr key={user.id} className={`hover:bg-gray-50 ${!user.active ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                              {isSelf && (
                                <span className="ml-2 text-xs text-primary-600 font-normal">(você)</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isSelf ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'ADMIN'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {user.role === 'ADMIN' ? 'Administrador' : 'Operador'}
                            </span>
                          ) : (
                            <select
                              value={user.role}
                              disabled={isLoading}
                              onChange={(e) =>
                                handleChangeRole(user.id, e.target.value as 'ADMIN' | 'OPERATOR')
                              }
                              className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-primary-500 ${
                                user.role === 'ADMIN'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              <option value="OPERATOR">Operador</option>
                              <option value="ADMIN">Administrador</option>
                            </select>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {!isSelf && (
                            <button
                              onClick={() => handleToggleActive(user.id, user.active)}
                              disabled={isLoading}
                              className={`text-sm font-medium px-3 py-1 rounded-md disabled:opacity-50 ${
                                user.active
                                  ? 'text-red-700 bg-red-50 hover:bg-red-100'
                                  : 'text-green-700 bg-green-50 hover:bg-green-100'
                              }`}
                            >
                              {isLoading ? '...' : user.active ? 'Desativar' : 'Ativar'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
