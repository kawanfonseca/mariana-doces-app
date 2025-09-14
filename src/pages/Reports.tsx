import { useEffect, useState } from 'react';
import { Calendar, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '@/services/api';
import { ReportSummary, ProductReport } from '@/types';
import { formatCurrency, formatDateInput, formatChannelName } from '@/utils/format';

export function Reports() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [productReports, setProductReports] = useState<ProductReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return formatDateInput(date);
  });
  const [dateTo, setDateTo] = useState(formatDateInput(new Date()));
  const [selectedChannel, setSelectedChannel] = useState<'ALL' | 'DIRECT' | 'IFOOD'>('ALL');

  useEffect(() => {
    loadReports();
  }, [dateFrom, dateTo, selectedChannel]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        dateFrom,
        dateTo,
      };

      if (selectedChannel !== 'ALL') {
        params.channel = selectedChannel;
      }

      const [summaryResponse, productsResponse] = await Promise.all([
        api.get('/reports/summary', { params }),
        api.get('/reports/products', { params })
      ]);

      setSummary(summaryResponse.data);
      setProductReports(productsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params: any = { dateFrom, dateTo };
      if (selectedChannel !== 'ALL') {
        params.channel = selectedChannel;
      }

      const response = await api.get('/reports/export/csv', {
        params,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-vendas-${dateFrom}-${dateTo}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-sm text-gray-600 mt-1">
            Análise de vendas e performance
          </p>
        </div>
        
        <button onClick={handleExportCSV} className="btn-outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canal
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value as any)}
                className="input"
              >
                <option value="ALL">Todos</option>
                <option value="DIRECT">Direto</option>
                <option value="IFOOD">iFood</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={loadReports}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Carregando...' : 'Filtrar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receita Bruta</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(summary.grossRevenue)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receita Líquida</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {formatCurrency(summary.netRevenue)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {summary.orderCount}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">#</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {formatCurrency(summary.avgOrderValue)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Report */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Relatório por Produtos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Produto</th>
                <th className="text-right">Qtd. Vendida</th>
                <th className="text-right">Receita</th>
                <th className="text-right">Custos</th>
                <th className="text-right">Lucro</th>
                <th className="text-right">Margem %</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      <span className="ml-2">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : productReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhuma venda encontrada no período
                  </td>
                </tr>
              ) : (
                productReports.map((product) => (
                  <tr key={product.productId}>
                    <td className="font-medium">{product.productName}</td>
                    <td className="text-right">{product.quantitySold}</td>
                    <td className="text-right text-green-600 font-medium">
                      {formatCurrency(product.revenue)}
                    </td>
                    <td className="text-right text-red-600">
                      {formatCurrency(product.costs)}
                    </td>
                    <td className="text-right font-medium">
                      {formatCurrency(product.profit)}
                    </td>
                    <td className="text-right">
                      <span className={`font-medium ${
                        product.marginPercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.marginPercent.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
