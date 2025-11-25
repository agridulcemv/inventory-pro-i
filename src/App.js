import React, { useState, useEffect } from 'react';
import { InventoryProvider, useInventory } from './contexts/InventoryContext';
import { DashboardView } from './components/Dashboard/DashboardView';
import { ProductsView } from './components/Products/ProductsView';
import { PriceAnalysisView } from './components/Prices/PriceAnalysisView';
import { SuppliersView } from './components/Suppliers/SuppliersView';
import ReportsView from './components/Reports/ReportsView';
import { OrdersExpensesView } from './components/Orders/OrdersView';
import { SalesView } from './components/Sales/SalesView';
import { AIAssistantPanel } from './components/AI/AIAssistantPanel';
import { POSView } from './components/POS/POSView';
import ConfigurationView from './components/Configuration/ConfigurationView';
import LoginView from './components/Auth/LoginView';
import UserHeader from './components/Auth/UserHeader';
import ShiftCloseModal from './components/Auth/ShiftCloseModal';
import { 
  Home, Package, TrendingUp, Users, FileText, ShoppingCart, 
  DollarSign, Bell, Settings, MessageSquare 
} from 'lucide-react';

// Ícono de caja registradora personalizado
const CashRegisterIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="13" width="20" height="8" rx="1" />
    <path d="M6 13V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" />
    <circle cx="8" cy="17" r="1" />
    <circle cx="12" cy="17" r="1" />
    <circle cx="16" cy="17" r="1" />
    <path d="M12 7v2" />
  </svg>
);

