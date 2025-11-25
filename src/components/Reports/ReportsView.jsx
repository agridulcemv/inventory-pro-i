import React, { useState, useMemo } from 'react';
import { exportToPDF, exportToExcel } from '../../utils/ExportUtils';
import { Download, TrendingUp, TrendingDown, Calendar as CalendarIcon, BarChart3, Package, AlertTriangle, FileText, CheckCircle, Users, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ReportsView = () => {
  const { sales, products, expenses, creditPayments, createOrderFromProduct, config, currentShift } = useInventory();
  const [activeTab, setActiveTab] = useState('resumen');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [periodFilter, setPeriodFilter] = useState('today');
  const [reportType, setReportType] = useState('general');

  // Obtener historial de turnos
  const shiftHistory = config?.shiftHistory || [];

  // Filtrar ventas según período
  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      switch(periodFilter) {
        case 'today':
          return sale.date === new Date().toISOString().split('T')[0];
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return saleDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return saleDate >= monthAgo;
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          return saleDate >= quarterAgo;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return saleDate >= yearAgo;
        default:
          return true;
      }
    });
  }, [sales, periodFilter]);

  // Filtrar ventas del día seleccionado
  const dailySales = useMemo(() => {
    return sales.filter(sale => sale.date === selectedDate);
  }, [sales, selectedDate]);

  // Calcular día anterior para comparativa
  const previousDate = useMemo(() => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    return prev.toISOString().split('T')[0];
  }, [selectedDate]);

  const previousSales = useMemo(() => {
    return sales.filter(sale => sale.date === previousDate);
  }, [sales, previousDate]);

  const previousExpenses = useMemo(() => {
    return expenses.filter(expense => expense.date === previousDate);
  }, [expenses, previousDate]);

  // ==================== OBTENER PAID IN/OUT DEL DÍA ====================
  const dailyPaidInOut = useMemo(() => {
    const paidIns = [];
    const paidOuts = [];

    // Del turno actual
    if (currentShift) {
      if (currentShift.paidIns) {
        currentShift.paidIns.forEach(pi => {
          if (pi.date === selectedDate) {
            paidIns.push({ ...pi, shiftUserName: currentShift.userName });
          }
        });
      }
      if (currentShift.paidOuts) {
        currentShift.paidOuts.forEach(po => {
          if (po.date === selectedDate) {
            paidOuts.push({ ...po, shiftUserName: currentShift.userName });
          }
        });
      }
    }

    // Del historial de turnos
    shiftHistory.forEach(shift => {
      if (shift.paidIns) {
        shift.paidIns.forEach(pi => {
          if (pi.date === selectedDate) {
            paidIns.push({ ...pi, shiftUserName: shift.userName });
          }
        });
      }
      if (shift.paidOuts) {
        shift.paidOuts.forEach(po => {
          if (po.date === selectedDate) {
            paidOuts.push({ ...po, shiftUserName: shift.userName });
          }
        });
      }
    });

    const totalPaidIn = paidIns.reduce((sum, pi) => sum + pi.amount, 0);
    const totalPaidOut = paidOuts.reduce((sum, po) => sum + po.amount, 0);

    return {
      paidIns,
      paidOuts,
      totalPaidIn,
      totalPaidOut,
      countPaidIn: paidIns.length,
      countPaidOut: paidOuts.length
    };
  }, [currentShift, shiftHistory, selectedDate]);

  // Métricas del día
  const dailyMetrics = useMemo(() => {
    const salesByMethod = {
      'Efectivo': 0,
      'Tarjeta': 0,
      'Transferencia': 0,
      'Crédito (Fiado)': 0
    };

    dailySales.forEach(sale => {
      const method = sale.paymentMethod === 'Fiado' ? 'Crédito (Fiado)' : sale.paymentMethod;
      salesByMethod[method] = (salesByMethod[method] || 0) + sale.total;
    });

    // GASTOS REALES del día seleccionado
    const dailyExpenses = expenses.filter(e => e.date === selectedDate);
    
    const gastosByMethod = {
      'Efectivo': 0,
      'Tarjeta': 0,
      'Transferencia': 0
    };

    const gastosByCategory = {};

    dailyExpenses.forEach(expense => {
      gastosByMethod[expense.paymentMethod] = (gastosByMethod[expense.paymentMethod] || 0) + expense.amount;
      gastosByCategory[expense.category] = (gastosByCategory[expense.category] || 0) + expense.amount;
    });

    const totalVentas = Object.values(salesByMethod).reduce((sum, val) => sum + val, 0);
    const totalGastos = Object.values(gastosByMethod).reduce((sum, val) => sum + val, 0);
    const ventasEfectivo = salesByMethod['Efectivo'];
    const gastosEfectivo = gastosByMethod['Efectivo'];
    
    // ABONOS REALES de clientes del día
    const dailyPayments = creditPayments.filter(p => p.date === selectedDate);
    const abonosClientes = dailyPayments
      .filter(p => p.paymentMethod === 'Efectivo')
      .reduce((sum, p) => sum + p.amount, 0);
    
    // SALDO ESPERADO ahora incluye Paid In y Paid Out
    const saldoEsperado = ventasEfectivo + abonosClientes + dailyPaidInOut.totalPaidIn - gastosEfectivo - dailyPaidInOut.totalPaidOut;

    // COMPARATIVAS CON DÍA ANTERIOR
    const prevTotalVentas = previousSales.reduce((sum, s) => sum + s.total, 0);
    const prevTotalGastos = previousExpenses.reduce((sum, e) => sum + e.amount, 0);
    const prevBalance = prevTotalVentas - prevTotalGastos;

    const ventasChange = prevTotalVentas > 0 ? ((totalVentas - prevTotalVentas) / prevTotalVentas * 100) : 0;
    const gastosChange = prevTotalGastos > 0 ? ((totalGastos - prevTotalGastos) / prevTotalGastos * 100) : 0;
    const balanceChange = prevBalance > 0 ? ((totalVentas - totalGastos - prevBalance) / prevBalance * 100) : 0;

    return {
      salesByMethod,
      totalVentas,
      gastosByMethod,
      gastosByCategory,
      totalGastos,
      balance: totalVentas - totalGastos,
      ventasEfectivo,
      abonosClientes,
      gastosEfectivo,
      saldoEsperado,
      ventasChange,
      gastosChange,
      balanceChange,
      dailyExpenses,
      dailyPayments
    };
  }, [dailySales, expenses, creditPayments, selectedDate, previousSales, previousExpenses, dailyPaidInOut]);

  // Datos para gráfico de flujo de efectivo por hora
  const hourlyData = useMemo(() => {
    return Array.from({ length: 24 }, (_, hour) => {
      const hourStr = hour.toString().padStart(2, '0');
      
      const hourSales = dailySales.filter(sale => {
        const saleHour = new Date(sale.date + 'T' + sale.time).getHours();
        return saleHour === hour;
      }).reduce((sum, s) => sum + s.total, 0);

      const hourExpenses = dailyMetrics.dailyExpenses.filter(expense => {
        const expenseHour = parseInt(expense.time.split(':')[0]);
        return expenseHour === hour;
      }).reduce((sum, e) => sum + e.amount, 0);

      // Agregar Paid In/Out por hora
      const hourPaidIn = dailyPaidInOut.paidIns.filter(pi => {
        const piHour = parseInt(pi.time.split(':')[0]);
        return piHour === hour;
      }).reduce((sum, pi) => sum + pi.amount, 0);

      const hourPaidOut = dailyPaidInOut.paidOuts.filter(po => {
        const poHour = parseInt(po.time.split(':')[0]);
        return poHour === hour;
      }).reduce((sum, po) => sum + po.amount, 0);

      return {
        hora: `${hourStr}:00`,
        ingresos: hourSales + hourPaidIn,
        gastos: hourExpenses + hourPaidOut
      };
    }).filter(h => h.ingresos > 0 || h.gastos > 0);
  }, [dailySales, dailyMetrics.dailyExpenses, dailyPaidInOut]);

  // Análisis de productos (para Tab 2)
  const productAnalysis = useMemo(() => {
    const productSales = {};
    filteredSales.forEach(sale => {
      if (sale.products && Array.isArray(sale.products)) {
        sale.products.forEach(product => {
          if (!productSales[product.name]) {
            const prod = products.find(p => p.name === product.name);
            productSales[product.name] = {
              name: product.name,
              quantity: 0,
              revenue: 0,
              cost: prod ? prod.cost : 0,
              category: prod ? prod.category : 'Sin categoría'
            };
          }
          productSales[product.name].quantity += product.quantity;
          productSales[product.name].revenue += product.subtotal;
        });
      }
    });

    Object.values(productSales).forEach(p => {
      p.profit = p.revenue - (p.cost * p.quantity);
      p.margin = p.revenue > 0 ? ((p.profit / p.revenue) * 100) : 0;
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    const categoryData = {};
    Object.values(productSales).forEach(p => {
      if (!categoryData[p.category]) {
        categoryData[p.category] = { category: p.category, revenue: 0, quantity: 0 };
      }
      categoryData[p.category].revenue += p.revenue;
      categoryData[p.category].quantity += p.quantity;
    });

    return {
      topProducts,
      categoryData: Object.values(categoryData).sort((a, b) => b.revenue - a.revenue)
    };
  }, [filteredSales, products]);

  // Productos con stock bajo
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock <= p.minStock).sort((a, b) => a.stock - b.stock);
  }, [products]);

  // Métricas de inventario
  const inventoryMetrics = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const totalCost = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
    const avgMargin = totalValue > 0 ? (((totalValue - totalCost) / totalValue) * 100) : 0;
    const lastUpdate = products.length > 0 ? 
      products.reduce((latest, p) => p.lastUpdate > latest ? p.lastUpdate : latest, products[0].lastUpdate) 
      : 'N/A';

    return { totalProducts, totalValue, totalCost, avgMargin, lastUpdate };
  }, [products]);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

  const periodLabels = {
    'today': 'Hoy',
    'week': 'Última Semana',
    'month': 'Último Mes',
    'quarter': 'Último Trimestre',
    'year': 'Último Año'
  };

  const handleMakeOrder = (product) => {
    const quantityNeeded = Math.max(product.minStock - product.stock + 10, 10);
    
    if (window.confirm(
      `Crear orden de compra para "${product.name}"?\n\n` +
      `Proveedor: ${product.supplier}\n` +
      `Cantidad sugerida: ${quantityNeeded} unidades\n` +
      `Costo estimado: $${(product.cost * quantityNeeded).toFixed(0)}`
    )) {
      const order = createOrderFromProduct(product, quantityNeeded);
      alert(`Orden #${order.id} creada exitosamente!\n\nPuedes verla en "Órdenes y Gastos"`);
    }
  };

  const handleExportPDF = () => {
    alert('Exportación a PDF en desarrollo');
  };

  const handleExportExcel = () => {
    alert('Exportación a Excel en desarrollo');
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('resumen')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'resumen' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon size={20} />
              Resumen del Día
            </button>
            <button
              onClick={() => setActiveTab('ventas-inventario')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'ventas-inventario' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 size={20} />
              Ventas e Inventario
            </button>
            <button
              onClick={() => setActiveTab('generador')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'generador' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={20} />
              Generador de Reportes
            </button>
          </nav>
        </div>
      </div>

      {/* TAB 1: RESUMEN DEL DÍA - MEJORADO */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Selector de fecha */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seleccionar fecha:
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <button 
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                Hoy
              </button>
            </div>
          </div>

          {/* Comparativa con día anterior */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ventas vs. Ayer</p>
                  <p className="text-2xl font-bold">${dailyMetrics.totalVentas.toLocaleString()}</p>
                </div>
                <div className={`flex items-center gap-1 ${dailyMetrics.ventasChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {dailyMetrics.ventasChange >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                  <span className="font-bold">{Math.abs(dailyMetrics.ventasChange).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Gastos vs. Ayer</p>
                  <p className="text-2xl font-bold">${dailyMetrics.totalGastos.toLocaleString()}</p>
                </div>
                <div className={`flex items-center gap-1 ${dailyMetrics.gastosChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {dailyMetrics.gastosChange <= 0 ? <TrendingDown size={24} /> : <TrendingUp size={24} />}
                  <span className="font-bold">{Math.abs(dailyMetrics.gastosChange).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Balance vs. Ayer</p>
                  <p className="text-2xl font-bold">${dailyMetrics.balance.toLocaleString()}</p>
                </div>
                <div className={`flex items-center gap-1 ${dailyMetrics.balanceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {dailyMetrics.balanceChange >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                  <span className="font-bold">{Math.abs(dailyMetrics.balanceChange).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tres columnas principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* COLUMNA 1: VENTAS */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-2 border-green-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                Ventas
              </h3>
              
              <div className="space-y-3">
                {Object.entries(dailyMetrics.salesByMethod).map(([method, amount]) => (
                  <div key={method} className="bg-white rounded-lg p-3 flex justify-between items-center">
                    <span className="font-semibold">{method}</span>
                    <span className="font-bold text-green-600">
                      ${amount.toLocaleString()}
                    </span>
                  </div>
                ))}

                <div className="bg-green-600 text-white rounded-lg p-4 mt-4">
                  <p className="text-sm opacity-90">Total Ventas</p>
                  <p className="text-2xl font-bold">${dailyMetrics.totalVentas.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* COLUMNA 2: GASTOS */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-red-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-700">
                <TrendingDown size={24} />
                Gastos
              </h3>
              
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-gray-600 text-sm mb-2">Total del día</p>
                <p className="text-3xl font-bold text-red-600">${dailyMetrics.totalGastos.toLocaleString()}</p>
              </div>

              <div className="bg-red-600 text-white rounded-lg p-4">
                <p className="text-sm opacity-90">Cantidad de gastos</p>
                <p className="text-2xl font-bold">{dailyMetrics.dailyExpenses.length}</p>
              </div>
              
              <p className="text-xs text-gray-500 mt-3 text-center">💡 Se integra con "Órdenes y Gastos"</p>
            </div>

            {/* COLUMNA 3: BALANCE */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-700">
                <TrendingUp size={24} />
                Balance
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-600 text-sm mb-1">Balance del día</p>
                  <p className={`text-3xl font-bold ${dailyMetrics.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${dailyMetrics.balance.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">(Ventas - Gastos)</p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-600 text-sm mb-1">Saldo esperado en caja</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${dailyMetrics.saldoEsperado.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">(Efectivo + Abonos + Entradas - Gastos - Salidas)</p>
                </div>

                <div className="bg-blue-600 text-white rounded-lg p-4">
                  <p className="text-sm opacity-90">Abonos recibidos</p>
                  <p className="text-2xl font-bold">${dailyMetrics.abonosClientes.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 🆕 SECCIÓN DE MOVIMIENTOS DE CAJA (PAID IN/OUT) */}
          {(dailyPaidInOut.countPaidIn > 0 || dailyPaidInOut.countPaidOut > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Entradas de Efectivo (Paid In) */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-green-200">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <ArrowDownCircle size={24} />
                    Entradas de Efectivo (Paid In)
                  </h3>
                  <p className="text-sm opacity-90 mt-1">
                    Total: ${dailyPaidInOut.totalPaidIn.toLocaleString()} • {dailyPaidInOut.countPaidIn} movimiento(s)
                  </p>
                </div>
                {dailyPaidInOut.paidIns.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-green-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Hora</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Descripción</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Autorizado</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-green-800">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-green-100">
                        {dailyPaidInOut.paidIns.map((paidIn, index) => (
                          <tr key={index} className="hover:bg-green-50">
                            <td className="px-4 py-3 text-sm">{paidIn.time}</td>
                            <td className="px-4 py-3 text-sm">
                              <p className="font-semibold">{paidIn.description}</p>
                              <p className="text-xs text-gray-500">{paidIn.category}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {paidIn.authorizedBy || 'Admin'}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-green-600">
                              +${paidIn.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-green-100 font-bold">
                          <td colSpan="3" className="px-4 py-3 text-right text-green-800">Total Entradas:</td>
                          <td className="px-4 py-3 text-right text-green-700">
                            +${dailyPaidInOut.totalPaidIn.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <ArrowDownCircle size={48} className="mx-auto mb-3 opacity-30" />
                    <p>No hay entradas de efectivo para este día</p>
                  </div>
                )}
              </div>

              {/* Salidas de Efectivo (Paid Out) */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-red-200">
                <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <ArrowUpCircle size={24} />
                    Salidas de Efectivo (Paid Out)
                  </h3>
                  <p className="text-sm opacity-90 mt-1">
                    Total: ${dailyPaidInOut.totalPaidOut.toLocaleString()} • {dailyPaidInOut.countPaidOut} movimiento(s)
                  </p>
                </div>
                {dailyPaidInOut.paidOuts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-red-800">Hora</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-red-800">Descripción</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-red-800">Autorizado</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-red-800">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100">
                        {dailyPaidInOut.paidOuts.map((paidOut, index) => (
                          <tr key={index} className="hover:bg-red-50">
                            <td className="px-4 py-3 text-sm">{paidOut.time}</td>
                            <td className="px-4 py-3 text-sm">
                              <p className="font-semibold">{paidOut.description}</p>
                              <p className="text-xs text-gray-500">{paidOut.category}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {paidOut.authorizedBy || 'Admin'}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-red-600">
                              -${paidOut.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-red-100 font-bold">
                          <td colSpan="3" className="px-4 py-3 text-right text-red-800">Total Salidas:</td>
                          <td className="px-4 py-3 text-right text-red-700">
                            -${dailyPaidInOut.totalPaidOut.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <ArrowUpCircle size={48} className="mx-auto mb-3 opacity-30" />
                    <p>No hay salidas de efectivo para este día</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resumen Paid In/Out si no hay movimientos */}
          {dailyPaidInOut.countPaidIn === 0 && dailyPaidInOut.countPaidOut === 0 && (
            <div className="bg-gray-50 rounded-xl shadow p-6 border-2 border-dashed border-gray-300">
              <div className="flex items-center justify-center gap-4 text-gray-400">
                <ArrowDownCircle size={32} />
                <ArrowUpCircle size={32} />
                <p className="text-lg">No hay movimientos de caja (Paid In/Out) para este día</p>
              </div>
            </div>
          )}

          {/* Gráfico de Flujo de Efectivo */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={24} />
              Flujo de Efectivo del Día (por hora)
            </h3>
            {hourlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hora" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Bar dataKey="ingresos" fill="#10b981" name="Ingresos ($)" />
                  <Bar dataKey="gastos" fill="#ef4444" name="Gastos ($)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp size={48} className="mx-auto mb-3 opacity-30" />
                  <p>No hay actividad para mostrar en el día seleccionado</p>
                </div>
              </div>
            )}
          </div>

          {/* Historial de Gastos del Día */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingDown className="text-red-600" size={24} />
              Historial de Gastos del Día
            </h3>
            {dailyMetrics.dailyExpenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hora</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descripción</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dailyMetrics.dailyExpenses.map((expense, index) => (
                      <tr key={index} className={`hover:bg-gray-50 ${expense.isPaidOut ? 'bg-orange-50' : ''}`}>
                        <td className="px-4 py-3 text-sm">{expense.time}</td>
                        <td className="px-4 py-3 text-sm">{expense.description}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {expense.isPaidOut ? (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                              <ArrowUpCircle size={12} /> Paid Out
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              Gasto Normal
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                          ${expense.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-red-50 font-bold">
                      <td colSpan="4" className="px-4 py-3 text-right">Total Gastos:</td>
                      <td className="px-4 py-3 text-right text-red-600">
                        ${dailyMetrics.totalGastos.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <TrendingDown size={48} className="mx-auto mb-3 opacity-30" />
                <p>No hay gastos registrados para este día</p>
              </div>
            )}
          </div>

          {/* Historial de Abonos del Día */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="text-green-600" size={24} />
              Historial de Abonos del Día
            </h3>
            {dailyMetrics.dailyPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hora</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Método</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dailyMetrics.dailyPayments.map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{payment.time || '00:00'}</td>
                        <td className="px-4 py-3 text-sm font-semibold">{payment.customerName}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-blue-100 rounded-full text-xs">
                            {payment.paymentMethod || 'Efectivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                          ${payment.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-green-50 font-bold">
                      <td colSpan="3" className="px-4 py-3 text-right">Total Abonos:</td>
                      <td className="px-4 py-3 text-right text-green-600">
                        ${dailyMetrics.abonosClientes.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Users size={48} className="mx-auto mb-3 opacity-30" />
                <p>No hay abonos registrados para este día</p>
              </div>
            )}
          </div>

          {/* Tabla de detalle de ventas */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Detalle de Ventas del Día</h3>
            {dailySales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hora</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Productos</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Método</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dailySales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{sale.time}</td>
                        <td className="px-4 py-3 text-sm">
                          {sale.products && Array.isArray(sale.products)
                            ? sale.products.map(item => `${item.name} (x${item.quantity})`).join(', ')
                            : 'Sin productos'
                          }
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-blue-100 rounded-full text-xs capitalize">
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">
                          ${sale.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mx-auto mb-3 opacity-30" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                <p>No hay ventas registradas para este día</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VENTAS E INVENTARIO */}
      {activeTab === 'ventas-inventario' && (
        <div className="space-y-6">
          {/* Filtro de período y exportación */}
          <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
            <select
              className="px-4 py-2 border-2 rounded-lg font-semibold"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              <option value="today">Hoy</option>
              <option value="week">Última Semana</option>
              <option value="month">Último Mes</option>
              <option value="quarter">Último Trimestre (90 días)</option>
              <option value="year">Último Año</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleExportPDF} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2">
                <Download size={18} /> PDF
              </button>
              <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Download size={18} /> Excel
              </button>
            </div>
          </div>

          {/* === SECCIÓN INVENTARIO === */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Package size={32} />
              Análisis de Inventario
            </h2>
          </div>

          {/* KPIs de Inventario */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90 mb-1">Total Productos</p>
              <p className="text-3xl font-bold">{inventoryMetrics.totalProducts}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90 mb-1">Valor Inventario</p>
              <p className="text-3xl font-bold">${inventoryMetrics.totalValue.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90 mb-1">Margen Promedio</p>
              <p className="text-3xl font-bold">{inventoryMetrics.avgMargin.toFixed(1)}%</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90 mb-1">Última Actualización</p>
              <p className="text-lg font-bold">{inventoryMetrics.lastUpdate}</p>
            </div>
          </div>

          {/* Stock Bajo */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b bg-red-50">
              <h3 className="text-xl font-bold flex items-center gap-2 text-red-700">
                <AlertTriangle size={24} />
                Productos con Stock Bajo ({lowStockProducts.length})
              </h3>
            </div>
            {lowStockProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Producto</th>
                      <th className="text-left py-3 px-4 font-semibold">Categoría</th>
                      <th className="text-left py-3 px-4 font-semibold">Stock Actual</th>
                      <th className="text-left py-3 px-4 font-semibold">Stock Mínimo</th>
                      <th className="text-left py-3 px-4 font-semibold">Proveedor</th>
                      <th className="text-right py-3 px-4 font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map(product => (
                      <tr key={product.id} className="border-b hover:bg-red-50">
                        <td className="py-3 px-4 font-semibold">{product.name}</td>
                        <td className="py-3 px-4">{product.category}</td>
                        <td className="py-3 px-4 font-bold text-red-600">{product.stock}</td>
                        <td className="py-3 px-4">{product.minStock}</td>
                        <td className="py-3 px-4 text-sm">{product.supplier}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleMakeOrder(product)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-bold text-sm"
                          >
                            Hacer Pedido
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400">
                <Package size={64} className="mx-auto mb-4 opacity-30" />
                <p>✅ Todos los productos tienen stock suficiente</p>
              </div>
            )}
          </div>

          {/* === SECCIÓN VENTAS === */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow p-6 mt-12">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <TrendingUp size={32} />
              Análisis de Ventas - {periodLabels[periodFilter]}
            </h2>
          </div>

          {/* Top 10 Productos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">🏆 Top 10 Productos Más Rentables</h3>
            {productAnalysis.topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">#</th>
                      <th className="text-left py-3 px-4 font-semibold">Producto</th>
                      <th className="text-left py-3 px-4 font-semibold">Categoría</th>
                      <th className="text-left py-3 px-4 font-semibold">Vendidos</th>
                      <th className="text-left py-3 px-4 font-semibold">Ingresos</th>
                      <th className="text-left py-3 px-4 font-semibold">Ganancia</th>
                      <th className="text-left py-3 px-4 font-semibold">Margen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productAnalysis.topProducts.map((p, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-bold">{i + 1}</td>
                        <td className="py-3 px-4 font-semibold">{p.name}</td>
                        <td className="py-3 px-4 text-sm">{p.category}</td>
                        <td className="py-3 px-4">{p.quantity}</td>
                        <td className="py-3 px-4 font-semibold">${p.revenue.toFixed(0)}</td>
                        <td className="py-3 px-4 font-bold text-green-600">${p.profit.toFixed(0)}</td>
                        <td className="py-3 px-4 font-bold text-blue-600">{p.margin.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-gray-400">No hay datos para este período</p>
            )}
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumen por Categoría */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">📊 Resumen por Categoría</h3>
              {productAnalysis.categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productAnalysis.categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Ingresos ($)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-12 text-gray-400">Sin datos</p>
              )}
            </div>

            {/* Distribución por Categoría */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">🥧 Distribución de Valor por Categorías</h3>
              {productAnalysis.categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productAnalysis.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {productAnalysis.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-12 text-gray-400">Sin datos</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GENERADOR DE REPORTES */}
      {activeTab === 'generador' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">📋 Generador de Reportes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2">Tipo de Reporte</label>
                <select
                  className="w-full px-4 py-2 border-2 rounded-lg"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="general">📊 Reporte General</option>
                  <option value="low-stock">⚠️ Productos con Stock Bajo</option>
                  <option value="sales">💰 Reporte de Ventas</option>
                  <option value="inventory">📦 Reporte de Inventario</option>
                  <option value="profits">📈 Análisis de Rentabilidad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Período</label>
                <select
                  className="w-full px-4 py-2 border-2 rounded-lg"
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                >
                  <option value="today">Hoy</option>
                  <option value="week">Última Semana</option>
                  <option value="month">Último Mes</option>
                  <option value="quarter">Último Trimestre</option>
                  <option value="year">Último Año</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleExportPDF}
                className="flex-1 bg-red-600 text-white py-4 rounded-lg hover:bg-red-700 font-bold flex items-center justify-center gap-2 text-lg"
              >
                <Download size={24} />
                Generar PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="flex-1 bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2 text-lg"
              >
                <Download size={24} />
                Generar Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ReportsView;