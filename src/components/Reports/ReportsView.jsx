import React, { useMemo, useState } from 'react';
import { Download, FileText, TrendingUp, Package, DollarSign, Calendar, Filter } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useInventory } from '../../contexts/InventoryContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const ReportsView = () => {
  const { products, suppliers, orders } = useInventory();
  const analytics = useAnalytics();
  const [dateRange, setDateRange] = useState('all');
  const [reportType, setReportType] = useState('general');

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  // Datos para reportes
  const inventoryByCategory = useMemo(() => 
    analytics.categoryData.map(cat => ({
      name: cat.name,
      productos: cat.value,
      valor: cat.amount
    })),
    [analytics.categoryData]
  );

  const topProducts = useMemo(() => 
    products
      .map(p => ({
        name: p.name,
        valor: p.stock * p.price,
        margen: ((p.price - p.cost) / p.price * 100).toFixed(1),
        ganancia: (p.price - p.cost) * p.stock
      }))
      .sort((a, b) => b.ganancia - a.ganancia)
      .slice(0, 10),
    [products]
  );

  const supplierStats = useMemo(() => 
    suppliers.map(s => ({
      nombre: s.name,
      productos: products.filter(p => p.supplier === s.name).length,
      calificacion: s.rating,
      valor: products
        .filter(p => p.supplier === s.name)
        .reduce((sum, p) => sum + (p.stock * p.price), 0)
    })),
    [suppliers, products]
  );

  const lowStockReport = useMemo(() => 
    products
      .filter(p => p.stock <= p.minStock)
      .map(p => ({
        producto: p.name,
        stockActual: p.stock,
        stockMinimo: p.minStock,
        faltante: Math.max(p.minStock * 2 - p.stock, 0),
        costoReposicion: Math.max(p.minStock * 2 - p.stock, 0) * p.cost,
        proveedor: p.supplier
      })),
    [products]
  );

  // Función para exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Inventario', pageWidth / 2, 20, { align: 'center' });
    
    // Fecha
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 28, { align: 'center' });
    
    // Resumen Ejecutivo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen Ejecutivo', 14, 40);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Productos: ${analytics.totalProducts}`, 14, 48);
    doc.text(`Valor Total Inventario: $${analytics.totalInventoryValue.toLocaleString()}`, 14, 54);
    doc.text(`Margen Promedio: ${analytics.avgMargin.toFixed(1)}%`, 14, 60);
    doc.text(`Productos con Stock Bajo: ${analytics.lowStockProducts.length}`, 14, 66);
    
    // Tabla de Productos
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Inventario por Categoría', 14, 80);
    
    doc.autoTable({
      startY: 85,
      head: [['Categoría', 'Productos', 'Valor Total']],
      body: inventoryByCategory.map(item => [
        item.name,
        item.productos,
        `$${item.valor.toLocaleString()}`
      ]),
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Top 10 Productos
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top 10 Productos Más Rentables', 14, 20);
    
    doc.autoTable({
      startY: 25,
      head: [['Producto', 'Valor', 'Margen %', 'Ganancia']],
      body: topProducts.map(item => [
        item.name,
        `$${item.valor.toLocaleString()}`,
        `${item.margen}%`,
        `$${item.ganancia.toLocaleString()}`
      ]),
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Alertas de Stock Bajo
    if (lowStockReport.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Alertas de Stock Bajo', 14, 20);
      
      doc.autoTable({
        startY: 25,
        head: [['Producto', 'Stock', 'Mínimo', 'Faltante', 'Costo Repos.', 'Proveedor']],
        body: lowStockReport.map(item => [
          item.producto,
          item.stockActual,
          item.stockMinimo,
          item.faltante,
          `$${item.costoReposicion.toLocaleString()}`,
          item.proveedor
        ]),
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [239, 68, 68] }
      });
    }
    
    // Proveedores
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen de Proveedores', 14, 20);
    
    doc.autoTable({
      startY: 25,
      head: [['Proveedor', 'Productos', 'Calificación', 'Valor Total']],
      body: supplierStats.map(item => [
        item.nombre,
        item.productos,
        `⭐ ${item.calificacion}`,
        `$${item.valor.toLocaleString()}`
      ]),
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Guardar PDF
    doc.save(`Reporte_Inventario_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Hoja 1: Resumen
    const resumenData = [
      ['REPORTE DE INVENTARIO'],
      ['Fecha:', new Date().toLocaleDateString('es-ES')],
      [''],
      ['RESUMEN EJECUTIVO'],
      ['Total de Productos:', analytics.totalProducts],
      ['Valor Total Inventario:', `$${analytics.totalInventoryValue.toLocaleString()}`],
      ['Margen Promedio:', `${analytics.avgMargin.toFixed(1)}%`],
      ['Productos con Stock Bajo:', analytics.lowStockProducts.length],
      [''],
      ['INVENTARIO POR CATEGORÍA'],
      ['Categoría', 'Cantidad Productos', 'Valor Total'],
      ...inventoryByCategory.map(item => [item.name, item.productos, item.valor])
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');
    
    // Hoja 2: Todos los Productos
    const productosData = products.map(p => ({
      'Producto': p.name,
      'Categoría': p.category,
      'Stock': p.stock,
      'Stock Mínimo': p.minStock,
      'Precio': p.price,
      'Costo': p.cost,
      'Margen %': ((p.price - p.cost) / p.price * 100).toFixed(1),
      'Valor Total': p.stock * p.price,
      'Proveedor': p.supplier,
      'Última Actualización': p.lastUpdate
    }));
    const ws2 = XLSX.utils.json_to_sheet(productosData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Productos');
    
    // Hoja 3: Top Productos
    const topData = topProducts.map(p => ({
      'Producto': p.name,
      'Valor': p.valor,
      'Margen %': p.margen,
      'Ganancia Total': p.ganancia
    }));
    const ws3 = XLSX.utils.json_to_sheet(topData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Top Productos');
    
    // Hoja 4: Stock Bajo
    if (lowStockReport.length > 0) {
      const stockBajoData = lowStockReport.map(item => ({
        'Producto': item.producto,
        'Stock Actual': item.stockActual,
        'Stock Mínimo': item.stockMinimo,
        'Unidades Faltantes': item.faltante,
        'Costo Reposición': item.costoReposicion,
        'Proveedor': item.proveedor
      }));
      const ws4 = XLSX.utils.json_to_sheet(stockBajoData);
      XLSX.utils.book_append_sheet(wb, ws4, 'Stock Bajo');
    }
    
    // Hoja 5: Proveedores
    const proveedoresData = supplierStats.map(s => ({
      'Proveedor': s.nombre,
      'Cantidad Productos': s.productos,
      'Calificación': s.calificacion,
      'Valor Total': s.valor
    }));
    const ws5 = XLSX.utils.json_to_sheet(proveedoresData);
    XLSX.utils.book_append_sheet(wb, ws5, 'Proveedores');
    
    // Hoja 6: Órdenes
    const ordenesData = orders.map(o => ({
      'Proveedor': o.supplier,
      'Producto': o.product,
      'Cantidad': o.quantity,
      'Total': o.total,
      'Fecha': o.date,
      'Estado': o.status
    }));
    const ws6 = XLSX.utils.json_to_sheet(ordenesData);
    XLSX.utils.book_append_sheet(wb, ws6, 'Órdenes');
    
    // Guardar Excel
    XLSX.writeFile(wb, `Reporte_Inventario_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Función para exportar datos específicos
  const exportCustomReport = () => {
    if (reportType === 'general') {
      exportToPDF();
    } else if (reportType === 'stockBajo') {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Reporte de Stock Bajo', 14, 20);
      doc.autoTable({
        startY: 30,
        head: [['Producto', 'Stock', 'Mínimo', 'Faltante', 'Costo', 'Proveedor']],
        body: lowStockReport.map(item => [
          item.producto,
          item.stockActual,
          item.stockMinimo,
          item.faltante,
          `$${item.costoReposicion.toLocaleString()}`,
          item.proveedor
        ])
      });
      doc.save('Reporte_Stock_Bajo.pdf');
    } else if (reportType === 'rentabilidad') {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Reporte de Rentabilidad', 14, 20);
      doc.autoTable({
        startY: 30,
        head: [['Producto', 'Valor', 'Margen %', 'Ganancia']],
        body: topProducts.map(item => [
          item.name,
          `$${item.valor.toLocaleString()}`,
          `${item.margen}%`,
          `$${item.ganancia.toLocaleString()}`
        ])
      });
      doc.save('Reporte_Rentabilidad.pdf');
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles de Filtros y Exportación */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold">Generador de Reportes</h3>
            <p className="text-sm text-gray-600 mt-1">Exporta y analiza datos de tu inventario</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="general">Reporte General</option>
              <option value="stockBajo">Stock Bajo</option>
              <option value="rentabilidad">Rentabilidad</option>
            </select>

            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">Todo el tiempo</option>
              <option value="month">Último mes</option>
              <option value="quarter">Último trimestre</option>
              <option value="year">Último año</option>
            </select>
            
            <button
              onClick={exportToPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition"
            >
              <Download size={20} />
              Exportar PDF
            </button>
            
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition"
            >
              <Download size={20} />
              Exportar Excel
            </button>
          </div>
        </div>
      </div>

      {/* KPIs Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Productos</p>
              <p className="text-3xl font-bold mt-1">{analytics.totalProducts}</p>
              <p className="text-xs opacity-75 mt-1">{products.reduce((sum, p) => sum + p.stock, 0)} unidades</p>
            </div>
            <Package size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Valor Inventario</p>
              <p className="text-3xl font-bold mt-1">${(analytics.totalInventoryValue / 1000).toFixed(1)}K</p>
              <p className="text-xs opacity-75 mt-1">Total en stock</p>
            </div>
            <DollarSign size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Margen Promedio</p>
              <p className="text-3xl font-bold mt-1">{analytics.avgMargin.toFixed(1)}%</p>
              <p className="text-xs opacity-75 mt-1">Rentabilidad</p>
            </div>
            <TrendingUp size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Última Actualización</p>
              <p className="text-2xl font-bold mt-1">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
              <p className="text-xs opacity-75 mt-1">Hoy</p>
            </div>
            <Calendar size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Distribución de Valor por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={inventoryByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: $${(entry.valor / 1000).toFixed(1)}K`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="valor"
              >
                {inventoryByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top 5 Productos por Ganancia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="ganancia" fill="#10b981" name="Ganancia" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de Inventario por Categoría */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Resumen por Categoría</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Categoría</th>
                <th className="text-left py-3 px-4 font-semibold">Productos</th>
                <th className="text-left py-3 px-4 font-semibold">Valor Total</th>
                <th className="text-left py-3 px-4 font-semibold">% del Total</th>
              </tr>
            </thead>
            <tbody>
              {inventoryByCategory.map((cat, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{backgroundColor: COLORS[idx % COLORS.length]}}
                      ></div>
                      {cat.name}
                    </div>
                  </td>
                  <td className="py-3 px-4">{cat.productos}</td>
                  <td className="py-3 px-4 font-semibold text-green-600">
                    ${cat.valor.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${(cat.valor / analytics.totalInventoryValue * 100)}%`}}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">
                        {(cat.valor / analytics.totalInventoryValue * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas de Stock Bajo */}
      {lowStockReport.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b bg-red-50">
            <div className="flex items-center gap-2">
              <div className="bg-red-500 text-white p-2 rounded">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900">
                  Reporte de Stock Bajo ({lowStockReport.length} productos)
                </h3>
                <p className="text-sm text-red-700">
                  Costo total de reposición: ${lowStockReport.reduce((sum, item) => sum + item.costoReposicion, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Producto</th>
                  <th className="text-left py-3 px-4 font-semibold">Stock Actual</th>
                  <th className="text-left py-3 px-4 font-semibold">Stock Mínimo</th>
                  <th className="text-left py-3 px-4 font-semibold">Unidades Faltantes</th>
                  <th className="text-left py-3 px-4 font-semibold">Costo Reposición</th>
                  <th className="text-left py-3 px-4 font-semibold">Proveedor</th>
                </tr>
              </thead>
              <tbody>
                {lowStockReport.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-medium">{item.producto}</td>
                    <td className="py-3 px-4">
                      <span className="text-red-600 font-semibold">{item.stockActual}</span>
                    </td>
                    <td className="py-3 px-4">{item.stockMinimo}</td>
                    <td className="py-3 px-4">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold text-sm">
                        {item.faltante}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-orange-600">
                      ${item.costoReposicion.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm">{item.proveedor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top 10 Productos Más Rentables */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Top 10 Productos Más Rentables</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">#</th>
                <th className="text-left py-3 px-4 font-semibold">Producto</th>
                <th className="text-left py-3 px-4 font-semibold">Valor en Stock</th>
                <th className="text-left py-3 px-4 font-semibold">Margen %</th>
                <th className="text-left py-3 px-4 font-semibold">Ganancia Total</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                      idx === 1 ? 'bg-gray-100 text-gray-800' :
                      idx === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-50 text-blue-800'
                    }`}>
                      {idx + 1}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{product.name}</td>
                  <td className="py-3 px-4">${product.valor.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-semibold text-sm">
                      {product.margen}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-green-600 text-lg">
                    ${product.ganancia.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de Proveedores */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Resumen de Proveedores</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Proveedor</th>
                <th className="text-left py-3 px-4 font-semibold">Cantidad Productos</th>
                <th className="text-left py-3 px-4 font-semibold">Calificación</th>
                <th className="text-left py-3 px-4 font-semibold">Valor Total en Stock</th>
              </tr>
            </thead>
            <tbody>
              {supplierStats
                .sort((a, b) => b.valor - a.valor)
                .map((supplier, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-medium">{supplier.nombre}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold text-sm">
                        {supplier.productos}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold">{supplier.calificacion}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-600">
                      ${supplier.valor.toLocaleString()}
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