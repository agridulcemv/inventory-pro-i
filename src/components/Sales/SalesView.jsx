import React, { useState, useMemo } from 'react';
import { ShoppingCart, CreditCard, TrendingUp, DollarSign, Users, AlertTriangle, Calendar, Phone, MessageCircle, FileText, Search, Filter, X, CheckCircle, Clock, XCircle, Trash2, User, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const SalesView = () => {
  const { sales, credits, addPaymentToCredit, deleteCredit, deleteSale, config, currentShift, expenses } = useInventory();
  const [activeTab, setActiveTab] = useState('history'); // history, credits, analysis
  
  // Estados para créditos
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Estados para historial
  const [salesSearchTerm, setSalesSearchTerm] = useState('');
  const [salesFilter, setSalesFilter] = useState('all'); // all, today, week, month
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  // Obtener historial de turnos del config
  const shiftHistory = config?.shiftHistory || [];

  // ==================== MÉTRICAS DE CRÉDITOS ====================
  const creditMetrics = useMemo(() => {
    const now = new Date();
    const pendingCredits = (credits ?? []).filter(c => c.status === 'Pendiente'); 
    
    const totalPending = pendingCredits.reduce((sum, c) => sum + c.amountDue, 0);
    const activeClients = pendingCredits.length;
    
    const overdue = pendingCredits.filter(c => {
      const dueDate = new Date(c.dueDate);
      return dueDate < now;
    });
    
    const dueSoon = pendingCredits.filter(c => {
      const dueDate = new Date(c.dueDate);
      const diffTime = dueDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });

    return {
      totalPending,
      activeClients,
      overdueCount: overdue.length,
      dueSoonCount: dueSoon.length
    };
  }, [credits]);

  // ==================== OBTENER PAID IN/OUT ====================
  const getAllPaidInOut = useMemo(() => {
    const paidIns = [];
    const paidOuts = [];

    // Obtener del turno actual
    if (currentShift) {
      if (currentShift.paidIns) {
        currentShift.paidIns.forEach(pi => {
          paidIns.push({
            ...pi,
            shiftUserName: currentShift.userName,
            isCurrentShift: true
          });
        });
      }
      if (currentShift.paidOuts) {
        currentShift.paidOuts.forEach(po => {
          paidOuts.push({
            ...po,
            shiftUserName: currentShift.userName,
            isCurrentShift: true
          });
        });
      }
    }

    // Obtener del historial de turnos
    shiftHistory.forEach(shift => {
      if (shift.paidIns) {
        shift.paidIns.forEach(pi => {
          paidIns.push({
            ...pi,
            shiftUserName: shift.userName,
            isCurrentShift: false
          });
        });
      }
      if (shift.paidOuts) {
        shift.paidOuts.forEach(po => {
          paidOuts.push({
            ...po,
            shiftUserName: shift.userName,
            isCurrentShift: false
          });
        });
      }
    });

    return { paidIns, paidOuts };
  }, [currentShift, shiftHistory]);

  // ==================== COMBINAR VENTAS CON SEPARADORES DE TURNO Y PAID IN/OUT ====================
  const salesWithShiftSeparators = useMemo(() => {
    const salesArray = sales ?? [];
    const shiftsArray = shiftHistory ?? [];
    const { paidIns, paidOuts } = getAllPaidInOut;
    
    // Crear array combinado
    const combined = [];
    
    // Agregar todas las ventas con su tipo
    salesArray.forEach(sale => {
      const saleDateTime = new Date(sale.date + ' ' + sale.time);
      combined.push({
        type: 'sale',
        data: sale,
        timestamp: saleDateTime.getTime()
      });
    });
    
    // Agregar los cierres de turno como separadores
    shiftsArray.forEach(shift => {
      const shiftDateTime = new Date(shift.endTime);
      combined.push({
        type: 'shift_separator',
        data: shift,
        timestamp: shiftDateTime.getTime()
      });
    });

    // Agregar Paid Ins
    paidIns.forEach(paidIn => {
      const piDateTime = new Date(paidIn.date + ' ' + paidIn.time);
      combined.push({
        type: 'paid_in',
        data: paidIn,
        timestamp: piDateTime.getTime()
      });
    });

    // Agregar Paid Outs
    paidOuts.forEach(paidOut => {
      const poDateTime = new Date(paidOut.date + ' ' + paidOut.time);
      combined.push({
        type: 'paid_out',
        data: paidOut,
        timestamp: poDateTime.getTime()
      });
    });
    
    // Ordenar por timestamp descendente (más reciente primero)
    combined.sort((a, b) => b.timestamp - a.timestamp);
    
    return combined;
  }, [sales, shiftHistory, getAllPaidInOut]);

  // ==================== FILTRADO DE VENTAS ====================
  const filteredSalesWithSeparators = useMemo(() => {
    let filtered = [...salesWithShiftSeparators];

    // Filtrar por búsqueda (solo afecta ventas, no separadores ni paid in/out)
    if (salesSearchTerm) {
      filtered = filtered.filter(item => {
        if (item.type === 'shift_separator') return true;
        if (item.type === 'paid_in' || item.type === 'paid_out') {
          return item.data.description.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
                 item.data.category.toLowerCase().includes(salesSearchTerm.toLowerCase());
        }
        return item.data.products.some(p => p.name.toLowerCase().includes(salesSearchTerm.toLowerCase())) ||
               item.data.paymentMethod.toLowerCase().includes(salesSearchTerm.toLowerCase());
      });
    }

    // Filtrar por período
    const now = new Date();
    if (salesFilter === 'today') {
      const today = now.toISOString().split('T')[0];
      filtered = filtered.filter(item => {
        if (item.type === 'shift_separator') {
          const shiftDate = new Date(item.data.endTime).toISOString().split('T')[0];
          return shiftDate === today;
        }
        if (item.type === 'paid_in' || item.type === 'paid_out') {
          return item.data.date === today;
        }
        return item.data.date === today;
      });
    } else if (salesFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(item => {
        if (item.type === 'shift_separator') {
          return new Date(item.data.endTime) >= weekAgo;
        }
        if (item.type === 'paid_in' || item.type === 'paid_out') {
          return new Date(item.data.date) >= weekAgo;
        }
        return new Date(item.data.date) >= weekAgo;
      });
    } else if (salesFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(item => {
        if (item.type === 'shift_separator') {
          return new Date(item.data.endTime) >= monthAgo;
        }
        if (item.type === 'paid_in' || item.type === 'paid_out') {
          return new Date(item.data.date) >= monthAgo;
        }
        return new Date(item.data.date) >= monthAgo;
      });
    }

    // Filtrar por método de pago (solo afecta ventas)
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(item => {
        if (item.type === 'shift_separator' || item.type === 'paid_in' || item.type === 'paid_out') return true;
        return item.data.paymentMethod === paymentMethodFilter;
      });
    }

    return filtered;
  }, [salesWithShiftSeparators, salesSearchTerm, salesFilter, paymentMethodFilter]);

  // Solo ventas filtradas (sin separadores ni paid in/out) para métricas
  const filteredSales = useMemo(() => {
    return filteredSalesWithSeparators
      .filter(item => item.type === 'sale')
      .map(item => item.data);
  }, [filteredSalesWithSeparators]);

  // Métricas de Paid In/Out filtradas
  const filteredPaidMetrics = useMemo(() => {
    const paidIns = filteredSalesWithSeparators.filter(item => item.type === 'paid_in');
    const paidOuts = filteredSalesWithSeparators.filter(item => item.type === 'paid_out');
    
    return {
      totalPaidIn: paidIns.reduce((sum, item) => sum + item.data.amount, 0),
      totalPaidOut: paidOuts.reduce((sum, item) => sum + item.data.amount, 0),
      countPaidIn: paidIns.length,
      countPaidOut: paidOuts.length
    };
  }, [filteredSalesWithSeparators]);

  // ==================== MÉTRICAS DE VENTAS ====================
  const salesMetrics = useMemo(() => {
    const totalSales = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const totalDiscount = filteredSales.reduce((sum, s) => sum + (s.discount || 0), 0);
    const avgSale = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;

    const byMethod = {
      'Efectivo': 0,
      'Tarjeta': 0,
      'Transferencia': 0,
      'Fiado': 0
    };

    filteredSales.forEach(sale => {
      byMethod[sale.paymentMethod] = (byMethod[sale.paymentMethod] || 0) + sale.total;
    });

    return {
      totalSales,
      totalDiscount,
      avgSale,
      count: filteredSales.length,
      byMethod
    };
  }, [filteredSales]);

  // ==================== FILTRADO DE CRÉDITOS ====================
  const filteredCredits = useMemo(() => {
    let result = credits ?? [];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.customerName.toLowerCase().includes(searchLower) ||
        c.phone.includes(searchTerm) ||
        c.products.some(p => p.name.toLowerCase().includes(searchLower))
      );
    }

    if (filterStatus === 'pending') {
      result = result.filter(c => c.status === 'Pendiente');
    } else if (filterStatus === 'paid') {
      result = result.filter(c => c.status === 'Pagado');
    } else if (filterStatus === 'overdue') {
      const now = new Date();
      result = result.filter(c => {
        const dueDate = new Date(c.dueDate);
        return c.status === 'Pendiente' && dueDate < now;
      });
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [credits, searchTerm, filterStatus]);

  const getStatusInfo = (credit) => {
    const now = new Date();
    const dueDate = new Date(credit.dueDate);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (credit.status === 'Pagado') {
      return { 
        label: 'PAGADO', 
        color: 'green', 
        icon: CheckCircle, 
        badge: 'bg-green-100 text-green-800'
      };
    }
    
    if (diffDays < 0) {
      return { 
        label: `VENCIDO (${Math.abs(diffDays)} días)`, 
        color: 'red', 
        icon: XCircle, 
        badge: 'bg-red-100 text-red-800'
      };
    } else if (diffDays <= 7) {
      return { 
        label: `PRÓXIMO (${diffDays} días)`, 
        color: 'yellow', 
        icon: AlertTriangle, 
        badge: 'bg-yellow-100 text-yellow-800'
      };
    } else {
      return { 
        label: `AL DÍA (${diffDays} días)`, 
        color: 'blue', 
        icon: Clock, 
        badge: 'bg-blue-100 text-blue-800'
      };
    }
  };

  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    if (amount > selectedCredit.amountDue) {
      alert('El monto no puede ser mayor a la deuda');
      return;
    }

    addPaymentToCredit(selectedCredit.id, amount, paymentNotes);
    alert('✅ Pago registrado exitosamente');
    
    setPaymentAmount('');
    setPaymentNotes('');
    setShowPaymentModal(false);
    setSelectedCredit(null);
  };

  const sendWhatsAppReminder = (credit) => {
    const message = `Hola ${credit.customerName}, te recordamos que tienes un saldo pendiente de $${credit.amountDue.toFixed(0)} que vence el ${credit.dueDate}. ¡Gracias por tu preferencia!`;
    const whatsappUrl = `https://wa.me/${credit.phone.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const callClient = (phone) => {
    window.open(`tel:${phone}`);
  };

  const handleDeleteSale = (id) => {
    if (window.confirm('¿Eliminar esta venta? Esta acción no se puede deshacer.')) {
      deleteSale(id);
    }
  };

  // Función para formatear la duración del turno
  const formatShiftDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 ${
                activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingCart size={20} />
              Historial de Ventas
            </button>
            <button
              onClick={() => setActiveTab('credits')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 ${
                activeTab === 'credits' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CreditCard size={20} />
              Créditos/Fiados
              {creditMetrics.overdueCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {creditMetrics.overdueCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 ${
                activeTab === 'analysis' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp size={20} />
              Análisis
            </button>
          </nav>
        </div>
      </div>

      {/* TAB 1: HISTORIAL DE VENTAS */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90 mb-1">Total Ventas</p>
              <p className="text-3xl font-bold">${salesMetrics.totalSales.toLocaleString()}</p>
              <p className="text-xs opacity-75 mt-1">{salesMetrics.count} ventas</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90 mb-1">Promedio por Venta</p>
              <p className="text-3xl font-bold">${salesMetrics.avgSale.toFixed(0)}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90 mb-1">Descuentos Aplicados</p>
              <p className="text-3xl font-bold">${salesMetrics.totalDiscount.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90 mb-1">Efectivo Recibido</p>
              <p className="text-3xl font-bold">${salesMetrics.byMethod['Efectivo'].toLocaleString()}</p>
            </div>
          </div>

          {/* KPIs de Paid In/Out */}
          {(filteredPaidMetrics.countPaidIn > 0 || filteredPaidMetrics.countPaidOut > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-100 to-green-100 border-2 border-green-300 rounded-lg shadow p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 p-3 rounded-full">
                    <ArrowDownCircle size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-semibold">Entradas de Efectivo (Paid In)</p>
                    <p className="text-2xl font-bold text-green-800">${filteredPaidMetrics.totalPaidIn.toLocaleString()}</p>
                    <p className="text-xs text-green-600">{filteredPaidMetrics.countPaidIn} movimiento(s)</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-100 to-orange-100 border-2 border-red-300 rounded-lg shadow p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500 p-3 rounded-full">
                    <ArrowUpCircle size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-red-700 font-semibold">Salidas de Efectivo (Paid Out)</p>
                    <p className="text-2xl font-bold text-red-800">${filteredPaidMetrics.totalPaidOut.toLocaleString()}</p>
                    <p className="text-xs text-red-600">{filteredPaidMetrics.countPaidOut} movimiento(s)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por producto, método de pago o descripción..."
                  className="w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={salesSearchTerm}
                  onChange={(e) => setSalesSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border-2 rounded-lg font-semibold"
                value={salesFilter}
                onChange={(e) => setSalesFilter(e.target.value)}
              >
                <option value="all">Todos los períodos</option>
                <option value="today">Hoy</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
              </select>
              <select
                className="px-4 py-2 border-2 rounded-lg font-semibold"
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
              >
                <option value="all">Todos los métodos</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Fiado">Fiado</option>
              </select>
            </div>
          </div>

          {/* Lista de ventas con separadores de turno y Paid In/Out */}
          {filteredSalesWithSeparators.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Fecha y Hora</th>
                      <th className="text-left py-3 px-4 font-semibold">Productos / Descripción</th>
                      <th className="text-left py-3 px-4 font-semibold">Subtotal</th>
                      <th className="text-left py-3 px-4 font-semibold">Descuento</th>
                      <th className="text-left py-3 px-4 font-semibold">Total</th>
                      <th className="text-left py-3 px-4 font-semibold">Método / Tipo</th>
                      <th className="text-right py-3 px-4 font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSalesWithSeparators.map((item, index) => {
                      // ========== SEPARADOR DE TURNO ==========
                      if (item.type === 'shift_separator') {
                        const shift = item.data;
                        return (
                          <tr key={`shift-${shift.endTime}-${index}`} className="bg-gradient-to-r from-blue-600 to-purple-600">
                            <td colSpan="7" className="py-4 px-4">
                              <div className="flex items-center justify-between text-white">
                                <div className="flex items-center gap-4">
                                  {/* Avatar del usuario */}
                                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <User size={24} className="text-white" />
                                  </div>
                                  
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg font-bold">🔒 Cierre de Turno</span>
                                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                                        {shift.userName || 'Usuario'}
                                      </span>
                                    </div>
                                    <p className="text-sm opacity-90 mt-1">
                                      {new Date(shift.endTime).toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex gap-6 text-center">
                                  <div>
                                    <p className="text-2xl font-bold">{shift.transactions || 0}</p>
                                    <p className="text-xs opacity-75">Ventas</p>
                                  </div>
                                  <div>
                                    <p className="text-2xl font-bold">${(shift.totalSales || 0).toLocaleString()}</p>
                                    <p className="text-xs opacity-75">Total</p>
                                  </div>
                                  <div>
                                    <p className="text-2xl font-bold">{formatShiftDuration(shift.duration || 0)}</p>
                                    <p className="text-xs opacity-75">Duración</p>
                                  </div>
                                  <div>
                                    <p className="text-2xl font-bold">{shift.productsSold || 0}</p>
                                    <p className="text-xs opacity-75">Productos</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Línea divisoria con texto */}
                              <div className="flex items-center mt-3">
                                <div className="flex-1 border-t border-white/30"></div>
                                <span className="px-4 text-xs text-white/70">
                                  ↑ Ventas del turno de {shift.userName || 'Usuario'} ↑
                                </span>
                                <div className="flex-1 border-t border-white/30"></div>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      // ========== PAID IN (Entrada de Efectivo) ==========
                      if (item.type === 'paid_in') {
                        const paidIn = item.data;
                        return (
                          <tr key={`paidin-${paidIn.id}-${index}`} className="bg-green-50 border-b border-green-200 hover:bg-green-100">
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                <p className="font-semibold text-green-800">{paidIn.date}</p>
                                <p className="text-green-600">{paidIn.time}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <ArrowDownCircle size={20} className="text-green-600" />
                                <div>
                                  <p className="font-semibold text-green-800">{paidIn.description}</p>
                                  <p className="text-xs text-green-600">Categoría: {paidIn.category}</p>
                                  {paidIn.authorizedBy && (
                                    <p className="text-xs text-green-500">🔐 Autorizado por: {paidIn.authorizedBy}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-green-600">-</td>
                            <td className="py-3 px-4 text-green-600">-</td>
                            <td className="py-3 px-4 font-bold text-green-700 text-lg">
                              +${paidIn.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-200 text-green-800 flex items-center gap-1 w-fit">
                                <ArrowDownCircle size={14} />
                                ENTRADA
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="text-xs text-green-600">
                                {paidIn.shiftUserName && `Turno: ${paidIn.shiftUserName}`}
                              </span>
                            </td>
                          </tr>
                        );
                      }

                      // ========== PAID OUT (Salida de Efectivo) ==========
                      if (item.type === 'paid_out') {
                        const paidOut = item.data;
                        return (
                          <tr key={`paidout-${paidOut.id}-${index}`} className="bg-red-50 border-b border-red-200 hover:bg-red-100">
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                <p className="font-semibold text-red-800">{paidOut.date}</p>
                                <p className="text-red-600">{paidOut.time}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <ArrowUpCircle size={20} className="text-red-600" />
                                <div>
                                  <p className="font-semibold text-red-800">{paidOut.description}</p>
                                  <p className="text-xs text-red-600">Categoría: {paidOut.category}</p>
                                  {paidOut.authorizedBy && (
                                    <p className="text-xs text-red-500">🔐 Autorizado por: {paidOut.authorizedBy}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-red-600">-</td>
                            <td className="py-3 px-4 text-red-600">-</td>
                            <td className="py-3 px-4 font-bold text-red-700 text-lg">
                              -${paidOut.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-200 text-red-800 flex items-center gap-1 w-fit">
                                <ArrowUpCircle size={14} />
                                SALIDA
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="text-xs text-red-600">
                                {paidOut.shiftUserName && `Turno: ${paidOut.shiftUserName}`}
                              </span>
                            </td>
                          </tr>
                        );
                      }
                      
                      // ========== VENTA NORMAL ==========
                      const sale = item.data;
                      return (
                        <tr key={sale.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <p className="font-semibold">{sale.date}</p>
                              <p className="text-gray-600">{sale.time}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {sale.products.map((p, i) => (
                              <div key={i} className="text-sm">
                                {p.name} x{p.quantity}
                              </div>
                            ))}
                          </td>
                          <td className="py-3 px-4">${sale.subtotal.toFixed(0)}</td>
                          <td className="py-3 px-4 text-orange-600">
                            {sale.discount > 0 ? `-$${sale.discount.toFixed(0)}` : '-'}
                          </td>
                          <td className="py-3 px-4 font-bold text-green-600 text-lg">
                            ${sale.total.toFixed(0)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              sale.paymentMethod === 'Efectivo' ? 'bg-green-100 text-green-800' :
                              sale.paymentMethod === 'Tarjeta' ? 'bg-blue-100 text-blue-800' :
                              sale.paymentMethod === 'Transferencia' ? 'bg-purple-100 text-purple-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {sale.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteSale(sale.id)}
                              className="text-red-600 hover:bg-red-100 p-2 rounded-lg"
                              title="Eliminar venta"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <ShoppingCart size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No se encontraron ventas</p>
              <p className="text-gray-400 text-sm mt-2">
                {salesSearchTerm || salesFilter !== 'all' || paymentMethodFilter !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Las ventas aparecerán aquí cuando realices transacciones desde el POS'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CRÉDITOS/FIADOS */}
      {activeTab === 'credits' && (
        <div className="space-y-6">
          {/* KPIs de créditos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90 mb-1">Total Pendiente</p>
              <p className="text-3xl font-bold">${creditMetrics.totalPending.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90 mb-1">Clientes Activos</p>
              <p className="text-3xl font-bold">{creditMetrics.activeClients}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90 mb-1">Por Vencer (7 días)</p>
              <p className="text-3xl font-bold">{creditMetrics.dueSoonCount}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90 mb-1">Vencidos</p>
              <p className="text-3xl font-bold">{creditMetrics.overdueCount}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, teléfono o producto..."
                  className="w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border-2 rounded-lg font-semibold"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="paid">Pagados</option>
                <option value="overdue">Vencidos</option>
              </select>
            </div>
          </div>

          {/* Lista de créditos */}
          {filteredCredits.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredCredits.map(credit => {
                const statusInfo = getStatusInfo(credit);
                const StatusIcon = statusInfo.icon;
                const progress = (credit.amountPaid / credit.total) * 100;

                return (
                  <div key={credit.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{credit.customerName}</h3>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <Phone size={14} /> {credit.phone}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusInfo.badge}`}>
                        <StatusIcon size={14} className="inline mr-1" />
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Barra de progreso */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Pagado: ${credit.amountPaid.toFixed(0)}</span>
                        <span>Total: ${credit.total.toFixed(0)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600">Saldo pendiente</p>
                      <p className="text-3xl font-bold text-red-600">${credit.amountDue.toFixed(0)}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedCredit(credit);
                          setShowPaymentModal(true);
                        }}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold text-sm flex items-center justify-center gap-1"
                      >
                        <DollarSign size={16} /> Pagar
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCredit(credit);
                          setShowDetailModal(true);
                        }}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold text-sm flex items-center justify-center gap-1"
                      >
                        <FileText size={16} /> Detalle
                      </button>
                      <button
                        onClick={() => sendWhatsAppReminder(credit)}
                        className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600"
                        title="Enviar recordatorio por WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        onClick={() => callClient(credit.phone)}
                        className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600"
                        title="Llamar al cliente"
                      >
                        <Phone size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <CreditCard size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No hay créditos registrados</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ANÁLISIS */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Gráficos de ventas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ventas por Método de Pago */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">💳 Ventas por Método de Pago</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(salesMetrics.byMethod)
                      .filter(([_, v]) => v > 0)
                      .map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(salesMetrics.byMethod).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Resumen de métodos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">📊 Desglose por Método</h3>
              <div className="space-y-4">
                {Object.entries(salesMetrics.byMethod).map(([method, amount], index) => (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-semibold">{method}</span>
                    </div>
                    <span className="font-bold">${amount.toLocaleString()}</span>
                  </div>
                ))}
                <hr />
                <div className="flex items-center justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-green-600">${salesMetrics.totalSales.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago */}
      {showPaymentModal && selectedCredit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-2xl font-bold">Registrar Pago</h3>
              <button onClick={() => setShowPaymentModal(false)} className="hover:bg-white/20 p-2 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-600">Cliente</p>
                <p className="text-xl font-bold">{selectedCredit.customerName}</p>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Deuda actual</p>
                <p className="text-3xl font-bold text-red-600">${selectedCredit.amountDue.toFixed(0)}</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Monto a pagar *</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 text-lg">$</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    max={selectedCredit.amountDue}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Notas (opcional)</label>
                <textarea
                  className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Ej: Pago en efectivo, abono parcial..."
                />
              </div>

              {paymentAmount && parseFloat(paymentAmount) > 0 && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Nuevo saldo</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(selectedCredit.amountDue - parseFloat(paymentAmount)).toFixed(0)}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold"
                >
                  Registrar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedCredit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-2xl font-bold">Estado de Cuenta - {selectedCredit.customerName}</h3>
              <button onClick={() => setShowDetailModal(false)} className="hover:bg-white/20 p-2 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Información del cliente */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="text-lg font-bold">{selectedCredit.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="text-lg font-bold">{selectedCredit.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de crédito</p>
                  <p className="text-lg font-bold">{selectedCredit.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vencimiento</p>
                  <p className="text-lg font-bold">{selectedCredit.dueDate}</p>
                </div>
              </div>

              {/* Resumen financiero */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-600">${selectedCredit.total.toFixed(0)}</p>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Pagado</p>
                  <p className="text-2xl font-bold text-green-600">${selectedCredit.amountPaid.toFixed(0)}</p>
                </div>
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Pendiente</p>
                  <p className="text-2xl font-bold text-red-600">${selectedCredit.amountDue.toFixed(0)}</p>
                </div>
              </div>

              {/* Productos */}
              <div>
                <h4 className="font-bold text-lg mb-3">Productos del crédito</h4>
                <div className="bg-gray-50 rounded-lg border-2 p-4 space-y-2">
                  {selectedCredit.products.map((product, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{product.name} x{product.quantity}</span>
                      <span className="font-bold">${product.subtotal.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historial de pagos */}
              <div>
                <h4 className="font-bold text-lg mb-3">Historial de Pagos ({selectedCredit.payments?.length || 0})</h4>
                {selectedCredit.payments && selectedCredit.payments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCredit.payments.map((payment, index) => (
                      <div key={payment.id} className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-green-700">Pago #{index + 1}</p>
                          <p className="text-sm text-gray-600">{payment.date} - {payment.time}</p>
                          {payment.notes && <p className="text-sm text-gray-500 italic">{payment.notes}</p>}
                        </div>
                        <p className="text-2xl font-bold text-green-600">${payment.amount.toFixed(0)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg border-2 border-dashed p-8 text-center text-gray-400">
                    <DollarSign size={48} className="mx-auto mb-2 opacity-30" />
                    <p>No hay pagos registrados</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-bold"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => alert('📄 Función de imprimir en desarrollo')}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold flex items-center justify-center gap-2"
                >
                  <FileText size={20} />
                  Imprimir Estado de Cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};