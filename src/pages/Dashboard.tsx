import { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Calendar,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { formatCurrency, formatDateBR } from '@/utils/format';
import { api } from '@/services/api';
import { ReportSummary, ProductReport } from '@/types';
import { useAuthStore } from '@/store/auth';

export function Dashboard() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [topProducts, setTopProducts] = useState<ProductReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar dados dos últimos 30 dias
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const [summaryResponse, productsResponse] = await Promise.all([
        api.get('/reports/summary', {
          params: {
            dateFrom: startDate.toISOString().split('T')[0],
            dateTo: endDate.toISOString().split('T')[0],
          }
        }),
        api.get('/reports/products', {
          params: {
            dateFrom: startDate.toISOString().split('T')[0],
            dateTo: endDate.toISOString().split('T')[0],
          }
        })
      ]);

      setSummary(summaryResponse.data);
      setTopProducts(productsResponse.data.slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Receita Bruta',
      value: formatCurrency(summary?.grossRevenue || 0),
      icon: DollarSign,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-100',
      gradientFrom: 'from-primary-50',
      gradientTo: 'to-accent-50',
    },
    {
      name: 'Receita Líquida',
      value: formatCurrency(summary?.netRevenue || 0),
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      gradientFrom: 'from-amber-50',
      gradientTo: 'to-orange-50',
    },
    {
      name: 'Total de Pedidos',
      value: summary?.orderCount?.toString() || '0',
      icon: ShoppingCart,
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
      borderColor: 'border-accent-100',
      gradientFrom: 'from-accent-50',
      gradientTo: 'to-amber-50',
    },
    {
      name: 'Ticket Médio',
      value: formatCurrency(summary?.avgOrderValue || 0),
      icon: Package,
      color: 'text-warm-brown-600',
      bgColor: 'bg-warm-brown-50',
      borderColor: 'border-warm-brown-100',
      gradientFrom: 'from-warm-brown-50',
      gradientTo: 'to-cream-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary-400" />
            <span className="text-sm font-medium text-primary-600">
              Bem-vindo(a) de volta
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {user?.name?.split(' ')[0] || 'Usuário'}!
          </h1>
          <p className="text-sm text-warm-brown-500 mt-1">
            Visão geral dos últimos 30 dias
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-warm-brown-400 bg-white px-4 py-2 rounded-xl shadow-sm border border-warm-brown-100">
          <Calendar className="w-4 h-4" />
          <span>Atualizado em {formatDateBR(new Date(), 'dd/MM/yyyy HH:mm')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${stat.gradientFrom} ${stat.gradientTo} border ${stat.borderColor} p-6 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warm-brown-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            {/* Decorative circle */}
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${stat.bgColor} opacity-40`}></div>
          </div>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card-warm">
          <div className="p-6 pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Top 5 Produtos</h3>
            <p className="text-sm text-warm-brown-400">Produtos mais vendidos por receita</p>
          </div>
          <div className="p-6 pt-4">
            <div className="space-y-3">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between p-3 rounded-xl hover:bg-cream-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-semibold text-sm ${
                        index === 0
                          ? 'bg-primary-100 text-primary-700'
                          : index === 1
                          ? 'bg-accent-100 text-accent-600'
                          : 'bg-warm-brown-100 text-warm-brown-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.productName}</p>
                        <p className="text-sm text-warm-brown-400">
                          {product.quantitySold} vendidos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(product.revenue)}
                      </p>
                      <p className="text-sm text-emerald-600">
                        {formatCurrency(product.profit)} lucro
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-warm-brown-400 text-center py-8">
                  Nenhuma venda registrada no período
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="card-warm">
          <div className="p-6 pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Resumo Financeiro</h3>
            <p className="text-sm text-warm-brown-400">Breakdown dos valores</p>
          </div>
          <div className="p-6 pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-700 font-medium">Receita Bruta</span>
                </div>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(summary?.grossRevenue || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                  <span className="text-gray-600">Descontos</span>
                </div>
                <span className="font-semibold text-red-500">
                  -{formatCurrency(summary?.discounts || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                  <span className="text-gray-600">Taxas de Plataforma</span>
                </div>
                <span className="font-semibold text-red-500">
                  -{formatCurrency(summary?.platformFees || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                  <span className="text-gray-600">Custos</span>
                </div>
                <span className="font-semibold text-red-500">
                  -{formatCurrency(summary?.costs || 0)}
                </span>
              </div>

              <div className="border-t border-warm-brown-100 pt-4 mt-2">
                <div className="flex items-center justify-between p-3 bg-primary-50 rounded-xl">
                  <span className="font-semibold text-gray-900">Receita Líquida</span>
                  <span className="font-bold text-primary-700 text-lg">
                    {formatCurrency(summary?.netRevenue || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-warm">
        <div className="p-6 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">Ações Rápidas</h3>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/vendas"
              className="flex items-center p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl hover:shadow-md border border-primary-100 transition-all"
            >
              <div className="p-2 bg-primary-100 rounded-lg mr-3">
                <ShoppingCart className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Registrar Venda</p>
                <p className="text-sm text-warm-brown-400">Lançar vendas do dia</p>
              </div>
            </a>

            <a
              href="/produtos"
              className="flex items-center p-4 bg-gradient-to-br from-accent-50 to-amber-50 rounded-xl hover:shadow-md border border-accent-100 transition-all"
            >
              <div className="p-2 bg-accent-100 rounded-lg mr-3">
                <Package className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Gerenciar Produtos</p>
                <p className="text-sm text-warm-brown-400">Produtos e receitas</p>
              </div>
            </a>

            <a
              href="/relatorios"
              className="flex items-center p-4 bg-gradient-to-br from-amber-50 to-warm-brown-50 rounded-xl hover:shadow-md border border-amber-100 transition-all"
            >
              <div className="p-2 bg-amber-100 rounded-lg mr-3">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Ver Relatórios</p>
                <p className="text-sm text-warm-brown-400">Análises detalhadas</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
