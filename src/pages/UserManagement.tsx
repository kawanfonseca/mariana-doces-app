import React, { useState, useEffect } from 'react';
import { User, usersService } from '../services/users';
import { UserForm } from '../components/UserForm';
import { UserList } from '../components/UserList';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [creatingDefaults, setCreatingDefaults] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersService.getUsers();
      
      if (response.success) {
        setUsers(response.users);
      } else {
        setError('Erro ao carregar usuários');
      }
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      setError(error.response?.data?.error || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefaultUsers = async () => {
    setCreatingDefaults(true);
    try {
      await usersService.createDefaultUsers();
      await loadUsers(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao criar usuários padrão:', error);
    } finally {
      setCreatingDefaults(false);
    }
  };

  const handleUserCreated = () => {
    loadUsers(); // Recarregar lista após criar usuário
  };

  const handleUserUpdated = () => {
    loadUsers(); // Recarregar lista após atualizar usuário
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="mt-2 text-gray-600">
            Gerencie os usuários do sistema Mariana Doces
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            ➕ Criar Novo Usuário
          </button>
          
          <button
            onClick={handleCreateDefaultUsers}
            disabled={creatingDefaults}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingDefaults ? 'Criando...' : '👑 Criar Usuários Padrão'}
          </button>
          
          <button
            onClick={loadUsers}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            🔄 Atualizar Lista
          </button>
        </div>

        {/* User Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <UserForm
                onUserCreated={handleUserCreated}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        {/* Users List */}
        <UserList users={users} onUserUpdated={handleUserUpdated} />

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Usuários</p>
                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Usuários Ativos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(user => user.active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">👑</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Administradores</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(user => user.role === 'ADMIN').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
