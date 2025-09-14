import { format as formatDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDateBR = (date: string | Date, pattern = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDate(dateObj, pattern, { locale: ptBR });
};

export const formatDateTimeBR = (date: string | Date): string => {
  return formatDateBR(date, 'dd/MM/yyyy HH:mm');
};

export const formatDateInput = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDate(dateObj, 'yyyy-MM-dd');
};

export const parseInputDate = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00');
};

export const formatChannelName = (channel: 'DIRECT' | 'IFOOD'): string => {
  return channel === 'DIRECT' ? 'Direto' : 'iFood';
};

export const formatUnit = (unit: string): string => {
  const units: Record<string, string> = {
    'g': 'gramas',
    'kg': 'quilos',
    'ml': 'mililitros',
    'l': 'litros',
    'un': 'unidades',
    'dz': 'dúzias',
  };
  return units[unit] || unit;
};
