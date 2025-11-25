import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within InventoryProvider');
  return context;
};

export const InventoryProvider = ({ children }) => {
  // ==================== CONFIGURACIÓN ====================
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('invenpo_config');
    return saved ? JSON.parse(saved) : {
      businessName: 'InventoryPro AI',
      businessSlogan: 'Sistema de Gestión Inteligente',
      businessAddress: '',
      businessPhone: '',
      businessEmail: '',
      businessWebsite: '',
      businessRUT: '',
      currency: '$',
      dateFormat: 'DD/MM/YYYY',
      language: 'es',
      shiftMode: false, // Cierres de turno simples
      mode24hrs: false, // Modo 24 horas con usuarios
      users: [],
      shiftHistory: []
    };
  });

  // Guardar configuración en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('invenpo_config', JSON.stringify(config));
  }, [config]);

  const updateConfig = useCallback((newConfig) => {
    setConfig(newConfig);
  }, []);

  // ==================== SISTEMA DE TURNOS ====================
  const [currentShift, setCurrentShift] = useState(() => {
    const saved = localStorage.getItem('invenpo_current_shift');
    return saved ? JSON.parse(saved) : null;
  });

  // Guardar turno actual en localStorage
  useEffect(() => {
    if (currentShift) {
      localStorage.setItem('invenpo_current_shift', JSON.stringify(currentShift));
    } else {
      localStorage.removeItem('invenpo_current_shift');
    }
  }, [currentShift]);

  // Actualizar datos del turno
  const updateShiftData = useCallback((updates) => {
    setCurrentShift(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Agregar turno al historial
  const addShiftToHistory = useCallback((shiftData) => {
    setConfig(prev => ({
      ...prev,
      shiftHistory: [...(prev.shiftHistory || []), shiftData]
    }));
  }, []);

  // ==================== PRODUCTOS ====================
  const [products, setProducts] = useState([
    { id: 1, name: 'Laptop Dell XPS 13', category: 'Electrónica', stock: 15, minStock: 10, price: 1200, cost: 900, supplier: 'Tech Distributors', lastUpdate: '2025-10-28', barcode: '7501234567890' },
    { id: 2, name: 'Mouse Logitech MX Master', category: 'Accesorios', stock: 5, minStock: 15, price: 99, cost: 65, supplier: 'Office Supplies Co', lastUpdate: '2025-10-27', barcode: '7501234567891' },
    { id: 3, name: 'Teclado Mecánico Keychron', category: 'Accesorios', stock: 25, minStock: 10, price: 120, cost: 80, supplier: 'Tech Distributors', lastUpdate: '2025-10-29', barcode: '7501234567892' },
    { id: 4, name: 'Monitor Samsung 27"', category: 'Electrónica', stock: 8, minStock: 8, price: 350, cost: 250, supplier: 'Display Wholesale', lastUpdate: '2025-10-28', barcode: '7501234567893' },
    { id: 5, name: 'Audífonos Sony WH-1000XM5', category: 'Audio', stock: 20, minStock: 12, price: 380, cost: 280, supplier: 'Audio Pro', lastUpdate: '2025-10-30', barcode: '7501234567894' },
    { id: 6, name: '1 kg saco de arroz tupahue', category: 'Alimentos', stock: 50, minStock: 20, price: 15, cost: 10, supplier: 'Distribuidora Alimentos', lastUpdate: '2025-11-06', barcode: '7890123456789' },
  ]);

  const addProduct = useCallback((product) => {
    setProducts(prev => [...prev, { ...product, id: Date.now() }]);
  }, []);

  const updateProduct = useCallback((id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // ==================== PROVEEDORES ====================
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Tech Distributors', contact: 'Juan Pérez', email: 'juan@techdist.com', phone: '+1234567890', address: 'Calle Principal 123' },
    { id: 2, name: 'Office Supplies Co', contact: 'María García', email: 'maria@officesupplies.com', phone: '+1234567891', address: 'Av. Central 456' },
    { id: 3, name: 'Display Wholesale', contact: 'Carlos López', email: 'carlos@displaywholesale.com', phone: '+1234567892', address: 'Boulevard Norte 789' },
    { id: 4, name: 'Audio Pro', contact: 'Ana Martínez', email: 'ana@audiopro.com', phone: '+1234567893', address: 'Zona Industrial 321' },
    { id: 5, name: 'Distribuidora Alimentos', contact: 'Pedro Salas', email: 'pedro@alimentos.com', phone: '+1234567894', address: 'Central de Abastos' },
  ]);

  const addSupplier = useCallback((supplier) => {
    setSuppliers(prev => [...prev, { ...supplier, id: Date.now() }]);
  }, []);

  const deleteSupplier = useCallback((id) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  }, []);

  // ==================== ÓRDENES ====================
  const [orders, setOrders] = useState([
    { 
      id: 1, 
      supplier: 'Tech Distributors', 
      products: [{ name: 'Laptop Dell XPS 13', quantity: 10, unitCost: 900, subtotal: 9000 }], 
      total: 9000, 
      date: '2025-10-25', 
      expectedDate: '2025-11-05', 
      status: 'Recibido', 
      notes: 'Orden completada exitosamente' 
    },
    { 
      id: 2, 
      supplier: 'Audio Pro', 
      products: [{ name: 'Audífonos Sony WH-1000XM5', quantity: 15, unitCost: 280, subtotal: 4200 }], 
      total: 4200, 
      date: '2025-10-28', 
      expectedDate: '2025-11-10', 
      status: 'En tránsito', 
      notes: '' 
    },
  ]);

  const addOrder = useCallback((order) => {
    setOrders(prev => [...prev, { ...order, id: Date.now() }]);
  }, []);

  const updateOrder = useCallback((id, updates) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, []);

  const updateOrderStatus = useCallback((id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }, []);

  const deleteOrder = useCallback((id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  const createOrderFromProduct = useCallback((product, quantity) => {
    const newOrder = {
      id: Date.now(),
      supplier: product.supplier,
      products: [{
        name: product.name,
        quantity: quantity,
        unitCost: product.cost,
        subtotal: product.cost * quantity
      }],
      total: product.cost * quantity,
      date: new Date().toISOString().split('T')[0],
      expectedDate: '',
      status: 'Pendiente',
      notes: `Orden automática por stock bajo (${product.stock} uds)`
    };
    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  }, []);

  const completeOrder = useCallback((orderId, receivedProducts) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    receivedProducts.forEach(rp => {
      const product = products.find(p => p.name === rp.name);
      if (product) {
        updateProduct(product.id, {
          stock: product.stock + rp.quantityReceived,
          lastUpdate: new Date().toISOString().split('T')[0]
        });
      }
    });

    updateOrderStatus(orderId, 'Recibido');
  }, [orders, products, updateProduct, updateOrderStatus]);

  // ==================== COMPRAS ====================
  const [purchases, setPurchases] = useState([
    { 
      id: 1, 
      supplier: 'Tech Distributors', 
      products: [{ name: 'Laptop Dell XPS 13', quantity: 10, unitCost: 900, subtotal: 9000 }], 
      total: 9000, 
      paymentMethod: 'Transferencia', 
      date: '2025-10-25', 
      notes: 'Orden #1 recibida' 
    },
  ]);

  const addPurchase = useCallback((purchase) => {
    setPurchases(prev => [...prev, { ...purchase, id: Date.now() }]);
  }, []);

  const deletePurchase = useCallback((id) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
  }, []);

  // ==================== GASTOS ====================
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Servicios', description: 'Pago de luz - Octubre', amount: 150, paymentMethod: 'Efectivo', date: '2025-11-01', time: '09:30', notes: 'Factura #45678', userId: null },
    { id: 2, category: 'Alquiler', description: 'Renta del local - Noviembre', amount: 800, paymentMethod: 'Transferencia', date: '2025-11-01', time: '10:00', notes: '', userId: null },
    { id: 4, category: 'Servicios', description: 'Internet - Noviembre', amount: 50, paymentMethod: 'Tarjeta', date: new Date().toISOString().split('T')[0], time: '08:15', notes: 'Plan empresarial', userId: null },
    { id: 5, category: 'Transporte', description: 'Gasolina para entregas', amount: 30, paymentMethod: 'Efectivo', date: new Date().toISOString().split('T')[0], time: '11:45', notes: '', userId: null },
    { id: 6, category: 'Mantenimiento', description: 'Reparación aire acondicionado', amount: 120, paymentMethod: 'Efectivo', date: new Date().toISOString().split('T')[0], time: '15:30', notes: 'Técnico local', userId: null },
    { id: 7, category: 'Servicios', description: 'Teléfono empresarial', amount: 45, paymentMethod: 'Transferencia', date: getYesterdayDate(), time: '09:00', notes: '', userId: null },
    { id: 8, category: 'Transporte', description: 'Taxi para entregas', amount: 25, paymentMethod: 'Efectivo', date: getYesterdayDate(), time: '14:30', notes: '', userId: null },
  ]);

  const addExpense = useCallback((expense) => {
    const newExpense = {
      ...expense,
      id: Date.now(),
      userId: currentShift?.userId || null,
      userName: currentShift?.userName || null
    };
    setExpenses(prev => [...prev, newExpense]);

    // Actualizar turno si está activo
    if (currentShift && expense.paymentMethod === 'Efectivo') {
      updateShiftData({
        totalExpenses: (currentShift.totalExpenses || 0) + expense.amount,
        cashExpenses: (currentShift.cashExpenses || 0) + expense.amount
      });
    }
  }, [currentShift, updateShiftData]);

  const deleteExpense = useCallback((id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  // ==================== CRÉDITOS (FIADOS) ====================
  const [credits, setCredits] = useState([
    {
      id: 1,
      customerName: 'Juan Pérez',
      phone: '+56912345678',
      date: '2025-11-01',
      time: '10:30',
      products: [{ name: 'Laptop Dell XPS 13', quantity: 1, price: 1200, subtotal: 1200 }],
      subtotal: 1200,
      discount: 50,
      total: 1150,
      amountPaid: 700,
      amountDue: 450,
      status: 'Pendiente',
      dueDate: '2025-11-15',
      userId: null,
      payments: [
        { id: 1, amount: 500, date: '2025-11-01', time: '10:30', paymentMethod: 'Efectivo', notes: 'Pago inicial' },
        { id: 2, amount: 200, date: new Date().toISOString().split('T')[0], time: '09:15', paymentMethod: 'Efectivo', notes: 'Segundo abono' }
      ]
    },
    {
      id: 2,
      customerName: 'María González',
      phone: '+56987654321',
      date: '2025-10-20',
      time: '15:45',
      products: [{ name: 'Monitor Samsung 27"', quantity: 1, price: 350, subtotal: 350 }],
      subtotal: 350,
      discount: 0,
      total: 350,
      amountPaid: 250,
      amountDue: 100,
      status: 'Pendiente',
      dueDate: '2025-11-05',
      userId: null,
      payments: [
        { id: 1, amount: 100, date: '2025-10-20', time: '15:45', paymentMethod: 'Efectivo', notes: 'Abono inicial' },
        { id: 2, amount: 150, date: new Date().toISOString().split('T')[0], time: '13:20', paymentMethod: 'Transferencia', notes: 'Abono parcial' }
      ]
    },
  ]);

  const addCredit = useCallback((credit) => {
    const newCredit = {
      ...credit,
      id: Date.now(),
      userId: currentShift?.userId || null,
      userName: currentShift?.userName || null
    };
    setCredits(prev => [...prev, newCredit]);

    // Actualizar turno si está activo
    if (currentShift) {
      updateShiftData({
        creditsCreated: (currentShift.creditsCreated || 0) + 1,
        salesByMethod: {
          ...(currentShift.salesByMethod || {}),
          'Crédito (Fiado)': (currentShift.salesByMethod?.['Crédito (Fiado)'] || 0) + credit.total
        }
      });
    }
  }, [currentShift, updateShiftData]);

  const updateCredit = useCallback((id, updates) => {
    setCredits(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const addPaymentToCredit = useCallback((creditId, payment, paymentMethod, notes) => {
    const credit = credits.find(c => c.id === creditId);
    if (!credit) return;

    const newAmountPaid = credit.amountPaid + payment;
    const newAmountDue = credit.total - newAmountPaid;
    const newStatus = newAmountDue <= 0 ? 'Pagado' : 'Pendiente';
    
    const newPayment = {
      id: Date.now(),
      amount: payment,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: paymentMethod,
      notes: notes
    };
    
    updateCredit(creditId, {
      amountPaid: newAmountPaid,
      amountDue: newAmountDue,
      status: newStatus,
      lastPaymentDate: new Date().toISOString().split('T')[0],
      payments: [...(credit.payments || []), newPayment]
    });

    // Actualizar turno si está activo
    if (currentShift) {
      updateShiftData({
        paymentsReceived: (currentShift.paymentsReceived || 0) + 1,
        totalPayments: (currentShift.totalPayments || 0) + payment,
        cashPayments: paymentMethod === 'Efectivo' 
          ? (currentShift.cashPayments || 0) + payment 
          : (currentShift.cashPayments || 0)
      });
    }
  }, [credits, updateCredit, currentShift, updateShiftData]);

  const deleteCredit = useCallback((id) => {
    setCredits(prev => prev.filter(c => c.id !== id));
  }, []);

  // Helper para obtener todos los abonos como lista plana
  const creditPayments = useMemo(() => {
    const allPayments = [];
    credits.forEach(credit => {
      if (credit.payments && credit.payments.length > 0) {
        credit.payments.forEach(payment => {
          allPayments.push({
            ...payment,
            customerName: credit.customerName,
            creditId: credit.id,
            paymentMethod: payment.paymentMethod || 'Efectivo'
          });
        });
      }
    });
    return allPayments;
  }, [credits]);

  // ==================== VENTAS ====================
  const [sales, setSales] = useState([
    {
      id: 1,
      date: '2025-11-06',
      time: '14:30',
      products: [{ name: 'Mouse Logitech MX Master', quantity: 2, price: 99, subtotal: 198 }],
      subtotal: 198,
      discount: 10,
      total: 188,
      paymentMethod: 'Efectivo',
      userId: null
    },
    {
      id: 2,
      date: '2025-11-06',
      time: '16:45',
      products: [{ name: 'Teclado Mecánico Keychron', quantity: 1, price: 120, subtotal: 120 }],
      subtotal: 120,
      discount: 0,
      total: 120,
      paymentMethod: 'Tarjeta',
      userId: null
    },
    {
      id: 4,
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      products: [{ name: 'Mouse Logitech MX Master', quantity: 1, price: 99, subtotal: 99 }],
      subtotal: 99,
      discount: 0,
      total: 99,
      paymentMethod: 'Efectivo',
      userId: null
    },
  ]);

  const addSale = useCallback((sale) => {
    const newSale = {
      ...sale,
      id: Date.now(),
      userId: currentShift?.userId || null,
      userName: currentShift?.userName || null
    };
    setSales(prev => [...prev, newSale]);

    // Actualizar stock
    sale.products.forEach(item => {
      const product = products.find(p => p.name === item.name);
      if (product) {
        updateProduct(product.id, {
          stock: product.stock - item.quantity,
          lastUpdate: new Date().toISOString().split('T')[0]
        });
      }
    });

    // Actualizar turno si está activo
    if (currentShift) {
      const productsSold = sale.products.reduce((sum, p) => sum + p.quantity, 0);
      
      updateShiftData({
        totalSales: (currentShift.totalSales || 0) + sale.total,
        transactions: (currentShift.transactions || 0) + 1,
        productsSold: (currentShift.productsSold || 0) + productsSold,
        salesByMethod: {
          ...(currentShift.salesByMethod || {
            'Efectivo': 0,
            'Tarjeta': 0,
            'Transferencia': 0,
            'Crédito (Fiado)': 0
          }),
          [sale.paymentMethod]: (currentShift.salesByMethod?.[sale.paymentMethod] || 0) + sale.total
        },
        cashSales: sale.paymentMethod === 'Efectivo' 
          ? (currentShift.cashSales || 0) + sale.total 
          : (currentShift.cashSales || 0)
      });
    }
  }, [products, updateProduct, currentShift, updateShiftData]);

  const deleteSale = useCallback((id) => {
    setSales(prev => prev.filter(s => s.id !== id));
  }, []);

  // ==================== MOVIMIENTOS ====================
  const [movements, setMovements] = useState([]);

  // ==================== AI ASSISTANT ====================
  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: '👋 ¡Hola! Soy tu asistente de inventario con IA. Puedo ayudarte a consultar stock, alertas, precios y más. Escribe "ayuda" para ver los comandos disponibles.',
      timestamp: new Date()
    }
  ]);

  const executeAICommand = useCallback((command) => {
    const cmd = command.toLowerCase().trim();
    
    const keywords = {
      stock: ['stock', 'inventario', 'cantidad', 'unidades', 'disponible'],
      alerts: ['alerta', 'alertas', 'bajo', 'crítico', 'revisar', 'atención'],
      prices: ['precio', 'precios', 'margen', 'márgenes', 'ganancia', 'rentabilidad'],
      suppliers: ['proveedor', 'proveedores', 'supplier'],
      orders: ['orden', 'órdenes', 'pedido', 'pedidos', 'compra'],
      best: ['mejor', 'mejores', 'top', 'mayor', 'más'],
      worst: ['peor', 'peores', 'menor', 'menos'],
      help: ['ayuda', 'help', 'qué puedes', 'comandos']
    };

    if (keywords.help.some(k => cmd.includes(k))) {
      return `📋 **Comandos disponibles:**

- "stock" o "inventario" - Ver estado del inventario
- "alertas" o "stock bajo" - Productos que necesitan reposición
- "precios" o "márgenes" - Análisis de rentabilidad
- "proveedores" - Información de proveedores
- "órdenes" o "pedidos" - Estado de compras
- "mejor producto" - Producto más rentable
- "recomendar compra" - Sugerencias de reposición

💡 Puedes combinar comandos, ej: "mostrar stock de laptop"`;
    }

    if (keywords.stock.some(k => cmd.includes(k))) {
      const productName = cmd.replace(/stock|inventario|de|del|cuanto|cuánto|hay|tiene|mostrar|ver/gi, '').trim();
      
      if (productName && productName.length > 2) {
        const product = products.find(p => 
          p.name.toLowerCase().includes(productName) || 
          productName.includes(p.name.toLowerCase().split(' ')[0])
        );
        
        if (product) {
          const stockStatus = product.stock <= product.minStock ? '🔴 CRÍTICO' : product.stock <= product.minStock * 1.5 ? '🟡 BAJO' : '🟢 NORMAL';
          const margin = ((product.price - product.cost) / product.price * 100).toFixed(1);
          
          return `📦 **${product.name}**

- Stock actual: ${product.stock} unidades
- Stock mínimo: ${product.minStock} unidades
- Estado: ${stockStatus}
- Precio: $${product.price}
- Margen: ${margin}%
- Proveedor: ${product.supplier}

${product.stock <= product.minStock ? '⚠️ Considera reordenar pronto.' : '✅ Stock en niveles óptimos.'}`;
        }
        return `🔍 No encontré "${productName}". Productos disponibles: ${products.slice(0, 3).map(p => p.name).join(', ')}...`;
      }
      
      const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
      const totalItems = products.reduce((sum, p) => sum + p.stock, 0);
      
      return `📊 **Resumen de Inventario**

- Total de productos: ${products.length} tipos
- Unidades totales: ${totalItems}
- Valor del inventario: $${totalValue.toLocaleString()}

💡 Tip: Pregunta por un producto específico`;
    }

    if (keywords.alerts.some(k => cmd.includes(k))) {
      const lowStock = products.filter(p => p.stock <= p.minStock);
      
      if (lowStock.length === 0) {
        return '✅ No hay productos con stock bajo. Todos los niveles están óptimos.';
      }
      
      return `⚠️ **Alertas de Stock** (${lowStock.length} productos)

${lowStock.map(p => `• ${p.name}: ${p.stock} uds (mínimo: ${p.minStock})`).join('\n')}

💡 Contacta a los proveedores para reposición.`;
    }

    if (keywords.prices.some(k => cmd.includes(k))) {
      const avgMargin = products.reduce((sum, p) => sum + ((p.price - p.cost) / p.price * 100), 0) / products.length;
      const topProducts = products
        .map(p => ({ name: p.name, margin: (p.price - p.cost) * p.stock }))
        .sort((a, b) => b.margin - a.margin)
        .slice(0, 3);
      
      return `💰 **Análisis de Rentabilidad**

- Margen promedio: ${avgMargin.toFixed(1)}%

🏆 **Top 3 Más Rentables:**
${topProducts.map((p, i) => `${i + 1}. ${p.name} - $${p.margin.toLocaleString()}`).join('\n')}`;
    }

    return `🤔 No entendí tu consulta.

💡 Escribe "ayuda" para ver los comandos disponibles.`;
  }, [products]);

  const sendAIMessage = useCallback((message) => {
    const userMsg = {
      id: aiMessages.length + 1,
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setAiMessages(prev => [...prev, userMsg]);
    
    setTimeout(() => {
      const response = executeAICommand(message);
      const aiMsg = {
        id: aiMessages.length + 2,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, aiMsg]);
    }, 500);
  }, [aiMessages.length, executeAICommand]);

  // ==================== CONTEXT VALUE ====================
  const value = {
    // Configuración
    config,
    updateConfig,
    
    // Sistema de turnos
    currentShift,
    setCurrentShift,
    updateShiftData,
    addShiftToHistory,
    
    // Productos
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Proveedores
    suppliers,
    addSupplier,
    deleteSupplier,
    
    // Órdenes
    orders,
    addOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    createOrderFromProduct,
    completeOrder,
    
    // Compras
    purchases,
    addPurchase,
    deletePurchase,
    
    // Gastos
    expenses,
    addExpense,
    deleteExpense,
    
    // Ventas
    sales,
    addSale,
    deleteSale,
    
    // Créditos
    credits,
    creditPayments,
    addCredit,
    updateCredit,
    addPaymentToCredit,
    deleteCredit,
    
    // Movimientos
    movements,
    
    // AI Assistant
    aiMessages,
    sendAIMessage,
    executeAICommand
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};