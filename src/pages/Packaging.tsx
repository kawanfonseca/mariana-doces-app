import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/services/api';
import { Packaging, PaginatedResponse } from '@/types';
import { formatCurrency } from '@/utils/format';
import { useAuthStore } from '@/store/auth';

export function PackagingPage() {
  const [packaging, setPackaging] = useState<Packaging[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadPackaging();
  }, [page, search]);

  const loadPackaging = async () => {
    try {
      setLoading(true);
      const response = await api.get<PaginatedResponse<Packaging>>('/packaging', {
        params: {
          page,
          limit: 20,
          search: search || undefined,
        }
      });
      setPackaging(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Erro ao carregar embalagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a embalagem "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/packaging/${id}`);
      toast.success('Embalagem excluída com sucesso');
      loadPackaging();
    } catch (error) {
      console.error('Erro ao excluir embalagem:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Embalagens</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie as embalagens utilizadas
          </p>
        </div>
        
        {isAdmin && (
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nova Embalagem
          </button>
        )}
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-content p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar embalagens..."
              className="input pl-10"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Packaging Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th className="text-right">Custo Unitário</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      <span className="ml-2">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : packaging.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    {search ? 'Nenhuma embalagem encontrada' : 'Nenhuma embalagem cadastrada'}
                  </td>
                </tr>
              ) : (
                packaging.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.name}</td>
                    <td className="text-right font-medium">
                      {formatCurrency(item.unitCost)}
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        {isAdmin && (
                          <>
                            <button
                              className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDelete(item.id, item.name)}
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
