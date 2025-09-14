import { api } from './api';
import { 
  SaleOrder, 
  CreateSaleOrderRequest, 
  PaginatedResponse 
} from '@/types';

export const ordersService = {
  async getOrders(params?: { 
    page?: number; 
    limit?: number; 
    dateFrom?: string;
    dateTo?: string;
    channel?: 'DIRECT' | 'IFOOD';
  }): Promise<PaginatedResponse<SaleOrder>> {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  async getOrder(id: string): Promise<SaleOrder> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async createOrder(data: CreateSaleOrderRequest): Promise<SaleOrder> {
    const response = await api.post('/orders', data);
    return response.data;
  },

  async updateOrder(id: string, data: Partial<CreateSaleOrderRequest>): Promise<SaleOrder> {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },

  async deleteOrder(id: string): Promise<void> {
    await api.delete(`/orders/${id}`);
  },
};
