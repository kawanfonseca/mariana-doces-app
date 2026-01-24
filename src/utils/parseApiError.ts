import { AxiosError } from 'axios';

interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: Array<{ message: string; path?: string[] }>;
}

/**
 * Extrai uma mensagem de erro amigável de uma resposta de erro da API
 * Centraliza a lógica de parsing de erros para evitar duplicação
 */
export function parseApiError(error: unknown, fallbackMessage = 'Erro inesperado. Tente novamente.'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;

    // Erro com mensagem específica
    if (data?.error) {
      return data.error;
    }

    // Erro com detalhes de validação (Zod)
    if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
      const firstDetail = data.details[0];
      if (firstDetail.message) {
        return firstDetail.message;
      }
    }

    // Mensagem genérica da API
    if (data?.message) {
      return data.message;
    }

    // Erros HTTP comuns
    switch (error.response?.status) {
      case 400:
        return 'Dados inválidos. Verifique as informações e tente novamente.';
      case 401:
        return 'Sessão expirada. Faça login novamente.';
      case 403:
        return 'Você não tem permissão para realizar esta ação.';
      case 404:
        return 'Recurso não encontrado.';
      case 409:
        return 'Este registro já existe.';
      case 422:
        return 'Dados inválidos. Verifique as informações.';
      case 429:
        return 'Muitas requisições. Aguarde um momento.';
      case 500:
        return 'Erro interno do servidor. Tente novamente.';
      case 502:
      case 503:
      case 504:
        return 'Servidor temporariamente indisponível. Tente novamente.';
    }

    // Erro de rede
    if (error.code === 'ERR_NETWORK') {
      return 'Erro de conexão. Verifique sua internet.';
    }
  }

  // Error padrão do JavaScript
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

/**
 * Cria um Error com mensagem parseada da API
 * Útil para re-throw em services
 */
export function createApiError(error: unknown, fallbackMessage?: string): Error {
  return new Error(parseApiError(error, fallbackMessage));
}