// Componente interno que usa el contexto
const AppContent = () => {
  const { config, currentShift, setCurrentShift, addShiftToHistory, updateShiftData } = useInventory();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showPOS, setShowPOS] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);

  // Verificar si el usuario necesita hacer login
  const needsLogin = config?.mode24hrs && !currentShift;

  // Manejar login
  const handleLogin = (loginData) => {
    setCurrentShift(loginData);
  };

  // Manejar cierre de turno
  const handleCloseShift = () => {
    setShowCloseShiftModal(true);
  };

  // Confirmar cierre de turno
  const handleConfirmCloseShift = (closeData) => {
    // Guardar en historial
    addShiftToHistory(closeData);
    
    // Limpiar turno actual
    setCurrentShift(null);
    
    // Cerrar modal
    setShowCloseShiftModal(false);
    
    // Volver a dashboard
    setActiveTab('dashboard');
  };

  // Atajo de teclado F12 para abrir POS
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        if (!needsLogin) {
          setShowPOS(prev => !prev);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [needsLogin]);

  // Si necesita login, mostrar pantalla de login
  if (needsLogin) {
    return <LoginView onLogin={handleLogin} config={config} />;
  }

  // Preparar datos del turno para el modal de cierre
  const shiftDataForClose = currentShift ? {
    ...currentShift,
    salesByMethod: currentShift.salesByMethod || {
      'Efectivo': 0,
      'Tarjeta': 0,
      'Transferencia': 0,
      'Crédito (Fiado)': 0
    },
    totalSales: currentShift.totalSales || 0,
    totalExpenses: currentShift.totalExpenses || 0,
    totalPayments: currentShift.totalPayments || 0,
    transactions: currentShift.transactions || 0,
    creditsCreated: currentShift.creditsCreated || 0,
    paymentsReceived: currentShift.paymentsReceived || 0,
    productsSold: currentShift.productsSold || 0
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="w-full px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {config?.businessName || 'InventoryPro AI'}
              </h1>
              <p className="text-sm opacity-90">
                {config?.businessSlogan || 'Sistema de Gestión Inteligente'}
              </p>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <button className="hover:bg-white/20 p-2 rounded-lg transition" title="Notificaciones">
                <Bell size={20} />
              </button>
              <button 
                onClick={() => setShowAIAssistant(true)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <MessageSquare size={20} />
                <span className="hidden md:inline">Asistente IA</span>
              </button>
              
              {/* Header de usuario si hay turno activo */}
              {currentShift && (
                <UserHeader 
                  currentShift={currentShift} 
                  onCloseShift={handleCloseShift}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="p-4 space-y-2">
            {/* Título del sidebar */}
            <p className="text-xs text-gray-500 px-4 mb-2 font-semibold uppercase">Menú de Control</p>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'products', label: 'Productos', icon: Package },
              { id: 'sales', label: 'Ventas', icon: DollarSign },
              { id: 'orders', label: 'Órdenes y Gastos', icon: ShoppingCart },
              { id: 'prices', label: 'Análisis de Precios', icon: TrendingUp },
              { id: 'suppliers', label: 'Proveedores', icon: Users },
              { id: 'reports', label: 'Reportes', icon: FileText },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Separador */}
            <div className="pt-4 mt-4 border-t">
              <p className="text-xs text-gray-500 px-4 mb-2 font-semibold uppercase">Punto de Venta</p>
              
              {/* Botón especial POS */}
              <button
                onClick={() => setShowPOS(true)}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-lg transition bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <CashRegisterIcon size={24} />
                <div className="text-left">
                  <div className="font-bold">Caja Registradora</div>
                  <div className="text-xs opacity-90">Venta rápida (F12)</div>
                </div>
              </button>
            </div>

            {/* Configuración al final */}
            <div className="pt-4 mt-4 border-t">
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === 'settings'
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings size={20} />
                <span>Configuración</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'products' && 'Gestión de Productos'}
              {activeTab === 'sales' && 'Ventas y Punto de Venta'}
              {activeTab === 'orders' && 'Órdenes y Gastos'}
              {activeTab === 'prices' && 'Análisis de Precios'}
              {activeTab === 'suppliers' && 'Gestión de Proveedores'}
              {activeTab === 'reports' && 'Reportes y Análisis'}
              {activeTab === 'settings' && 'Configuración del Sistema'}
            </h2>
            <p className="text-gray-600 mt-1">
              {activeTab === 'dashboard' && 'Vista general de tu inventario'}
              {activeTab === 'products' && 'Administra tu catálogo de productos'}
              {activeTab === 'sales' && 'Gestiona ventas, fiados y cobros'}
              {activeTab === 'orders' && 'Gestión de órdenes a proveedores, compras recibidas y gastos operativos'}
              {activeTab === 'prices' && 'Análisis de precios y competencia'}
              {activeTab === 'suppliers' && 'Gestión de proveedores y contactos'}
              {activeTab === 'reports' && 'Genera reportes detallados y exporta datos'}
              {activeTab === 'settings' && 'Personaliza tu sistema y gestiona turnos'}
            </p>
          </div>

          {/* Render Views */}
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'sales' && <SalesView />}
          {activeTab === 'orders' && <OrdersExpensesView />}
          {activeTab === 'prices' && <PriceAnalysisView />}
          {activeTab === 'suppliers' && <SuppliersView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <ConfigurationView />}
        </div>
      </div>

      {/* Botón flotante adicional de caja registradora */}
      <button
        onClick={() => setShowPOS(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all z-40 group"
        title="Abrir Caja Registradora (F12)"
      >
        <CashRegisterIcon size={32} />
        <span className="absolute -top-12 right-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Caja (F12)
        </span>
      </button>

      {/* AI Assistant Panel */}
      <AIAssistantPanel 
        isOpen={showAIAssistant} 
        onClose={() => setShowAIAssistant(false)} 
      />

      {/* POS View */}
      <POSView 
        isOpen={showPOS} 
        onClose={() => setShowPOS(false)} 
      />

      {/* Modal de Cierre de Turno */}
      {showCloseShiftModal && shiftDataForClose && (
        <ShiftCloseModal
          isOpen={showCloseShiftModal}
          onClose={() => setShowCloseShiftModal(false)}
          onConfirm={handleConfirmCloseShift}
          shiftData={shiftDataForClose}
          config={config}
        />
      )}
    </div>
  );
};

// Componente principal que envuelve todo en el Provider
function App() {
  return (
    <InventoryProvider>
      <AppContent />
    </InventoryProvider>
  );
}

export default App;