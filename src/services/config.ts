import { api } from './api';

export const configService = {
  getConfigs: async (): Promise<Record<string, { value: string; description?: string }>> => {
    const response = await api.get('/config');
    return response.data;
  },
};
