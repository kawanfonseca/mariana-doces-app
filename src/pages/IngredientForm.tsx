import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ingredientsService } from '@/services/ingredients';
import { Ingredient, CreateIngredientRequest } from '@/types';

const ingredientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  costPerUnit: z.number().min(0, 'Custo deve ser maior ou igual a zero'),
  supplier: z.string().optional(),
});

type IngredientForm = z.infer<typeof ingredientSchema>;

export function IngredientForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  
  const isEditing = Boolean(id);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<IngredientForm>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: '',
      unit: '',
      costPerUnit: 0,
      supplier: '',
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      loadIngredient();
    }
  }, [id, isEditing]);

  const loadIngredient = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const ingredientData = await ingredientsService.getIngredient(id);
      setIngredient(ingredientData);
      
      setValue('name', ingredientData.name);
      setValue('unit', ingredientData.unit);
      setValue('costPerUnit', ingredientData.costPerUnit);
      setValue('supplier', ingredientData.supplier || '');
    } catch (error) {
      console.error('Erro ao carregar ingrediente:', error);
      toast.error('Erro ao carregar ingrediente');
      navigate('/ingredientes');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: IngredientForm) => {
    try {
      setSaving(true);
      
      const ingredientData: CreateIngredientRequest = {
        name: data.name.trim(),
        unit: data.unit.trim(),
        costPerUnit: data.costPerUnit,
        supplier: data.supplier?.trim() || undefined,
      };

      if (isEditing && id) {
        await ingredientsService.updateIngredient(id, ingredientData);
        toast.success('Ingrediente atualizado com sucesso');
      } else {
        await ingredientsService.createIngredient(ingredientData);
        toast.success('Ingrediente criado com sucesso');
      }
      
      navigate('/ingredientes');
    } catch (error: any) {
      console.error('Erro ao salvar ingrediente:', error);
      
      if (error.message) {
        toast.error(error.message);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.details) {
        // Se há detalhes de validação, mostrar o primeiro erro
        const details = error.response.data.details;
        if (Array.isArray(details) && details.length > 0) {
          toast.error(details[0].message || 'Parâmetros inválidos');
        } else {
          toast.error('Parâmetros inválidos');
        }
      } else {
        toast.error('Erro ao salvar ingrediente');
      }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/ingredientes')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Ingrediente' : 'Novo Ingrediente'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isEditing ? 'Atualize as informações do ingrediente' : 'Cadastre um novo ingrediente'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div className="card-content">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Ingrediente *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className={`input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Digite o nome do ingrediente"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                  Unidade *
                </label>
                <select
                  {...register('unit')}
                  id="unit"
                  className={`input ${errors.unit ? 'border-red-500' : ''}`}
                >
                  <option value="">Selecione a unidade</option>
                  <option value="kg">Quilograma (kg)</option>
                  <option value="g">Grama (g)</option>
                  <option value="L">Litro (L)</option>
                  <option value="ml">Mililitro (ml)</option>
                  <option value="un">Unidade (un)</option>
                  <option value="cx">Caixa (cx)</option>
                  <option value="pct">Pacote (pct)</option>
                  <option value="lata">Lata</option>
                  <option value="garrafa">Garrafa</option>
                </select>
                {errors.unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="costPerUnit" className="block text-sm font-medium text-gray-700 mb-2">
                  Custo por Unidade (R$) *
                </label>
                <input
                  {...register('costPerUnit', { 
                    valueAsNumber: true,
                    setValueAs: (value) => value === '' ? 0 : Number(value)
                  })}
                  type="number"
                  id="costPerUnit"
                  step="0.01"
                  min="0"
                  className={`input ${errors.costPerUnit ? 'border-red-500' : ''}`}
                  placeholder="0,00"
                />
                {errors.costPerUnit && (
                  <p className="mt-1 text-sm text-red-600">{errors.costPerUnit.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-2">
                  Fornecedor
                </label>
                <input
                  {...register('supplier')}
                  type="text"
                  id="supplier"
                  className={`input ${errors.supplier ? 'border-red-500' : ''}`}
                  placeholder="Nome do fornecedor (opcional)"
                />
                {errors.supplier && (
                  <p className="mt-1 text-sm text-red-600">{errors.supplier.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/ingredientes')}
                className="btn-outline"
                disabled={saving}
              >
                Cancelar
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
                    {isEditing ? 'Atualizar' : 'Criar'} Ingrediente
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
