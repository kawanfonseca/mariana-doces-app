import { api } from './api';
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
    } catch (error: any) {
      console.error('Erro na API de produtos:', error);
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

  async getProduct(id: string): Promise<Product> {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Produto não encontrado');
      }
      throw error;
    }
  },

  async createProduct(data: CreateProductRequest): Promise<Product> {
    try {
      const response = await api.post('/products', data);
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

  async updateProduct(id: string, data: Partial<CreateProductRequest>): Promise<Product> {
    try {
      const response = await api.put(`/products/${id}`, data);
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
