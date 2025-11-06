import React, { useState, useMemo } from 'react';
import { ShoppingCart, CreditCard, DollarSign, TrendingUp, Users, Plus, Search, Receipt, AlertCircle, Trash2 } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { Modal } from '../shared/Modal';

const SaleForm = ({ products, onSubmit, onCancel }) => {
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = discountType === 'percentage' ? (subtotal * discount / 100) : discount;
  const total = subtotal - discountAmount;

  const addToCart = () => {
    if (!selectedProduct) return;
    const product = products.find(p => p.name === selectedProduct);
    if (!product || quantity > product.stock) {
      alert(`Stock insuficiente. Disponible: ${product?.stock || 0}`);
      return;
    }

    const existingItem = cart.find(item => item.name === selectedProduct);
    if (existingItem) {
      setCart(cart.map(item => 
        item.name === selectedProduct 
          ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        name: selectedProduct,
        quantity,
        price: product.price,
        subtotal: product.price * quantity
      }]);
    }
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeFromCart = (productName) => {
    setCart(cart.filter(item => item.name !== productName));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Agrega productos a la venta');
      return;
    }
    onSubmit({ products: cart, subtotal, discount: discountAmount, total, paymentMethod });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <h4 className="font-semibold mb-3">Agregar Productos</h4>
        <div className="grid grid-cols-12 gap-2">
          <select
            className="col-span-7 px-3 py-2 border rounded-lg"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">Seleccionar producto</option>
            {products.filter(p => p.stock > 0).map(p => (
              <option key={p.id} value={p.name}>{p.name} - ${p.price} (Stock: {p.stock})</option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            className="col-span-3 px-3 py-2 border rounded-lg"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
          <button type="button" onClick={addToCart} className="col-span-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Plus size={20} className="mx-auto" />
          </button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden max-h-60">
        <div className="bg-gray-50 px-4 py-2 font-semibold border-b">Carrito ({cart.length})</div>
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
            <p>Carrito vacío</p>
          </div>
        ) : (
          <table className="w-full">
            <tbody>
              {cart.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 text-sm">{item.name}</td>
                  <td className="py-2 px-3 text-center">{item.quantity}x</td>
                  <td className="py-2 px-3 text-right">${item.price}</td>
                  <td className="py-2 px-3 text-right font-semibold">${item.subtotal}</td>
                  <td className="py-2 px-3 text-center">
                    <button type="button" onClick={() => removeFromCart(item.name)} className="text-red-600">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="border rounded-lg p-4 bg-yellow-50">
        <h4 className="font-semibold mb-3">Descuento</h4>
        <div className="grid grid-cols-2 gap-3">
          <select className="px-3 py-2 border rounded-lg" value={discountType} onChange={(e) => { setDiscountType(e.target.value); setDiscount(0); }}>
            <option value="percentage">Porcentaje (%)</option>
            <option value="fixed">Monto Fijo ($)</option>
          </select>
          <input type="number" min="0" className="px-3 py-2 border rounded-lg" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Método de Pago</label>
        <select className="w-full px-3 py-2 border rounded-lg" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option>Efectivo</option>
          <option>Tarjeta</option>
          <option>Transferencia</option>
        </select>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Descuento:</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>TOTAL:</span>
          <span className="text-green-600">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={cart.length === 0} className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 font-semibold">
          Completar Venta
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300">
          Cancelar
        </button>
      </div>
    </form>
  );
};

const CreditForm = ({ products, onSubmit, onCancel }) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [amountPaid, setAmountPaid] = useState(0);

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = discountType === 'percentage' ? (subtotal * discount / 100) : discount;
  const total = subtotal - discountAmount;
  const amountDue = total - amountPaid;

  const addToCart = () => {
    if (!selectedProduct) return;
    const product = products.find(p => p.name === selectedProduct);
    if (!product || quantity > product.stock) {
      alert(`Stock insuficiente. Disponible: ${product?.stock || 0}`);
      return;
    }
    const existingItem = cart.find(item => item.name === selectedProduct);
    if (existingItem) {
      setCart(cart.map(item => 
        item.name === selectedProduct 
          ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * item.price }
          : item
      ));
    } else {
      setCart([...cart, { name: selectedProduct, quantity, price: product.price, subtotal: product.price * quantity }]);
    }
    setSelectedProduct('');
    setQuantity(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName || !phone || cart.length === 0) {
      alert('Completa todos los campos obligatorios');
      return;
    }
    onSubmit({ customerName, phone, dueDate, products: cart, subtotal, discount: discountAmount, total, amountPaid, amountDue });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
        <h4 className="font-semibold mb-3">Datos del Cliente</h4>
        <div className="grid grid-cols-2 gap-3">
          <input type="text" className="px-3 py-2 border rounded-lg" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre completo *" required />
          <input type="tel" className="px-3 py-2 border rounded-lg" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono *" required />
        </div>
        <input type="date" className="w-full px-3 py-2 border rounded-lg mt-3" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>

      <div className="border-2 border-dashed rounded-lg p-4">
        <div className="grid grid-cols-12 gap-2">
          <select className="col-span-7 px-3 py-2 border rounded-lg" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
            <option value="">Seleccionar producto</option>
            {products.filter(p => p.stock > 0).map(p => (
              <option key={p.id} value={p.name}>{p.name} - ${p.price}</option>
            ))}
          </select>
          <input type="number" min="1" className="col-span-3 px-3 py-2 border rounded-lg" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
          <button type="button" onClick={addToCart} className="col-span-2 bg-green-600 text-white rounded-lg">
            <Plus size={20} className="mx-auto" />
          </button>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm py-1">
              <span>{item.quantity}x {item.name}</span>
              <span className="font-semibold">${item.subtotal}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <select className="px-3 py-2 border rounded-lg text-sm" value={discountType} onChange={(e) => { setDiscountType(e.target.value); setDiscount(0); }}>
          <option value="percentage">% Descuento</option>
          <option value="fixed">$ Monto Fijo</option>
        </select>
        <input type="number" min="0" className="px-3 py-2 border rounded-lg text-sm" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} placeholder="0" />
      </div>

      <input type="number" min="0" step="0.01" className="w-full px-3 py-2 border rounded-lg" value={amountPaid} onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)} placeholder="Abono inicial" />

      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-red-600 text-sm">
            <span>Descuento:</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold border-t pt-2 mt-2">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        {amountPaid > 0 && (
          <div className="flex justify-between text-green-600 text-sm">
            <span>Abono:</span>
            <span>-${amountPaid.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-red-600 border-t pt-2 mt-2">
          <span>SALDO:</span>
          <span>${amountDue.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={cart.length === 0 || !customerName || !phone} className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 font-semibold">
          Registrar Fiado
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300">
          Cancelar
        </button>
      </div>
    </form>
  );
};

