import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Calculator } from 'lucide-react';
import { productsService } from '@/services/products';
import { Product, ProductRecipe, PricingPreview } from '@/types';
import { formatCurrency } from '@/utils/format';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [recipe, setRecipe] = useState<ProductRecipe | null>(null);
  const [pricing, setPricing] = useState<PricingPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProductData();
    }
  }, [id]);

  const loadProductData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [productData, recipeData, pricingData] = await Promise.all([
        productsService.getProduct(id),
        productsService.getProductRecipe(id),
        productsService.getPricingPreview(id),
      ]);
      
      setProduct(productData);
      setRecipe(recipeData);
      setPricing(pricingData);
    } catch (error) {
      console.error('Erro ao carregar dados do produto:', error);
    } finally {
      setLoading(false);
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
          <Link to="/produtos" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-600 mt-1">Detalhes do produto</p>
          </div>
        </div>
        
        <Link to={`/produtos/${id}/editar`} className="btn-primary">
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Informações Básicas</h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <p className="mt-1 text-sm text-gray-900">{product.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preço Direto</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {product.channelBasePriceDirect ? 
                      formatCurrency(product.channelBasePriceDirect) : 
                      'Não definido'
                    }
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preço iFood</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {product.channelBasePriceIFood ? 
                      formatCurrency(product.channelBasePriceIFood) : 
                      'Não definido'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recipe */}
          {recipe && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">Receita</h3>
              </div>
              <div className="card-content">
                {/* Ingredients */}
                {recipe.recipeItems.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Ingredientes</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Ingrediente</th>
                            <th className="text-right py-2">Quantidade</th>
                            <th className="text-right py-2">Custo Unit.</th>
                            <th className="text-right py-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recipe.recipeItems.map((item) => {
                            const wasteFactor = 1 + (item.wastePct || 0) / 100;
                            const totalCost = item.qty * item.ingredient.costPerUnit * wasteFactor;
                            
                            return (
                              <tr key={item.id} className="border-b">
                                <td className="py-2">{item.ingredient.name}</td>
                                <td className="text-right py-2">
                                  {item.qty} {item.ingredient.unit}
                                  {item.wastePct && (
                                    <span className="text-xs text-gray-500 ml-1">
                                      (+{item.wastePct}% desperdício)
                                    </span>
                                  )}
                                </td>
                                <td className="text-right py-2">
                                  {formatCurrency(item.ingredient.costPerUnit)}/{item.ingredient.unit}
                                </td>
                                <td className="text-right py-2 font-medium">
                                  {formatCurrency(totalCost)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Packaging */}
                {recipe.packagingUsages.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Embalagens</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Embalagem</th>
                            <th className="text-right py-2">Quantidade</th>
                            <th className="text-right py-2">Custo Unit.</th>
                            <th className="text-right py-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recipe.packagingUsages.map((usage) => (
                            <tr key={usage.id} className="border-b">
                              <td className="py-2">{usage.packaging.name}</td>
                              <td className="text-right py-2">{usage.qty}</td>
                              <td className="text-right py-2">
                                {formatCurrency(usage.packaging.unitCost)}
                              </td>
                              <td className="text-right py-2 font-medium">
                                {formatCurrency(usage.qty * usage.packaging.unitCost)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Labor */}
                {recipe.laborCostPreset && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Mão de Obra</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Preset:</span>
                          <span className="ml-2 font-medium">{recipe.laborCostPreset.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Taxa/hora:</span>
                          <span className="ml-2 font-medium">
                            {formatCurrency(recipe.laborCostPreset.laborRatePerHour)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tempo/lote:</span>
                          <span className="ml-2 font-medium">
                            {recipe.laborCostPreset.minutesPerBatch} min
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Rendimento:</span>
                          <span className="ml-2 font-medium">
                            {recipe.laborCostPreset.batchYield} unidades
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div>
          {pricing && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Análise de Custos</h3>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {/* Costs */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Custos Unitários</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ingredientes:</span>
                        <span>{formatCurrency(pricing.ingredientsCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Embalagens:</span>
                        <span>{formatCurrency(pricing.packagingCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mão de obra:</span>
                        <span>{formatCurrency(pricing.laborCost)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(pricing.totalUnitCost)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Prices */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Preços Sugeridos</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-blue-900">Direto</span>
                          <span className="font-bold text-blue-900">
                            {formatCurrency(pricing.suggestedPriceDirect)}
                          </span>
                        </div>
                        <div className="text-xs text-blue-700">
                          Margem: {pricing.marginDirect.percent.toFixed(1)}% 
                          ({formatCurrency(pricing.marginDirect.value)})
                        </div>
                      </div>
                      
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-red-900">iFood</span>
                          <span className="font-bold text-red-900">
                            {formatCurrency(pricing.suggestedPriceIFood)}
                          </span>
                        </div>
                        <div className="text-xs text-red-700">
                          Margem: {pricing.marginIFood.percent.toFixed(1)}% 
                          ({formatCurrency(pricing.marginIFood.value)})
                        </div>
                      </div>
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
