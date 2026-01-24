import { describe, it, expect } from 'vitest'
import { AxiosError } from 'axios'
import { parseApiError, createApiError } from './parseApiError'

describe('parseApiError', () => {
  it('should extract error message from API response', () => {
    const error = new AxiosError('Request failed')
    error.response = {
      status: 400,
      data: { error: 'Email já cadastrado' },
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    }

    expect(parseApiError(error)).toBe('Email já cadastrado')
  })

  it('should extract first validation detail', () => {
    const error = new AxiosError('Request failed')
    error.response = {
      status: 422,
      data: {
        details: [
          { message: 'Nome é obrigatório', path: ['name'] },
          { message: 'Email inválido', path: ['email'] },
        ]
      },
      statusText: 'Unprocessable Entity',
      headers: {},
      config: {} as any,
    }

    expect(parseApiError(error)).toBe('Nome é obrigatório')
  })

  it('should return fallback for network errors', () => {
    const error = new AxiosError('Network Error')
    error.code = 'ERR_NETWORK'

    expect(parseApiError(error)).toBe('Erro de conexão. Verifique sua internet.')
  })

  it('should handle 401 errors', () => {
    const error = new AxiosError('Unauthorized')
    error.response = {
      status: 401,
      data: {},
      statusText: 'Unauthorized',
      headers: {},
      config: {} as any,
    }

    expect(parseApiError(error)).toBe('Sessão expirada. Faça login novamente.')
  })

  it('should handle 500 errors', () => {
    const error = new AxiosError('Internal Server Error')
    error.response = {
      status: 500,
      data: {},
      statusText: 'Internal Server Error',
      headers: {},
      config: {} as any,
    }

    expect(parseApiError(error)).toBe('Erro interno do servidor. Tente novamente.')
  })

  it('should return fallback message for unknown errors', () => {
    expect(parseApiError('something went wrong')).toBe('Erro inesperado. Tente novamente.')
  })

  it('should extract message from standard Error', () => {
    const error = new Error('Custom error message')
    expect(parseApiError(error)).toBe('Custom error message')
  })
})

describe('createApiError', () => {
  it('should create Error with parsed message', () => {
    const axiosError = new AxiosError('Request failed')
    axiosError.response = {
      status: 409,
      data: { error: 'Usuário já existe' },
      statusText: 'Conflict',
      headers: {},
      config: {} as any,
    }

    const error = createApiError(axiosError)

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('Usuário já existe')
  })
})
