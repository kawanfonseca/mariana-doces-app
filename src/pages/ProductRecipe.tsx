import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Plus, Trash2, Calculator } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { productsService } from '@/services/products';
import { ingredientsService } from '@/services/ingredients';
import { Product, Ingredient, UpdateProductRecipeRequest } from '@/types';
import { formatCurrency } from '@/utils/format';

const recipeItemSchema = z.object({
  ingredientId: z.string().min(1, 'Ingrediente é obrigatório'),
  qty: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  wastePct: z.number().min(0).max(100).optional(),
});

const recipeSchema = z.object({
  recipeItems: z.array(recipeItemSchema),
  packagingUsages: z.array(z.object({
    packagingId: z.string().min(1, 'Embalagem é obrigatória'),
    qty: z.number().min(1, 'Quantidade deve ser maior que zero'),
  })),
  laborCostPreset: z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    minutesPerBatch: z.number().min(1, 'Minutos deve ser maior que zero'),
    batchYield: z.number().min(1, 'Rendimento deve ser maior que zero'),
    laborRatePerHour: z.number().min(0, 'Taxa deve ser maior ou igual a zero'),
  }).optional(),
});

type RecipeForm = z.infer<typeof recipeSchema>;

export function ProductRecipe() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [costAnalysis, setCostAnalysis] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors: _errors },
    setValue,
    watch,
  } = useForm<RecipeForm>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      recipeItems: [],
      packagingUsages: [],
      laborCostPreset: undefined,
    },
  });

  const watchedItems = watch('recipeItems');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [productData, ingredientsData, recipeData] = await Promise.all([
        productsService.getProduct(id),
        ingredientsService.getIngredients(),
        productsService.getProductRecipe(id).catch(() => null),
      ]);
      
      setProduct(productData);
      setIngredients(ingredientsData.data.filter(i => i.active));
      
      if (recipeData) {
        setValue('recipeItems', recipeData.recipeItems.map(item => ({
          ingredientId: item.ingredientId,
          qty: item.qty,
          wastePct: item.wastePct,
        })));
        setValue('packagingUsages', recipeData.packagingUsages.map(usage => ({
          packagingId: usage.packagingId,
          qty: usage.qty,
        })));
        if (recipeData.laborCostPreset) {
          setValue('laborCostPreset', recipeData.laborCostPreset);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do produto');
    } finally {
      setLoading(false);
    }
  };

  const addRecipeItem = () => {
    const currentItems = watch('recipeItems');
    setValue('recipeItems', [...currentItems, { ingredientId: '', qty: 0, wastePct: 0 }]);
  };

  const removeRecipeItem = (index: number) => {
    const currentItems = watch('recipeItems');
    setValue('recipeItems', currentItems.filter((_, i) => i !== index));
  };

  const calculateCosts = () => {
    const items = watch('recipeItems');
    let totalCost = 0;
    
    const analysis = items.map(item => {
      const ingredient = ingredients.find(i => i.id === item.ingredientId);
      if (!ingredient) return null;
      
      const wasteFactor = 1 + (item.wastePct || 0) / 100;
      const itemCost = item.qty * ingredient.costPerUnit * wasteFactor;
      totalCost += itemCost;
      
      return {
        ingredientName: ingredient.name,
        quantity: item.qty,
        unit: ingredient.unit,
        costPerUnit: ingredient.costPerUnit,
        wastePct: item.wastePct || 0,
        totalCost: itemCost,
      };
    }).filter(Boolean);
    
    setCostAnalysis({ items: analysis, totalCost });
  };

  const onSubmit = async (data: RecipeForm) => {
    if (!id) return;
    
    try {
      setSaving(true);
      
      const recipeData: UpdateProductRecipeRequest = {
        recipeItems: data.recipeItems,
        packagingUsages: data.packagingUsages,
        laborCostPreset: data.laborCostPreset,
      };

      await productsService.updateProductRecipe(id, recipeData);
      toast.success('Receita atualizada com sucesso');
      
      // Recalcular custos
      calculateCosts();
    } catch (error: any) {
      console.error('Erro ao salvar receita:', error);
      toast.error(error.message || 'Erro ao salvar receita');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Produto não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={`/produtos/${id}`} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Receita - {product.name}</h1>
            <p className="text-sm text-gray-600 mt-1">Configure a receita e custos do produto</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipe Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Ingredients */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Ingredientes</h3>
                  <button
                    type="button"
                    onClick={addRecipeItem}
                    className="btn-outline btn-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </button>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {watchedItems.map((_, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ingrediente
                        </label>
                        <select
                          {...register(`recipeItems.${index}.ingredientId`)}
                          className="input"
                        >
                          <option value="">Selecione...</option>
                          {ingredients.map(ingredient => (
                            <option key={ingredient.id} value={ingredient.id}>
                              {ingredient.name} ({ingredient.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantidade
                        </label>
                        <input
                          {...register(`recipeItems.${index}.qty`, { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          min="0"
                          className="input"
                          placeholder="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Desperdício (%)
                        </label>
                        <input
                          {...register(`recipeItems.${index}.wastePct`, { valueAsNumber: true })}
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          className="input"
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeRecipeItem(index)}
                          className="btn-outline btn-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {watchedItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nenhum ingrediente adicionado</p>
                      <p className="text-sm">Clique em "Adicionar" para começar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Labor Cost */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">Mão de Obra</h3>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Preset
                    </label>
                    <input
                      {...register('laborCostPreset.name')}
                      type="text"
                      className="input"
                      placeholder="Ex: Produção Padrão"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taxa por Hora (R$)
                    </label>
                    <input
                      {...register('laborCostPreset.laborRatePerHour', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="input"
                      placeholder="0,00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minutos por Lote
                    </label>
                    <input
                      {...register('laborCostPreset.minutesPerBatch', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      className="input"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rendimento (unidades)
                    </label>
                    <input
                      {...register('laborCostPreset.batchYield', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      className="input"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={calculateCosts}
                className="btn-outline"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calcular Custos
              </button>
              
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Receita
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Cost Analysis */}
        <div>
          {costAnalysis && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">Análise de Custos</h3>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ingredientes</h4>
                    <div className="space-y-2">
                      {costAnalysis.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.ingredientName} ({item.quantity} {item.unit})
                            {item.wastePct > 0 && (
                              <span className="text-xs text-gray-500 ml-1">
                                (+{item.wastePct}%)
                              </span>
                            )}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.totalCost)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-medium">
                      <span>Total Ingredientes:</span>
                      <span>{formatCurrency(costAnalysis.totalCost)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
