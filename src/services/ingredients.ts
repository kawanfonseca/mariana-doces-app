import { api } from './api';
import { createApiError } from '@/utils/parseApiError';
import {
  Ingredient,
  CreateIngredientRequest,
  PaginatedResponse,
  StockMovement,
  CreateStockMovementRequest
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
    } catch (error) {
      throw createApiError(error, 'Ingrediente não encontrado');
    }
  },

  async createIngredient(data: CreateIngredientRequest): Promise<Ingredient> {
    try {
      const response = await api.post('/ingredients', data);
      return response.data;
    } catch (error) {
      throw createApiError(error, 'Erro ao criar ingrediente');
    }
  },

  async updateIngredient(id: string, data: Partial<CreateIngredientRequest>): Promise<Ingredient> {
    try {
      const response = await api.put(`/ingredients/${id}`, data);
      return response.data;
    } catch (error) {
      throw createApiError(error, 'Erro ao atualizar ingrediente');
    }
  },

  async deleteIngredient(id: string): Promise<void> {
    try {
      await api.delete(`/ingredients/${id}`);
    } catch (error) {
      throw createApiError(error, 'Erro ao excluir ingrediente');
    }
  },

  // Stock Management
  async getStockMovements(params?: {
    page?: number;
    limit?: number;
    ingredientId?: string;
  }): Promise<PaginatedResponse<StockMovement>> {
    try {
      const response = await api.get('/stock/movements', { params });
      return response.data;
    } catch (error) {
      throw createApiError(error, 'Erro ao carregar movimentações');
    }
  },

  async createStockMovement(data: CreateStockMovementRequest): Promise<StockMovement> {
    try {
      const response = await api.post('/stock/movements', data);
      return response.data;
    } catch (error) {
      throw createApiError(error, 'Erro ao registrar movimentação');
    }
  },
};