export const SalesView = () => {
  const { sales = [], credits = [], products = [], addSale, deleteSale, addCredit, addPaymentToCredit, deleteCredit } = useInventory();
  const [activeSubTab, setActiveSubTab] = useState('pos');
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');

  const today = new Date().toISOString().split('T')[0];

  const filteredSales = useMemo(() => {
    if (!Array.isArray(sales)) return [];
    let filtered = sales;

    if (dateFilter === 'today') {
      filtered = filtered.filter(s => s.date === today);
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(s => new Date(s.date) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(s => new Date(s.date) >= monthAgo);
    }

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.products && s.products.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });
  }, [sales, dateFilter, searchTerm, today]);

  const filteredCredits = useMemo(() => {
    if (!Array.isArray(credits)) return [];
    return credits.filter(c => 
      searchTerm === '' || 
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    ).sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'Pendiente' ? -1 : 1;
      }
      return b.date.localeCompare(a.date);
    });
  }, [credits, searchTerm]);

  const stats = useMemo(() => {
    if (!Array.isArray(sales)) {
      return { todayRevenue: 0, todaySales: 0, monthRevenue: 0, monthSales: 0, pendingCredits: 0, totalDue: 0 };
    }

    const todaySales = sales.filter(s => s.date === today);
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
    
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthSales = sales.filter(s => new Date(s.date) >= monthStart);
    const monthRevenue = monthSales.reduce((sum, s) => sum + s.total, 0);

    const pendingCredits = credits ? credits.filter(c => c.status === 'Pendiente') : [];
    const totalDue = pendingCredits.reduce((sum, c) => sum + c.amountDue, 0);

    return { todayRevenue, todaySales: todaySales.length, monthRevenue, monthSales: monthSales.length, pendingCredits: pendingCredits.length, totalDue };
  }, [sales, credits, today]);

  const handleSaleSubmit = (saleData) => {
    addSale(saleData);
    setShowSaleModal(false);
    alert('¡Venta registrada exitosamente!');
  };

  const handleCreditSubmit = (creditData) => {
    addCredit(creditData);
    setShowCreditModal(false);
    alert('¡Fiado registrado exitosamente!');
  };

  const handleAddPayment = (creditId) => {
    const payment = prompt('Ingresa el monto del abono:');
    if (payment && !isNaN(payment)) {
      addPaymentToCredit(creditId, parseFloat(payment));
      alert('Abono registrado exitosamente');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="border-b p-4">
          <div className="flex gap-2">
            <button onClick={() => setActiveSubTab('pos')} className={`px-4 py-2 rounded-lg transition ${activeSubTab === 'pos' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              <ShoppingCart size={18} className="inline mr-2" />
              Punto de Venta
            </button>
            <button onClick={() => setActiveSubTab('history')} className={`px-4 py-2 rounded-lg transition ${activeSubTab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              <Receipt size={18} className="inline mr-2" />
              Historial
            </button>
            <button onClick={() => setActiveSubTab('credits')} className={`px-4 py-2 rounded-lg transition ${activeSubTab === 'credits' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              <CreditCard size={18} className="inline mr-2" />
              Fiados ({stats.pendingCredits})
            </button>
          </div>
        </div>

        {(activeSubTab === 'history' || activeSubTab === 'credits') && (
          <div className="p-4 border-b bg-gray-50">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input type="text" placeholder={activeSubTab === 'history' ? 'Buscar por producto...' : 'Buscar por cliente...'} className="w-full pl-10 pr-4 py-2 border rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {activeSubTab === 'history' && (
                <select className="px-4 py-2 border rounded-lg" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                  <option value="today">Hoy</option>
                  <option value="week">Última semana</option>
                  <option value="month">Último mes</option>
                  <option value="all">Todo</option>
                </select>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Ventas Hoy</p>
              <p className="text-3xl font-bold mt-1">${stats.todayRevenue.toLocaleString()}</p>
              <p className="text-xs opacity-75 mt-1">{stats.todaySales} transacciones</p>
            </div>
            <DollarSign size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Ventas del Mes</p>
              <p className="text-3xl font-bold mt-1">${(stats.monthRevenue / 1000).toFixed(1)}K</p>
              <p className="text-xs opacity-75 mt-1">{stats.monthSales} transacciones</p>
            </div>
            <TrendingUp size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Fiados Pendientes</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingCredits}</p>
              <p className="text-xs opacity-75 mt-1">clientes</p>
            </div>
            <AlertCircle size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Por Cobrar</p>
              <p className="text-3xl font-bold mt-1">${(stats.totalDue / 1000).toFixed(1)}K</p>
              <p className="text-xs opacity-75 mt-1">total adeudado</p>
            </div>
            <CreditCard size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {activeSubTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="text-green-600" />
              Nueva Venta
            </h3>
            <button onClick={() => setShowSaleModal(true)} className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-lg font-semibold">
              <Plus size={24} />
              Iniciar Venta
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="text-orange-600" />
              Nuevo Fiado
            </h3>
            <button onClick={() => setShowCreditModal(true)} className="w-full bg-orange-600 text-white py-4 rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2 text-lg font-semibold">
              <Plus size={24} />
              Registrar Fiado
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Historial de Ventas ({filteredSales.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Venta #</th>
                  <th className="text-left py-3 px-4 font-semibold">Fecha y Hora</th>
                  <th className="text-left py-3 px-4 font-semibold">Productos</th>
                  <th className="text-left py-3 px-4 font-semibold">Subtotal</th>
                  <th className="text-left py-3 px-4 font-semibold">Descuento</th>
                  <th className="text-left py-3 px-4 font-semibold">Total</th>
                  <th className="text-left py-3 px-4 font-semibold">Método</th>
                  <th className="text-left py-3 px-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-400">
                      <Receipt size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No hay ventas registradas</p>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map(sale => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-blue-600">#{sale.id}</td>
                      <td className="py-3 px-4 text-sm">
                        <div>{sale.date}</div>
                        <div className="text-gray-500 text-xs">{sale.time}</div>
                      </td>
                      <td className="py-3 px-4">
                        {sale.products.map((p, idx) => (
                          <div key={idx} className="text-sm text-gray-600">{p.quantity}x {p.name}</div>
                        ))}
                      </td>
                      <td className="py-3 px-4">${sale.subtotal.toFixed(2)}</td>
                      <td className="py-3 px-4">{sale.discount > 0 ? <span className="text-red-600">-${sale.discount.toFixed(2)}</span> : '-'}</td>
                      <td className="py-3 px-4 font-bold text-green-600">${sale.total.toFixed(2)}</td>
                      <td className="py-3 px-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{sale.paymentMethod}</span></td>
                      <td className="py-3 px-4">
                        <button onClick={() => { if (window.confirm('¿Eliminar?')) deleteSale(sale.id); }} className="text-red-600 hover:text-red-800">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'credits' && (
        <div className="space-y-4">
          {filteredCredits.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <CreditCard size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay fiados registrados</h3>
              <button onClick={() => setShowCreditModal(true)} className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 mt-4">
                Registrar Primer Fiado
              </button>
            </div>
          ) : (
            filteredCredits.map(credit => (
              <div key={credit.id} className={`bg-white rounded-lg shadow p-6 border-l-4 ${credit.status === 'Pendiente' ? 'border-orange-500' : 'border-green-500'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg">{credit.customerName}</h4>
                    <p className="text-sm text-gray-600">{credit.phone}</p>
                    <p className="text-xs text-gray-500 mt-1">Fiado #{credit.id} - {credit.date} {credit.time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${credit.status === 'Pendiente' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                    {credit.status}
                  </span>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50 mb-4">
                  <h5 className="font-semibold text-sm mb-2">Productos:</h5>
                  {credit.products.map((p, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{p.quantity}x {p.name}</span>
                      <span className="font-semibold">${p.subtotal}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-red-800">Saldo Pendiente</p>
                      {credit.dueDate && <p className="text-xs text-red-600 mt-1">Vence: {credit.dueDate}</p>}
                    </div>
                    <p className="text-2xl font-bold text-red-600">${credit.amountDue.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {credit.status === 'Pendiente' && (
                    <button onClick={() => handleAddPayment(credit.id)} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                      Registrar Abono
                    </button>
                  )}
                  <button onClick={() => { if (window.confirm('¿Eliminar?')) deleteCredit(credit.id); }} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={showSaleModal} onClose={() => setShowSaleModal(false)} title="Nueva Venta">
        <SaleForm products={products} onSubmit={handleSaleSubmit} onCancel={() => setShowSaleModal(false)} />
      </Modal>

      <Modal isOpen={showCreditModal} onClose={() => setShowCreditModal(false)} title="Nuevo Fiado">
        <CreditForm products={products} onSubmit={handleCreditSubmit} onCancel={() => setShowCreditModal(false)} />
      </Modal>
    </div>
  );
};