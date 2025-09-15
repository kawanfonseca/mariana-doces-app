import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { productsService } from '@/services/products';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/format';
import { useAuthStore } from '@/store/auth';

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.getProducts({
        page,
        limit: 20,
        search: search || undefined,
      });
      setProducts(response.data);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) {
      return;
    }

    try {
      await productsService.deleteProduct(id);
      toast.success('Produto excluído com sucesso');
      loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie seus produtos, receitas e preços
          </p>
        </div>
        
        {isAdmin && (
          <Link to="/produtos/novo" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-content p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="input pl-10"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Preço Direto</th>
                <th>Preço iFood</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      <span className="ml-2">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    {search ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        {product.variants && product.variants.length > 0 && (
                          <p className="text-sm text-gray-500">
                            {product.variants.length} variante(s)
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      {product.channelBasePriceDirect ? 
                        formatCurrency(product.channelBasePriceDirect) : 
                        <span className="text-gray-400">Não definido</span>
                      }
                    </td>
                    <td>
                      {product.channelBasePriceIFood ? 
                        formatCurrency(product.channelBasePriceIFood) : 
                        <span className="text-gray-400">Não definido</span>
                      }
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/produtos/${product.id}`}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        {isAdmin && (
                          <>
                            <Link
                              to={`/produtos/${product.id}/editar`}
                              className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Página {page} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
