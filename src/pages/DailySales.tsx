import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Calendar, Plus, Save, Upload } from 'lucide-react';
import { productsService } from '@/services/products';
import { ordersService } from '@/services/orders';
import { Product, CreateSaleOrderRequest } from '@/types';
import { formatCurrency, formatDateInput } from '@/utils/format';

const dailySalesSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  channel: z.enum(['DIRECT', 'IFOOD']),
  notes: z.string().optional(),
});

type DailySalesForm = z.infer<typeof dailySalesSchema>;

interface SaleItemInput {
  productId: string;
  qty: number;
  unitPrice: number;
}

export function DailySales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'DIRECT' | 'IFOOD'>('DIRECT');
  const [saleItems, setSaleItems] = useState<Record<string, number>>({});

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DailySalesForm>({
    resolver: zodResolver(dailySalesSchema),
    defaultValues: {
      date: formatDateInput(new Date()),
      channel: 'DIRECT',
    },
  });

  const selectedChannel = watch('channel');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setValue('channel', activeTab);
  }, [activeTab, setValue]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.getProducts({ limit: 100 });
      setProducts(response.data.filter(p => p.active));
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId: string, qty: number) => {
    setSaleItems(prev => ({
      ...prev,
      [productId]: Math.max(0, qty)
    }));
  };

  const getProductPrice = (product: Product, channel: 'DIRECT' | 'IFOOD'): number => {
    if (channel === 'IFOOD') {
      return product.channelBasePriceIFood || product.channelBasePriceDirect || 0;
    }
    return product.channelBasePriceDirect || 0;
  };

  const calculateTotals = () => {
    let grossAmount = 0;
    const items: SaleItemInput[] = [];

    Object.entries(saleItems).forEach(([productId, qty]) => {
      if (qty > 0) {
        const product = products.find(p => p.id === productId);
        if (product) {
          const unitPrice = getProductPrice(product, selectedChannel);
          const lineTotal = qty * unitPrice;
          grossAmount += lineTotal;
          items.push({ productId, qty, unitPrice });
        }
      }
    });

    const platformFees = selectedChannel === 'IFOOD' ? grossAmount * 0.25 : 0;
    const netAmount = grossAmount - platformFees;

    return {
      items,
      grossAmount,
      platformFees,
      netAmount,
      itemCount: items.length
    };
  };

  const totals = calculateTotals();

  const onSubmit = async (data: DailySalesForm) => {
    if (totals.items.length === 0) {
      toast.error('Adicione pelo menos um produto com quantidade maior que zero');
      return;
    }

    setSaving(true);
    try {
      const orderData: CreateSaleOrderRequest = {
        date: data.date,
        channel: data.channel,
        items: totals.items,
        notes: data.notes,
      };

      await ordersService.createOrder(orderData);
      toast.success('Venda registrada com sucesso!');
      
      // Limpar formulário
      setSaleItems({});
      setValue('notes', '');
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diário de Vendas</h1>
          <p className="text-sm text-gray-600 mt-1">
            Registre as vendas diárias por canal
          </p>
        </div>
        
        <button className="btn-outline">
          <Upload className="w-4 h-4 mr-2" />
          Importar CSV
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Date and Channel Selection */}
        <div className="card">
          <div className="card-content p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    {...register('date')}
                    type="date"
                    className="input pl-10"
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canal
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('DIRECT')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'DIRECT'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pronta Entrega
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('IFOOD')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'IFOOD'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    iFood
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <input
                  {...register('notes')}
                  type="text"
                  className="input"
                  placeholder="Observações sobre a venda..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Produtos - {activeTab === 'DIRECT' ? 'Pronta Entrega' : 'iFood'}</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => {
                const price = getProductPrice(product, selectedChannel);
                const qty = saleItems[product.id] || 0;
                
                return (
                  <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                        <p className="text-sm text-gray-600">{formatCurrency(price)}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, qty - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                        >
                          -
                        </button>
                        
                        <input
                          type="number"
                          min="0"
                          value={qty}
                          onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)}
                          className="w-16 text-center border rounded px-2 py-1 text-sm"
                        />
                        
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, qty + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                        >
                          +
                        </button>
                      </div>
                      
                      {qty > 0 && (
                        <div className="text-sm font-medium text-green-600">
                          Total: {formatCurrency(qty * price)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Resumo da Venda</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Itens</p>
                <p className="text-2xl font-bold text-blue-900">{totals.itemCount}</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Receita Bruta</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(totals.grossAmount)}
                </p>
              </div>
              
              {selectedChannel === 'IFOOD' && (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">Taxa iFood (25%)</p>
                  <p className="text-2xl font-bold text-red-900">
                    {formatCurrency(totals.platformFees)}
                  </p>
                </div>
              )}
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Receita Líquida</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(totals.netAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setSaleItems({})}
            className="btn-outline"
          >
            Limpar
          </button>
          
          <button
            type="submit"
            disabled={saving || totals.items.length === 0}
            className="btn-primary disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Venda'}
          </button>
        </div>
      </form>
    </div>
  );
}
