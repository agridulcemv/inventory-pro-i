import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Phone, Mail, Star, Users, Truck, Search, Building2, FileText, MapPin, CreditCard, Calendar, DollarSign, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { Modal } from '../shared/Modal';

// ==================== FORMULARIO DE PROVEEDOR ====================
const SupplierForm = ({ supplier, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(supplier || {
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    rut: '',
    giro: '',
    rating: 5,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Nombre del Proveedor *</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">RUT</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.rut}
            onChange={(e) => setFormData({...formData, rut: e.target.value})}
            placeholder="12.345.678-9"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Giro</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.giro}
            onChange={(e) => setFormData({...formData, giro: e.target.value})}
            placeholder="Actividad comercial"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Persona de Contacto *</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.contact}
            onChange={(e) => setFormData({...formData, contact: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono *</label>
          <input
            type="tel"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
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

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="Dirección completa"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Notas</label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Notas adicionales..."
          />
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

// ==================== FORMULARIO DE CLIENTE ====================
const CustomerForm = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(customer || {
    name: '',
    rut: '',
    giro: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    commune: '',
    contactPerson: '',
    creditLimit: 0,
    paymentTerms: 30,
    notes: '',
    type: 'persona' // persona o empresa
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Tipo de cliente */}
      <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="type"
            value="persona"
            checked={formData.type === 'persona'}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="w-4 h-4 text-blue-600"
          />
          <span className="font-medium">Persona Natural</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="type"
            value="empresa"
            checked={formData.type === 'empresa'}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="w-4 h-4 text-blue-600"
          />
          <span className="font-medium">Empresa</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">
            {formData.type === 'empresa' ? 'Razón Social *' : 'Nombre Completo *'}
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">RUT *</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.rut}
            onChange={(e) => setFormData({...formData, rut: e.target.value})}
            placeholder="12.345.678-9"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Giro</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.giro}
            onChange={(e) => setFormData({...formData, giro: e.target.value})}
            placeholder="Actividad económica"
          />
        </div>

        {formData.type === 'empresa' && (
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Persona de Contacto</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.contactPerson}
              onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
              placeholder="Nombre del contacto principal"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono *</label>
          <input
            type="tel"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="Calle, número, depto/oficina"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Comuna</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.commune}
            onChange={(e) => setFormData({...formData, commune: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ciudad</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Límite de Crédito ($)</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.creditLimit}
            onChange={(e) => setFormData({...formData, creditLimit: parseFloat(e.target.value) || 0})}
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Plazo de Pago (días)</label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.paymentTerms}
            onChange={(e) => setFormData({...formData, paymentTerms: parseInt(e.target.value)})}
          >
            <option value={0}>Contado</option>
            <option value={15}>15 días</option>
            <option value={30}>30 días</option>
            <option value={45}>45 días</option>
            <option value={60}>60 días</option>
            <option value={90}>90 días</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Notas</label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="2"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Observaciones adicionales..."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          {customer ? 'Actualizar' : 'Crear'} Cliente
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
export const SuppliersView = () => {
  const { suppliers, products, addSupplier, deleteSupplier, updateSupplier, customers = [], addCustomer, deleteCustomer, updateCustomer, credits = [], sales = [] } = useInventory();
  
  // Tab activo: proveedores o clientes
  const [activeTab, setActiveTab] = useState('suppliers');
  
  // Estados para proveedores
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierSearch, setSupplierSearch] = useState('');
  
  // Estados para clientes
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  // ==================== LÓGICA DE PROVEEDORES ====================
  const handleSupplierSubmit = (formData) => {
    if (editingSupplier) {
      if (updateSupplier) {
        updateSupplier(editingSupplier.id, formData);
      }
    } else {
      if (addSupplier) {
        addSupplier(formData);
      }
    }
    setShowSupplierModal(false);
    setEditingSupplier(null);
  };

  const handleDeleteSupplier = (id) => {
    if (window.confirm('¿Eliminar este proveedor?')) {
      if (deleteSupplier) {
        deleteSupplier(id);
      }
    }
  };

  const suppliersWithStats = useMemo(() => {
    return (suppliers || []).map(s => ({
      ...s,
      productCount: (products || []).filter(p => p.supplier === s.name).length,
      totalValue: (products || [])
        .filter(p => p.supplier === s.name)
        .reduce((sum, p) => sum + (p.stock * p.price), 0)
    }));
  }, [suppliers, products]);

  const filteredSuppliers = useMemo(() => {
    if (!supplierSearch) return suppliersWithStats;
    const search = supplierSearch.toLowerCase();
    return suppliersWithStats.filter(s => 
      s.name.toLowerCase().includes(search) ||
      s.contact?.toLowerCase().includes(search) ||
      s.email?.toLowerCase().includes(search)
    );
  }, [suppliersWithStats, supplierSearch]);

  // ==================== LÓGICA DE CLIENTES ====================
  const handleCustomerSubmit = (formData) => {
    if (editingCustomer) {
      if (updateCustomer) {
        updateCustomer(editingCustomer.id, formData);
      }
    } else {
      if (addCustomer) {
        addCustomer(formData);
      }
    }
    setShowCustomerModal(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (id) => {
    if (window.confirm('¿Eliminar este cliente? Los créditos asociados no serán eliminados.')) {
      if (deleteCustomer) {
        deleteCustomer(id);
      }
    }
  };

  const customersWithStats = useMemo(() => {
    return (customers || []).map(c => {
      // Buscar créditos del cliente
      const customerCredits = (credits || []).filter(cr => 
        cr.customerName?.toLowerCase() === c.name?.toLowerCase() ||
        cr.customerId === c.id
      );
      
      const totalDebt = customerCredits
        .filter(cr => cr.status === 'Pendiente')
        .reduce((sum, cr) => sum + (cr.amountDue || 0), 0);
      
      const totalPurchases = customerCredits.reduce((sum, cr) => sum + (cr.total || 0), 0);
      
      // Buscar ventas del cliente (si tienen customerId)
      const customerSales = (sales || []).filter(s => s.customerId === c.id);
      const totalSalesAmount = customerSales.reduce((sum, s) => sum + (s.total || 0), 0);

      return {
        ...c,
        totalDebt,
        totalPurchases: totalPurchases + totalSalesAmount,
        creditsCount: customerCredits.length,
        hasOverdue: customerCredits.some(cr => {
          if (cr.status !== 'Pendiente') return false;
          const dueDate = new Date(cr.dueDate);
          return dueDate < new Date();
        })
      };
    });
  }, [customers, credits, sales]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customersWithStats;
    const search = customerSearch.toLowerCase();
    return customersWithStats.filter(c => 
      c.name?.toLowerCase().includes(search) ||
      c.rut?.toLowerCase().includes(search) ||
      c.email?.toLowerCase().includes(search) ||
      c.phone?.includes(search)
    );
  }, [customersWithStats, customerSearch]);

  // Métricas de clientes
  const customerMetrics = useMemo(() => {
    const total = customersWithStats.length;
    const withDebt = customersWithStats.filter(c => c.totalDebt > 0).length;
    const totalDebt = customersWithStats.reduce((sum, c) => sum + c.totalDebt, 0);
    const totalPurchases = customersWithStats.reduce((sum, c) => sum + c.totalPurchases, 0);
    const empresas = customersWithStats.filter(c => c.type === 'empresa').length;
    
    return { total, withDebt, totalDebt, totalPurchases, empresas };
  }, [customersWithStats]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 ${
                activeTab === 'suppliers'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Truck size={20} />
              Proveedores
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                {suppliers?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 ${
                activeTab === 'customers'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={20} />
              Clientes
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                {customers?.length || 0}
              </span>
              {customerMetrics.withDebt > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {customerMetrics.withDebt} con deuda
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* ==================== TAB PROVEEDORES ==================== */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          {/* Header con búsqueda y botón */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-semibold">Gestión de Proveedores</h3>
              <p className="text-gray-600 text-sm mt-1">
                Total: {suppliers?.length || 0} proveedores activos
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar proveedor..."
                  className="w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                />
              </div>
              <button
                onClick={() => {
                  setEditingSupplier(null);
                  setShowSupplierModal(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition whitespace-nowrap"
              >
                <Plus size={20} />
                Nuevo Proveedor
              </button>
            </div>
          </div>

          {/* Estadísticas de proveedores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Proveedor Más Productos</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {suppliersWithStats.sort((a, b) => b.productCount - a.productCount)[0]?.name || '-'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {suppliersWithStats.sort((a, b) => b.productCount - a.productCount)[0]?.productCount || 0} productos
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Mejor Calificado</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {suppliersWithStats.sort((a, b) => b.rating - a.rating)[0]?.name || '-'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="text-yellow-500" fill="currentColor" size={16} />
                <span className="text-sm font-semibold">
                  {suppliersWithStats.sort((a, b) => b.rating - a.rating)[0]?.rating || 0}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Mayor Valor en Inventario</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                ${suppliersWithStats.sort((a, b) => b.totalValue - a.totalValue)[0]?.totalValue?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {suppliersWithStats.sort((a, b) => b.totalValue - a.totalValue)[0]?.name || '-'}
              </p>
            </div>
          </div>

          {/* Lista de Proveedores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map(supplier => (
              <div key={supplier.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg">{supplier.name}</h4>
                    <p className="text-sm text-gray-600">{supplier.contact}</p>
                    {supplier.rut && (
                      <p className="text-xs text-gray-500">RUT: {supplier.rut}</p>
                    )}
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
                  {supplier.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} />
                      <span className="truncate">{supplier.address}</span>
                    </div>
                  )}
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
                        setShowSupplierModal(true);
                      }}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 transition flex items-center justify-center gap-1"
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(supplier.id)}
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

          {filteredSuppliers.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Truck size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No se encontraron proveedores</p>
              <p className="text-gray-400 text-sm mt-2">
                {supplierSearch ? 'Intenta con otra búsqueda' : 'Agrega tu primer proveedor'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB CLIENTES ==================== */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* Header con búsqueda y botón */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-semibold">Gestión de Clientes</h3>
              <p className="text-gray-600 text-sm mt-1">
                {customerMetrics.total} clientes ({customerMetrics.empresas} empresas)
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar cliente, RUT..."
                  className="w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>
              <button
                onClick={() => {
                  setEditingCustomer(null);
                  setShowCustomerModal(true);
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition whitespace-nowrap"
              >
                <Plus size={20} />
                Nuevo Cliente
              </button>
            </div>
          </div>

          {/* Estadísticas de clientes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90">Total Clientes</p>
              <p className="text-3xl font-bold mt-1">{customerMetrics.total}</p>
              <p className="text-xs opacity-75 mt-1">{customerMetrics.empresas} empresas</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90">Total Compras</p>
              <p className="text-3xl font-bold mt-1">${customerMetrics.totalPurchases.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90">Deuda Total</p>
              <p className="text-3xl font-bold mt-1">${customerMetrics.totalDebt.toLocaleString()}</p>
              <p className="text-xs opacity-75 mt-1">{customerMetrics.withDebt} clientes</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90">Cliente Top</p>
              <p className="text-lg font-bold mt-1 truncate">
                {customersWithStats.sort((a, b) => b.totalPurchases - a.totalPurchases)[0]?.name || '-'}
              </p>
              <p className="text-xs opacity-75 mt-1">
                ${customersWithStats.sort((a, b) => b.totalPurchases - a.totalPurchases)[0]?.totalPurchases?.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* Lista de Clientes */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Cliente</th>
                  <th className="text-left py-3 px-4 font-semibold">RUT</th>
                  <th className="text-left py-3 px-4 font-semibold">Contacto</th>
                  <th className="text-left py-3 px-4 font-semibold">Compras</th>
                  <th className="text-left py-3 px-4 font-semibold">Deuda</th>
                  <th className="text-left py-3 px-4 font-semibold">Límite</th>
                  <th className="text-right py-3 px-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <React.Fragment key={customer.id}>
                    <tr className={`border-b hover:bg-gray-50 transition ${customer.hasOverdue ? 'bg-red-50' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            customer.type === 'empresa' ? 'bg-purple-100' : 'bg-green-100'
                          }`}>
                            {customer.type === 'empresa' ? (
                              <Building2 size={20} className="text-purple-600" />
                            ) : (
                              <Users size={20} className="text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{customer.name}</p>
                            <p className="text-xs text-gray-500">
                              {customer.type === 'empresa' ? 'Empresa' : 'Persona'} 
                              {customer.giro && ` • ${customer.giro}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{customer.rut || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p>{customer.phone}</p>
                          <p className="text-gray-500 truncate max-w-[150px]">{customer.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-green-600">
                          ${customer.totalPurchases.toLocaleString()}
                        </span>
                        <p className="text-xs text-gray-500">{customer.creditsCount} créditos</p>
                      </td>
                      <td className="py-3 px-4">
                        {customer.totalDebt > 0 ? (
                          <span className={`font-bold ${customer.hasOverdue ? 'text-red-600' : 'text-orange-600'}`}>
                            ${customer.totalDebt.toLocaleString()}
                            {customer.hasOverdue && (
                              <span className="ml-1 text-xs bg-red-100 text-red-800 px-1 rounded">VENCIDO</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-green-600">Sin deuda</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">
                          ${customer.creditLimit?.toLocaleString() || 0}
                        </span>
                        <p className="text-xs text-gray-500">{customer.paymentTerms || 0} días</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Ver detalles"
                          >
                            {expandedCustomer === customer.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          <button
                            onClick={() => {
                              setEditingCustomer(customer);
                              setShowCustomerModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Fila expandida con detalles */}
                    {expandedCustomer === customer.id && (
                      <tr className="bg-gray-50">
                        <td colSpan="7" className="py-4 px-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <FileText size={16} />
                                Datos Fiscales
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-gray-500">RUT:</span> {customer.rut || '-'}</p>
                                <p><span className="text-gray-500">Giro:</span> {customer.giro || '-'}</p>
                                {customer.type === 'empresa' && (
                                  <p><span className="text-gray-500">Contacto:</span> {customer.contactPerson || '-'}</p>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <MapPin size={16} />
                                Dirección
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p>{customer.address || '-'}</p>
                                <p>{customer.commune && `${customer.commune}, `}{customer.city || ''}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <CreditCard size={16} />
                                Condiciones Comerciales
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-gray-500">Límite crédito:</span> ${customer.creditLimit?.toLocaleString() || 0}</p>
                                <p><span className="text-gray-500">Plazo pago:</span> {customer.paymentTerms || 0} días</p>
                                {customer.notes && (
                                  <p className="text-gray-500 italic mt-2">"{customer.notes}"</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className="p-12 text-center">
                <Users size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">No se encontraron clientes</p>
                <p className="text-gray-400 text-sm mt-2">
                  {customerSearch ? 'Intenta con otra búsqueda' : 'Agrega tu primer cliente'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Proveedor */}
      <Modal
        isOpen={showSupplierModal}
        onClose={() => {
          setShowSupplierModal(false);
          setEditingSupplier(null);
        }}
        title={editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      >
        <SupplierForm
          supplier={editingSupplier}
          onSubmit={handleSupplierSubmit}
          onCancel={() => {
            setShowSupplierModal(false);
            setEditingSupplier(null);
          }}
        />
      </Modal>

      {/* Modal Cliente */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => {
          setShowCustomerModal(false);
          setEditingCustomer(null);
        }}
        title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <CustomerForm
          customer={editingCustomer}
          onSubmit={handleCustomerSubmit}
          onCancel={() => {
            setShowCustomerModal(false);
            setEditingCustomer(null);
          }}
        />
      </Modal>
    </div>
  );
};