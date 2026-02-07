import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ordersService } from '@/services/orders';
import { SaleOrder } from '@/types';
import { formatCurrency } from '@/utils/format';

export function SalesHistory() {
  const [orders, setOrders] = useState<SaleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [channelFilter, setChannelFilter] = useState<'' | 'DIRECT' | 'IFOOD'>('');

  // Expanded row
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Edit modal
  const [editOrder, setEditOrder] = useState<SaleOrder | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation
  const [deleteOrder, setDeleteOrder] = useState<SaleOrder | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [page, dateFrom, dateTo, channelFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (channelFilter) params.channel = channelFilter;

      const response = await ordersService.getOrders(params);
      setOrders(response.data);
      setTotalPages(response.pagination.pages);
      setTotal(response.pagination.total);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order: SaleOrder) => {
    setEditOrder(order);
    setEditNotes(order.notes || '');
    setEditCustomerName(order.customerName || '');
    setEditCustomerPhone(order.customerPhone || '');
  };

  const handleSaveEdit = async () => {
    if (!editOrder) return;
    setEditLoading(true);
    try {
      await ordersService.updateOrder(editOrder.id, {
        notes: editNotes || undefined,
        customerName: editCustomerName || undefined,
        customerPhone: editCustomerPhone || undefined,
      });
      toast.success('Venda atualizada com sucesso');
      setEditOrder(null);
      await loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar venda');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteOrder) return;
    setDeleteLoading(true);
    try {
      await ordersService.deleteOrder(deleteOrder.id);
      toast.success('Venda excluída com sucesso');
      setDeleteOrder(null);
      if (expandedId === deleteOrder.id) setExpandedId(null);
      await loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir venda');
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setChannelFilter('');
    setPage(1);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatChannel = (channel: string) => {
    return channel === 'DIRECT' ? 'Pronta Entrega' : 'iFood';
  };

  const getChannelBadge = (channel: string) => {
    return channel === 'DIRECT'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-red-100 text-red-800';
  };

  const getItemsSummary = (order: SaleOrder) => {
    const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0);
    return `${totalQty} ${totalQty === 1 ? 'item' : 'itens'}`;
  };

  if (loading && orders.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Vendas</h1>
          <p className="text-sm text-gray-600 mt-1">
            {total} {total === 1 ? 'venda registrada' : 'vendas registradas'}
          </p>
        </div>
        <button onClick={loadOrders} className="btn-outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content p-4">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">De</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Até</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
              <select
                value={channelFilter}
                onChange={(e) => { setChannelFilter(e.target.value as any); setPage(1); }}
                className="input"
              >
                <option value="">Todos</option>
                <option value="DIRECT">Pronta Entrega</option>
                <option value="IFOOD">iFood</option>
              </select>
            </div>
            {(dateFrom || dateTo || channelFilter) && (
              <button onClick={clearFilters} className="btn-outline text-sm">
                <X className="w-4 h-4 mr-1" />
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-content">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma venda encontrada</p>
              {(dateFrom || dateTo || channelFilter) && (
                <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros</p>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-10 px-4 py-3"></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Canal</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Itens</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Bruto</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Taxas</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Líquido</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => {
                      const isExpanded = expandedId === order.id;

                      return (
                        <tr key={order.id} className="group">
                          <td colSpan={8} className="p-0">
                            <div>
                              {/* Main row */}
                              <div
                                className="flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                              >
                                <div className="w-10 px-4 py-3 text-gray-400">
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 grid grid-cols-7 items-center">
                                  <div className="px-4 py-3 text-sm text-gray-900">{formatDate(order.date)}</div>
                                  <div className="px-4 py-3">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getChannelBadge(order.channel)}`}>
                                      {formatChannel(order.channel)}
                                    </span>
                                  </div>
                                  <div className="px-4 py-3 text-sm text-gray-600">{getItemsSummary(order)}</div>
                                  <div className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(order.grossAmount)}</div>
                                  <div className="px-4 py-3 text-sm text-right text-red-600">
                                    {order.platformFees > 0 ? `-${formatCurrency(order.platformFees)}` : '-'}
                                  </div>
                                  <div className="px-4 py-3 text-sm text-right font-medium text-green-700">{formatCurrency(order.netAmount)}</div>
                                  <div className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end space-x-1">
                                      <button
                                        onClick={() => handleEdit(order)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Editar"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteOrder(order)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Excluir"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded details */}
                              {isExpanded && (
                                <div className="px-14 pb-4 bg-gray-50 border-t border-gray-100">
                                  <div className="py-3">
                                    {order.notes && (
                                      <p className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">Obs:</span> {order.notes}
                                      </p>
                                    )}
                                    {order.customerName && (
                                      <p className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">Cliente:</span> {order.customerName}
                                        {order.customerPhone && ` - ${order.customerPhone}`}
                                      </p>
                                    )}
                                    <table className="w-full text-sm mt-2">
                                      <thead>
                                        <tr className="text-gray-500">
                                          <th className="text-left py-1 font-medium">Produto</th>
                                          <th className="text-right py-1 font-medium">Qtd</th>
                                          <th className="text-right py-1 font-medium">Preço Unit.</th>
                                          <th className="text-right py-1 font-medium">Total</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {order.items.map((item) => (
                                          <tr key={item.id} className="border-t border-gray-200">
                                            <td className="py-1.5 text-gray-900">
                                              {item.product?.name || item.variant?.name || 'Produto removido'}
                                            </td>
                                            <td className="py-1.5 text-right text-gray-600">{item.qty}</td>
                                            <td className="py-1.5 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                                            <td className="py-1.5 text-right font-medium">{formatCurrency(item.lineGross)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot>
                                        <tr className="border-t border-gray-300">
                                          <td colSpan={3} className="py-1.5 text-right font-medium">Bruto</td>
                                          <td className="py-1.5 text-right font-medium">{formatCurrency(order.grossAmount)}</td>
                                        </tr>
                                        {order.discounts > 0 && (
                                          <tr>
                                            <td colSpan={3} className="py-1 text-right text-gray-600">Descontos</td>
                                            <td className="py-1 text-right text-red-600">-{formatCurrency(order.discounts)}</td>
                                          </tr>
                                        )}
                                        {order.platformFees > 0 && (
                                          <tr>
                                            <td colSpan={3} className="py-1 text-right text-gray-600">Taxa plataforma</td>
                                            <td className="py-1 text-right text-red-600">-{formatCurrency(order.platformFees)}</td>
                                          </tr>
                                        )}
                                        <tr className="border-t border-gray-300">
                                          <td colSpan={3} className="py-1.5 text-right font-bold">Líquido</td>
                                          <td className="py-1.5 text-right font-bold text-green-700">{formatCurrency(order.netAmount)}</td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="btn-outline text-sm disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="btn-outline text-sm disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Editar Venda - {formatDate(editOrder.date)}
              </h2>
              <button onClick={() => setEditOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Observações sobre a venda..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  className="input"
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone do Cliente</label>
                <input
                  type="text"
                  value={editCustomerPhone}
                  onChange={(e) => setEditCustomerPhone(e.target.value)}
                  className="input"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button onClick={() => setEditOrder(null)} className="btn-outline">
                  Cancelar
                </button>
                <button onClick={handleSaveEdit} disabled={editLoading} className="btn-primary">
                  {editLoading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Excluir Venda</h2>
            <p className="text-sm text-gray-600 mb-1">
              Tem certeza que deseja excluir a venda de{' '}
              <span className="font-medium">{formatDate(deleteOrder.date)}</span>?
            </p>
            <p className="text-sm text-gray-600 mb-4">
              {formatChannel(deleteOrder.channel)} - {formatCurrency(deleteOrder.grossAmount)}
            </p>
            <p className="text-xs text-red-600 mb-4">
              Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeleteOrder(null)} className="btn-outline">
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
              >
                {deleteLoading ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
