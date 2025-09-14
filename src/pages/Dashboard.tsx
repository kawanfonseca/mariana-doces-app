import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package,
  Calendar
} from 'lucide-react';
import { formatCurrency, formatDateBR } from '@/utils/format';
import { api } from '@/services/api';
import { ReportSummary, ProductReport } from '@/types';

export function Dashboard() {
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
      color: 'text-green-600 bg-green-100',
    },
    {
      name: 'Receita Líquida',
      value: formatCurrency(summary?.netRevenue || 0),
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      name: 'Total de Pedidos',
      value: summary?.orderCount?.toString() || '0',
      icon: ShoppingCart,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      name: 'Ticket Médio',
      value: formatCurrency(summary?.avgOrderValue || 0),
      icon: Package,
      color: 'text-orange-600 bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Visão geral dos últimos 30 dias
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Atualizado em {formatDateBR(new Date(), 'dd/MM/yyyy HH:mm')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Top 5 Produtos</h3>
            <p className="text-sm text-gray-600">Produtos mais vendidos por receita</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full text-primary-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.productName}</p>
                        <p className="text-sm text-gray-500">
                          {product.quantitySold} vendidos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(product.revenue)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(product.profit)} lucro
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma venda registrada no período
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Summary by Channel */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Resumo Financeiro</h3>
            <p className="text-sm text-gray-600">Breakdown dos valores</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Receita Bruta</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(summary?.grossRevenue || 0)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Descontos</span>
                <span className="font-semibold text-red-600">
                  -{formatCurrency(summary?.discounts || 0)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Taxas de Plataforma</span>
                <span className="font-semibold text-red-600">
                  -{formatCurrency(summary?.platformFees || 0)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Custos</span>
                <span className="font-semibold text-red-600">
                  -{formatCurrency(summary?.costs || 0)}
                </span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Receita Líquida</span>
                  <span className="font-bold text-blue-600 text-lg">
                    {formatCurrency(summary?.netRevenue || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Ações Rápidas</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/vendas"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ShoppingCart className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-blue-900">Registrar Venda</p>
                <p className="text-sm text-blue-700">Lançar vendas do dia</p>
              </div>
            </a>
            
            <a
              href="/produtos"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Package className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-900">Gerenciar Produtos</p>
                <p className="text-sm text-green-700">Produtos e receitas</p>
              </div>
            </a>
            
            <a
              href="/relatorios"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-purple-900">Ver Relatórios</p>
                <p className="text-sm text-purple-700">Análises detalhadas</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
