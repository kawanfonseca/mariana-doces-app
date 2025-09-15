import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ingredientsService } from '@/services/ingredients';
import { Ingredient, StockMovement, CreateStockMovementRequest } from '@/types';
import { formatCurrency } from '@/utils/format';
import { useAuthStore } from '@/store/auth';

const stockMovementSchema = z.object({
  ingredientId: z.string().min(1, 'Ingrediente é obrigatório'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  notes: z.string().optional(),
});

type StockMovementForm = z.infer<typeof stockMovementSchema>;

export function Inventory() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
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

  // const selectedType = watch('type'); // Removido - não utilizado

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await ingredientsService.getIngredients();
      setIngredients(response.data.filter(i => i.active));
      // TODO: Carregar movimentações de estoque quando a API estiver disponível
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do estoque');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: StockMovementForm) => {
    try {
      setSaving(true);
      
      // TODO: Implementar API de movimentação de estoque
      const movementData: CreateStockMovementRequest = {
        ingredientId: data.ingredientId,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
        notes: data.notes,
      };

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

  // Função removida - não utilizada
  // const getMovementIcon = (type: string) => {
  //   switch (type) {
  //     case 'IN':
  //       return <TrendingUp className="w-4 h-4 text-green-600" />;
  //     case 'OUT':
  //       return <TrendingDown className="w-4 h-4 text-red-600" />;
  //     case 'ADJUSTMENT':
  //       return <Package className="w-4 h-4 text-blue-600" />;
  //     default:
  //       return <Package className="w-4 h-4 text-gray-600" />;
  //   }
  // };

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
          <h1 className="text-2xl font-bold text-gray-900">Controle de Estoque</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie o estoque de ingredientes e movimentações
          </p>
        </div>
        
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

      {/* Stock Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Ingredientes</p>
                <p className="text-2xl font-bold text-gray-900">{ingredients.length}</p>
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
                  {ingredients.filter(i => i.currentStock <= i.minStock && i.currentStock > 0).length}
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
                  {ingredients.filter(i => i.currentStock <= 0).length}
                </p>
              </div>
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
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ingredient) => {
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
            <h3 className="text-lg font-semibold mb-4">Nova Movimentação</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingrediente
                </label>
                <select
                  {...register('ingredientId')}
                  className="input"
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
                  Motivo
                </label>
                <input
                  {...register('reason')}
                  type="text"
                  className="input"
                  placeholder="Ex: Compra, Produção, Ajuste..."
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
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
                  onClick={() => setShowMovementForm(false)}
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
    </div>
  );
}
