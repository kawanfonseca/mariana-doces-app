import { api } from './api';
import { createApiError } from '@/utils/parseApiError';
import {
  Product,
  CreateProductRequest,
  PaginatedResponse,
  ProductRecipe,
  UpdateProductRecipeRequest,
  PricingPreview
} from '@/types';

export const productsService = {
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Product>> {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Erro na API de produtos:', error);
      throw createApiError(error, 'Erro ao carregar produtos');
    }
  },

  async getProduct(id: string): Promise<Product> {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw createApiError(error, 'Produto não encontrado');
    }
  },

  async createProduct(data: CreateProductRequest): Promise<Product> {
    try {
      const response = await api.post('/products', data);
      return response.data;
    } catch (error) {
      throw createApiError(error, 'Erro ao criar produto');
    }
  },

  async updateProduct(id: string, data: Partial<CreateProductRequest>): Promise<Product> {
    try {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    } catch (error) {
      throw createApiError(error, 'Erro ao atualizar produto');
    }
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async getProductRecipe(id: string): Promise<ProductRecipe> {
    const response = await api.get(`/products/${id}/recipe`);
    return response.data;
  },

  async updateProductRecipe(id: string, data: UpdateProductRecipeRequest): Promise<void> {
    await api.put(`/products/${id}/recipe`, data);
  },

  async getPricingPreview(productId: string): Promise<PricingPreview> {
    const response = await api.get('/products/pricing/preview', {
      params: { productId }
    });
    return response.data;
  },
};
