import React, { createContext, useContext, useState, useCallback } from 'react';

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within InventoryProvider');
  return context;
};

export const InventoryProvider = ({ children }) => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Laptop Dell XPS 13', category: 'Electrónica', stock: 15, minStock: 10, price: 1200, cost: 900, supplier: 'Tech Distributors', lastUpdate: '2025-10-28' },
    { id: 2, name: 'Mouse Logitech MX Master', category: 'Accesorios', stock: 5, minStock: 15, price: 99, cost: 65, supplier: 'Office Supplies Co', lastUpdate: '2025-10-27' },
    { id: 3, name: 'Teclado Mecánico Keychron', category: 'Accesorios', stock: 25, minStock: 10, price: 120, cost: 80, supplier: 'Tech Distributors', lastUpdate: '2025-10-29' },
    { id: 4, name: 'Monitor Samsung 27"', category: 'Electrónica', stock: 8, minStock: 8, price: 350, cost: 250, supplier: 'Display Wholesale', lastUpdate: '2025-10-28' },
    { id: 5, name: 'Audífonos Sony WH-1000XM5', category: 'Audio', stock: 20, minStock: 12, price: 380, cost: 280, supplier: 'Audio Pro', lastUpdate: '2025-10-30' },
  ]);

  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Tech Distributors', contact: 'Juan Pérez', email: 'juan@techdist.com', phone: '+1234567890', rating: 4.5 },
    { id: 2, name: 'Office Supplies Co', contact: 'María García', email: 'maria@officesupplies.com', phone: '+1234567891', rating: 4.2 },
    { id: 3, name: 'Display Wholesale', contact: 'Carlos López', email: 'carlos@displaywholesale.com', phone: '+1234567892', rating: 4.8 },
    { id: 4, name: 'Audio Pro', contact: 'Ana Martínez', email: 'ana@audiopro.com', phone: '+1234567893', rating: 4.6 },
  ]);

  const [orders, setOrders] = useState([
    { id: 1, supplier: 'Tech Distributors', product: 'Laptop Dell XPS 13', quantity: 10, total: 9000, date: '2025-10-25', status: 'Entregado' },
    { id: 2, supplier: 'Audio Pro', product: 'Audífonos Sony WH-1000XM5', quantity: 15, total: 4200, date: '2025-10-28', status: 'En tránsito' },
    { id: 3, supplier: 'Office Supplies Co', product: 'Mouse Logitech MX Master', quantity: 20, total: 1300, date: '2025-10-20', status: 'Entregado' },
  ]);

  const [sales, setSales] = useState([
    { id: 1, date: '2025-11-06', time: '14:30', products: [{ name: 'Mouse Logitech MX Master', quantity: 2, price: 99, subtotal: 198 }], subtotal: 198, discount: 10, total: 188, paymentMethod: 'Efectivo' },
    { id: 2, date: '2025-11-06', time: '16:45', products: [{ name: 'Teclado Mecánico Keychron', quantity: 1, price: 120, subtotal: 120 }], subtotal: 120, discount: 0, total: 120, paymentMethod: 'Tarjeta' },
  ]);

  const [credits, setCredits] = useState([
    { id: 1, customerName: 'Juan Pérez', phone: '+56912345678', date: '2025-11-01', time: '10:30', products: [{ name: 'Laptop Dell XPS 13', quantity: 1, price: 1200, subtotal: 1200 }], subtotal: 1200, discount: 50, total: 1150, amountPaid: 500, amountDue: 650, status: 'Pendiente', dueDate: '2025-11-15' },
  ]);

  const [aiMessages, setAiMessages] = useState([
    { id: 1, role: 'assistant', content: '¡Hola! Soy tu asistente de inventario. Puedo ayudarte a consultar stock, analizar precios, generar reportes y más. ¿En qué puedo ayudarte?\n\n💡 Escribe "ayuda" para ver todos los comandos disponibles.', timestamp: new Date() }
  ]);

  // Product Actions
  const addProduct = useCallback((product) => {
    const newProduct = {
      ...product,
      id: Math.max(...products.map(p => p.id), 0) + 1,
      lastUpdate: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  }, [products]);

  const updateProduct = useCallback((id, updates) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, lastUpdate: new Date().toISOString().split('T')[0] } : p
    ));
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // Orders Actions
  const addOrder = useCallback((order) => {
    const newOrder = {
      ...order,
      id: Math.max(...orders.map(o => o.id), 0) + 1,
      date: new Date().toISOString().split('T')[0],
      status: 'Pendiente'
    };
    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  }, [orders]);

  const updateOrder = useCallback((id, updates) => {
    setOrders(prev => prev.map(o => 
      o.id === id ? { ...o, ...updates } : o
    ));
  }, []);

  const deleteOrder = useCallback((id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  const completeOrder = useCallback((orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const product = products.find(p => p.name === order.product);
      if (product) {
        updateProduct(product.id, { stock: product.stock + order.quantity });
      }
      updateOrder(orderId, { status: 'Entregado', deliveredDate: new Date().toISOString().split('T')[0] });
    }
  }, [orders, products, updateProduct, updateOrder]);

  // Sales Actions
  const addSale = useCallback((sale) => {
    const newSale = {
      ...sale,
      id: Math.max(...sales.map(s => s.id), 0) + 1,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
    
    sale.products.forEach(item => {
      const product = products.find(p => p.name === item.name);
      if (product) {
        updateProduct(product.id, { stock: product.stock - item.quantity });
      }
    });
    
    setSales(prev => [...prev, newSale]);
    return newSale;
  }, [sales, products, updateProduct]);

  const deleteSale = useCallback((id) => {
    setSales(prev => prev.filter(s => s.id !== id));
  }, []);

  // Credits Actions
  const addCredit = useCallback((credit) => {
    const newCredit = {
      ...credit,
      id: Math.max(...credits.map(c => c.id), 0) + 1,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      status: credit.amountDue > 0 ? 'Pendiente' : 'Pagado'
    };
    
    credit.products.forEach(item => {
      const product = products.find(p => p.name === item.name);
      if (product) {
        updateProduct(product.id, { stock: product.stock - item.quantity });
      }
    });
    
    setCredits(prev => [...prev, newCredit]);
    return newCredit;
  }, [credits, products, updateProduct]);

  const updateCredit = useCallback((id, updates) => {
    setCredits(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  }, []);

  const addPaymentToCredit = useCallback((creditId, payment) => {
    const credit = credits.find(c => c.id === creditId);
    if (credit) {
      const newAmountPaid = credit.amountPaid + payment;
      const newAmountDue = credit.total - newAmountPaid;
      const newStatus = newAmountDue <= 0 ? 'Pagado' : 'Pendiente';
      
      updateCredit(creditId, {
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        status: newStatus,
        lastPaymentDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [credits, updateCredit]);

  const deleteCredit = useCallback((id) => {
    setCredits(prev => prev.filter(c => c.id !== id));
  }, []);

  // AI Commands Handler
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
  }, [products, suppliers, orders]);

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

  const value = {
    products,
    suppliers,
    orders,
    sales,
    credits,
    aiMessages,
    addProduct,
    updateProduct,
    deleteProduct,
    sendAIMessage,
    executeAICommand,
    addOrder,
    updateOrder,
    deleteOrder,
    completeOrder,
    addSale,
    deleteSale,
    addCredit,
    updateCredit,
    addPaymentToCredit,
    deleteCredit
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};