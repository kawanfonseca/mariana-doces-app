import axios from 'axios';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor para lidar com erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      toast.error('Sessão expirada. Faça login novamente.');
    } else if (error.response?.status >= 500) {
      toast.error('Erro interno do servidor. Tente novamente.');
    } else if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    } else {
      toast.error('Erro inesperado. Tente novamente.');
    }
    return Promise.reject(error);
  }
);
