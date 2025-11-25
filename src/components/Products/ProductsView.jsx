import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, AlertTriangle, Package, TrendingUp, TrendingDown, Edit as EditIcon, Calendar, Box, Layers, ArrowRightLeft, ChevronDown, ChevronUp, Settings, Hash, Camera, FileDown, FileSpreadsheet, FileText, X } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { Modal } from '../shared/Modal';
import { ProductForm } from './ProductForm';

// ==================== FORMULARIO DE PACK ====================
const PackForm = ({ pack, products, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(pack || {
    name: '',
    sku: '',
    barcode: '',
    description: '',
    components: [],
    packPrice: 0,
    autoPrice: true
  });

  const [selectedProduct, setSelectedProduct] = useState('');
  const [componentQty, setComponentQty] = useState(1);

  // Calcular precio sugerido basado en componentes
  const suggestedPrice = useMemo(() => {
    return formData.components.reduce((sum, comp) => {
      const product = products.find(p => p.id === comp.productId);
      return sum + (product?.price || 0) * comp.quantity;
    }, 0);
  }, [formData.components, products]);

  const addComponent = () => {
    if (!selectedProduct) return;
    const productId = parseInt(selectedProduct);
    
    // Verificar si ya existe
    const exists = formData.components.find(c => c.productId === productId);
    if (exists) {
      setFormData({
        ...formData,
        components: formData.components.map(c => 
          c.productId === productId 
            ? { ...c, quantity: c.quantity + componentQty }
            : c
        )
      });
    } else {
      const product = products.find(p => p.id === productId);
      setFormData({
        ...formData,
        components: [...formData.components, {
          productId,
          productName: product.name,
          quantity: componentQty
        }]
      });
    }
    setSelectedProduct('');
    setComponentQty(1);
  };

  const removeComponent = (productId) => {
    setFormData({
      ...formData,
      components: formData.components.filter(c => c.productId !== productId)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.components.length === 0) {
      alert('Agrega al menos un producto al pack');
      return;
    }
    onSubmit({
      ...formData,
      packPrice: formData.autoPrice ? suggestedPrice : formData.packPrice
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Nombre del Pack *</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Ej: Pack 6 Cervezas, Combo Oficina..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">SKU</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.sku}
            onChange={(e) => setFormData({...formData, sku: e.target.value})}
            placeholder="PACK-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Código de Barras</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.barcode}
            onChange={(e) => setFormData({...formData, barcode: e.target.value})}
            placeholder="7501234567890"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="2"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Descripción del pack..."
          />
        </div>
      </div>

      {/* Agregar componentes */}
      <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 bg-purple-50">
        <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
          <Layers size={18} />
          Productos del Pack
        </h4>
        
        <div className="flex gap-2 mb-4">
          <select
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">Seleccionar producto...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} (Stock: {p.stock}) - ${p.price}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            className="w-20 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={componentQty}
            onChange={(e) => setComponentQty(parseInt(e.target.value) || 1)}
          />
          <button
            type="button"
            onClick={addComponent}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Lista de componentes */}
        {formData.components.length > 0 ? (
          <div className="space-y-2">
            {formData.components.map((comp, index) => {
              const product = products.find(p => p.id === comp.productId);
              return (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <span className="bg-purple-100 text-purple-800 font-bold px-2 py-1 rounded">
                      x{comp.quantity}
                    </span>
                    <span className="font-medium">{comp.productName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">
                      ${(product?.price || 0) * comp.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeComponent(comp.productId)}
                      className="text-red-600 hover:bg-red-100 p-1 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-purple-600 py-4">
            Agrega productos para crear el pack
          </p>
        )}
      </div>

      {/* Precio */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">Precio del Pack</h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoPrice}
              onChange={(e) => setFormData({...formData, autoPrice: e.target.checked})}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm">Calcular automáticamente</span>
          </label>
        </div>

        {formData.autoPrice ? (
          <div className="text-center">
            <p className="text-sm text-gray-600">Precio calculado:</p>
            <p className="text-3xl font-bold text-purple-600">${suggestedPrice.toLocaleString()}</p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1">Precio personalizado</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.packPrice}
                onChange={(e) => setFormData({...formData, packPrice: parseFloat(e.target.value) || 0})}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Precio sugerido: ${suggestedPrice.toLocaleString()} 
              {formData.packPrice < suggestedPrice && (
                <span className="text-green-600 ml-1">
                  (Descuento: {((1 - formData.packPrice / suggestedPrice) * 100).toFixed(0)}%)
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
        >
          {pack ? 'Actualizar' : 'Crear'} Pack
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

// ==================== COMPONENTE PRINCIPAL ====================
export const ProductsView = () => {
  const { 
    products, addProduct, updateProduct, deleteProduct, 
    movements = [], 
    packs = [], addPack, updatePack, deletePack, assemblePack, disassemblePack 
  } = useInventory();
  
  const [activeTab, setActiveTab] = useState('catalog'); // catalog, packs, movements
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Estados para packs
  const [showPackModal, setShowPackModal] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [packSearch, setPackSearch] = useState('');
  const [showAssembleModal, setShowAssembleModal] = useState(false);
  const [selectedPackForAction, setSelectedPackForAction] = useState(null);
  const [assembleQty, setAssembleQty] = useState(1);
  const [actionType, setActionType] = useState('assemble'); // assemble o disassemble
  
  // Filtros para movimientos
  const [filterType, setFilterType] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');

  // Estados para OCR
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [ocrImage, setOcrImage] = useState(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrResults, setOcrResults] = useState([]);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats.filter(Boolean);
  }, [products]);

  const filteredProducts = useMemo(() => 
    products.filter(p => 
      (selectedCategory === 'all' || p.category === selectedCategory) &&
      (searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode?.includes(searchTerm))
    ),
    [products, selectedCategory, searchTerm]
  );

  const filteredPacks = useMemo(() => {
    if (!packSearch) return packs || [];
    const search = packSearch.toLowerCase();
    return (packs || []).filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.sku?.toLowerCase().includes(search) ||
      p.barcode?.includes(search)
    );
  }, [packs, packSearch]);

  const filteredMovements = movements.filter(m => {
    const typeMatch = filterType === 'all' || m.type === filterType;
    const productMatch = filterProduct === 'all' || m.productId?.toString() === filterProduct;
    return typeMatch && productMatch;
  });

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

  // ==================== LÓGICA DE PACKS ====================
  const handlePackSubmit = (formData) => {
    if (editingPack) {
      if (updatePack) updatePack(editingPack.id, formData);
    } else {
      if (addPack) addPack(formData);
    }
    setShowPackModal(false);
    setEditingPack(null);
  };

  const handleDeletePack = (id) => {
    if (window.confirm('¿Eliminar este pack?')) {
      if (deletePack) deletePack(id);
    }
  };

  const openAssembleModal = (pack, type) => {
    setSelectedPackForAction(pack);
    setActionType(type);
    setAssembleQty(1);
    setShowAssembleModal(true);
  };

  const handleAssembleDisassemble = () => {
    if (!selectedPackForAction || assembleQty < 1) return;

    if (actionType === 'assemble') {
      // Verificar stock disponible
      const canAssemble = selectedPackForAction.components.every(comp => {
        const product = products.find(p => p.id === comp.productId);
        return product && product.stock >= comp.quantity * assembleQty;
      });

      if (!canAssemble) {
        alert('No hay suficiente stock de los componentes para armar este pack');
        return;
      }

      if (assemblePack) {
        assemblePack(selectedPackForAction.id, assembleQty);
        alert(`✅ Se armaron ${assembleQty} pack(s) de "${selectedPackForAction.name}"`);
      }
    } else {
      // Verificar que hay packs armados
      if ((selectedPackForAction.stockAssembled || 0) < assembleQty) {
        alert('No hay suficientes packs armados para desarmar');
        return;
      }

      if (disassemblePack) {
        disassemblePack(selectedPackForAction.id, assembleQty);
        alert(`✅ Se desarmaron ${assembleQty} pack(s) de "${selectedPackForAction.name}"`);
      }
    }

    setShowAssembleModal(false);
    setSelectedPackForAction(null);
  };

  // Calcular disponibilidad máxima para armar packs
  const getMaxAssemblable = (pack) => {
    if (!pack.components || pack.components.length === 0) return 0;
    
    const maxPerComponent = pack.components.map(comp => {
      const product = products.find(p => p.id === comp.productId);
      if (!product) return 0;
      return Math.floor(product.stock / comp.quantity);
    });
    
    return Math.min(...maxPerComponent);
  };

  // ==================== EXPORTACIÓN ====================
  const exportToCSV = () => {
    const headers = ['ID', 'Nombre', 'Categoría', 'Stock', 'Stock Mínimo', 'Precio', 'Costo', 'Proveedor', 'Código de Barras'];
    const rows = products.map(p => [
      p.id,
      p.name,
      p.category,
      p.stock,
      p.minStock,
      p.price,
      p.cost,
      p.supplier || '',
      p.barcode || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `productos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToExcel = () => {
    // Crear HTML table para exportar como Excel
    const table = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>Stock Mínimo</th>
            <th>Precio</th>
            <th>Costo</th>
            <th>Margen %</th>
            <th>Proveedor</th>
            <th>Código de Barras</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => {
            const margin = ((p.price - p.cost) / p.price * 100).toFixed(1);
            return `
              <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>${p.stock}</td>
                <td>${p.minStock}</td>
                <td>${p.price}</td>
                <td>${p.cost}</td>
                <td>${margin}%</td>
                <td>${p.supplier || ''}</td>
                <td>${p.barcode || ''}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `productos_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
  };

  // ==================== OCR DE FACTURAS ====================
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOcrImage(event.target.result);
        processOCR(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processOCR = async (imageData) => {
    setOcrProcessing(true);
    
    // Simulación de OCR (en producción usarías Tesseract.js o Google Vision API)
    setTimeout(() => {
      // Resultados simulados
      const mockResults = [
        { name: 'Producto Ejemplo 1', quantity: 10, price: 1500 },
        { name: 'Producto Ejemplo 2', quantity: 5, price: 2300 },
        { name: 'Producto Ejemplo 3', quantity: 20, price: 850 }
      ];
      setOcrResults(mockResults);
      setOcrProcessing(false);
    }, 2000);
  };

  const addProductFromOCR = (ocrProduct) => {
    const newProduct = {
      name: ocrProduct.name,
      category: 'Sin categoría',
      stock: ocrProduct.quantity || 0,
      minStock: 5,
      price: ocrProduct.price || 0,
      cost: ocrProduct.price ? ocrProduct.price * 0.7 : 0,
      supplier: 'Proveedor OCR',
      barcode: ''
    };
    addProduct(newProduct);
    alert(`✅ Producto "${ocrProduct.name}" agregado al inventario`);
  };

  const movementTypes = {
    'entry': { label: 'Entrada', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    'exit': { label: 'Salida', icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    'adjustment': { label: 'Ajuste', icon: EditIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    'return': { label: 'Devolución', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    'loss': { label: 'Merma', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
    'pack_assemble': { label: 'Armado Pack', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    'pack_disassemble': { label: 'Desarmado Pack', icon: ArrowRightLeft, color: 'text-pink-600', bg: 'bg-pink-50' }
  };

  const movementStats = {
    totalEntries: movements.filter(m => m.type === 'entry').reduce((sum, m) => sum + m.quantity, 0),
    totalExits: movements.filter(m => m.type === 'exit').reduce((sum, m) => sum + m.quantity, 0),
    totalAdjustments: movements.filter(m => m.type === 'adjustment').length,
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 ${
                activeTab === 'catalog'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package size={20} />
              Catálogo de Productos
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                {products.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('packs')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 ${
                activeTab === 'packs'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers size={20} />
              Packs / Combos
              <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">
                {packs?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 ${
                activeTab === 'movements'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp size={20} />
              Movimientos
            </button>
          </nav>
        </div>
      </div>

      {/* ==================== TAB CATÁLOGO ==================== */}
      {activeTab === 'catalog' && (
        <>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o código..."
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
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              {/* Botones de acción */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowOCRModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 transition"
                  title="Escanear Factura con OCR"
                >
                  <Camera size={20} />
                  <span className="hidden md:inline">OCR</span>
                </button>
                <button
                  onClick={exportToCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition"
                  title="Exportar a CSV"
                >
                  <FileText size={20} />
                  <span className="hidden md:inline">CSV</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 transition"
                  title="Exportar a Excel"
                >
                  <FileSpreadsheet size={20} />
                  <span className="hidden md:inline">Excel</span>
                </button>
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
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.barcode && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Hash size={12} />
                                {product.barcode}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">{product.category}</td>
                        <td className="py-3 px-4">
                          <span className={isLowStock ? 'text-red-600 font-semibold' : ''}>
                            {product.stock}
                          </span>
                          <span className="text-gray-400 text-xs ml-1">/ mín: {product.minStock}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold">${product.price.toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-600">${product.cost.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className="text-green-600 font-semibold">{margin}%</span>
                        </td>
                        <td className="py-3 px-4">
                          {isLowStock ? (
                            <span className="flex items-center gap-1 text-red-600 text-sm bg-red-50 px-2 py-1 rounded-full w-fit">
                              <AlertTriangle size={14} />
                              Stock bajo
                            </span>
                          ) : (
                            <span className="text-green-600 text-sm bg-green-50 px-2 py-1 rounded-full">
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
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

            {filteredProducts.length === 0 && (
              <div className="p-12 text-center">
                <Package size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">No se encontraron productos</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ==================== TAB PACKS ==================== */}
      {activeTab === 'packs' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-semibold">Gestión de Packs / Combos</h3>
              <p className="text-gray-600 text-sm mt-1">
                Arma y desarma packs de productos
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar pack..."
                  className="w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={packSearch}
                  onChange={(e) => setPackSearch(e.target.value)}
                />
              </div>
              <button
                onClick={() => {
                  setEditingPack(null);
                  setShowPackModal(true);
                }}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 transition whitespace-nowrap"
              >
                <Plus size={20} />
                Nuevo Pack
              </button>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Layers className="text-purple-600 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-purple-800">¿Cómo funcionan los Packs?</h4>
                <p className="text-sm text-purple-700 mt-1">
                  <strong>Armar:</strong> Resta stock de los productos individuales y crea unidades del pack.<br />
                  <strong>Desarmar:</strong> Devuelve el stock a los productos individuales.
                </p>
              </div>
            </div>
          </div>

          {/* Lista de Packs */}
          {filteredPacks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPacks.map(pack => {
                const maxAssemblable = getMaxAssemblable(pack);
                const totalComponentsPrice = pack.components?.reduce((sum, comp) => {
                  const product = products.find(p => p.id === comp.productId);
                  return sum + (product?.price || 0) * comp.quantity;
                }, 0) || 0;
                const discount = totalComponentsPrice > 0 
                  ? ((1 - (pack.packPrice || totalComponentsPrice) / totalComponentsPrice) * 100).toFixed(0)
                  : 0;

                return (
                  <div key={pack.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                    {/* Header del pack */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-lg">{pack.name}</h4>
                          {pack.sku && <p className="text-xs opacity-80">SKU: {pack.sku}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${(pack.packPrice || totalComponentsPrice).toLocaleString()}</p>
                          {discount > 0 && (
                            <span className="bg-green-400 text-green-900 text-xs font-bold px-2 py-0.5 rounded">
                              -{discount}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-4">
                      {/* Stock armado */}
                      <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500">Packs armados</p>
                          <p className="text-2xl font-bold text-purple-600">{pack.stockAssembled || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Puedes armar</p>
                          <p className="text-xl font-bold text-green-600">{maxAssemblable}</p>
                        </div>
                      </div>

                      {/* Componentes */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 mb-2">COMPONENTES:</p>
                        <div className="space-y-1">
                          {pack.components?.map((comp, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-700">{comp.productName}</span>
                              <span className="font-semibold text-purple-600">x{comp.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="space-y-2">
                        <button
                          onClick={() => openAssembleModal(pack, 'assemble')}
                          disabled={maxAssemblable === 0}
                          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                        >
                          <Box size={18} />
                          Armar Pack
                        </button>
                        <button
                          onClick={() => openAssembleModal(pack, 'disassemble')}
                          disabled={(pack.stockAssembled || 0) === 0}
                          className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                        >
                          <ArrowRightLeft size={18} />
                          Desarmar Pack
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingPack(pack);
                              setShowPackModal(true);
                            }}
                            className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1"
                          >
                            <Edit size={16} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeletePack(pack.id)}
                            className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1"
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Layers size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg font-semibold">No hay packs creados</p>
              <p className="text-gray-400 text-sm mt-2">Crea tu primer pack para agrupar productos</p>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB MOVIMIENTOS ==================== */}
      {activeTab === 'movements' && (
        <>
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Entradas</p>
                  <p className="text-3xl font-bold mt-1">{movementStats.totalEntries}</p>
                </div>
                <TrendingUp size={40} className="opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Salidas</p>
                  <p className="text-3xl font-bold mt-1">{movementStats.totalExits}</p>
                </div>
                <TrendingDown size={40} className="opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Ajustes Realizados</p>
                  <p className="text-3xl font-bold mt-1">{movementStats.totalAdjustments}</p>
                </div>
                <EditIcon size={40} className="opacity-80" />
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <select
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                {Object.entries(movementTypes).map(([key, info]) => (
                  <option key={key} value={key}>{info.label}</option>
                ))}
              </select>
              <select
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
              >
                <option value="all">Todos los productos</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabla de movimientos */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filteredMovements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Fecha</th>
                      <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold">Producto</th>
                      <th className="text-left py-3 px-4 font-semibold">Cantidad</th>
                      <th className="text-left py-3 px-4 font-semibold">Motivo</th>
                      <th className="text-left py-3 px-4 font-semibold">Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovements.map(movement => {
                      const product = products.find(p => p.id === movement.productId);
                      const typeInfo = movementTypes[movement.type] || movementTypes['adjustment'];
                      const Icon = typeInfo.icon;
                      return (
                        <tr key={movement.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <div className="font-medium">{movement.date}</div>
                              <div className="text-gray-500">{movement.time}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                              <Icon size={16} />
                              {typeInfo.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">{product?.name || movement.productName || 'Eliminado'}</td>
                          <td className="py-3 px-4">
                            <span className={`font-bold ${movement.type === 'entry' || movement.type === 'return' || movement.type === 'pack_disassemble' ? 'text-green-600' : 'text-red-600'}`}>
                              {movement.type === 'entry' || movement.type === 'return' || movement.type === 'pack_disassemble' ? '+' : '-'}{movement.quantity}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{movement.reason}</td>
                          <td className="py-3 px-4 text-sm">{movement.user || 'Sistema'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">No hay movimientos registrados</p>
              </div>
            )}
          </div>

          {/* Leyenda */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Tipos de Movimientos</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.entries(movementTypes).map(([key, info]) => {
                const Icon = info.icon;
                return (
                  <div key={key} className={`flex items-center gap-2 p-3 rounded-lg ${info.bg}`}>
                    <Icon className={info.color} size={18} />
                    <div className={`font-semibold text-xs ${info.color}`}>{info.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Modal Producto */}
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

      {/* Modal Pack */}
      <Modal
        isOpen={showPackModal}
        onClose={() => {
          setShowPackModal(false);
          setEditingPack(null);
        }}
        title={editingPack ? 'Editar Pack' : 'Nuevo Pack'}
      >
        <PackForm
          pack={editingPack}
          products={products}
          onSubmit={handlePackSubmit}
          onCancel={() => {
            setShowPackModal(false);
            setEditingPack(null);
          }}
        />
      </Modal>

      {/* Modal Armar/Desarmar */}
      {showAssembleModal && selectedPackForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className={`p-6 rounded-t-2xl text-white ${
              actionType === 'assemble' 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                : 'bg-gradient-to-r from-orange-600 to-red-600'
            }`}>
              <h3 className="text-2xl font-bold flex items-center gap-3">
                {actionType === 'assemble' ? <Box size={28} /> : <ArrowRightLeft size={28} />}
                {actionType === 'assemble' ? 'Armar Pack' : 'Desarmar Pack'}
              </h3>
              <p className="opacity-90 mt-1">{selectedPackForAction.name}</p>
            </div>

            <div className="p-6 space-y-4">
              {actionType === 'assemble' ? (
                <>
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700">
                      <strong>Máximo disponible:</strong> {getMaxAssemblable(selectedPackForAction)} packs
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Basado en el stock actual de los componentes
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cantidad a armar</label>
                    <input
                      type="number"
                      min="1"
                      max={getMaxAssemblable(selectedPackForAction)}
                      className="w-full px-4 py-3 border-2 rounded-lg text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={assembleQty}
                      onChange={(e) => setAssembleQty(Math.min(parseInt(e.target.value) || 1, getMaxAssemblable(selectedPackForAction)))}
                    />
                  </div>

                  <div className="text-sm text-gray-600">
                    <p className="font-semibold mb-2">Se descontará del stock:</p>
                    {selectedPackForAction.components?.map((comp, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{comp.productName}</span>
                        <span className="text-red-600 font-semibold">-{comp.quantity * assembleQty}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-orange-700">
                      <strong>Packs armados:</strong> {selectedPackForAction.stockAssembled || 0}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cantidad a desarmar</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedPackForAction.stockAssembled || 0}
                      className="w-full px-4 py-3 border-2 rounded-lg text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={assembleQty}
                      onChange={(e) => setAssembleQty(Math.min(parseInt(e.target.value) || 1, selectedPackForAction.stockAssembled || 0))}
                    />
                  </div>

                  <div className="text-sm text-gray-600">
                    <p className="font-semibold mb-2">Se devolverá al stock:</p>
                    {selectedPackForAction.components?.map((comp, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{comp.productName}</span>
                        <span className="text-green-600 font-semibold">+{comp.quantity * assembleQty}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAssembleModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssembleDisassemble}
                  className={`flex-1 text-white py-3 rounded-lg font-bold ${
                    actionType === 'assemble'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {actionType === 'assemble' ? 'Armar' : 'Desarmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal OCR */}
      {showOCRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Camera size={32} />
                  <div>
                    <h3 className="text-2xl font-bold">Escanear Factura</h3>
                    <p className="text-sm opacity-90">OCR - Reconocimiento de texto</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowOCRModal(false);
                    setOcrImage(null);
                    setOcrResults([]);
                  }}
                  className="hover:bg-white/20 p-2 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Upload */}
              {!ocrImage && (
                <div className="border-2 border-dashed border-purple-300 rounded-xl p-12 text-center hover:border-purple-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="ocr-upload"
                  />
                  <label htmlFor="ocr-upload" className="cursor-pointer">
                    <Camera size={64} className="mx-auto text-purple-400 mb-4" />
                    <p className="text-lg font-semibold text-gray-700">Subir imagen de factura</p>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG o JPEG</p>
                  </label>
                </div>
              )}

              {/* Imagen subida */}
              {ocrImage && (
                <div className="space-y-4">
                  <div className="relative">
                    <img src={ocrImage} alt="Factura" className="w-full rounded-lg border-2 border-gray-200" />
                    {ocrProcessing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
                          <p className="font-semibold">Procesando imagen...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Resultados */}
                  {ocrResults.length > 0 && (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                      <h4 className="font-semibold text-purple-800 mb-3">Productos detectados:</h4>
                      <div className="space-y-2">
                        {ocrResults.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">Cant: {item.quantity} | Precio: ${item.price}</p>
                            </div>
                            <button
                              onClick={() => addProductFromOCR(item)}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-semibold"
                            >
                              + Agregar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Nota:</strong> El OCR es una función simulada. En producción se integraría con Tesseract.js o Google Cloud Vision API para reconocimiento real de texto.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t">
              <button
                onClick={() => {
                  setShowOCRModal(false);
                  setOcrImage(null);
                  setOcrResults([]);
                }}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};