import React, { useState } from 'react';
import { Lock, User, DollarSign, Eye, EyeOff } from 'lucide-react';

const LoginView = ({ onLogin, config }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [initialCash, setInitialCash] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');

    // Validar campos
    if (!username || !password) {
      setError('⚠️ Por favor ingresa usuario y contraseña');
      return;
    }

    if (!initialCash || parseFloat(initialCash) < 0) {
      setError('⚠️ Por favor ingresa un monto inicial válido');
      return;
    }

    // Buscar usuario
    const user = config.users?.find(u => 
      (u.name.toLowerCase() === username.toLowerCase() || u.pin === password) && 
      (u.password === password || u.pin === password)
    );

    if (!user) {
      setError('❌ Usuario o contraseña incorrectos');
      return;
    }

    // Login exitoso - crear objeto de turno
    onLogin({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      startTime: new Date().toISOString(),
      initialCash: parseFloat(initialCash),
      notes: notes,
      salesByMethod: {
        'Efectivo': 0,
        'Tarjeta': 0,
        'Transferencia': 0,
        'Crédito (Fiado)': 0
      },
      totalSales: 0,
      totalExpenses: 0,
      totalPayments: 0,
      transactions: 0,
      creditsCreated: 0,
      paymentsReceived: 0,
      productsSold: 0,
      cashSales: 0,
      cashExpenses: 0,
      cashPayments: 0
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // Obtener notas del último turno
  const lastShift = config.shiftHistory && config.shiftHistory.length > 0 
    ? config.shiftHistory[config.shiftHistory.length - 1] 
    : null;
  const lastNotes = lastShift?.notesForNext || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Lock className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {config.businessName || 'InventoryPro AI'}
          </h1>
          <p className="text-gray-600 mt-2">Apertura de Turno</p>
        </div>

        {/* Notas del turno anterior */}
        {lastNotes && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <p className="text-sm font-semibold text-yellow-800 mb-2">📝 Notas del turno anterior:</p>
            <p className="text-sm text-gray-700">{lastNotes}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Formulario */}
        <div className="space-y-4">
          {/* Usuario */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Usuario
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Nombre de usuario"
                autoFocus
              />
            </div>
          </div>

          {/* Contraseña/PIN */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña o PIN
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Contraseña o PIN de 4 dígitos"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Monto inicial */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💵 Monto inicial en caja (Efectivo)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                value={initialCash}
                onChange={(e) => setInitialCash(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ingresa el monto en efectivo con el que comienzas el turno
            </p>
          </div>

          {/* Notas (opcional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              rows="2"
              placeholder="Observaciones o pendientes..."
            />
          </div>
        </div>

        {/* Botón de login */}
        <button
          onClick={handleLogin}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          🔓 Iniciar Turno
        </button>

        {/* Info adicional */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Modo 24 Horas Activado</p>
          <p className="text-xs mt-1">Todos los movimientos serán registrados</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;