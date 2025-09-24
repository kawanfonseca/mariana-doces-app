import { api } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OPERATOR';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'OPERATOR';
}

export interface UpdateUserData {
  name?: string;
  role?: 'ADMIN' | 'OPERATOR';
  active?: boolean;
}

export interface UsersResponse {
  success: boolean;
  users: User[];
  total: number;
}

export interface UserResponse {
  success: boolean;
  user: User;
  message?: string;
}

export const usersService = {
  // Criar usuário
  async createUser(userData: CreateUserData): Promise<UserResponse> {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Listar usuários
  async getUsers(): Promise<UsersResponse> {
    const response = await api.get('/users');
    return response.data;
  },

  // Buscar usuário por ID
  async getUserById(id: string): Promise<UserResponse> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Atualizar usuário
  async updateUser(id: string, userData: UpdateUserData): Promise<UserResponse> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Deletar usuário
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Criar usuários padrão
  async createDefaultUsers(): Promise<void> {
    const defaultUsers = [
      {
        name: 'Administrador',
        email: 'admin@marianadoces.com',
        password: 'admin123',
        role: 'ADMIN' as const
      },
      {
        name: 'Operador',
        email: 'operador@marianadoces.com',
        password: 'operador123',
        role: 'OPERATOR' as const
      }
    ];

    for (const user of defaultUsers) {
      try {
        await this.createUser(user);
        console.log(`✅ Usuário padrão criado: ${user.email}`);
      } catch (error: any) {
        if (error.response?.status === 409) {
          console.log(`⚠️ Usuário já existe: ${user.email}`);
        } else {
          console.error(`❌ Erro ao criar usuário ${user.email}:`, error);
        }
      }
    }
  }
};
