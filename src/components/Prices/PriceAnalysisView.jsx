import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';

export const PriceAnalysisView = () => {
  const { products } = useInventory();

  // Competidores simulados (en producción vendría de una API)
  const competitors = [
    { id: 1, name: 'Competidor A', product: 'Laptop Dell XPS 13', price: 1250 },
    { id: 2, name: 'Competidor B', product: 'Laptop Dell XPS 13', price: 1180 },
    { id: 3, name: 'Competidor A', product: 'Mouse Logitech MX Master', price: 105 },
    { id: 4, name: 'Competidor C', product: 'Mouse Logitech MX Master', price: 95 },
    { id: 5, name: 'Competidor B', product: 'Teclado Mecánico Keychron', price: 125 },
    { id: 6, name: 'Competidor A', product: 'Monitor Samsung 27"', price: 360 },
  ];

  const priceHistory = [
    { date: '10/01', laptop: 1200, mouse: 95, teclado: 115, monitor: 340, audifonos: 375 },
    { date: '10/08', laptop: 1180, mouse: 98, teclado: 118, monitor: 345, audifonos: 378 },
    { date: '10/15', laptop: 1190, mouse: 99, teclado: 120, monitor: 350, audifonos: 380 },
    { date: '10/22', laptop: 1200, mouse: 99, teclado: 120, monitor: 350, audifonos: 380 },
    { date: '10/29', laptop: 1200, mouse: 99, teclado: 120, monitor: 350, audifonos: 380 },
  ];

  const marginData = useMemo(() => 
    products.map(p => ({
      name: p.name.split(' ').slice(0, 3).join(' '),
      margen: parseFloat(((p.price - p.cost) / p.price * 100).toFixed(1)),
      ganancia: (p.price - p.cost) * p.stock
    })).sort((a, b) => b.margen - a.margen),
    [products]
  );

  const avgMargin = useMemo(() => 
    products.reduce((sum, p) => sum + ((p.price - p.cost) / p.price * 100), 0) / products.length,
    [products]
  );

  const totalProfit = useMemo(() => 
    products.reduce((sum, p) => sum + ((p.price - p.cost) * p.stock), 0),
    [products]
  );

  const bestProduct = useMemo(() => 
    products.reduce((best, p) => {
      const margin = (p.price - p.cost) * p.stock;
      const bestMargin = (best.price - best.cost) * best.stock;
      return margin > bestMargin ? p : best;
    }),
    [products]
  );

  const worstProduct = useMemo(() => 
    products.reduce((worst, p) => {
      const margin = ((p.price - p.cost) / p.price * 100);
      const worstMargin = ((worst.price - worst.cost) / worst.price * 100);
      return margin < worstMargin ? p : worst;
    }),
    [products]
  );

  return (
    <div className="space-y-6">
      {/* KPIs de Precios */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Margen Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{avgMargin.toFixed(1)}%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Percent className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ganancia Potencial</p>
              <p className="text-2xl font-bold text-gray-900">${totalProfit.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mejor Producto</p>
              <p className="text-sm font-bold text-gray-900">{bestProduct.name.split(' ').slice(0, 2).join(' ')}</p>
              <p className="text-xs text-green-600">+{((bestProduct.price - bestProduct.cost) / bestProduct.price * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Menor Margen</p>
              <p className="text-sm font-bold text-gray-900">{worstProduct.name.split(' ').slice(0, 2).join(' ')}</p>
              <p className="text-xs text-red-600">{((worstProduct.price - worstProduct.cost) / worstProduct.price * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Análisis de Márgenes por Producto</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marginData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="margen" fill="#8b5cf6" name="Margen %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Tendencia de Precios (Últimas 5 Semanas)</h3>
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

      {/* Comparación con Competencia */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Comparación con Competencia</h3>
        <div className="space-y-4">
          {products.map(product => {
            const productCompetitors = competitors.filter(c => c.product === product.name);
            if (productCompetitors.length === 0) return null;
            
            const avgCompPrice = productCompetitors.reduce((sum, c) => sum + c.price, 0) / productCompetitors.length;
            const priceDiff = ((product.price - avgCompPrice) / avgCompPrice * 100).toFixed(1);
            const isCompetitive = parseFloat(priceDiff) <= 0;
            
            return (
              <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{product.name}</h4>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-gray-600">Tu precio: <span className="font-semibold text-blue-600">${product.price}</span></span>
                      <span className="text-gray-600">Promedio mercado: <span className="font-semibold">${avgCompPrice.toFixed(0)}</span></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-lg font-semibold ${
                      isCompetitive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isCompetitive ? '✓ Competitivo' : '⚠ Precio Alto'}
                    </span>
                    <span className={`text-lg font-bold ${
                      parseFloat(priceDiff) > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {parseFloat(priceDiff) > 0 ? '+' : ''}{priceDiff}%
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Precios de competidores:</p>
                  <div className="flex flex-wrap gap-3">
                    {productCompetitors.map(comp => (
                      <div key={comp.id} className="bg-gray-50 px-3 py-2 rounded text-sm">
                        <span className="text-gray-600">{comp.name}:</span>
                        <span className="font-semibold ml-1">${comp.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {!isCompetitive && (
                  <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="text-sm text-yellow-800">
                      💡 <strong>Recomendación:</strong> Considera ajustar tu precio a ${(avgCompPrice * 0.95).toFixed(0)} para ser más competitivo.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla de Análisis Detallado */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Análisis Detallado de Rentabilidad</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Producto</th>
                <th className="text-left py-3 px-4 font-semibold">Precio</th>
                <th className="text-left py-3 px-4 font-semibold">Costo</th>
                <th className="text-left py-3 px-4 font-semibold">Margen %</th>
                <th className="text-left py-3 px-4 font-semibold">Ganancia/Unidad</th>
                <th className="text-left py-3 px-4 font-semibold">Stock</th>
                <th className="text-left py-3 px-4 font-semibold">Ganancia Total</th>
              </tr>
            </thead>
            <tbody>
              {products
                .map(p => ({
                  ...p,
                  margin: ((p.price - p.cost) / p.price * 100).toFixed(1),
                  unitProfit: p.price - p.cost,
                  totalProfit: (p.price - p.cost) * p.stock
                }))
                .sort((a, b) => b.totalProfit - a.totalProfit)
                .map(product => (
                  <tr key={product.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4">${product.price}</td>
                    <td className="py-3 px-4">${product.cost}</td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${
                        parseFloat(product.margin) > 30 ? 'text-green-600' : 
                        parseFloat(product.margin) > 20 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {product.margin}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-green-600 font-semibold">${product.unitProfit}</td>
                    <td className="py-3 px-4">{product.stock}</td>
                    <td className="py-3 px-4 text-green-600 font-bold">${product.totalProfit.toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};