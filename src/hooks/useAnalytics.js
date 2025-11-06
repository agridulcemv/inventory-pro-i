import { useMemo } from 'react';
import { useInventory } from '../contexts/InventoryContext';

export const useAnalytics = () => {
  const { products, orders } = useInventory();
  
  return useMemo(() => {
    const lowStockProducts = products.filter(p => p.stock <= p.minStock);
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
    const avgMargin = products.reduce((sum, p) => sum + ((p.price - p.cost) / p.price * 100), 0) / products.length;
    
    const categoryData = ['Electrónica', 'Accesorios', 'Audio'].map(cat => ({
      name: cat,
      value: products.filter(p => p.category === cat).length,
      amount: products.filter(p => p.category === cat).reduce((sum, p) => sum + (p.stock * p.price), 0)
    }));
    
    return {
      lowStockProducts,
      totalInventoryValue,
      avgMargin,
      categoryData,
      totalProducts: products.length,
      pendingOrders: orders.filter(o => o.status !== 'Entregado').length
    };
  }, [products, orders]);
};