import React, { useState, useEffect } from 'react';
import { User, Clock, DollarSign, LogOut } from 'lucide-react';

const UserHeader = ({ currentShift, onCloseShift }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('');
  const [currentCash, setCurrentCash] = useState(0);

  // Actualizar tiempo transcurrido cada minuto
  useEffect(() => {
    const updateTime = () => {
      if (!currentShift) return;
      
      const start = new Date(currentShift.startTime);
      const now = new Date();
      const diff = Math.floor((now - start) / 1000 / 60); // minutos
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      
      setElapsedTime(`${hours}h ${minutes}m`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, [currentShift]);

  // Calcular efectivo en caja
  useEffect(() => {
    if (!currentShift) return;
    
    const cash = currentShift.initialCash + 
                 (currentShift.cashSales || 0) + 
                 (currentShift.cashPayments || 0) - 
                 (currentShift.cashExpenses || 0);
    
    setCurrentCash(cash);
  }, [currentShift]);

  if (!currentShift) return null;

  const startTime = new Date(currentShift.startTime).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="relative">
      {/* Botón compacto */}
      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
      >
        <User size={20} />
        <span className="font-semibold">{currentShift.userName}</span>
        <span className="text-xs opacity-75">▾</span>
      </button>

      {/* Panel expandido */}
      {isHovered && (
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-2xl p-4 min-w-[280px] z-50 animate-fadeIn"
        >
          {/* Info del usuario */}
          <div className="mb-4 pb-4 border-b">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {currentShift.userName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-800">{currentShift.userName}</p>
                <p className="text-sm text-gray-500">{currentShift.userRole}</p>
              </div>
            </div>
          </div>

          {/* Estadísticas del turno */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <Clock className="text-blue-600" size={20} />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Inicio del turno</p>
                <p className="font-semibold text-gray-800">{startTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="text-green-600" size={20} />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Tiempo trabajado</p>
                <p className="font-semibold text-gray-800">{elapsedTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="text-purple-600" size={20} />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Efectivo en caja</p>
                <p className="font-semibold text-gray-800">${currentCash.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Botón cerrar turno */}
          <button
            onClick={onCloseShift}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg hover:from-red-700 hover:to-orange-700 font-bold flex items-center justify-center gap-2 transition-all"
          >
            <LogOut size={20} />
            Cerrar Turno
          </button>
        </div>
      )}

      {/* CSS para animación */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserHeader;