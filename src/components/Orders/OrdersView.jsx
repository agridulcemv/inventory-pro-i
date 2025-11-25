import React, { useState } from 'react';
import { Plus, Package, ShoppingBag, Receipt, Trash2, X, Edit2, Check, Clock, Truck, CheckCircle } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';

export const OrdersExpensesView = () => {
  const { 
    orders, 
    purchases, 
    expenses, 
    suppliers,
    addOrder, 
    updateOrderStatus,
    deleteOrder,
    addPurchase, 
    deletePurchase,
    addExpense, 
    deleteExpense,
    addSupplier,
    completeOrder // Importado para el flujo completo
  } = useInventory();

  const [activeTab, setActiveTab] = useState('orders'); // orders, purchases, expenses
  
  // Formularios
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);

  // Estados para órdenes
  const [orderData, setOrderData] = useState({
    supplier: '',
    products: [],
    total: 0,
    expectedDate: '',
    notes: '',
    status: 'Pendiente'
  });

  const [orderProduct, setOrderProduct] = useState({
    name: '',
    quantity: 0,
    unitCost: 0
  });

  // Estados para compras
  const [purchaseData, setPurchaseData] = useState({
    supplier: '',
    products: [],
    total: 0,
    paymentMethod: 'Efectivo',
    notes: ''
  });

  const [purchaseProduct, setPurchaseProduct] = useState({
    name: '',
    quantity: 0,
    unitCost: 0
  });

  // Estados para gastos
  const [expenseData, setExpenseData] = useState({
    category: 'Servicios',
    description: '',
    amount: 0,
    paymentMethod: 'Efectivo',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Estado para proveedores
  const [supplierData, setSupplierData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: ''
  });

  const expenseCategories = [
    'Servicios',
    'Alquiler',
    'Sueldos',
    'Transporte',
    'Marketing',
    'Mantenimiento',
    'Impuestos',
    'Suministros',
    'Inventario/Compras', // Sugerencia de categoría
    'Otros'
  ];

  // ============ ÓRDENES ============
  const addProductToOrder = () => {
    if (!orderProduct.name || orderProduct.quantity <= 0 || orderProduct.unitCost <= 0) {
      alert('Completa todos los campos del producto');
      return;
    }

    const subtotal = orderProduct.quantity * orderProduct.unitCost;
    const newProduct = { ...orderProduct, subtotal };

    setOrderData({
      ...orderData,
      products: [...orderData.products, newProduct],
      total: orderData.total + subtotal
    });

    setOrderProduct({ name: '', quantity: 0, unitCost: 0 });
  };

  const removeProductFromOrder = (index) => {
    const product = orderData.products[index];
    setOrderData({
      ...orderData,
      products: orderData.products.filter((_, i) => i !== index),
      total: orderData.total - product.subtotal
    });
  };

  const handleSaveOrder = () => {
    if (!orderData.supplier || orderData.products.length === 0 || !orderData.expectedDate) {
      alert('Completa proveedor, productos y fecha esperada');
      return;
    }

    addOrder(orderData);
    alert('✅ Orden creada exitosamente');
    
    setOrderData({
      supplier: '',
      products: [],
      total: 0,
      expectedDate: '',
      notes: '',
      status: 'Pendiente'
    });
    setShowOrderForm(false);
  };

  const handleChangeOrderStatus = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    
    // FLUJO COMPLETO: Orden Recibida -> Compra -> Gasto -> Actualización de Stock
    if (newStatus === 'Recibido') {
      const order = orders.find(o => o.id === orderId);
      
      if (order && window.confirm('¿Deseas registrar esta orden como COMPRA RECIBIDA y el GASTO asociado (actualizará el inventario)?')) {
          
          let paymentMethod = 'Transferencia'; // Método por defecto
          const methodInput = prompt('Método de pago (Efectivo, Tarjeta, Transferencia):', paymentMethod);
          
          if (methodInput) {
            paymentMethod = methodInput.trim().charAt(0).toUpperCase() + methodInput.trim().slice(1).toLowerCase();
            if (!['Efectivo', 'Tarjeta', 'Transferencia'].includes(paymentMethod)) {
                paymentMethod = 'Transferencia'; // Fallback si el usuario introduce algo inválido
            }
          }
        
        try {
            // Llama a la función que maneja todo el flujo en el contexto
            const result = completeOrder(orderId, paymentMethod);

            alert(`✅ Orden #${orderId} completada. Compra y Gasto registrados (${paymentMethod}). Stock actualizado.`);
            
        } catch (error) {
            alert('❌ Error al completar la orden: ' + error.message);
        }
      }
    }
  };

  // ============ COMPRAS ============
  const addProductToPurchase = () => {
    if (!purchaseProduct.name || purchaseProduct.quantity <= 0 || purchaseProduct.unitCost <= 0) {
      alert('Completa todos los campos del producto');
      return;
    }

    const subtotal = purchaseProduct.quantity * purchaseProduct.unitCost;
    const newProduct = { ...purchaseProduct, subtotal };

    setPurchaseData({
      ...purchaseData,
      products: [...purchaseData.products, newProduct],
      total: purchaseData.total + subtotal
    });

    setPurchaseProduct({ name: '', quantity: 0, unitCost: 0 });
  };

  const removeProductFromPurchase = (index) => {
    const product = purchaseData.products[index];
    setPurchaseData({
      ...purchaseData,
      products: purchaseData.products.filter((_, i) => i !== index),
      total: purchaseData.total - product.subtotal
    });
  };

  const handleSavePurchase = () => {
    if (!purchaseData.supplier || purchaseData.products.length === 0) {
      alert('Completa el proveedor y agrega al menos un producto');
      return;
    }

    // Registrar Compra
    const newPurchase = addPurchase(purchaseData);
    
    // Registrar Gasto asociado a la compra
    const expenseFromPurchase = {
        category: 'Inventario/Compras',
        description: `Compra de inventario a ${purchaseData.supplier} (Manual)`,
        amount: purchaseData.total,
        paymentMethod: purchaseData.paymentMethod,
        date: new Date().toISOString().split('T')[0],
        notes: `Referencia a Compra #${newPurchase.id}`
    };
    addExpense(expenseFromPurchase);


    alert('✅ Compra y Gasto registrados exitosamente');
    
    setPurchaseData({
      supplier: '',
      products: [],
      total: 0,
      paymentMethod: 'Efectivo',
      notes: ''
    });
    setShowPurchaseForm(false);
  };

  // ============ GASTOS ============
  const handleSaveExpense = () => {
    if (!expenseData.description || expenseData.amount <= 0) {
      alert('Completa la descripción y el monto');
      return;
    }

    addExpense(expenseData);
    alert('✅ Gasto registrado exitosamente');
    
    setExpenseData({
      category: 'Servicios',
      description: '',
      amount: 0,
      paymentMethod: 'Efectivo',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowExpenseForm(false);
  };

  // ============ PROVEEDORES ============
  const handleSaveSupplier = () => {
    if (!supplierData.name) {
      alert('Ingresa el nombre del proveedor');
      return;
    }

    addSupplier(supplierData);
    alert('✅ Proveedor agregado exitosamente');
    
    setSupplierData({
      name: '',
      contact: '',
      phone: '',
      email: '',
      address: ''
    });
    setShowSupplierForm(false);
  };

  // Totales
  const totalOrders = orders.filter(o => o.status === 'Pendiente').reduce((sum, o) => sum + o.total, 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pendiente': return <Clock className="text-yellow-600" size={18} />;
      case 'En tránsito': return <Truck className="text-blue-600" size={18} />;
      case 'Recibido': return <CheckCircle className="text-green-600" size={18} />;
      case 'Cancelado': return <X className="text-red-600" size={18} />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'En tránsito': return 'bg-blue-100 text-blue-800';
      case 'Recibido': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 ${
                activeTab === 'orders' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package size={20} />
              Órdenes a Proveedores
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 ${
                activeTab === 'purchases' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingBag size={20} />
              Compras Recibidas
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 ${
                activeTab === 'expenses' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Receipt size={20} />
              Gastos Operativos
            </button>
          </nav>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg shadow p-6">
          <p className="text-sm opacity-90 mb-1">Órdenes Pendientes</p>
          <p className="text-3xl font-bold">${totalOrders.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
          <p className="text-sm opacity-90 mb-1">Total Compras</p>
          <p className="text-3xl font-bold">${totalPurchases.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow p-6">
          <p className="text-sm opacity-90 mb-1">Total Gastos</p>
          <p className="text-3xl font-bold">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow p-6">
          <p className="text-sm opacity-90 mb-1">Total Egresos</p>
          <p className="text-3xl font-bold">${(totalPurchases + totalExpenses).toLocaleString()}</p>
        </div>
      </div>

      {/* TAB 1: ÓRDENES */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Órdenes a Proveedores ({orders.length})</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSupplierForm(true)}
                className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2 font-bold"
              >
                <Plus size={20} />
                Proveedor
              </button>
              <button
                onClick={() => setShowOrderForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-bold"
              >
                <Plus size={20} />
                Nueva Orden
              </button>
            </div>
          </div>

          {/* Formulario de Orden */}
          {showOrderForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Nueva Orden a Proveedor</h3>
                  <button onClick={() => setShowOrderForm(false)} className="hover:bg-white/20 p-2 rounded-lg">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Proveedor *</label>
                      <select
                        className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={orderData.supplier}
                        onChange={(e) => setOrderData({...orderData, supplier: e.target.value})}
                      >
                        <option value="">Selecciona un proveedor</option>
                        {suppliers.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Fecha Esperada *</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={orderData.expectedDate}
                        onChange={(e) => setOrderData({...orderData, expectedDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h4 className="font-bold mb-3 text-blue-900">Agregar Productos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Nombre del producto"
                        className="px-3 py-2 border-2 rounded-lg"
                        value={orderProduct.name}
                        onChange={(e) => setOrderProduct({...orderProduct, name: e.target.value})}
                      />
                      <input
                        type="number"
                        placeholder="Cantidad"
                        className="px-3 py-2 border-2 rounded-lg"
                        value={orderProduct.quantity || ''}
                        onChange={(e) => setOrderProduct({...orderProduct, quantity: parseFloat(e.target.value) || 0})}
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Costo unitario"
                        className="px-3 py-2 border-2 rounded-lg"
                        value={orderProduct.unitCost || ''}
                        onChange={(e) => setOrderProduct({...orderProduct, unitCost: parseFloat(e.target.value) || 0})}
                      />
                      <button
                        onClick={addProductToOrder}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold"
                      >
                        <Plus size={20} className="inline" /> Agregar
                      </button>
                    </div>
                  </div>

                  {orderData.products.length > 0 && (
                    <div>
                      <h4 className="font-bold mb-3">Productos en la orden ({orderData.products.length})</h4>
                      <div className="space-y-2">
                        {orderData.products.map((product, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border-2">
                            <div>
                              <p className="font-bold">{product.name}</p>
                              <p className="text-sm text-gray-600">
                                {product.quantity} x ${product.unitCost} = ${product.subtotal.toFixed(2)}
                              </p>
                            </div>
                            <button
                              onClick={() => removeProductFromOrder(index)}
                              className="text-red-600 hover:bg-red-100 p-2 rounded-lg"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold">TOTAL:</span>
                          <span className="text-3xl font-bold text-green-600">${orderData.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold mb-2">Notas (opcional)</label>
                    <textarea
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      value={orderData.notes}
                      onChange={(e) => setOrderData({...orderData, notes: e.target.value})}
                      placeholder="Observaciones adicionales"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowOrderForm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveOrder}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold"
                    >
                      Crear Orden
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulario de Proveedor */}
          {showSupplierForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Agregar Proveedor</h3>
                  <button onClick={() => setShowSupplierForm(false)} className="hover:bg-white/20 p-2 rounded-lg">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Nombre *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={supplierData.name}
                      onChange={(e) => setSupplierData({...supplierData, name: e.target.value})}
                      placeholder="Nombre del proveedor"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Contacto</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border-2 rounded-lg"
                        value={supplierData.contact}
                        onChange={(e) => setSupplierData({...supplierData, contact: e.target.value})}
                        placeholder="Persona de contacto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Teléfono</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-2 border-2 rounded-lg"
                        value={supplierData.phone}
                        onChange={(e) => setSupplierData({...supplierData, phone: e.target.value})}
                        placeholder="Número de teléfono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border-2 rounded-lg"
                      value={supplierData.email}
                      onChange={(e) => setSupplierData({...supplierData, email: e.target.value})}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Dirección</label>
                    <textarea
                      className="w-full px-4 py-2 border-2 rounded-lg"
                      rows="2"
                      value={supplierData.address}
                      onChange={(e) => setSupplierData({...supplierData, address: e.target.value})}
                      placeholder="Dirección completa"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSupplierForm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveSupplier}
                      className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-bold"
                    >
                      Guardar Proveedor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de órdenes */}
          {orders.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Fecha Orden</th>
                      <th className="text-left py-3 px-4 font-semibold">Proveedor</th>
                      <th className="text-left py-3 px-4 font-semibold">Productos</th>
                      <th className="text-left py-3 px-4 font-semibold">Total</th>
                      <th className="text-left py-3 px-4 font-semibold">Fecha Esperada</th>
                      <th className="text-left py-3 px-4 font-semibold">Estado</th>
                      <th className="text-right py-3 px-4 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{order.date}</td>
                        <td className="py-3 px-4 font-semibold">{order.supplier}</td>
                        <td className="py-3 px-4">
                          {order.products.map((p, i) => (
                            <div key={i} className="text-sm">
                              {p.name} x{p.quantity}
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-4 font-bold text-blue-600">${order.total.toFixed(0)}</td>
                        <td className="py-3 px-4">{order.expectedDate}</td>
                        <td className="py-3 px-4">
                          <select
                            className={`px-3 py-1 rounded-lg text-sm font-bold ${getStatusColor(order.status)}`}
                            value={order.status}
                            onChange={(e) => handleChangeOrderStatus(order.id, e.target.value)}
                            disabled={order.status === 'Recibido' || order.status === 'Cancelado'}
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En tránsito">En tránsito</option>
                            <option value="Recibido">Recibido</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="text-red-600 hover:bg-red-100 p-2 rounded-lg disabled:opacity-50"
                            disabled={order.status !== 'Pendiente'}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Package size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No hay órdenes registradas</p>
              <p className="text-gray-400 text-sm mt-2">Crea tu primera orden a un proveedor</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPRAS (código similar al anterior pero con el formulario de compras) */}
      {activeTab === 'purchases' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Compras Recibidas ({purchases.length})</h2>
            <button
              onClick={() => setShowPurchaseForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 font-bold"
            >
              <Plus size={20} />
              Registrar Compra
            </button>
          </div>

          {/* Formulario similar al anterior */}
          {showPurchaseForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Registrar Compra Recibida</h3>
                  <button onClick={() => setShowPurchaseForm(false)} className="hover:bg-white/20 p-2 rounded-lg">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Proveedor *</label>
                      <select
                        className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={purchaseData.supplier}
                        onChange={(e) => setPurchaseData({...purchaseData, supplier: e.target.value})}
                      >
                        <option value="">Selecciona un proveedor</option>
                        {suppliers.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Método de Pago *</label>
                      <select
                        className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={purchaseData.paymentMethod}
                        onChange={(e) => setPurchaseData({...purchaseData, paymentMethod: e.target.value})}
                      >
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta">Tarjeta</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Crédito">Crédito</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                    <h4 className="font-bold mb-3 text-green-900">Agregar Productos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Nombre del producto"
                        className="px-3 py-2 border-2 rounded-lg"
                        value={purchaseProduct.name}
                        onChange={(e) => setPurchaseProduct({...purchaseProduct, name: e.target.value})}
                      />
                      <input
                        type="number"
                        placeholder="Cantidad"
                        className="px-3 py-2 border-2 rounded-lg"
                        value={purchaseProduct.quantity || ''}
                        onChange={(e) => setPurchaseProduct({...purchaseProduct, quantity: parseFloat(e.target.value) || 0})}
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Costo unitario"
                        className="px-3 py-2 border-2 rounded-lg"
                        value={purchaseProduct.unitCost || ''}
                        onChange={(e) => setPurchaseProduct({...purchaseProduct, unitCost: parseFloat(e.target.value) || 0})}
                      />
                      <button
                        onClick={addProductToPurchase}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold"
                      >
                        <Plus size={20} className="inline" /> Agregar
                      </button>
                    </div>
                  </div>

                  {purchaseData.products.length > 0 && (
                    <div>
                      <h4 className="font-bold mb-3">Productos ({purchaseData.products.length})</h4>
                      <div className="space-y-2">
                        {purchaseData.products.map((product, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border-2">
                            <div>
                              <p className="font-bold">{product.name}</p>
                              <p className="text-sm text-gray-600">
                                {product.quantity} x ${product.unitCost} = ${product.subtotal.toFixed(2)}
                              </p>
                            </div>
                            <button
                              onClick={() => removeProductFromPurchase(index)}
                              className="text-red-600 hover:bg-red-100 p-2 rounded-lg"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold">TOTAL:</span>
                          <span className="text-3xl font-bold text-green-600">${purchaseData.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold mb-2">Notas</label>
                    <textarea
                      className="w-full px-4 py-2 border-2 rounded-lg"
                      rows="3"
                      value={purchaseData.notes}
                      onChange={(e) => setPurchaseData({...purchaseData, notes: e.target.value})}
                      placeholder="Número de factura, observaciones, etc."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowPurchaseForm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSavePurchase}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold"
                    >
                      Registrar Compra
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de compras */}
          {purchases.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Fecha</th>
                      <th className="text-left py-3 px-4 font-semibold">Proveedor</th>
                      <th className="text-left py-3 px-4 font-semibold">Productos</th>
                      <th className="text-left py-3 px-4 font-semibold">Método de Pago</th>
                      <th className="text-left py-3 px-4 font-semibold">Total</th>
                      <th className="text-right py-3 px-4 font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map(purchase => (
                      <tr key={purchase.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{purchase.date}</td>
                        <td className="py-3 px-4 font-semibold">{purchase.supplier}</td>
                        <td className="py-3 px-4">
                          {purchase.products.map((p, i) => (
                            <div key={i} className="text-sm">{p.name} x{p.quantity}</div>
                          ))}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            purchase.paymentMethod === 'Efectivo' ? 'bg-green-100 text-green-800' :
                            purchase.paymentMethod === 'Tarjeta' ? 'bg-blue-100 text-blue-800' :
                            purchase.paymentMethod === 'Transferencia' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {purchase.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-green-600">${purchase.total.toFixed(0)}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deletePurchase(purchase.id)}
                            className="text-red-600 hover:bg-red-100 p-2 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <ShoppingBag size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No hay compras registradas</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GASTOS */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gastos Operativos ({expenses.length})</h2>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 flex items-center gap-2 font-bold"
            >
              <Plus size={20} />
              Nuevo Gasto
            </button>
          </div>

          {/* Formulario de gasto */}
          {showExpenseForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Nuevo Gasto Operativo</h3>
                  <button onClick={() => setShowExpenseForm(false)} className="hover:bg-white/20 p-2 rounded-lg">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Categoría *</label>
                      <select
                        className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={expenseData.category}
                        onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
                      >
                        {expenseCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Fecha *</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={expenseData.date}
                        onChange={(e) => setExpenseData({...expenseData, date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Descripción *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={expenseData.description}
                      onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
                      placeholder="Ej: Pago de luz, gasolina, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Monto *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full pl-8 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          value={expenseData.amount || ''}
                          onChange={(e) => setExpenseData({...expenseData, amount: parseFloat(e.target.value) || 0})}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Método de Pago *</label>
                      <select
                        className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={expenseData.paymentMethod}
                        onChange={(e) => setExpenseData({...expenseData, paymentMethod: e.target.value})}
                      >
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta">Tarjeta</option>
                        <option value="Transferencia">Transferencia</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Notas</label>
                    <textarea
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows="3"
                      value={expenseData.notes}
                      onChange={(e) => setExpenseData({...expenseData, notes: e.target.value})}
                      placeholder="Información adicional"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowExpenseForm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveExpense}
                      className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-bold"
                    >
                      Registrar Gasto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de gastos */}
          {expenses.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Fecha</th>
                      <th className="text-left py-3 px-4 font-semibold">Categoría</th>
                      <th className="text-left py-3 px-4 font-semibold">Descripción</th>
                      <th className="text-left py-3 px-4 font-semibold">Método de Pago</th>
                      <th className="text-left py-3 px-4 font-semibold">Monto</th>
                      <th className="text-right py-3 px-4 font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(expense => (
                      <tr key={expense.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{expense.date}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            expense.category === 'Inventario/Compras' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {expense.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">{expense.description}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            expense.paymentMethod === 'Efectivo' ? 'bg-green-100 text-green-800' :
                            expense.paymentMethod === 'Tarjeta' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {expense.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-orange-600">${expense.amount.toFixed(0)}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="text-red-600 hover:bg-red-100 p-2 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Receipt size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No hay gastos registrados</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};