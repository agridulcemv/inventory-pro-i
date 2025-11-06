import React, { useState } from 'react';
import { InventoryProvider } from './contexts/InventoryContext';
import { DashboardView } from './components/Dashboard/DashboardView';
import { ProductsView } from './components/Products/ProductsView';
import { PriceAnalysisView } from './components/Prices/PriceAnalysisView';
import { SuppliersView } from './components/Suppliers/SuppliersView';
import { ReportsView } from './components/Reports/ReportsView';
import { OrdersView } from './components/Orders/OrdersView';
import { SalesView } from './components/Sales/SalesView';
import { AIAssistantPanel } from './components/AI/AIAssistantPanel';
import { Home, Package, TrendingUp, Users, FileText, ShoppingCart, DollarSign, Bell, Settings, MessageSquare } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  return (
    <InventoryProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">InventoryPro AI</h1>
                <p className="text-sm opacity-90">Sistema de Gestión Inteligente</p>
              </div>
              <div className="flex items-center gap-3">
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
                <button className="hover:bg-white/20 p-2 rounded-lg transition" title="Configuración">
                  <Settings size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-lg min-h-screen">
            <nav className="p-4 space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Home },
                { id: 'products', label: 'Productos', icon: Package },
                { id: 'sales', label: 'Ventas', icon: DollarSign },
                { id: 'orders', label: 'Órdenes', icon: ShoppingCart },
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
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'products' && 'Gestión de Productos'}
                {activeTab === 'sales' && 'Ventas y Punto de Venta'}
                {activeTab === 'orders' && 'Órdenes de Compra'}
                {activeTab === 'prices' && 'Análisis de Precios'}
                {activeTab === 'suppliers' && 'Gestión de Proveedores'}
                {activeTab === 'reports' && 'Reportes y Análisis'}
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === 'dashboard' && 'Vista general de tu inventario'}
                {activeTab === 'products' && 'Administra tu catálogo de productos'}
                {activeTab === 'sales' && 'Gestiona ventas, fiados y cobros'}
                {activeTab === 'orders' && 'Gestiona órdenes de compra y reabastecimiento'}
                {activeTab === 'prices' && 'Análisis de precios y competencia'}
                {activeTab === 'suppliers' && 'Gestión de proveedores y contactos'}
                {activeTab === 'reports' && 'Genera reportes detallados y exporta datos'}
              </p>
            </div>

            {/* Render Views */}
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'products' && <ProductsView />}
            {activeTab === 'sales' && <SalesView />}
            {activeTab === 'orders' && <OrdersView />}
            {activeTab === 'prices' && <PriceAnalysisView />}
            {activeTab === 'suppliers' && <SuppliersView />}
            {activeTab === 'reports' && <ReportsView />}
          </div>
        </div>

        {/* AI Assistant Panel */}
        <AIAssistantPanel 
          isOpen={showAIAssistant} 
          onClose={() => setShowAIAssistant(false)} 
        />
      </div>
    </InventoryProvider>
  );
}

export default App;