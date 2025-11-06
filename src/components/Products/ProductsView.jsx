import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { Modal } from '../shared/Modal';
import { ProductForm } from './ProductForm';

export const ProductsView = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const filteredProducts = useMemo(() => 
    products.filter(p => 
      (selectedCategory === 'all' || p.category === selectedCategory) &&
      (searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [products, selectedCategory, searchTerm]
  );

  const handleSubmit = (formData) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            <option value="Electrónica">Electrónica</option>
            <option value="Accesorios">Accesorios</option>
            <option value="Audio">Audio</option>
          </select>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
          >
            <Plus size={20} />
            Agregar Producto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Producto</th>
                <th className="text-left py-3 px-4 font-semibold">Categoría</th>
                <th className="text-left py-3 px-4 font-semibold">Stock</th>
                <th className="text-left py-3 px-4 font-semibold">Precio</th>
                <th className="text-left py-3 px-4 font-semibold">Costo</th>
                <th className="text-left py-3 px-4 font-semibold">Margen</th>
                <th className="text-left py-3 px-4 font-semibold">Estado</th>
                <th className="text-left py-3 px-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const margin = ((product.price - product.cost) / product.price * 100).toFixed(1);
                const isLowStock = product.stock <= product.minStock;
                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4">{product.category}</td>
                    <td className="py-3 px-4">
                      <span className={isLowStock ? 'text-red-600 font-semibold' : ''}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">${product.price}</td>
                    <td className="py-3 px-4">${product.cost}</td>
                    <td className="py-3 px-4">
                      <span className="text-green-600 font-semibold">{margin}%</span>
                    </td>
                    <td className="py-3 px-4">
                      {isLowStock ? (
                        <span className="flex items-center gap-1 text-red-600 text-sm">
                          <AlertTriangle size={16} />
                          Stock bajo
                        </span>
                      ) : (
                        <span className="text-green-600 text-sm">✓ Normal</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
        />
      </Modal>
    </div>
  );
};