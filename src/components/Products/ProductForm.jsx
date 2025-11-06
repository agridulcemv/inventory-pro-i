import React, { useState } from 'react';

export const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(product || {
    name: '',
    category: 'Electrónica',
    stock: 0,
    minStock: 0,
    price: 0,
    cost: 0,
    supplier: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre del Producto</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option>Electrónica</option>
            <option>Accesorios</option>
            <option>Audio</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Proveedor</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.supplier}
            onChange={(e) => setFormData({...formData, supplier: e.target.value})}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Stock Actual</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Stock Mínimo</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.minStock}
            onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Precio de Venta ($)</label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Costo ($)</label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.cost}
            onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
            required
          />
        </div>
      </div>
      
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {product ? 'Actualizar' : 'Crear'} Producto
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