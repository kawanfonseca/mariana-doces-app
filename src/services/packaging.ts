import { api } from './api';
import { 
  Packaging, 
  CreatePackagingRequest, 
  PaginatedResponse 
} from '@/types';

export const packagingService = {
  async getPackaging(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
  }): Promise<PaginatedResponse<Packaging>> {
    const response = await api.get('/packaging', { params });
    return response.data;
  },

  async getPackagingItem(id: string): Promise<Packaging> {
    try {
      const response = await api.get(`/packaging/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Embalagem não encontrada');
      }
      throw error;
    }
  },

  async createPackaging(data: CreatePackagingRequest): Promise<Packaging> {
    try {
      const response = await api.post('/packaging', data);
      return response.data;
    } catch (error: any) {
      // Re-throw with more specific error handling
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.details) {
        const details = error.response.data.details;
        if (Array.isArray(details) && details.length > 0) {
          throw new Error(details[0].message || 'Parâmetros inválidos');
        }
        throw new Error('Parâmetros inválidos');
      }
      throw error;
    }
  },

  async updatePackaging(id: string, data: Partial<CreatePackagingRequest>): Promise<Packaging> {
    try {
      const response = await api.put(`/packaging/${id}`, data);
      return response.data;
    } catch (error: any) {
      // Re-throw with more specific error handling
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.details) {
        const details = error.response.data.details;
        if (Array.isArray(details) && details.length > 0) {
          throw new Error(details[0].message || 'Parâmetros inválidos');
        }
        throw new Error('Parâmetros inválidos');
      }
      throw error;
    }
  },

  async deletePackaging(id: string): Promise<void> {
    try {
      await api.delete(`/packaging/${id}`);
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },
};
