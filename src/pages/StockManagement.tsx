import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  DollarSign,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ingredientsService } from '@/services/ingredients';
import { Ingredient, CreateStockMovementRequest, StockMovement } from '@/types';
import { formatCurrency } from '@/utils/format';
import { useAuthStore } from '@/store/auth';

const stockMovementSchema = z.object({
  ingredientId: z.string().min(1, 'Ingrediente é obrigatório'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type StockMovementForm = z.infer<typeof stockMovementSchema>;

interface StockAlert {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK';
  message: string;
}

interface InventoryStats {
  totalIngredients: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
  averageStockLevel: number;
}

export function StockManagement() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalIngredients: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0,
    averageStockLevel: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out' | 'normal'>('all');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [showIngredientHistory, setShowIngredientHistory] = useState(false);
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<StockMovementForm>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      ingredientId: '',
      type: 'IN',
      quantity: 0,
      reason: '',
      notes: '',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await ingredientsService.getIngredients();
      const activeIngredients = response.data.filter(i => i.active);
      setIngredients(activeIngredients);
      
      // Calcular estatísticas
      calculateStats(activeIngredients);
      
      // Gerar alertas
      generateAlerts(activeIngredients);
      
      const movementsResponse = await ingredientsService.getStockMovements();
      setStockMovements(movementsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do estoque');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ingredientsList: Ingredient[]) => {
    const totalIngredients = ingredientsList.length;
    const lowStockCount = ingredientsList.filter(i => i.currentStock <= i.minStock && i.currentStock > 0).length;
    const outOfStockCount = ingredientsList.filter(i => i.currentStock <= 0).length;
    const totalValue = ingredientsList.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);
    const averageStockLevel = totalIngredients > 0 ?
      ingredientsList.reduce((sum, i) => {
        const level = i.minStock > 0 ? (i.currentStock / i.minStock) : (i.currentStock > 0 ? 1 : 0);
        return sum + level;
      }, 0) / totalIngredients : 0;

    setStats({
      totalIngredients,
      lowStockCount,
      outOfStockCount,
      totalValue,
      averageStockLevel,
    });
  };

  const generateAlerts = (ingredientsList: Ingredient[]) => {
    const alertsList: StockAlert[] = [];
    
    ingredientsList.forEach(ingredient => {
      if (ingredient.currentStock <= 0) {
        alertsList.push({
          id: ingredient.id,
          name: ingredient.name,
          unit: ingredient.unit,
          currentStock: ingredient.currentStock,
          minStock: ingredient.minStock,
          alertType: 'OUT_OF_STOCK',
          message: `Sem estoque - ${ingredient.name}`,
        });
      } else if (ingredient.currentStock <= ingredient.minStock) {
        alertsList.push({
          id: ingredient.id,
          name: ingredient.name,
          unit: ingredient.unit,
          currentStock: ingredient.currentStock,
          minStock: ingredient.minStock,
          alertType: 'LOW_STOCK',
          message: `Estoque baixo - ${ingredient.name} (${ingredient.currentStock} ${ingredient.unit})`,
        });
      }
    });

    setAlerts(alertsList);
  };

  const onSubmit = async (data: StockMovementForm) => {
    try {
      setSaving(true);
      
      const movementData: CreateStockMovementRequest = {
        ingredientId: data.ingredientId,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
        notes: data.notes,
      };

      // TODO: Implementar API de movimentação de estoque
      await ingredientsService.createStockMovement(movementData);
      
      // Simular criação de movimentação
      console.log('Movimentação de estoque:', movementData);
      
      toast.success('Movimentação registrada com sucesso');
      reset();
      setShowMovementForm(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao registrar movimentação:', error);
      toast.error(error.message || 'Erro ao registrar movimentação');
    } finally {
      setSaving(false);
    }
  };

  const getStockStatus = (ingredient: Ingredient) => {
    if (ingredient.currentStock <= 0) {
      return { status: 'out', color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle };
    } else if (ingredient.currentStock <= ingredient.minStock) {
      return { status: 'low', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: AlertTriangle };
    } else {
      return { status: 'ok', color: 'text-green-600', bg: 'bg-green-50', icon: Package };
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'OUT':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'ADJUSTMENT':
        return <Settings className="w-4 h-4 text-blue-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'low' && ingredient.currentStock <= ingredient.minStock && ingredient.currentStock > 0) ||
      (filterStatus === 'out' && ingredient.currentStock <= 0) ||
      (filterStatus === 'normal' && ingredient.currentStock > ingredient.minStock);
    
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const csvContent = [
      ['Ingrediente', 'Unidade', 'Estoque Atual', 'Estoque Mínimo', 'Custo Unitário', 'Valor Total', 'Status'],
      ...filteredIngredients.map(ingredient => {
        const status = getStockStatus(ingredient);
        const totalValue = ingredient.currentStock * ingredient.costPerUnit;
        return [
          ingredient.name,
          ingredient.unit,
          ingredient.currentStock,
          ingredient.minStock,
          ingredient.costPerUnit,
          totalValue,
          status.status === 'out' ? 'Sem Estoque' : status.status === 'low' ? 'Estoque Baixo' : 'Normal'
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estoque-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Relatório exportado com sucesso');
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
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Estoque</h1>
          <p className="text-sm text-gray-600 mt-1">
            Controle completo do estoque de ingredientes e movimentações
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {alerts.length > 0 && (
            <button
              onClick={() => setShowAlerts(true)}
              className="btn-outline relative"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alertas
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {alerts.length}
              </span>
            </button>
          )}
          
          <button
            onClick={exportToCSV}
            className="btn-outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          
          <button
            onClick={loadData}
            className="btn-outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </button>
          
          {isAdmin && (
            <button
              onClick={() => setShowMovementForm(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Movimentação
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIngredients}</p>
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
                <p className="text-sm font-medium text-gray-600">Normal</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalIngredients - stats.lowStockCount - stats.outOfStockCount}
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
                <p className="text-2xl font-bold text-gray-900">{stats.lowStockCount}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.outOfStockCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar ingrediente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="input"
                >
                  <option value="all">Todos</option>
                  <option value="normal">Normal</option>
                  <option value="low">Estoque Baixo</option>
                  <option value="out">Sem Estoque</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredIngredients.length} de {ingredients.length} ingredientes
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients Stock Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Estoque de Ingredientes</h3>
        </div>
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Unidade</th>
                  <th className="text-right">Estoque Atual</th>
                  <th className="text-right">Estoque Mín.</th>
                  <th className="text-right">Custo Unit.</th>
                  <th className="text-right">Valor Total</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredIngredients.map((ingredient) => {
                  const stockStatus = getStockStatus(ingredient);
                  const StatusIcon = stockStatus.icon;
                  const totalValue = ingredient.currentStock * ingredient.costPerUnit;
                  
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
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {stockStatus.status === 'out' && 'Sem Estoque'}
                          {stockStatus.status === 'low' && 'Estoque Baixo'}
                          {stockStatus.status === 'ok' && 'Normal'}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedIngredient(ingredient);
                              setShowIngredientHistory(true);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ver Histórico"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setSelectedIngredient(ingredient);
                                setValue('ingredientId', ingredient.id);
                                setShowMovementForm(true);
                              }}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Nova Movimentação"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stock Movement Form Modal */}
      {showMovementForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedIngredient ? `Movimentação - ${selectedIngredient.name}` : 'Nova Movimentação'}
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingrediente
                </label>
                <select
                  {...register('ingredientId')}
                  className="input"
                  disabled={!!selectedIngredient}
                >
                  <option value="">Selecione...</option>
                  {ingredients.map(ingredient => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} ({ingredient.unit})
                    </option>
                  ))}
                </select>
                {errors.ingredientId && (
                  <p className="mt-1 text-sm text-red-600">{errors.ingredientId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Movimentação
                </label>
                <select
                  {...register('type')}
                  className="input"
                >
                  <option value="IN">Entrada</option>
                  <option value="OUT">Saída</option>
                  <option value="ADJUSTMENT">Ajuste</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade
                </label>
                <input
                  {...register('quantity', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  placeholder="0"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  {...register('notes')}
                  className="input"
                  rows={3}
                  placeholder="Observações adicionais..."
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMovementForm(false);
                    setSelectedIngredient(null);
                    reset();
                  }}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alerts Modal */}
      {showAlerts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Alertas de Estoque</h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.alertType === 'OUT_OF_STOCK'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{alert.name}</p>
                      <p className="text-sm text-gray-600">
                        {alert.alertType === 'OUT_OF_STOCK' 
                          ? 'Sem estoque' 
                          : `Estoque baixo: ${alert.currentStock} ${alert.unit}`
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Mínimo: {alert.minStock} {alert.unit}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4">
              <button
                onClick={() => setShowAlerts(false)}
                className="btn-outline"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ingredient History Modal */}
      {showIngredientHistory && selectedIngredient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Histórico - {selectedIngredient.name}
            </h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Estoque Atual</p>
                  <p className="font-semibold">{selectedIngredient.currentStock} {selectedIngredient.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estoque Mínimo</p>
                  <p className="font-semibold">{selectedIngredient.minStock} {selectedIngredient.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Custo Unitário</p>
                  <p className="font-semibold">{formatCurrency(selectedIngredient.costPerUnit)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="font-semibold">
                    {formatCurrency(selectedIngredient.currentStock * selectedIngredient.costPerUnit)}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Quantidade</th>
                    <th>Motivo</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {stockMovements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        Nenhuma movimentação registrada
                      </td>
                    </tr>
                  ) : (
                    stockMovements.map((movement) => (
                      <tr key={movement.id}>
                        <td>{new Date(movement.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="flex items-center">
                            {getMovementIcon(movement.type)}
                            <span className="ml-2">
                              {movement.type === 'IN' ? 'Entrada' : 
                               movement.type === 'OUT' ? 'Saída' : 'Ajuste'}
                            </span>
                          </div>
                        </td>
                        <td className="text-right">{movement.quantity}</td>
                        <td>{movement.reason}</td>
                        <td>{movement.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4">
              <button
                onClick={() => {
                  setShowIngredientHistory(false);
                  setSelectedIngredient(null);
                }}
                className="btn-outline"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
