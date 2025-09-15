import { api } from './api';
import { 
  Ingredient, 
  CreateIngredientRequest, 
  PaginatedResponse 
} from '@/types';

export const ingredientsService = {
  async getIngredients(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
  }): Promise<PaginatedResponse<Ingredient>> {
    const response = await api.get('/ingredients', { params });
    return response.data;
  },

  async getIngredient(id: string): Promise<Ingredient> {
    try {
      const response = await api.get(`/ingredients/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Ingrediente não encontrado');
      }
      throw error;
    }
  },

  async createIngredient(data: CreateIngredientRequest): Promise<Ingredient> {
    try {
      const response = await api.post('/ingredients', data);
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

  async updateIngredient(id: string, data: Partial<CreateIngredientRequest>): Promise<Ingredient> {
    try {
      const response = await api.put(`/ingredients/${id}`, data);
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

  async deleteIngredient(id: string): Promise<void> {
    try {
      await api.delete(`/ingredients/${id}`);
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },
};
