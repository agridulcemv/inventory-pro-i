import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, DollarSign, ShoppingCart, CreditCard, AlertCircle } from 'lucide-react';

const ShiftCloseModal = ({ isOpen, onClose, onConfirm, shiftData, config }) => {
  const [realCash, setRealCash] = useState('');
  const [justification, setJustification] = useState('');
  const [notesForNext, setNotesForNext] = useState('');

  if (!isOpen) return null;

  const {
    userName,
    startTime,
    initialCash,
    salesByMethod,
    totalSales,
    totalExpenses,
    totalPayments,
    transactions,
    creditsCreated,
    paymentsReceived,
    productsSold
  } = shiftData;

  // Calcular duración del turno
  const duration = Math.floor((new Date() - new Date(startTime)) / 1000 / 60); // minutos
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  // Calcular efectivo esperado
  const expectedCash = initialCash + salesByMethod.Efectivo + totalPayments - totalExpenses;

  // Calcular diferencia
  const difference = realCash ? parseFloat(realCash) - expectedCash : 0;
  const hasDifference = Math.abs(difference) > 0.01;

  const handleClose = () => {
    if (hasDifference && Math.abs(difference) > 10 && !justification) {
      alert('⚠️ Por favor justifica la diferencia de caja');
      return;
    }

    const closeData = {
      ...shiftData,
      endTime: new Date().toISOString(),
      duration: duration,
      expectedCash,
      realCash: parseFloat(realCash) || 0,
      difference,
      justification,
      notesForNext
    };

    onConfirm(closeData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">📊 Resumen del Turno</h2>
              <p className="text-sm opacity-90 mt-1">Verifica los datos antes de cerrar</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Info del turno */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">👤 Usuario</p>
                <p className="font-bold text-lg">{userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">🕐 Duración</p>
                <p className="font-bold text-lg">{hours}h {minutes}min</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">📅 Fecha</p>
                <p className="font-bold text-lg">
                  {new Date(startTime).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>

          {/* Efectivo */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-700">
              <DollarSign size={24} />
              Movimiento de Efectivo
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Monto inicial:</span>
                <span className="font-bold">${initialCash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Ventas en efectivo:</span>
                <span className="font-bold">+${salesByMethod.Efectivo.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Abonos recibidos:</span>
                <span className="font-bold">+${totalPayments.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Gastos:</span>
                <span className="font-bold">-${totalExpenses.toLocaleString()}</span>
              </div>
              <div className="border-t-2 border-green-300 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Efectivo esperado:</span>
                  <span className="font-bold text-2xl text-green-600">
                    ${expectedCash.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Otros métodos */}
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <CreditCard size={20} />
              Otros Métodos de Pago
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tarjeta</p>
                <p className="font-bold">${salesByMethod.Tarjeta.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transferencia</p>
                <p className="font-bold">${salesByMethod.Transferencia.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fiado (Crédito)</p>
                <p className="font-bold">${salesByMethod['Crédito (Fiado)'].toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Totales */}
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <ShoppingCart size={20} />
              Resumen del Turno
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Ventas</p>
                <p className="font-bold text-green-600">${totalSales.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Gastos</p>
                <p className="font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Balance</p>
                <p className="font-bold text-blue-600">${(totalSales - totalExpenses).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transacciones</p>
                <p className="font-bold">{transactions}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t">
              <div>
                <p className="text-sm text-gray-600">🛒 Ventas</p>
                <p className="font-bold">{transactions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">💰 Créditos creados</p>
                <p className="font-bold">{creditsCreated}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">✅ Abonos recibidos</p>
                <p className="font-bold">{paymentsReceived}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-gray-600">📦 Productos vendidos</p>
              <p className="font-bold text-lg">{productsSold} unidades</p>
            </div>
          </div>

          {/* Arqueo de caja */}
          <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-300">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-800">
              💵 Arqueo de Caja
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                El efectivo que debe haber en caja es: 
                <span className="font-bold text-2xl text-yellow-800 ml-2">
                  ${expectedCash.toLocaleString()}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Efectivo real contado:
              </label>
              <input
                type="number"
                value={realCash}
                onChange={(e) => setRealCash(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-xl font-bold"
                placeholder="0"
                min="0"
                autoFocus
              />
            </div>

            {realCash && hasDifference && (
              <div className={`mt-4 p-4 rounded-lg ${
                difference > 0 ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={20} className={difference > 0 ? 'text-green-600' : 'text-red-600'} />
                  <p className={`font-bold ${difference > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {difference > 0 ? 'Sobrante' : 'Faltante'}: ${Math.abs(difference).toLocaleString()}
                  </p>
                </div>

                {Math.abs(difference) > 10 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Justificación (obligatorio):
                    </label>
                    <textarea
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      rows="2"
                      placeholder="Ej: Error en cambio de venta #123"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notas para siguiente turno */}
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📝 Notas para el siguiente turno (opcional):
            </label>
            <textarea
              value={notesForNext}
              onChange={(e) => setNotesForNext(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              rows="3"
              placeholder="Ej: Faltan reponer bolsas, Cliente X viene mañana..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-bold"
            >
              Cancelar
            </button>
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 font-bold flex items-center justify-center gap-2"
            >
              🔒 Cerrar Turno
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftCloseModal;