import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart, DollarSign, CreditCard, Package, Mic, Edit2, Check, Barcode, Search, ArrowDownCircle, ArrowUpCircle, Lock, User, Shield, RotateCcw, PackageOpen, CheckCircle, Boxes } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';

export const POSView = ({ isOpen, onClose }) => {
  const { products, addSale, addCredit, addExpense, currentShift, updateShiftData, config, sales, updateProduct, packs } = useInventory();
  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [discount, setDiscount] = useState(0);
  const [editingTotal, setEditingTotal] = useState(false);
  const [customTotal, setCustomTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amountReceived, setAmountReceived] = useState(0);
  
  // Estados para Consultar Precio
  const [showPriceChecker, setShowPriceChecker] = useState(false);
  const [priceSearch, setPriceSearch] = useState('');
  const [priceResult, setPriceResult] = useState(null);
  
  // ==================== PAID IN/OUT ====================
  const [showPaidInModal, setShowPaidInModal] = useState(false);
  const [showPaidOutModal, setShowPaidOutModal] = useState(false);
  const [paidAmount, setPaidAmount] = useState('');
  const [paidDescription, setPaidDescription] = useState('');
  const [paidCategory, setPaidCategory] = useState('Otros');
  
  // ==================== AUTENTICACIÓN ADMIN ====================
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticatedAdmin, setAuthenticatedAdmin] = useState(null);

  // ==================== DEVOLUCIONES ====================
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundSearch, setRefundSearch] = useState('');
  const [selectedSaleForRefund, setSelectedSaleForRefund] = useState(null);
  const [refundItems, setRefundItems] = useState([]);
  const [refundReason, setRefundReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('efectivo');

  // ==================== PACKS ====================
  const [showPacksModal, setShowPacksModal] = useState(false);
  const [packSearch, setPackSearch] = useState('');
  const [selectedPack, setSelectedPack] = useState(null);
  const [packAction, setPackAction] = useState('sell'); // 'sell', 'assemble', 'disassemble'

  // ==================== CONFIRMACIÓN VISUAL ====================
  const [showSaleConfirmation, setShowSaleConfirmation] = useState(false);
  const [lastSaleData, setLastSaleData] = useState(null);
  
  const barcodeInputRef = useRef(null);
  const priceSearchRef = useRef(null);
  const adminPasswordRef = useRef(null);
  const refundSearchRef = useRef(null);

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = editingTotal && customTotal > 0 ? customTotal : (subtotal - discountAmount);
  const change = amountReceived - total;

  useEffect(() => {
    if (isOpen && barcodeInputRef.current && !showPriceChecker && !showPaidInModal && !showPaidOutModal && !showAdminAuth && !showRefundModal && !showPacksModal) {
      barcodeInputRef.current.focus();
    }
    if (showPriceChecker && priceSearchRef.current) {
      priceSearchRef.current.focus();
    }
    if (showAdminAuth && adminPasswordRef.current) {
      adminPasswordRef.current.focus();
    }
    if (showRefundModal && refundSearchRef.current) {
      refundSearchRef.current.focus();
    }
  }, [isOpen, showPriceChecker, showPaidInModal, showPaidOutModal, showAdminAuth, showRefundModal, showPacksModal]);

  // ==================== AUTO-CERRAR CONFIRMACIÓN ====================
  useEffect(() => {
    if (showSaleConfirmation) {
      const timer = setTimeout(() => {
        setShowSaleConfirmation(false);
        setLastSaleData(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSaleConfirmation]);

  const calculateSimilarity = (str1, str2) => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    if (s2.includes(s1) || s1.includes(s2)) return 100;
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    let matches = 0;
    words1.forEach(w1 => {
      if (words2.some(w2 => w2.includes(w1) || w1.includes(w2))) {
        matches++;
      }
    });
    return (matches / Math.max(words1.length, words2.length)) * 100;
  };

  const findProductByCodeOrName = (input) => {
    input = input.trim();
    let product = products.find(p => p.barcode && p.barcode === input);
    if (product && product.stock > 0) return product;
    product = products.find(p => p.id.toString() === input);
    if (product && product.stock > 0) return product;
    const availableProducts = products.filter(p => p.stock > 0);
    const similarities = availableProducts.map(p => ({
      product: p,
      score: calculateSimilarity(input, p.name)
    }));
    similarities.sort((a, b) => b.score - a.score);
    if (similarities.length > 0 && similarities[0].score >= 40) {
      return similarities[0].product;
    }
    return null;
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const product = findProductByCodeOrName(barcodeInput);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
      barcodeInputRef.current?.focus();
      speakFeedback(`${product.name.substring(0, 30)} agregado`);
    } else {
      speakFeedback('Producto no encontrado');
    }
  };

  // Consultar precio
  const handlePriceSearch = (e) => {
    e.preventDefault();
    if (!priceSearch.trim()) return;
    
    const product = products.find(p => 
      (p.barcode && p.barcode === priceSearch) ||
      p.id.toString() === priceSearch ||
      p.name.toLowerCase().includes(priceSearch.toLowerCase())
    );
    
    setPriceResult(product || 'notfound');
    speakFeedback(product ? `${product.name}, ${product.price} pesos` : 'Producto no encontrado');
  };

  const clearPriceSearch = () => {
    setPriceSearch('');
    setPriceResult(null);
    priceSearchRef.current?.focus();
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert(`Stock insuficiente. Disponible: ${product.stock}`);
        speakFeedback('Stock insuficiente');
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        subtotal: product.price,
        maxStock: product.stock
      }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    const item = cart.find(i => i.id === productId);
    if (newQuantity > item.maxStock) {
      alert(`Stock insuficiente. Máximo: ${item.maxStock}`);
      return;
    }
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    if (window.confirm('¿Vaciar el carrito?')) {
      setCart([]);
      setDiscount(0);
      setEditingTotal(false);
      setCustomTotal(0);
      setPaymentMethod('');
      setBarcodeInput('');
      setAmountReceived(0);
      setCustomerName('');
      setCustomerPhone('');
      setShowCreditForm(false);
      speakFeedback('Carrito vaciado');
    }
  };

  const applyQuickDiscount = (percentage) => {
    setDiscount(percentage);
    setEditingTotal(false);
    speakFeedback(`Descuento del ${percentage}% aplicado`);
  };

  const saveCustomTotal = () => {
    if (customTotal > 0 && customTotal <= subtotal) {
      setEditingTotal(false);
      const newDiscount = ((subtotal - customTotal) / subtotal) * 100;
      setDiscount(newDiscount);
      speakFeedback('Total actualizado');
    } else {
      alert('El total debe ser mayor a 0 y menor o igual al subtotal');
    }
  };

  const completeSale = () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    if (!paymentMethod) {
      alert('Selecciona un método de pago');
      return;
    }
    if (paymentMethod === 'Fiado') {
      if (!customerName.trim() || !customerPhone.trim()) {
        alert('Ingresa nombre y teléfono del cliente');
        return;
      }
      const creditData = {
        customerName,
        phone: customerPhone,
        products: cart,
        subtotal,
        discount: discountAmount,
        total,
        amountPaid: 0,
        amountDue: total,
        dueDate: null
      };
      addCredit(creditData);
      
      // Mostrar confirmación visual
      setLastSaleData({
        type: 'credit',
        total,
        customerName,
        paymentMethod: 'Fiado'
      });
      setShowSaleConfirmation(true);
      speakFeedback('Fiado registrado exitosamente');
    } else {
      if (paymentMethod === 'Efectivo' && amountReceived < total) {
        alert('El monto recibido es insuficiente');
        return;
      }
      const saleData = {
        products: cart,
        subtotal,
        discount: discountAmount,
        total,
        paymentMethod
      };
      addSale(saleData);
      
      // Mostrar confirmación visual
      setLastSaleData({
        type: 'sale',
        total,
        paymentMethod,
        change: paymentMethod === 'Efectivo' ? change : 0,
        itemCount: cart.length
      });
      setShowSaleConfirmation(true);
      
      if (paymentMethod === 'Efectivo' && change > 0) {
        speakFeedback(`Venta completada. Cambio: ${change.toFixed(0)} pesos`);
      } else {
        speakFeedback('Venta completada exitosamente');
      }
    }
    setCart([]);
    setDiscount(0);
    setEditingTotal(false);
    setCustomTotal(0);
    setPaymentMethod('');
    setBarcodeInput('');
    setAmountReceived(0);
    setCustomerName('');
    setCustomerPhone('');
    setShowCreditForm(false);
    setTimeout(() => barcodeInputRef.current?.focus(), 100);
  };

  // ==================== AUTENTICACIÓN DE ADMINISTRADOR ====================
  const requestAdminAuth = (action) => {
    setPendingAction(action);
    setAdminUsername('');
    setAdminPassword('');
    setAuthError('');
    setAuthenticatedAdmin(null);
    setShowAdminAuth(true);
  };

  const verifyAdminCredentials = () => {
    setAuthError('');
    
    const users = config?.users || [];
    const user = users.find(u => 
      (u.name.toLowerCase() === adminUsername.toLowerCase() || u.pin === adminPassword) && 
      (u.password === adminPassword || u.pin === adminPassword)
    );

    if (!user) {
      setAuthError('❌ Usuario o contraseña incorrectos');
      return;
    }

    if (user.role !== 'Administrador' && user.role !== 'admin' && user.role !== 'Admin') {
      setAuthError('⚠️ Solo los administradores pueden realizar esta acción');
      return;
    }

    setAuthenticatedAdmin(user);
    setShowAdminAuth(false);
    
    if (pendingAction === 'paidIn') {
      setShowPaidInModal(true);
    } else if (pendingAction === 'paidOut') {
      setShowPaidOutModal(true);
    } else if (pendingAction === 'refund') {
      setShowRefundModal(true);
    }
    
    setAdminUsername('');
    setAdminPassword('');
    setPendingAction(null);
  };

  const cancelAdminAuth = () => {
    setShowAdminAuth(false);
    setAdminUsername('');
    setAdminPassword('');
    setAuthError('');
    setPendingAction(null);
    setAuthenticatedAdmin(null);
  };

  // ==================== PAID IN (Entrada de efectivo) ====================
  const handlePaidIn = () => {
    const amount = parseFloat(paidAmount);
    if (!amount || amount <= 0) {
      alert('Ingresa un monto válido');
      return;
    }
    if (!paidDescription.trim()) {
      alert('Ingresa una descripción');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    if (currentShift) {
      updateShiftData({
        cashSales: (currentShift.cashSales || 0) + amount,
        totalSales: (currentShift.totalSales || 0) + amount,
        salesByMethod: {
          ...(currentShift.salesByMethod || {
            'Efectivo': 0,
            'Tarjeta': 0,
            'Transferencia': 0,
            'Crédito (Fiado)': 0
          }),
          'Efectivo': (currentShift.salesByMethod?.['Efectivo'] || 0) + amount
        },
        paidIns: [...(currentShift.paidIns || []), {
          id: Date.now(),
          amount,
          description: paidDescription,
          category: paidCategory,
          date: dateStr,
          time: timeStr,
          authorizedBy: authenticatedAdmin?.name || 'Admin',
          registeredBy: currentShift.userName
        }]
      });
    }

    speakFeedback(`Entrada de ${amount} pesos registrada`);
    alert(`✅ Entrada de Efectivo Registrada\n\n💵 Monto: $${amount.toLocaleString()}\n📝 ${paidDescription}\n🔐 Autorizado por: ${authenticatedAdmin?.name || 'Admin'}`);
    
    setPaidAmount('');
    setPaidDescription('');
    setPaidCategory('Otros');
    setShowPaidInModal(false);
    setAuthenticatedAdmin(null);
    setTimeout(() => barcodeInputRef.current?.focus(), 100);
  };

  // ==================== PAID OUT (Salida de efectivo) ====================
  const handlePaidOut = () => {
    const amount = parseFloat(paidAmount);
    if (!amount || amount <= 0) {
      alert('Ingresa un monto válido');
      return;
    }
    if (!paidDescription.trim()) {
      alert('Ingresa una descripción');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    addExpense({
      category: paidCategory,
      description: paidDescription,
      amount: amount,
      paymentMethod: 'Efectivo',
      date: dateStr,
      time: timeStr,
      notes: `Paid Out - Autorizado por: ${authenticatedAdmin?.name || 'Admin'}`,
      isPaidOut: true,
      authorizedBy: authenticatedAdmin?.name || 'Admin'
    });

    if (currentShift) {
      updateShiftData({
        paidOuts: [...(currentShift.paidOuts || []), {
          id: Date.now(),
          amount,
          description: paidDescription,
          category: paidCategory,
          date: dateStr,
          time: timeStr,
          authorizedBy: authenticatedAdmin?.name || 'Admin',
          registeredBy: currentShift.userName
        }]
      });
    }

    speakFeedback(`Salida de ${amount} pesos registrada`);
    alert(`✅ Salida de Efectivo Registrada\n\n💸 Monto: $${amount.toLocaleString()}\n📝 ${paidDescription}\n🔐 Autorizado por: ${authenticatedAdmin?.name || 'Admin'}`);
    
    setPaidAmount('');
    setPaidDescription('');
    setPaidCategory('Otros');
    setShowPaidOutModal(false);
    setAuthenticatedAdmin(null);
    setTimeout(() => barcodeInputRef.current?.focus(), 100);
  };

  // ==================== DEVOLUCIONES ====================
  const searchSalesForRefund = () => {
    if (!refundSearch.trim()) return [];
    const search = refundSearch.toLowerCase();
    return (sales || []).filter(sale => 
      sale.id?.toString().includes(search) ||
      sale.products?.some(p => p.name?.toLowerCase().includes(search)) ||
      sale.date?.includes(search)
    ).slice(0, 10);
  };

  const toggleRefundItem = (product, saleProduct) => {
    const existingIndex = refundItems.findIndex(item => 
      item.productId === product.id && item.saleProductIndex === saleProduct.index
    );
    
    if (existingIndex >= 0) {
      setRefundItems(refundItems.filter((_, i) => i !== existingIndex));
    } else {
      setRefundItems([...refundItems, {
        productId: product.id,
        productName: product.name,
        price: saleProduct.price,
        quantity: 1,
        maxQuantity: saleProduct.quantity,
        saleProductIndex: saleProduct.index
      }]);
    }
  };

  const updateRefundItemQuantity = (index, qty) => {
    const item = refundItems[index];
    if (qty < 1 || qty > item.maxQuantity) return;
    setRefundItems(refundItems.map((item, i) => 
      i === index ? { ...item, quantity: qty } : item
    ));
  };

  const calculateRefundTotal = () => {
    return refundItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleRefund = () => {
    if (refundItems.length === 0) {
      alert('Selecciona al menos un producto para devolver');
      return;
    }
    if (!refundReason.trim()) {
      alert('Ingresa el motivo de la devolución');
      return;
    }

    const now = new Date();
    const refundTotal = calculateRefundTotal();

    // Devolver stock de productos
    refundItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product && updateProduct) {
        updateProduct(item.productId, {
          stock: product.stock + item.quantity
        });
      }
    });

    // Registrar la devolución en el turno
    if (currentShift) {
      updateShiftData({
        refunds: [...(currentShift.refunds || []), {
          id: Date.now(),
          originalSaleId: selectedSaleForRefund?.id,
          items: refundItems,
          total: refundTotal,
          reason: refundReason,
          method: refundMethod,
          date: now.toISOString().split('T')[0],
          time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          authorizedBy: authenticatedAdmin?.name || 'Admin',
          processedBy: currentShift.userName
        }]
      });
    }

    speakFeedback(`Devolución de ${refundTotal} pesos procesada`);
    alert(`✅ Devolución Procesada\n\n💸 Total devuelto: $${refundTotal.toLocaleString()}\n📝 Motivo: ${refundReason}\n💰 Método: ${refundMethod}\n🔐 Autorizado por: ${authenticatedAdmin?.name || 'Admin'}`);

    // Limpiar
    setShowRefundModal(false);
    setSelectedSaleForRefund(null);
    setRefundItems([]);
    setRefundReason('');
    setRefundSearch('');
    setAuthenticatedAdmin(null);
    setTimeout(() => barcodeInputRef.current?.focus(), 100);
  };

  // ==================== PACKS ====================
  const getAvailablePacks = () => {
    if (!packs) return [];
    return packs.filter(pack => {
      if (!packSearch.trim()) return true;
      return pack.name?.toLowerCase().includes(packSearch.toLowerCase());
    });
  };

  const addPackToCart = (pack) => {
    // Verificar stock de componentes
    let canSell = true;
    pack.components?.forEach(comp => {
      const product = products.find(p => p.id === comp.productId);
      if (!product || product.stock < comp.quantity) {
        canSell = false;
      }
    });

    if (!canSell) {
      alert('Stock insuficiente para armar este pack');
      speakFeedback('Stock insuficiente para el pack');
      return;
    }

    // Agregar pack al carrito
    const existingPack = cart.find(item => item.id === `pack-${pack.id}`);
    if (existingPack) {
      setCart(cart.map(item => 
        item.id === `pack-${pack.id}` 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * pack.price }
          : item
      ));
    } else {
      setCart([...cart, {
        id: `pack-${pack.id}`,
        name: `📦 ${pack.name}`,
        price: pack.price,
        quantity: 1,
        subtotal: pack.price,
        maxStock: 999,
        isPack: true,
        packId: pack.id,
        components: pack.components
      }]);
    }

    speakFeedback(`Pack ${pack.name} agregado`);
    setShowPacksModal(false);
    setPackSearch('');
    setSelectedPack(null);
  };

  const speakFeedback = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.2;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('❌ Tu navegador no soporta reconocimiento de voz.\n\n✅ Usa Google Chrome o Microsoft Edge.');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => {
      setIsListening(true);
      speakFeedback('Escuchando. Dime el producto');
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log('Escuchado:', transcript);
      const product = findProductByCodeOrName(transcript);
      if (product) {
        addToCart(product);
        speakFeedback(`${product.name.substring(0, 40)} agregado`);
      } else {
        speakFeedback('No encontré ese producto. Intenta de nuevo');
      }
      setIsListening(false);
    };
    recognition.onerror = (event) => {
      console.error('Error de reconocimiento:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        speakFeedback('No te escuché. Intenta de nuevo');
      }
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;
      if (e.key === 'F4') {
        e.preventDefault();
        clearCart();
      }
      if (e.key === 'F11') {
        e.preventDefault();
        setShowPriceChecker(prev => !prev);
      }
      // F7 para Paid In (requiere auth)
      if (e.key === 'F7') {
        e.preventDefault();
        requestAdminAuth('paidIn');
      }
      // F8 para Paid Out (requiere auth)
      if (e.key === 'F8') {
        e.preventDefault();
        requestAdminAuth('paidOut');
      }
      // F9 para Devoluciones (requiere auth)
      if (e.key === 'F9') {
        e.preventDefault();
        requestAdminAuth('refund');
      }
      // F10 para Packs
      if (e.key === 'F10') {
        e.preventDefault();
        setShowPacksModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, cart]);

  // Categorías para Paid In/Out
  const paidInCategories = [
    'Préstamo dueño',
    'Cambio adicional',
    'Depósito',
    'Devolución proveedor',
    'Otros'
  ];

  const paidOutCategories = [
    'Pago proveedor',
    'Adelanto empleado',
    'Compra menor',
    'Envío/Delivery',
    'Propina',
    'Otros'
  ];

  const refundReasons = [
    'Producto defectuoso',
    'Cliente insatisfecho',
    'Error en venta',
    'Cambio de producto',
    'Garantía',
    'Otro'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShoppingCart size={28} />
            <div>
              <h2 className="text-xl font-bold">Punto de Venta</h2>
              <p className="text-xs opacity-90">Sistema rápido</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-[65%] flex flex-col border-r">
            {/* CONSULTAR PRECIO */}
            {showPriceChecker && (
              <div className="p-4 bg-blue-100 border-b-4 border-blue-500">
                <form onSubmit={handlePriceSearch}>
                  <div className="relative mb-3">
                    <Search className="absolute left-4 top-3 text-blue-600" size={24} />
                    <input
                      ref={priceSearchRef}
                      type="text"
                      placeholder="🔍 CONSULTAR PRECIO - Código o nombre"
                      className="w-full pl-14 pr-20 py-3 border-4 border-blue-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 text-lg font-bold"
                      value={priceSearch}
                      onChange={(e) => setPriceSearch(e.target.value)}
                    />
                    {priceSearch && (
                      <button
                        type="button"
                        onClick={clearPriceSearch}
                        className="absolute right-2 top-2 bg-gray-200 hover:bg-gray-300 p-2 rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </form>

                {priceResult && (
                  <div className="mt-2">
                    {priceResult === 'notfound' ? (
                      <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 text-center">
                        <p className="text-red-800 font-bold">❌ Producto no encontrado</p>
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-blue-300 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 mb-2">{priceResult.name}</h4>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <p className="text-xs text-gray-600">Precio</p>
                                <p className="text-2xl font-bold text-green-600">${priceResult.price}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Stock</p>
                                <p className={`text-2xl font-bold ${priceResult.stock <= priceResult.minStock ? 'text-red-600' : 'text-blue-600'}`}>
                                  {priceResult.stock}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Categoría</p>
                                <p className="text-sm font-semibold text-gray-700">{priceResult.category}</p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              addToCart(priceResult);
                              setShowPriceChecker(false);
                              clearPriceSearch();
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold ml-3"
                          >
                            + Agregar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ESCÁNER DE CÓDIGO */}
            <div className="p-4 bg-blue-50 border-b-4 border-blue-400">
              <form onSubmit={handleBarcodeSubmit}>
                <div className="relative">
                  <Barcode className="absolute left-4 top-4 text-blue-600" size={28} />
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    placeholder="ESCANEA CÓDIGO O ESCRIBE Y PRESIONA ENTER"
                    className="w-full pl-16 pr-4 py-4 border-4 border-blue-400 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 text-xl font-bold"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    disabled={showPriceChecker || showPaidInModal || showPaidOutModal || showAdminAuth || showRefundModal || showPacksModal}
                  />
                </div>
              </form>
            </div>

            {/* BOTONES: VOZ + PRECIO + PAID IN/OUT + DEVOLUCIÓN + PACKS */}
            <div className="p-3 bg-purple-50">
              <div className="grid grid-cols-6 gap-2">
                {/* Botón VOZ */}
                <button
                  onClick={startVoiceRecognition}
                  disabled={showPriceChecker || showPaidInModal || showPaidOutModal || showAdminAuth || showRefundModal}
                  className={`py-3 rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition ${
                    showPriceChecker || showPaidInModal || showPaidOutModal || showAdminAuth || showRefundModal ? 'bg-gray-300 cursor-not-allowed' :
                    isListening 
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <Mic size={18} />
                  {isListening ? '🔴' : 'VOZ'}
                </button>
                
                {/* Botón PRECIO */}
                <button
                  onClick={() => setShowPriceChecker(prev => !prev)}
                  className={`py-3 rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition ${
                    showPriceChecker 
                      ? 'bg-blue-700 hover:bg-blue-800 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  title="Consultar Precio (F11)"
                >
                  <Search size={18} />
                  PRECIO
                </button>

                {/* Botón PAID IN (Entrada) */}
                <button
                  onClick={() => requestAdminAuth('paidIn')}
                  disabled={showPriceChecker}
                  className={`py-3 rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition ${
                    showPriceChecker ? 'bg-gray-300 cursor-not-allowed' :
                    'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                  title="Entrada de Efectivo (F7)"
                >
                  <ArrowDownCircle size={18} />
                  IN
                </button>

                {/* Botón PAID OUT (Salida) */}
                <button
                  onClick={() => requestAdminAuth('paidOut')}
                  disabled={showPriceChecker}
                  className={`py-3 rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition ${
                    showPriceChecker ? 'bg-gray-300 cursor-not-allowed' :
                    'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  title="Salida de Efectivo (F8)"
                >
                  <ArrowUpCircle size={18} />
                  OUT
                </button>

                {/* Botón DEVOLUCIÓN */}
                <button
                  onClick={() => requestAdminAuth('refund')}
                  disabled={showPriceChecker}
                  className={`py-3 rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition ${
                    showPriceChecker ? 'bg-gray-300 cursor-not-allowed' :
                    'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                  title="Devolución (F9)"
                >
                  <RotateCcw size={18} />
                  DEV
                </button>

                {/* Botón PACKS */}
                <button
                  onClick={() => setShowPacksModal(true)}
                  disabled={showPriceChecker}
                  className={`py-3 rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition ${
                    showPriceChecker ? 'bg-gray-300 cursor-not-allowed' :
                    'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                  title="Packs (F10)"
                >
                  <Boxes size={18} />
                  PACK
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-2xl font-bold">🛒 CARRITO ({cart.length})</h3>
                {cart.length > 0 && (
                  <button onClick={clearCart} className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition font-semibold">
                    🗑️ Vaciar
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Carrito vacío</p>
                  <p className="text-gray-400 text-sm mt-2">Escanea un producto o búscalo por nombre</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className={`flex items-center justify-between p-3 rounded-xl border-2 ${item.isPack ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'}`}>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">${item.price} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-bold text-lg">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300"
                        >
                          <Plus size={16} />
                        </button>
                        <p className="w-24 text-right font-bold text-green-600">${item.subtotal.toLocaleString()}</p>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel Derecho - Resumen y Pago */}
          <div className="w-[35%] flex flex-col p-4 bg-gray-50">
            {cart.length > 0 && (
              <>
                {/* Descuentos rápidos */}
                <div className="mb-3">
                  <p className="text-xs font-bold text-gray-700 mb-2">DESCUENTO RÁPIDO:</p>
                  <div className="flex gap-1">
                    {[5, 10, 15, 20].map(pct => (
                      <button
                        key={pct}
                        onClick={() => applyQuickDiscount(pct)}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${
                          discount === pct 
                            ? 'bg-green-600 text-white' 
                            : 'bg-white border-2 border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                    {discount > 0 && (
                      <button
                        onClick={() => { setDiscount(0); setEditingTotal(false); }}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg font-bold text-sm hover:bg-red-200"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border-2 mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold">✏️ EDITAR TOTAL</label>
                    {!editingTotal && (
                      <button onClick={() => { setEditingTotal(true); setCustomTotal(total); }} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                        <Edit2 size={18} />
                      </button>
                    )}
                  </div>
                  {editingTotal && (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input type="number" step="0.01" className="w-full pl-7 pr-3 py-2 border-2 border-blue-300 rounded-lg font-bold" value={customTotal || ''} onChange={(e) => setCustomTotal(parseFloat(e.target.value) || 0)} autoFocus />
                      </div>
                      <button onClick={saveCustomTotal} className="bg-green-600 text-white px-3 rounded-lg hover:bg-green-700"><Check size={20} /></button>
                      <button onClick={() => { setEditingTotal(false); setCustomTotal(0); }} className="bg-gray-200 text-gray-700 px-3 rounded-lg hover:bg-gray-300"><X size={20} /></button>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg mb-3">
              <div className="flex justify-between text-sm opacity-90 mb-1">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm opacity-90 mb-1">
                  <span>Desc. ({discount.toFixed(1)}%):</span>
                  <span>-${discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold border-t border-white/30 pt-2">
                <span>TOTAL:</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>

            {cart.length > 0 && !paymentMethod && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-700">MÉTODO DE PAGO:</p>
                <button onClick={() => setPaymentMethod('Efectivo')} className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2"><DollarSign size={20} /> EFECTIVO</button>
                <button onClick={() => setPaymentMethod('Tarjeta')} className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 font-bold flex items-center justify-center gap-2"><CreditCard size={20} /> TARJETA</button>
                <button onClick={() => setPaymentMethod('Transferencia')} className="w-full bg-purple-600 text-white py-4 rounded-lg hover:bg-purple-700 font-bold flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  TRANSFERENCIA
                </button>
                <button onClick={() => { setPaymentMethod('Fiado'); setShowCreditForm(true); }} className="w-full bg-orange-600 text-white py-4 rounded-lg hover:bg-orange-700 font-bold flex items-center justify-center gap-2"><Package size={20} /> FIADO</button>
              </div>
            )}

            {paymentMethod === 'Efectivo' && (
              <div className="space-y-2">
                <label className="block text-sm font-bold">💵 MONTO RECIBIDO</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input type="number" step="0.01" className="w-full pl-8 pr-3 py-3 border-2 border-green-300 rounded-lg font-bold text-lg" value={amountReceived || ''} onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)} placeholder="0.00" autoFocus />
                </div>
                {amountReceived > 0 && change >= 0 && (
                  <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                    <p className="text-xs text-green-800 font-bold">💰 CAMBIO:</p>
                    <p className="text-3xl font-bold text-green-600">${change.toLocaleString()}</p>
                  </div>
                )}
                {amountReceived > 0 && change < 0 && (
                  <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                    <p className="text-xs text-red-800 font-bold">⚠️ FALTA:</p>
                    <p className="text-2xl font-bold text-red-600">${Math.abs(change).toLocaleString()}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPaymentMethod('')} className="bg-gray-200 py-3 rounded-lg hover:bg-gray-300 font-bold">← ATRÁS</button>
                  <button onClick={completeSale} disabled={amountReceived < total} className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 font-bold">✓ CONFIRMAR</button>
                </div>
              </div>
            )}

            {paymentMethod === 'Tarjeta' && (
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
                  <CreditCard size={40} className="mx-auto mb-2 text-blue-600" />
                  <p className="font-bold text-blue-900">Pago con Tarjeta</p>
                  <p className="text-xl font-bold text-blue-700 mt-1">${total.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPaymentMethod('')} className="bg-gray-200 py-3 rounded-lg hover:bg-gray-300 font-bold">← ATRÁS</button>
                  <button onClick={completeSale} className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold">✓ CONFIRMAR</button>
                </div>
              </div>
            )}

            {paymentMethod === 'Transferencia' && (
              <div className="space-y-2">
                <div className="p-3 bg-purple-50 border-2 border-purple-200 rounded-lg text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-purple-600"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  <p className="font-bold text-purple-900">Pago con Transferencia</p>
                  <p className="text-xl font-bold text-purple-700 mt-1">${total.toLocaleString()}</p>
                  <p className="text-xs text-purple-600 mt-2">💡 Confirma que recibiste la transferencia</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPaymentMethod('')} className="bg-gray-200 py-3 rounded-lg hover:bg-gray-300 font-bold">← ATRÁS</button>
                  <button onClick={completeSale} className="bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-bold">✓ CONFIRMAR</button>
                </div>
              </div>
            )}

            {paymentMethod === 'Fiado' && showCreditForm && (
              <div className="space-y-2">
                <div className="p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
                  <h4 className="font-bold text-orange-900 mb-2">📝 DATOS DEL CLIENTE</h4>
                  <input type="text" placeholder="Nombre completo *" className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg mb-2" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                  <input type="tel" placeholder="Teléfono *" className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
                  <p className="text-xs text-orange-700 mt-2">💡 Se registra fecha/hora automática</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setPaymentMethod(''); setShowCreditForm(false); setCustomerName(''); setCustomerPhone(''); }} className="bg-gray-200 py-3 rounded-lg hover:bg-gray-300 font-bold">← ATRÁS</button>
                  <button onClick={completeSale} disabled={!customerName.trim() || !customerPhone.trim()} className="bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 font-bold">✓ REGISTRAR</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== CONFIRMACIÓN VISUAL DE VENTA ==================== */}
      {showSaleConfirmation && lastSaleData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md transform animate-scale-in">
            <div className={`p-8 rounded-t-3xl text-white text-center ${
              lastSaleData.type === 'credit' ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle size={48} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {lastSaleData.type === 'credit' ? '¡FIADO REGISTRADO!' : '¡VENTA EXITOSA!'}
              </h2>
              <p className="text-5xl font-black mt-4">${lastSaleData.total.toLocaleString()}</p>
            </div>
            <div className="p-6 text-center">
              <div className="space-y-2 text-gray-600">
                {lastSaleData.type === 'credit' ? (
                  <p className="text-lg">Cliente: <span className="font-bold text-gray-800">{lastSaleData.customerName}</span></p>
                ) : (
                  <>
                    <p className="text-lg">Método: <span className="font-bold text-gray-800">{lastSaleData.paymentMethod}</span></p>
                    {lastSaleData.change > 0 && (
                      <div className="mt-3 p-3 bg-green-50 rounded-xl border-2 border-green-200">
                        <p className="text-sm text-green-700">Cambio a entregar:</p>
                        <p className="text-3xl font-bold text-green-600">${lastSaleData.change.toLocaleString()}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-4">Este mensaje se cerrará automáticamente...</p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL AUTENTICACIÓN ADMIN ==================== */}
      {showAdminAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={32} />
                  <div>
                    <h3 className="text-2xl font-bold">Autorización Requerida</h3>
                    <p className="text-sm opacity-90">
                      {pendingAction === 'paidIn' ? 'Entrada de Efectivo' : 
                       pendingAction === 'paidOut' ? 'Salida de Efectivo' : 
                       pendingAction === 'refund' ? 'Devolución de Producto' : 'Acción'}
                    </p>
                  </div>
                </div>
                <button onClick={cancelAdminAuth} className="hover:bg-white/20 p-2 rounded-lg transition">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 text-center">
                <Lock className="mx-auto mb-2 text-yellow-600" size={32} />
                <p className="text-yellow-800 font-bold">🔐 Solo administradores pueden realizar esta acción</p>
                <p className="text-sm text-yellow-700 mt-1">Ingresa las credenciales de un administrador</p>
              </div>

              {authError && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 text-center">
                  <p className="text-red-700 font-bold">{authError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">👤 Usuario Administrador</label>
                <div className="relative">
                  <User className="absolute left-4 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Nombre de usuario"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🔑 Contraseña o PIN</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3 text-gray-400" size={20} />
                  <input
                    ref={adminPasswordRef}
                    type="password"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Contraseña o PIN"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        verifyAdminCredentials();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={cancelAdminAuth} className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 font-bold">
                  Cancelar
                </button>
                <button onClick={verifyAdminCredentials} className="flex-1 bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 font-bold flex items-center justify-center gap-2">
                  <Shield size={20} />
                  Verificar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL PAID IN ==================== */}
      {showPaidInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ArrowDownCircle size={32} />
                  <div>
                    <h3 className="text-2xl font-bold">Entrada de Efectivo</h3>
                    <p className="text-sm opacity-90">Paid In - Dinero que entra a caja</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPaidInModal(false);
                    setPaidAmount('');
                    setPaidDescription('');
                    setPaidCategory('Otros');
                    setAuthenticatedAdmin(null);
                  }}
                  className="hover:bg-white/20 p-2 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {authenticatedAdmin && (
              <div className="bg-green-100 px-6 py-2 flex items-center gap-2 text-green-800">
                <Shield size={16} />
                <span className="text-sm font-semibold">Autorizado por: {authenticatedAdmin.name}</span>
              </div>
            )}

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">💵 Monto *</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 text-xl">$</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border-2 border-green-300 rounded-xl text-2xl font-bold focus:outline-none focus:ring-4 focus:ring-green-200"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">📁 Categoría</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-200"
                  value={paidCategory}
                  onChange={(e) => setPaidCategory(e.target.value)}
                >
                  {paidInCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">📝 Descripción *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-200"
                  value={paidDescription}
                  onChange={(e) => setPaidDescription(e.target.value)}
                  placeholder="Ej: Préstamo del dueño para cambio"
                />
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-800"><strong>💡 Este monto se sumará a los ingresos del turno</strong></p>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Aumenta el efectivo esperado en caja</li>
                  <li>• Se registra en el cierre de turno</li>
                  <li>• Queda registro del administrador que autorizó</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPaidInModal(false);
                    setPaidAmount('');
                    setPaidDescription('');
                    setPaidCategory('Otros');
                    setAuthenticatedAdmin(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePaidIn}
                  className="flex-1 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 font-bold flex items-center justify-center gap-2"
                >
                  <ArrowDownCircle size={20} />
                  Registrar Entrada
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL PAID OUT ==================== */}
      {showPaidOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ArrowUpCircle size={32} />
                  <div>
                    <h3 className="text-2xl font-bold">Salida de Efectivo</h3>
                    <p className="text-sm opacity-90">Paid Out - Dinero que sale de caja</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPaidOutModal(false);
                    setPaidAmount('');
                    setPaidDescription('');
                    setPaidCategory('Otros');
                    setAuthenticatedAdmin(null);
                  }}
                  className="hover:bg-white/20 p-2 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {authenticatedAdmin && (
              <div className="bg-red-100 px-6 py-2 flex items-center gap-2 text-red-800">
                <Shield size={16} />
                <span className="text-sm font-semibold">Autorizado por: {authenticatedAdmin.name}</span>
              </div>
            )}

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">💸 Monto *</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 text-xl">$</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border-2 border-red-300 rounded-xl text-2xl font-bold focus:outline-none focus:ring-4 focus:ring-red-200"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">📁 Categoría</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-200"
                  value={paidCategory}
                  onChange={(e) => setPaidCategory(e.target.value)}
                >
                  {paidOutCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">📝 Descripción *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-200"
                  value={paidDescription}
                  onChange={(e) => setPaidDescription(e.target.value)}
                  placeholder="Ej: Pago a proveedor de pan"
                />
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800"><strong>⚠️ Este dinero se descontará de la caja</strong></p>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>• Se registrará como gasto en efectivo</li>
                  <li>• Reduce el efectivo esperado en caja</li>
                  <li>• Aparece en el cierre de turno y reportes</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPaidOutModal(false);
                    setPaidAmount('');
                    setPaidDescription('');
                    setPaidCategory('Otros');
                    setAuthenticatedAdmin(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePaidOut}
                  className="flex-1 bg-red-600 text-white py-4 rounded-xl hover:bg-red-700 font-bold flex items-center justify-center gap-2"
                >
                  <ArrowUpCircle size={20} />
                  Registrar Salida
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DEVOLUCIONES ==================== */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RotateCcw size={32} />
                  <div>
                    <h3 className="text-2xl font-bold">Devolución de Producto</h3>
                    <p className="text-sm opacity-90">Procesar reembolso al cliente</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedSaleForRefund(null);
                    setRefundItems([]);
                    setRefundReason('');
                    setRefundSearch('');
                    setAuthenticatedAdmin(null);
                  }}
                  className="hover:bg-white/20 p-2 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {authenticatedAdmin && (
              <div className="bg-orange-100 px-6 py-2 flex items-center gap-2 text-orange-800">
                <Shield size={16} />
                <span className="text-sm font-semibold">Autorizado por: {authenticatedAdmin.name}</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Buscar venta */}
              {!selectedSaleForRefund && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">🔍 Buscar Venta</label>
                    <input
                      ref={refundSearchRef}
                      type="text"
                      className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-200"
                      value={refundSearch}
                      onChange={(e) => setRefundSearch(e.target.value)}
                      placeholder="ID de venta, nombre de producto o fecha..."
                    />
                  </div>

                  {/* Resultados */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchSalesForRefund().map(sale => (
                      <div
                        key={sale.id}
                        onClick={() => setSelectedSaleForRefund(sale)}
                        className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-800">Venta #{sale.id}</p>
                            <p className="text-sm text-gray-600">{sale.date} - {sale.time}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {sale.products?.map(p => p.name).join(', ').substring(0, 50)}...
                            </p>
                          </div>
                          <p className="font-bold text-green-600">${sale.total?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    {refundSearch && searchSalesForRefund().length === 0 && (
                      <p className="text-center text-gray-500 py-8">No se encontraron ventas</p>
                    )}
                  </div>
                </>
              )}

              {/* Venta seleccionada */}
              {selectedSaleForRefund && (
                <>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-bold text-blue-800">Venta #{selectedSaleForRefund.id}</p>
                        <p className="text-sm text-blue-600">{selectedSaleForRefund.date} - {selectedSaleForRefund.time}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSaleForRefund(null);
                          setRefundItems([]);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                      >
                        Cambiar venta
                      </button>
                    </div>
                  </div>

                  {/* Productos de la venta */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">📦 Selecciona productos a devolver</label>
                    <div className="space-y-2">
                      {selectedSaleForRefund.products?.map((product, idx) => {
                        const isSelected = refundItems.some(item => 
                          item.productId === product.id && item.saleProductIndex === idx
                        );
                        const refundItem = refundItems.find(item => 
                          item.productId === product.id && item.saleProductIndex === idx
                        );
                        const refundItemIndex = refundItems.findIndex(item => 
                          item.productId === product.id && item.saleProductIndex === idx
                        );

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border-2 transition ${
                              isSelected ? 'bg-orange-50 border-orange-400' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div 
                                className="flex-1 cursor-pointer"
                                onClick={() => toggleRefundItem(product, { ...product, index: idx })}
                              >
                                <p className="font-bold text-gray-800">{product.name}</p>
                                <p className="text-sm text-gray-600">${product.price} x {product.quantity}</p>
                              </div>
                              {isSelected && refundItem && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateRefundItemQuantity(refundItemIndex, refundItem.quantity - 1)}
                                    className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="w-8 text-center font-bold">{refundItem.quantity}</span>
                                  <button
                                    onClick={() => updateRefundItemQuantity(refundItemIndex, refundItem.quantity + 1)}
                                    className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center"
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                              )}
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleRefundItem(product, { ...product, index: idx })}
                                className="w-5 h-5 ml-3 accent-orange-600"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Motivo y método */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">📝 Motivo *</label>
                      <select
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        {refundReasons.map(reason => (
                          <option key={reason} value={reason}>{reason}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">💰 Método reembolso</label>
                      <select
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                        value={refundMethod}
                        onChange={(e) => setRefundMethod(e.target.value)}
                      >
                        <option value="efectivo">Efectivo</option>
                        <option value="credito">Crédito en tienda</option>
                        <option value="original">Mismo método original</option>
                      </select>
                    </div>
                  </div>

                  {/* Total a devolver */}
                  {calculateRefundTotal() > 0 && (
                    <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 text-center">
                      <p className="text-sm text-orange-700">Total a devolver:</p>
                      <p className="text-3xl font-bold text-orange-600">${calculateRefundTotal().toLocaleString()}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Botones */}
            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedSaleForRefund(null);
                  setRefundItems([]);
                  setRefundReason('');
                  setRefundSearch('');
                  setAuthenticatedAdmin(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 font-bold"
              >
                Cancelar
              </button>
              {selectedSaleForRefund && (
                <button
                  onClick={handleRefund}
                  disabled={calculateRefundTotal() === 0 || !refundReason}
                  className="flex-1 bg-orange-600 text-white py-4 rounded-xl hover:bg-orange-700 disabled:bg-gray-300 font-bold flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  Procesar Devolución
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL PACKS ==================== */}
      {showPacksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Boxes size={32} />
                  <div>
                    <h3 className="text-2xl font-bold">Packs / Combos</h3>
                    <p className="text-sm opacity-90">Vender productos agrupados</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPacksModal(false);
                    setPackSearch('');
                    setSelectedPack(null);
                  }}
                  className="hover:bg-white/20 p-2 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-4 border-b">
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-200"
                value={packSearch}
                onChange={(e) => setPackSearch(e.target.value)}
                placeholder="🔍 Buscar pack..."
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {getAvailablePacks().length === 0 ? (
                <div className="text-center py-12">
                  <PackageOpen size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-bold">No hay packs disponibles</p>
                  <p className="text-gray-400 text-sm mt-1">Crea packs en la sección de Productos</p>
                </div>
              ) : (
                getAvailablePacks().map(pack => (
                  <div
                    key={pack.id}
                    className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl hover:border-indigo-400 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-indigo-900 text-lg">📦 {pack.name}</h4>
                        <p className="text-sm text-indigo-700 mt-1">{pack.description || 'Sin descripción'}</p>
                        <div className="mt-2 text-xs text-indigo-600">
                          <p className="font-semibold">Contiene:</p>
                          <ul className="list-disc list-inside">
                            {pack.components?.map((comp, idx) => {
                              const prod = products.find(p => p.id === comp.productId);
                              return (
                                <li key={idx}>{comp.quantity}x {prod?.name || 'Producto'}</li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">${pack.price?.toLocaleString()}</p>
                        <button
                          onClick={() => addPackToCart(pack)}
                          className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-bold text-sm"
                        >
                          + Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t">
              <button
                onClick={() => {
                  setShowPacksModal(false);
                  setPackSearch('');
                  setSelectedPack(null);
                }}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS para animaciones */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};