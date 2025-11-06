import React from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { KPICard } from './KPICard';

export const DashboardView = () => {
  const { orders } = useInventory();
  const analytics = useAnalytics();
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899'];

  const priceHistory = [
    { date: '2025-10-01', laptop: 1200, mouse: 95, audifonos: 375 },
    { date: '2025-10-08', laptop: 1180, mouse: 98, audifonos: 378 },
    { date: '2025-10-15', laptop: 1190, mouse: 99, audifonos: 380 },
    { date: '2025-10-22', laptop: 1200, mouse: 99, audifonos: 380 },
    { date: '2025-10-29', laptop: 1200, mouse: 99, audifonos: 380 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Valor Total Inventario"
          value={`$${analytics.totalInventoryValue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-blue-100"
        />
        <KPICard
          title="Productos en Stock"
          value={analytics.totalProducts}
          icon={Package}
          color="bg-green-100"
        />
        <KPICard
          title="Margen Promedio"
          value={`${analytics.avgMargin.toFixed(1)}%`}
          icon={TrendingUp}
          color="bg-purple-100"
        />
        <KPICard
          title="Alertas Stock Bajo"
          value={analytics.lowStockProducts.length}
          icon={AlertTriangle}
          color="bg-red-100"
        />
      </div>

      {analytics.lowStockProducts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start">
            <AlertTriangle className="text-red-500 mr-3 mt-1" size={20} />
            <div>
              <h3 className="text-red-800 font-semibold">Productos con Stock Bajo</h3>
              <ul className="mt-2 space-y-1">
                {analytics.lowStockProducts.map(p => (
                  <li key={p.id} className="text-red-700 text-sm">
                    {p.name}: {p.stock} unidades (mínimo: {p.minStock})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Distribución por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={entry => entry.name}
                outerRadius={100}
                dataKey="value"
              >
                {analytics.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Tendencia de Precios</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="laptop" stroke="#3b82f6" name="Laptop" />
              <Line type="monotone" dataKey="mouse" stroke="#8b5cf6" name="Mouse" />
              <Line type="monotone" dataKey="audifonos" stroke="#ec4899" name="Audífonos" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Órdenes Recientes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Proveedor</th>
                <th className="text-left py-3 px-4">Producto</th>
                <th className="text-left py-3 px-4">Cantidad</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{order.supplier}</td>
                  <td className="py-3 px-4">{order.product}</td>
                  <td className="py-3 px-4">{order.quantity}</td>
                  <td className="py-3 px-4">${order.total.toLocaleString()}</td>
                  <td className="py-3 px-4">{order.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${order.status === 'Entregado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};