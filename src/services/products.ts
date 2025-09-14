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
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await api.post('/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: Partial<CreateProductRequest>): Promise<Product> {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
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
