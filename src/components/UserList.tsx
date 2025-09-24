import React, { useState } from 'react';
import { User, usersService } from '../services/users';

interface UserListProps {
  users: User[];
  onUserUpdated: () => void;
}

export const UserList: React.FC<UserListProps> = ({ users, onUserUpdated }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setLoading(userId);
    setError(null);

    try {
      await usersService.updateUser(userId, { active: !currentStatus });
      onUserUpdated();
    } catch (error: any) {
      console.error('Erro ao alterar status do usuário:', error);
      setError(error.response?.data?.error || 'Erro ao alterar status do usuário');
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) {
      return;
    }

    setLoading(userId);
    setError(null);

    try {
      await usersService.deleteUser(userId);
      onUserUpdated();
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      setError(error.response?.data?.error || 'Erro ao excluir usuário');
    } finally {
      setLoading(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'OPERATOR':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'OPERATOR':
        return 'Operador';
      default:
        return role;
    }
  };

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
          <p className="text-gray-500">Crie o primeiro usuário para começar a usar o sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Usuários Cadastrados</h2>
        <p className="text-sm text-gray-600 mt-1">{users.length} usuário(s) encontrado(s)</p>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {users.map((user) => (
          <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Criado em:</strong> {new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
                  {user.updatedAt !== user.createdAt && (
                    <p><strong>Atualizado em:</strong> {new Date(user.updatedAt).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleToggleStatus(user.id, user.active)}
                  disabled={loading === user.id}
                  className={`px-3 py-1 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    user.active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
                  }`}
                >
                  {loading === user.id ? '...' : user.active ? 'Desativar' : 'Ativar'}
                </button>
                
                <button
                  onClick={() => handleDeleteUser(user.id, user.name)}
                  disabled={loading === user.id}
                  className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
