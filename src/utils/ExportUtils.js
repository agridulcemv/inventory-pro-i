import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ==================== FUNCIONES DE PDF ====================

export const exportToPDF = (reportType, data, title) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('Generado: ' + new Date().toLocaleDateString('es-ES'), pageWidth / 2, 32, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  
  let yPosition = 50;
  
  switch(reportType) {
    case 'daily-summary':
      exportDailySummaryPDF(doc, data, yPosition);
      break;
    case 'sales':
      exportSalesPDF(doc, data, yPosition);
      break;
    case 'inventory':
      exportInventoryPDF(doc, data, yPosition);
      break;
    case 'credits':
      exportCreditsPDF(doc, data, yPosition);
      break;
    case 'low-stock':
      exportLowStockPDF(doc, data, yPosition);
      break;
    case 'top-products':
      exportTopProductsPDF(doc, data, yPosition);
      break;
    default:
      doc.text('Reporte no disponible', 20, yPosition);
  }
  
  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      'Pagina ' + i + ' de ' + totalPages,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
  
  doc.save(title.replace(/\s+/g, '_') + '_' + new Date().toISOString().split('T')[0] + '.pdf');
};

const exportDailySummaryPDF = (doc, data, yPosition) => {
  const { date, sales, expenses, balance } = data;
  
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Resumen del Dia - ' + date, 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  
  const kpis = [
    ['Total Ventas', '$' + sales.total.toLocaleString()],
    ['Total Gastos', '$' + expenses.total.toLocaleString()],
    ['Balance Final', '$' + balance.toLocaleString()],
  ];
  
  doc.autoTable({
    startY: yPosition,
    head: [['Concepto', 'Monto']],
    body: kpis,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Ventas por Metodo de Pago', 20, yPosition);
  yPosition += 10;
  
  const salesByMethod = Object.entries(sales.byMethod).map(([method, amount]) => [
    method,
    '$' + amount.toLocaleString()
  ]);
  
  doc.autoTable({
    startY: yPosition,
    head: [['Metodo de Pago', 'Monto']],
    body: salesByMethod,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
    margin: { left: 20, right: 20 },
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  if (expenses.byCategory && Object.keys(expenses.byCategory).length > 0) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Gastos por Categoria', 20, yPosition);
    yPosition += 10;
    
    const expensesByCategory = Object.entries(expenses.byCategory).map(([category, amount]) => [
      category,
      '$' + amount.toLocaleString()
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Categoria', 'Monto']],
      body: expensesByCategory,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
      margin: { left: 20, right: 20 },
    });
  }
};

const exportSalesPDF = (doc, data, yPosition) => {
  const { sales, period } = data;
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Periodo: ' + period, 20, yPosition);
  yPosition += 10;
  
  const tableData = sales.map(sale => [
    sale.date,
    sale.time,
    sale.products.map(p => p.name + ' (x' + p.quantity + ')').join(', '),
    '$' + sale.total.toFixed(0),
    sale.paymentMethod
  ]);
  
  doc.autoTable({
    startY: yPosition,
    head: [['Fecha', 'Hora', 'Productos', 'Total', 'Pago']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 9 },
  });
  
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  yPosition = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Total Ventas: $' + totalSales.toLocaleString(), 20, yPosition);
  doc.text('Numero de Ventas: ' + sales.length, 20, yPosition + 10);
};

const exportInventoryPDF = (doc, data, yPosition) => {
  const { products } = data;
  
  const tableData = products.map(p => [
    p.name,
    p.category,
    p.stock.toString(),
    p.minStock.toString(),
    '$' + p.price.toFixed(0),
    '$' + p.cost.toFixed(0),
    p.supplier
  ]);
  
  doc.autoTable({
    startY: yPosition,
    head: [['Producto', 'Categoria', 'Stock', 'Min', 'Precio', 'Costo', 'Proveedor']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 8 },
  });
  
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const totalCost = products.reduce((sum, p) => sum + (p.stock * p.cost), 0);
  yPosition = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Total Productos: ' + products.length, 20, yPosition);
  doc.text('Valor Total: $' + totalValue.toLocaleString(), 20, yPosition + 8);
  doc.text('Costo Total: $' + totalCost.toLocaleString(), 20, yPosition + 16);
};

const exportCreditsPDF = (doc, data, yPosition) => {
  const { credits } = data;
  
  const tableData = credits.map(c => [
    c.customerName,
    c.phone,
    c.date,
    c.dueDate,
    '$' + c.total.toFixed(0),
    '$' + c.amountPaid.toFixed(0),
    '$' + c.amountDue.toFixed(0),
    c.status
  ]);
  
  doc.autoTable({
    startY: yPosition,
    head: [['Cliente', 'Telefono', 'Fecha', 'Vence', 'Total', 'Pagado', 'Debe', 'Estado']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 8 },
  });
  
  const totalDue = credits.filter(c => c.status === 'Pendiente').reduce((sum, c) => sum + c.amountDue, 0);
  yPosition = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Total por Cobrar: $' + totalDue.toLocaleString(), 20, yPosition);
  doc.text('Clientes con Deuda: ' + credits.filter(c => c.status === 'Pendiente').length, 20, yPosition + 8);
};

const exportLowStockPDF = (doc, data, yPosition) => {
  const { products } = data;
  
  const tableData = products.map(p => [
    p.name,
    p.category,
    p.stock.toString(),
    p.minStock.toString(),
    p.supplier,
    '$' + (p.price * (p.minStock - p.stock)).toFixed(0)
  ]);
  
  doc.autoTable({
    startY: yPosition,
    head: [['Producto', 'Categoria', 'Stock', 'Minimo', 'Proveedor', 'Costo Reposicion']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 9 },
  });
  
  const totalRestock = products.reduce((sum, p) => sum + (p.price * (p.minStock - p.stock)), 0);
  yPosition = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(239, 68, 68);
  doc.text(products.length + ' productos necesitan reposicion', 20, yPosition);
  doc.text('Inversion estimada: $' + totalRestock.toLocaleString(), 20, yPosition + 8);
};

const exportTopProductsPDF = (doc, data, yPosition) => {
  const { products } = data;
  
  const tableData = products.map((p, i) => [
    (i + 1).toString(),
    p.name,
    p.quantity.toString(),
    '$' + p.revenue.toFixed(0),
    '$' + p.profit.toFixed(0),
    p.margin.toFixed(1) + '%'
  ]);
  
  doc.autoTable({
    startY: yPosition,
    head: [['#', 'Producto', 'Vendidos', 'Ingresos', 'Ganancia', 'Margen']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94] },
    margin: { left: 20, right: 20 },
  });
  
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
  const totalProfit = products.reduce((sum, p) => sum + p.profit, 0);
  yPosition = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Total Ingresos: $' + totalRevenue.toLocaleString(), 20, yPosition);
  doc.text('Total Ganancia: $' + totalProfit.toLocaleString(), 20, yPosition + 8);
};

// ==================== FUNCIONES DE EXCEL ====================

export const exportToExcel = (reportType, data, title) => {
  let worksheetData = [];
  let worksheetName = 'Reporte';
  
  switch(reportType) {
    case 'daily-summary':
      worksheetData = prepareDailySummaryExcel(data);
      worksheetName = 'Resumen del Dia';
      break;
    case 'sales':
      worksheetData = prepareSalesExcel(data);
      worksheetName = 'Ventas';
      break;
    case 'inventory':
      worksheetData = prepareInventoryExcel(data);
      worksheetName = 'Inventario';
      break;
    case 'credits':
      worksheetData = prepareCreditsExcel(data);
      worksheetName = 'Creditos';
      break;
    case 'low-stock':
      worksheetData = prepareLowStockExcel(data);
      worksheetName = 'Stock Bajo';
      break;
    case 'top-products':
      worksheetData = prepareTopProductsExcel(data);
      worksheetName = 'Top Productos';
      break;
    default:
      worksheetData = [['Reporte no disponible']];
  }
  
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, worksheetName);
  
  const maxWidth = worksheetData.reduce((max, row) => {
    return Math.max(max, ...row.map(cell => String(cell).length));
  }, 10);
  
  ws['!cols'] = worksheetData[0].map(() => ({ wch: Math.min(maxWidth, 30) }));
  
  XLSX.writeFile(wb, title.replace(/\s+/g, '_') + '_' + new Date().toISOString().split('T')[0] + '.xlsx');
};

const prepareDailySummaryExcel = (data) => {
  const { date, sales, expenses, balance } = data;
  
  const rows = [
    ['RESUMEN DEL DIA'],
    ['Fecha: ' + date],
    [],
    ['VENTAS'],
    ['Metodo de Pago', 'Monto'],
    ...Object.entries(sales.byMethod).map(([method, amount]) => [method, '$' + amount.toLocaleString()]),
    ['TOTAL VENTAS', '$' + sales.total.toLocaleString()],
    [],
    ['GASTOS'],
    ['Categoria', 'Monto'],
  ];
  
  if (expenses.byCategory && Object.keys(expenses.byCategory).length > 0) {
    rows.push(...Object.entries(expenses.byCategory).map(([category, amount]) => [category, '$' + amount.toLocaleString()]));
  }
  
  rows.push(
    ['TOTAL GASTOS', '$' + expenses.total.toLocaleString()],
    [],
    ['BALANCE FINAL', '$' + balance.toLocaleString()]
  );
  
  return rows;
};

const prepareSalesExcel = (data) => {
  const { sales, period } = data;
  
  const rows = [
    ['REPORTE DE VENTAS'],
    ['Periodo: ' + period],
    [],
    ['Fecha', 'Hora', 'Productos', 'Subtotal', 'Descuento', 'Total', 'Metodo de Pago'],
    ...sales.map(sale => [
      sale.date,
      sale.time,
      sale.products.map(p => p.name + ' (x' + p.quantity + ')').join(', '),
      '$' + sale.subtotal.toFixed(0),
      '$' + (sale.discount || 0).toFixed(0),
      '$' + sale.total.toFixed(0),
      sale.paymentMethod
    ]),
    [],
    ['TOTAL', '', '', '', '', '$' + sales.reduce((sum, s) => sum + s.total, 0).toLocaleString(), '']
  ];
  
  return rows;
};

const prepareInventoryExcel = (data) => {
  const { products } = data;
  
  const rows = [
    ['INVENTARIO DE PRODUCTOS'],
    [],
    ['Producto', 'Categoria', 'Stock', 'Stock Minimo', 'Precio', 'Costo', 'Proveedor', 'Codigo de Barras'],
    ...products.map(p => [
      p.name,
      p.category,
      p.stock,
      p.minStock,
      '$' + p.price.toFixed(0),
      '$' + p.cost.toFixed(0),
      p.supplier,
      p.barcode
    ]),
    [],
    ['TOTAL PRODUCTOS', products.length],
    ['VALOR TOTAL', '$' + products.reduce((sum, p) => sum + (p.stock * p.price), 0).toLocaleString()],
    ['COSTO TOTAL', '$' + products.reduce((sum, p) => sum + (p.stock * p.cost), 0).toLocaleString()]
  ];
  
  return rows;
};

const prepareCreditsExcel = (data) => {
  const { credits } = data;
  
  const rows = [
    ['REPORTE DE CREDITOS'],
    [],
    ['Cliente', 'Telefono', 'Fecha', 'Vencimiento', 'Total', 'Pagado', 'Debe', 'Estado'],
    ...credits.map(c => [
      c.customerName,
      c.phone,
      c.date,
      c.dueDate,
      '$' + c.total.toFixed(0),
      '$' + c.amountPaid.toFixed(0),
      '$' + c.amountDue.toFixed(0),
      c.status
    ]),
    [],
    ['TOTAL POR COBRAR', '$' + credits.filter(c => c.status === 'Pendiente').reduce((sum, c) => sum + c.amountDue, 0).toLocaleString()],
    ['CLIENTES CON DEUDA', credits.filter(c => c.status === 'Pendiente').length]
  ];
  
  return rows;
};

const prepareLowStockExcel = (data) => {
  const { products } = data;
  
  const rows = [
    ['PRODUCTOS CON STOCK BAJO'],
    [],
    ['Producto', 'Categoria', 'Stock Actual', 'Stock Minimo', 'Faltante', 'Proveedor', 'Costo Reposicion'],
    ...products.map(p => [
      p.name,
      p.category,
      p.stock,
      p.minStock,
      p.minStock - p.stock,
      p.supplier,
      '$' + (p.price * (p.minStock - p.stock)).toFixed(0)
    ]),
    [],
    ['PRODUCTOS AFECTADOS', products.length],
    ['INVERSION ESTIMADA', '$' + products.reduce((sum, p) => sum + (p.price * (p.minStock - p.stock)), 0).toLocaleString()]
  ];
  
  return rows;
};

const prepareTopProductsExcel = (data) => {
  const { products } = data;
  
  const rows = [
    ['TOP PRODUCTOS MAS VENDIDOS'],
    [],
    ['Posicion', 'Producto', 'Cantidad Vendida', 'Ingresos', 'Ganancia', 'Margen %'],
    ...products.map((p, i) => [
      i + 1,
      p.name,
      p.quantity,
      '$' + p.revenue.toFixed(0),
      '$' + p.profit.toFixed(0),
      p.margin.toFixed(1) + '%'
    ]),
    [],
    ['TOTAL INGRESOS', '$' + products.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()],
    ['TOTAL GANANCIA', '$' + products.reduce((sum, p) => sum + p.profit, 0).toLocaleString()]
  ];
  
  return rows;
};