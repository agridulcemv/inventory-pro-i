import React, { useState } from 'react';
import { Plus, Edit, Trash2, Phone, Mail, Star } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { Modal } from '../shared/Modal';

const SupplierForm = ({ supplier, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(supplier || {
    name: '',
    contact: '',
    email: '',
    phone: '',
    rating: 5
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre del Proveedor</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Persona de Contacto</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.contact}
          onChange={(e) => setFormData({...formData, contact: e.target.value})}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            type="tel"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Calificación (1-5)</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            className="flex-1"
            value={formData.rating}
            onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
          />
          <span className="text-lg font-semibold w-12">{formData.rating}</span>
          <Star className="text-yellow-500" fill="currentColor" size={20} />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {supplier ? 'Actualizar' : 'Crear'} Proveedor
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

export const SuppliersView = () => {
  const { suppliers, products } = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const handleSubmit = (formData) => {
    // Aquí irá la lógica para agregar/actualizar proveedores
    console.log('Guardar proveedor:', formData);
    setShowModal(false);
    setEditingSupplier(null);
  };

  const suppliersWithStats = suppliers.map(s => ({
    ...s,
    productCount: products.filter(p => p.supplier === s.name).length,
    totalValue: products
      .filter(p => p.supplier === s.name)
      .reduce((sum, p) => sum + (p.stock * p.price), 0)
  }));

  return (
    <div className="space-y-6">
      {/* Header con botón */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Gestión de Proveedores</h3>
          <p className="text-gray-600 text-sm mt-1">
            Total: {suppliers.length} proveedores activos
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSupplier(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Nuevo Proveedor
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Proveedor Más Productos</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {suppliersWithStats.sort((a, b) => b.productCount - a.productCount)[0]?.name}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {suppliersWithStats.sort((a, b) => b.productCount - a.productCount)[0]?.productCount} productos
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Mejor Calificado</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {suppliersWithStats.sort((a, b) => b.rating - a.rating)[0]?.name}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="text-yellow-500" fill="currentColor" size={16} />
            <span className="text-sm font-semibold">
              {suppliersWithStats.sort((a, b) => b.rating - a.rating)[0]?.rating}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Mayor Valor en Inventario</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            ${suppliersWithStats.sort((a, b) => b.totalValue - a.totalValue)[0]?.totalValue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {suppliersWithStats.sort((a, b) => b.totalValue - a.totalValue)[0]?.name}
          </p>
        </div>
      </div>

      {/* Lista de Proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliersWithStats.map(supplier => (
          <div key={supplier.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-lg">{supplier.name}</h4>
                <p className="text-sm text-gray-600">{supplier.contact}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="text-yellow-500" fill="currentColor" size={18} />
                <span className="font-semibold">{supplier.rating}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={16} />
                <span className="truncate">{supplier.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} />
                <span>{supplier.phone}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center mb-4">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{supplier.productCount}</p>
                  <p className="text-xs text-gray-600">Productos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">${(supplier.totalValue / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-gray-600">Valor Stock</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingSupplier(supplier);
                    setShowModal(true);
                  }}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 transition flex items-center justify-center gap-1"
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('¿Eliminar este proveedor?')) {
                      console.log('Eliminar:', supplier.id);
                    }
                  }}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded hover:bg-red-100 transition flex items-center justify-center gap-1"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla de Productos por Proveedor */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Productos por Proveedor</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Proveedor</th>
                <th className="text-left py-3 px-4 font-semibold">Productos</th>
                <th className="text-left py-3 px-4 font-semibold">Calificación</th>
                <th className="text-left py-3 px-4 font-semibold">Valor Total</th>
                <th className="text-left py-3 px-4 font-semibold">Contacto</th>
              </tr>
            </thead>
            <tbody>
              {suppliersWithStats
                .sort((a, b) => b.productCount - a.productCount)
                .map(supplier => (
                  <tr key={supplier.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-medium">{supplier.name}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                        {supplier.productCount}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-500" fill="currentColor" size={16} />
                        <span className="font-semibold">{supplier.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-600">
                      ${supplier.totalValue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{supplier.contact}</td>
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
          setEditingSupplier(null);
        }}
        title={editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      >
        <SupplierForm
          supplier={editingSupplier}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setEditingSupplier(null);
          }}
        />
      </Modal>
    </div>
  );
};