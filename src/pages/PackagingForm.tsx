import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { packagingService } from '@/services/packaging';
import { Packaging, CreatePackagingRequest } from '@/types';

const packagingSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  unitCost: z.number().min(0, 'Custo deve ser maior ou igual a zero'),
});

type PackagingForm = z.infer<typeof packagingSchema>;

export function PackagingForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [packaging, setPackaging] = useState<Packaging | null>(null);
  
  const isEditing = Boolean(id);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PackagingForm>({
    resolver: zodResolver(packagingSchema),
    defaultValues: {
      name: '',
      unitCost: 0,
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      loadPackaging();
    }
  }, [id, isEditing]);

  const loadPackaging = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const packagingData = await packagingService.getPackagingItem(id);
      setPackaging(packagingData);
      
      setValue('name', packagingData.name);
      setValue('unitCost', packagingData.unitCost);
    } catch (error) {
      console.error('Erro ao carregar embalagem:', error);
      toast.error('Erro ao carregar embalagem');
      navigate('/embalagens');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PackagingForm) => {
    try {
      setSaving(true);
      
      const packagingData: CreatePackagingRequest = {
        name: data.name.trim(),
        unitCost: data.unitCost,
      };

      if (isEditing && id) {
        await packagingService.updatePackaging(id, packagingData);
        toast.success('Embalagem atualizada com sucesso');
      } else {
        await packagingService.createPackaging(packagingData);
        toast.success('Embalagem criada com sucesso');
      }
      
      navigate('/embalagens');
    } catch (error: any) {
      console.error('Erro ao salvar embalagem:', error);
      
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
        toast.error('Erro ao salvar embalagem');
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
            onClick={() => navigate('/embalagens')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Embalagem' : 'Nova Embalagem'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isEditing ? 'Atualize as informações da embalagem' : 'Cadastre uma nova embalagem'}
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
                  Nome da Embalagem *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className={`input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Digite o nome da embalagem"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="unitCost" className="block text-sm font-medium text-gray-700 mb-2">
                  Custo Unitário (R$) *
                </label>
                <input
                  {...register('unitCost', { 
                    valueAsNumber: true,
                    setValueAs: (value) => value === '' ? 0 : Number(value)
                  })}
                  type="number"
                  id="unitCost"
                  step="0.01"
                  min="0"
                  className={`input ${errors.unitCost ? 'border-red-500' : ''}`}
                  placeholder="0,00"
                />
                {errors.unitCost && (
                  <p className="mt-1 text-sm text-red-600">{errors.unitCost.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/embalagens')}
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
                    {isEditing ? 'Atualizar' : 'Criar'} Embalagem
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
