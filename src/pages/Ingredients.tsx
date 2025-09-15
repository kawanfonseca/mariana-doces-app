import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ingredientsService } from '@/services/ingredients';
import { Ingredient } from '@/types';
import { formatCurrency } from '@/utils/format';
import { useAuthStore } from '@/store/auth';

export function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadIngredients();
  }, [page, search]);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const response = await ingredientsService.getIngredients({
        page,
        limit: 20,
        search: search || undefined,
      });
      setIngredients(response.data);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Erro ao carregar ingredientes:', error);
      toast.error('Erro ao carregar ingredientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o ingrediente "${name}"?`)) {
      return;
    }

    try {
      await ingredientsService.deleteIngredient(id);
      toast.success('Ingrediente excluído com sucesso');
      loadIngredients();
    } catch (error: any) {
      console.error('Erro ao excluir ingrediente:', error);
      toast.error(error.message || 'Erro ao excluir ingrediente');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ingredientes</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie os ingredientes e insumos
          </p>
        </div>
        
        {isAdmin && (
          <Link to="/ingredientes/novo" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Novo Ingrediente
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
              placeholder="Buscar ingredientes..."
              className="input pl-10"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Unidade</th>
                <th className="text-right">Custo por Unidade</th>
                <th>Fornecedor</th>
                <th className="text-right">Estoque Atual</th>
                <th className="text-right">Estoque Mín.</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      <span className="ml-2">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : ingredients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    {search ? 'Nenhum ingrediente encontrado' : 'Nenhum ingrediente cadastrado'}
                  </td>
                </tr>
              ) : (
                ingredients.map((ingredient) => (
                  <tr key={ingredient.id}>
                    <td className="font-medium">{ingredient.name}</td>
                    <td>{ingredient.unit}</td>
                    <td className="text-right font-medium">
                      {formatCurrency(ingredient.costPerUnit)}
                    </td>
                    <td>{ingredient.supplier || '-'}</td>
                    <td className="text-right">
                      <span className={`font-medium ${
                        ingredient.currentStock <= ingredient.minStock 
                          ? 'text-red-600' 
                          : 'text-gray-900'
                      }`}>
                        {ingredient.currentStock} {ingredient.unit}
                      </span>
                    </td>
                    <td className="text-right text-gray-600">
                      {ingredient.minStock} {ingredient.unit}
                    </td>
                    <td>
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ingredient.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {ingredient.active ? 'Ativo' : 'Inativo'}
                        </span>
                        {ingredient.currentStock <= ingredient.minStock && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Estoque Baixo
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        {isAdmin && (
                          <>
                            <Link
                              to={`/ingredientes/${ingredient.id}/editar`}
                              className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            
                            <button
                              onClick={() => handleDelete(ingredient.id, ingredient.name)}
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
