import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Check, Clock, Package, DollarSign, Calendar, Filter, Search } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { Modal } from '../shared/Modal';

const OrderForm = ({ order, products, suppliers, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(order || {
    supplier: '',
    product: '',
    quantity: 0,
    unitCost: 0,
    total: 0,
    expectedDate: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleProductChange = (productName) => {
    const selectedProduct = products.find(p => p.name === productName);
    if (selectedProduct) {
      const total = selectedProduct.cost * formData.quantity;
      setFormData({
        ...formData,
        product: productName,
        supplier: selectedProduct.supplier,
        unitCost: selectedProduct.cost,
        total
      });
    }
  };

  const handleQuantityChange = (qty) => {
    const total = formData.unitCost * qty;
    setFormData({ ...formData, quantity: qty, total });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Producto</label>
        <select
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.product}
          onChange={(e) => handleProductChange(e.target.value)}
          required
        >
          <option value="">Seleccionar producto</option>
          {products.map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Proveedor</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg bg-gray-50"
            value={formData.supplier}
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Costo Unitario</label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border rounded-lg bg-gray-50"
            value={formData.unitCost}
            readOnly
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cantidad</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Total</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg bg-gray-50 font-bold text-green-600"
            value={`$${formData.total.toLocaleString()}`}
            readOnly
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fecha Esperada de Entrega</label>
        <input
          type="date"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.expectedDate}
          onChange={(e) => setFormData({...formData, expectedDate: e.target.value})}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
        <textarea
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Notas adicionales sobre la orden..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {order ? 'Actualizar' : 'Crear'} Orden
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export const OrdersView = () => {
  const { orders, products, suppliers, addOrder, updateOrder, deleteOrder, completeOrder } = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = useMemo(() => 
    orders.filter(o => 
      (filterStatus === 'all' || o.status === filterStatus) &&
      (searchTerm === '' || 
       o.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
       o.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [orders, filterStatus, searchTerm]
  );

  const stats = useMemo(() => ({
    pending: orders.filter(o => o.status === 'Pendiente').length,
    inTransit: orders.filter(o => o.status === 'En tránsito').length,
    delivered: orders.filter(o => o.status === 'Entregado').length,
    totalPending: orders.filter(o => o.status !== 'Entregado').reduce((sum, o) => sum + o.total, 0),
    totalDelivered: orders.filter(o => o.status === 'Entregado').reduce((sum, o) => sum + o.total, 0),
  }), [orders]);

  const handleSubmit = (formData) => {
    if (editingOrder) {
      updateOrder(editingOrder.id, formData);
    } else {
      addOrder(formData);
    }
    setShowModal(false);
    setEditingOrder(null);
  };

  const handleComplete = (orderId) => {
    if (window.confirm('¿Marcar esta orden como entregada y actualizar el inventario?')) {
      completeOrder(orderId);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar esta orden?')) {
      deleteOrder(id);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'En tránsito': return 'bg-blue-100 text-blue-800';
      case 'Entregado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pendiente': return <Clock size={16} />;
      case 'En tránsito': return <Package size={16} />;
      case 'Entregado': return <Check size={16} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold">Órdenes de Compra</h3>
            <p className="text-sm text-gray-600 mt-1">
              Total: {orders.length} órdenes
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-initial relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar orden..."
                className="w-full md:w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En tránsito">En tránsito</option>
              <option value="Entregado">Entregado</option>
            </select>

            <button
              onClick={() => {
                setEditingOrder(null);
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
            >
              <Plus size={20} />
              Nueva Orden
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pendientes</p>
              <p className="text-3xl font-bold mt-1">{stats.pending}</p>
            </div>
            <Clock size={32} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">En Tránsito</p>
              <p className="text-3xl font-bold mt-1">{stats.inTransit}</p>
            </div>
            <Package size={32} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Entregadas</p>
              <p className="text-3xl font-bold mt-1">{stats.delivered}</p>
            </div>
            <Check size={32} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">En Proceso</p>
              <p className="text-2xl font-bold mt-1">${(stats.totalPending / 1000).toFixed(1)}K</p>
            </div>
            <DollarSign size={32} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Recibido</p>
              <p className="text-2xl font-bold mt-1">${(stats.totalDelivered / 1000).toFixed(1)}K</p>
            </div>
            <DollarSign size={32} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Tabla de Órdenes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Orden #</th>
                <th className="text-left py-3 px-4 font-semibold">Producto</th>
                <th className="text-left py-3 px-4 font-semibold">Proveedor</th>
                <th className="text-left py-3 px-4 font-semibold">Cantidad</th>
                <th className="text-left py-3 px-4 font-semibold">Total</th>
                <th className="text-left py-3 px-4 font-semibold">Fecha Orden</th>
                <th className="text-left py-3 px-4 font-semibold">Fecha Esperada</th>
                <th className="text-left py-3 px-4 font-semibold">Estado</th>
                <th className="text-left py-3 px-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-bold text-blue-600">#{order.id}</td>
                  <td className="py-3 px-4 font-medium">{order.product}</td>
                  <td className="py-3 px-4 text-sm">{order.supplier}</td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold text-sm">
                      {order.quantity}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-green-600">
                    ${order.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm">{order.date}</td>
                  <td className="py-3 px-4 text-sm">{order.expectedDate || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm font-semibold flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {order.status !== 'Entregado' && (
                        <button
                          onClick={() => handleComplete(order.id)}
                          className="text-green-600 hover:text-green-800 transition"
                          title="Marcar como entregada"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingOrder(order);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingOrder(null);
        }}
        title={editingOrder ? 'Editar Orden' : 'Nueva Orden de Compra'}
      >
        <OrderForm
          order={editingOrder}
          products={products}
          suppliers={suppliers}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setEditingOrder(null);
          }}
        />
      </Modal>
    </div>
  );
};