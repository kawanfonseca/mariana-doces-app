import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Eye,
  Plus
} from 'lucide-react';
import { ingredientsService } from '@/services/ingredients';
import { Ingredient } from '@/types';
import { formatCurrency } from '@/utils/format';
import { useAuthStore } from '@/store/auth';

interface StockSummary {
  totalIngredients: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
  criticalItems: Ingredient[];
}

export function StockDashboard() {
  const [stockSummary, setStockSummary] = useState<StockSummary>({
    totalIngredients: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0,
    criticalItems: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = async () => {
    try {
      setLoading(true);
      const response = await ingredientsService.getIngredients();
      const activeIngredients = response.data.filter(i => i.active);
      
      const totalIngredients = activeIngredients.length;
      const lowStockCount = activeIngredients.filter(i => i.currentStock <= i.minStock && i.currentStock > 0).length;
      const outOfStockCount = activeIngredients.filter(i => i.currentStock <= 0).length;
      const totalValue = activeIngredients.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);
      
      // Top 5 itens críticos (sem estoque ou estoque muito baixo)
      const criticalItems = activeIngredients
        .filter(i => i.currentStock <= i.minStock)
        .sort((a, b) => a.currentStock - b.currentStock)
        .slice(0, 5);

      setStockSummary({
        totalIngredients,
        lowStockCount,
        outOfStockCount,
        totalValue,
        criticalItems
      });
    } catch (error) {
      console.error('Erro ao carregar dados do estoque:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="card-content">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Ingredientes</p>
                <p className="text-2xl font-bold text-gray-900">{stockSummary.totalIngredients}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-gray-900">{stockSummary.lowStockCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sem Estoque</p>
                <p className="text-2xl font-bold text-gray-900">{stockSummary.outOfStockCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stockSummary.totalValue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Items Alert */}
      {stockSummary.criticalItems.length > 0 && (
        <div className="card border-l-4 border-red-500">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Itens Críticos de Estoque
                  </h3>
                  <p className="text-sm text-gray-600">
                    {stockSummary.criticalItems.length} ingrediente(s) precisam de atenção
                  </p>
                </div>
              </div>
              <Link
                to="/gerenciamento-estoque"
                className="btn-outline"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Link>
            </div>
            
            <div className="mt-4 space-y-2">
              {stockSummary.criticalItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Estoque atual: {item.currentStock} {item.unit} | 
                      Mínimo: {item.minStock} {item.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.currentStock <= 0 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.currentStock <= 0 ? 'Sem Estoque' : 'Estoque Baixo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Ações Rápidas</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/gerenciamento-estoque"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Gerenciar Estoque</p>
                <p className="text-sm text-gray-600">Ver e gerenciar ingredientes</p>
              </div>
            </Link>

            {isAdmin && (
              <Link
                to="/gerenciamento-estoque"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <Plus className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Nova Movimentação</p>
                  <p className="text-sm text-gray-600">Registrar entrada/saída</p>
                </div>
              </Link>
            )}

            <Link
              to="/relatorios-estoque"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Relatórios</p>
                <p className="text-sm text-gray-600">Análise de estoque</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Stock Status Overview */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Status do Estoque</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-full w-12 h-12 mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Normal</p>
              <p className="text-2xl font-bold text-green-600">
                {stockSummary.totalIngredients - stockSummary.lowStockCount - stockSummary.outOfStockCount}
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-yellow-100 rounded-full w-12 h-12 mx-auto mb-2">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Atenção</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stockSummary.lowStockCount}
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-red-100 rounded-full w-12 h-12 mx-auto mb-2">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Crítico</p>
              <p className="text-2xl font-bold text-red-600">
                {stockSummary.outOfStockCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
