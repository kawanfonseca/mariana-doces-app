import { useEffect, useState } from 'react';
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  Package,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ingredientsService } from '@/services/ingredients';
import { Ingredient } from '@/types';
import { formatCurrency } from '@/utils/format';
import { useAuthStore } from '@/store/auth';

interface StockReport {
  totalValue: number;
  lowStockValue: number;
  outOfStockValue: number;
  averageStockLevel: number;
  topIngredients: Array<{
    id: string;
    name: string;
    value: number;
    percentage: number;
  }>;
  stockDistribution: {
    normal: number;
    low: number;
    out: number;
  };
}

interface MovementReport {
  totalMovements: number;
  movementsByType: {
    IN: number;
    OUT: number;
    ADJUSTMENT: number;
  };
  topReasons: Array<{
    reason: string;
    count: number;
  }>;
}

export function StockReports() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [stockReport, setStockReport] = useState<StockReport | null>(null);
  const [movementReport, setMovementReport] = useState<MovementReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const { user: _user } = useAuthStore();

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await ingredientsService.getIngredients();
      const activeIngredients = response.data.filter(i => i.active);
      setIngredients(activeIngredients);
      
      // Gerar relatório de estoque
      generateStockReport(activeIngredients);
      
      // TODO: Gerar relatório de movimentações quando a API estiver disponível
      _generateMovementReport();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados dos relatórios');
    } finally {
      setLoading(false);
    }
  };

  const generateStockReport = (ingredientsList: Ingredient[]) => {
    const totalValue = ingredientsList.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);
    
    const lowStockIngredients = ingredientsList.filter(i => i.currentStock <= i.minStock && i.currentStock > 0);
    const outOfStockIngredients = ingredientsList.filter(i => i.currentStock <= 0);
    
    const lowStockValue = lowStockIngredients.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);
    const outOfStockValue = outOfStockIngredients.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);
    
    const averageStockLevel = ingredientsList.length > 0 ?
      ingredientsList.reduce((sum, i) => {
        const level = i.minStock > 0 ? (i.currentStock / i.minStock) : (i.currentStock > 0 ? 1 : 0);
        return sum + level;
      }, 0) / ingredientsList.length : 0;

    // Top 5 ingredientes por valor
    const topIngredients = ingredientsList
      .map(i => ({
        id: i.id,
        name: i.name,
        value: i.currentStock * i.costPerUnit,
        percentage: 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map(item => ({
        ...item,
        percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0
      }));

    // Distribuição do estoque
    const stockDistribution = {
      normal: ingredientsList.filter(i => i.currentStock > i.minStock).length,
      low: lowStockIngredients.length,
      out: outOfStockIngredients.length
    };

    setStockReport({
      totalValue,
      lowStockValue,
      outOfStockValue,
      averageStockLevel,
      topIngredients,
      stockDistribution
    });
  };

  const _generateMovementReport = () => {
    setMovementReport({
      totalMovements: 0,
      movementsByType: { IN: 0, OUT: 0, ADJUSTMENT: 0 },
      topReasons: []
    });
  };

  const exportStockReport = () => {
    if (!stockReport) return;

    const csvContent = [
      ['Relatório de Estoque', ''],
      ['Data', new Date().toLocaleDateString()],
      ['', ''],
      ['Resumo Geral', ''],
      ['Valor Total do Estoque', formatCurrency(stockReport.totalValue)],
      ['Valor em Estoque Baixo', formatCurrency(stockReport.lowStockValue)],
      ['Valor Sem Estoque', formatCurrency(stockReport.outOfStockValue)],
      ['Nível Médio de Estoque', `${(stockReport.averageStockLevel * 100).toFixed(1)}%`],
      ['', ''],
      ['Distribuição do Estoque', ''],
      ['Normal', stockReport.stockDistribution.normal],
      ['Estoque Baixo', stockReport.stockDistribution.low],
      ['Sem Estoque', stockReport.stockDistribution.out],
      ['', ''],
      ['Top 5 Ingredientes por Valor', ''],
      ['Nome', 'Valor', 'Percentual'],
      ...stockReport.topIngredients.map(item => [
        item.name,
        formatCurrency(item.value),
        `${item.percentage.toFixed(1)}%`
      ]),
      ['', ''],
      ['Detalhamento por Ingrediente', ''],
      ['Nome', 'Unidade', 'Estoque Atual', 'Estoque Mínimo', 'Custo Unitário', 'Valor Total', 'Status'],
      ...ingredients.map(ingredient => {
        const status = ingredient.currentStock <= 0 ? 'Sem Estoque' : 
                      ingredient.currentStock <= ingredient.minStock ? 'Estoque Baixo' : 'Normal';
        const totalValue = ingredient.currentStock * ingredient.costPerUnit;
        return [
          ingredient.name,
          ingredient.unit,
          ingredient.currentStock,
          ingredient.minStock,
          ingredient.costPerUnit,
          totalValue,
          status
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-estoque-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Relatório exportado com sucesso');
  };

  const exportMovementReport = () => {
    if (!movementReport) return;

    const csvContent = [
      ['Relatório de Movimentações', ''],
      ['Período', `${dateRange.start} a ${dateRange.end}`],
      ['', ''],
      ['Resumo', ''],
      ['Total de Movimentações', movementReport.totalMovements],
      ['', ''],
      ['Por Tipo', ''],
      ['Entradas', movementReport.movementsByType.IN],
      ['Saídas', movementReport.movementsByType.OUT],
      ['Ajustes', movementReport.movementsByType.ADJUSTMENT],
      ['', ''],
      ['Principais Motivos', ''],
      ['Motivo', 'Quantidade'],
      ...movementReport.topReasons.map(item => [item.reason, item.count])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-movimentacoes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Relatório de movimentações exportado com sucesso');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios de Estoque</h1>
          <p className="text-sm text-gray-600 mt-1">
            Análise detalhada do estoque e movimentações
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportStockReport}
            className="btn-outline"
            disabled={!stockReport}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Estoque
          </button>
          
          <button
            onClick={exportMovementReport}
            className="btn-outline"
            disabled={!movementReport}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Movimentações
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="card-content">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Período:</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="input"
              />
              <span className="text-gray-500">até</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stock Overview */}
      {stockReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stockReport.totalValue)}
                  </p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stockReport.lowStockValue)}
                  </p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stockReport.outOfStockValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Nível Médio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stockReport.averageStockLevel * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Distribution Chart */}
      {stockReport && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Distribuição do Estoque</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                    <span className="text-sm font-medium">Normal</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {stockReport.stockDistribution.normal} ingredientes
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                    <span className="text-sm font-medium">Estoque Baixo</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {stockReport.stockDistribution.low} ingredientes
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                    <span className="text-sm font-medium">Sem Estoque</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {stockReport.stockDistribution.out} ingredientes
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Top 5 Ingredientes por Valor</h3>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {stockReport.topIngredients.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-600 w-6">
                        {index + 1}°
                      </span>
                      <span className="text-sm font-medium ml-2">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(item.value)}</p>
                      <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movement Report */}
      {movementReport && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Relatório de Movimentações</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-3 bg-green-100 rounded-full w-12 h-12 mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Entradas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {movementReport.movementsByType.IN}
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-red-100 rounded-full w-12 h-12 mx-auto mb-2">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Saídas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {movementReport.movementsByType.OUT}
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-2">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Ajustes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {movementReport.movementsByType.ADJUSTMENT}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Stock Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Detalhamento do Estoque</h3>
        </div>
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Unidade</th>
                  <th className="text-right">Estoque Atual</th>
                  <th className="text-right">Estoque Mínimo</th>
                  <th className="text-right">Custo Unitário</th>
                  <th className="text-right">Valor Total</th>
                  <th>Status</th>
                  <th className="text-right">Nível (%)</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ingredient) => {
                  const totalValue = ingredient.currentStock * ingredient.costPerUnit;
                  const stockLevel = ingredient.minStock > 0 ? 
                    (ingredient.currentStock / ingredient.minStock) * 100 : 0;
                  
                  let status = 'Normal';
                  let statusColor = 'text-green-600 bg-green-50';
                  
                  if (ingredient.currentStock <= 0) {
                    status = 'Sem Estoque';
                    statusColor = 'text-red-600 bg-red-50';
                  } else if (ingredient.currentStock <= ingredient.minStock) {
                    status = 'Estoque Baixo';
                    statusColor = 'text-yellow-600 bg-yellow-50';
                  }
                  
                  return (
                    <tr key={ingredient.id}>
                      <td className="font-medium">{ingredient.name}</td>
                      <td>{ingredient.unit}</td>
                      <td className="text-right font-medium">
                        {ingredient.currentStock} {ingredient.unit}
                      </td>
                      <td className="text-right text-gray-600">
                        {ingredient.minStock} {ingredient.unit}
                      </td>
                      <td className="text-right">
                        {formatCurrency(ingredient.costPerUnit)}
                      </td>
                      <td className="text-right font-medium">
                        {formatCurrency(totalValue)}
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className={`font-medium ${
                          stockLevel <= 0 ? 'text-red-600' : 
                          stockLevel <= 100 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {stockLevel.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
