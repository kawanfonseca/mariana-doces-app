import { api } from './api';
import { LoginRequest, LoginResponse, User } from '@/types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(data: { name: string; email: string; password: string }): Promise<void> {
    await api.post('/auth/register', data);
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    // No endpoint específico de logout, apenas limpar o estado local
    return Promise.resolve();
  },
};
