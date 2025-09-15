import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { productsService } from '@/services/products';
import { Product, CreateProductRequest } from '@/types';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  channelBasePriceDirect: z.number().min(0, 'Preço deve ser maior ou igual a zero').optional(),
  channelBasePriceIFood: z.number().min(0, 'Preço deve ser maior ou igual a zero').optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [, setProduct] = useState<Product | null>(null);
  
  const isEditing = Boolean(id);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      channelBasePriceDirect: undefined,
      channelBasePriceIFood: undefined,
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      loadProduct();
    }
  }, [id, isEditing]);

  const loadProduct = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const productData = await productsService.getProduct(id);
      setProduct(productData);
      
      setValue('name', productData.name);
      setValue('channelBasePriceDirect', productData.channelBasePriceDirect || undefined);
      setValue('channelBasePriceIFood', productData.channelBasePriceIFood || undefined);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      toast.error('Erro ao carregar produto');
      navigate('/produtos');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductForm) => {
    try {
      setSaving(true);
      
      const productData: CreateProductRequest = {
        name: data.name.trim(),
        channelBasePriceDirect: data.channelBasePriceDirect || undefined,
        channelBasePriceIFood: data.channelBasePriceIFood || undefined,
      };

      if (isEditing && id) {
        await productsService.updateProduct(id, productData);
        toast.success('Produto atualizado com sucesso');
      } else {
        await productsService.createProduct(productData);
        toast.success('Produto criado com sucesso');
      }
      
      navigate('/produtos');
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      
      if (error.response?.data?.error) {
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
        toast.error('Erro ao salvar produto');
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
            onClick={() => navigate('/produtos')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Produto' : 'Novo Produto'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isEditing ? 'Atualize as informações do produto' : 'Cadastre um novo produto'}
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
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className={`input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Digite o nome do produto"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="channelBasePriceDirect" className="block text-sm font-medium text-gray-700 mb-2">
                  Preço Direto (R$)
                </label>
                <input
                  {...register('channelBasePriceDirect', { 
                    valueAsNumber: true,
                    setValueAs: (value) => value === '' ? undefined : Number(value)
                  })}
                  type="number"
                  id="channelBasePriceDirect"
                  step="0.01"
                  min="0"
                  className={`input ${errors.channelBasePriceDirect ? 'border-red-500' : ''}`}
                  placeholder="0,00"
                />
                {errors.channelBasePriceDirect && (
                  <p className="mt-1 text-sm text-red-600">{errors.channelBasePriceDirect.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="channelBasePriceIFood" className="block text-sm font-medium text-gray-700 mb-2">
                  Preço iFood (R$)
                </label>
                <input
                  {...register('channelBasePriceIFood', { 
                    valueAsNumber: true,
                    setValueAs: (value) => value === '' ? undefined : Number(value)
                  })}
                  type="number"
                  id="channelBasePriceIFood"
                  step="0.01"
                  min="0"
                  className={`input ${errors.channelBasePriceIFood ? 'border-red-500' : ''}`}
                  placeholder="0,00"
                />
                {errors.channelBasePriceIFood && (
                  <p className="mt-1 text-sm text-red-600">{errors.channelBasePriceIFood.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/produtos')}
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
                    {isEditing ? 'Atualizar' : 'Criar'} Produto
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
