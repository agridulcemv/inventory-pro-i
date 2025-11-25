import React, { useState, useEffect } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { 
  Settings, Save, Users, History, Trophy, Info, 
  DollarSign, Globe, Calendar, Clock, User, Edit2, Trash2, 
  Eye, ChevronDown, ChevronUp, Download, Filter, Search,
  Shield, Lock, Check, X, AlertTriangle, Key
} from 'lucide-react';

// ==================== DEFINICIÓN DE PERMISOS ====================
const PERMISOS_DISPONIBLES = {
  // Punto de Venta
  pos_vender: { nombre: 'Realizar ventas', categoria: 'Punto de Venta', descripcion: 'Puede realizar ventas en el POS' },
  pos_descuentos: { nombre: 'Aplicar descuentos', categoria: 'Punto de Venta', descripcion: 'Puede aplicar descuentos a ventas' },
  pos_fiado: { nombre: 'Vender a crédito (Fiado)', categoria: 'Punto de Venta', descripcion: 'Puede registrar ventas a crédito' },
  pos_consultar_precio: { nombre: 'Consultar precios', categoria: 'Punto de Venta', descripcion: 'Puede consultar precios de productos' },
  pos_paid_in: { nombre: 'Entrada de efectivo (Paid In)', categoria: 'Punto de Venta', descripcion: 'Puede registrar entradas de efectivo' },
  pos_paid_out: { nombre: 'Salida de efectivo (Paid Out)', categoria: 'Punto de Venta', descripcion: 'Puede registrar salidas de efectivo' },
  
  // Ventas
  ventas_ver: { nombre: 'Ver historial de ventas', categoria: 'Ventas', descripcion: 'Puede ver el historial de ventas' },
  ventas_eliminar: { nombre: 'Eliminar ventas', categoria: 'Ventas', descripcion: 'Puede eliminar ventas del sistema' },
  ventas_devoluciones: { nombre: 'Procesar devoluciones', categoria: 'Ventas', descripcion: 'Puede procesar devoluciones de productos' },
  
  // Créditos
  creditos_ver: { nombre: 'Ver créditos', categoria: 'Créditos', descripcion: 'Puede ver los créditos pendientes' },
  creditos_cobrar: { nombre: 'Registrar pagos', categoria: 'Créditos', descripcion: 'Puede registrar pagos de créditos' },
  creditos_eliminar: { nombre: 'Eliminar créditos', categoria: 'Créditos', descripcion: 'Puede eliminar créditos del sistema' },
  
  // Inventario
  inventario_ver: { nombre: 'Ver inventario', categoria: 'Inventario', descripcion: 'Puede ver el catálogo de productos' },
  inventario_agregar: { nombre: 'Agregar productos', categoria: 'Inventario', descripcion: 'Puede agregar nuevos productos' },
  inventario_editar: { nombre: 'Editar productos', categoria: 'Inventario', descripcion: 'Puede editar productos existentes' },
  inventario_eliminar: { nombre: 'Eliminar productos', categoria: 'Inventario', descripcion: 'Puede eliminar productos del sistema' },
  inventario_ajustar: { nombre: 'Ajustar stock', categoria: 'Inventario', descripcion: 'Puede ajustar cantidades de stock' },
  
  // Gastos
  gastos_ver: { nombre: 'Ver gastos', categoria: 'Gastos', descripcion: 'Puede ver el registro de gastos' },
  gastos_agregar: { nombre: 'Registrar gastos', categoria: 'Gastos', descripcion: 'Puede registrar nuevos gastos' },
  gastos_eliminar: { nombre: 'Eliminar gastos', categoria: 'Gastos', descripcion: 'Puede eliminar gastos del sistema' },
  
  // Órdenes/Compras
  ordenes_ver: { nombre: 'Ver órdenes', categoria: 'Órdenes', descripcion: 'Puede ver las órdenes de compra' },
  ordenes_crear: { nombre: 'Crear órdenes', categoria: 'Órdenes', descripcion: 'Puede crear nuevas órdenes' },
  ordenes_recibir: { nombre: 'Recibir órdenes', categoria: 'Órdenes', descripcion: 'Puede marcar órdenes como recibidas' },
  
  // Reportes
  reportes_ver: { nombre: 'Ver reportes', categoria: 'Reportes', descripcion: 'Puede ver los reportes del sistema' },
  reportes_exportar: { nombre: 'Exportar reportes', categoria: 'Reportes', descripcion: 'Puede exportar reportes a PDF/Excel' },
  
  // Turnos
  turnos_abrir: { nombre: 'Abrir turno', categoria: 'Turnos', descripcion: 'Puede iniciar un turno de trabajo' },
  turnos_cerrar: { nombre: 'Cerrar turno', categoria: 'Turnos', descripcion: 'Puede cerrar su turno de trabajo' },
  turnos_ver_historial: { nombre: 'Ver historial de turnos', categoria: 'Turnos', descripcion: 'Puede ver el historial de turnos' },
  
  // Configuración
  config_ver: { nombre: 'Ver configuración', categoria: 'Configuración', descripcion: 'Puede ver la configuración del sistema' },
  config_editar: { nombre: 'Editar configuración', categoria: 'Configuración', descripcion: 'Puede modificar la configuración' },
  config_usuarios: { nombre: 'Gestionar usuarios', categoria: 'Configuración', descripcion: 'Puede crear, editar y eliminar usuarios' },
  config_roles: { nombre: 'Gestionar roles', categoria: 'Configuración', descripcion: 'Puede modificar roles y permisos' },
};

// ==================== ROLES PREDEFINIDOS ====================
const ROLES_PREDEFINIDOS = {
  'Administrador': {
    descripcion: 'Acceso total al sistema',
    color: 'red',
    permisos: Object.keys(PERMISOS_DISPONIBLES) // Todos los permisos
  },
  'Gerente': {
    descripcion: 'Gestión operativa y reportes',
    color: 'blue',
    permisos: [
      'pos_vender', 'pos_descuentos', 'pos_fiado', 'pos_consultar_precio', 'pos_paid_in', 'pos_paid_out',
      'ventas_ver', 'ventas_eliminar', 'ventas_devoluciones',
      'creditos_ver', 'creditos_cobrar', 'creditos_eliminar',
      'inventario_ver', 'inventario_agregar', 'inventario_editar', 'inventario_ajustar',
      'gastos_ver', 'gastos_agregar',
      'ordenes_ver', 'ordenes_crear', 'ordenes_recibir',
      'reportes_ver', 'reportes_exportar',
      'turnos_abrir', 'turnos_cerrar', 'turnos_ver_historial',
      'config_ver'
    ]
  },
  'Supervisor': {
    descripcion: 'Supervisión de operaciones',
    color: 'purple',
    permisos: [
      'pos_vender', 'pos_descuentos', 'pos_fiado', 'pos_consultar_precio', 'pos_paid_in', 'pos_paid_out',
      'ventas_ver', 'ventas_devoluciones',
      'creditos_ver', 'creditos_cobrar',
      'inventario_ver', 'inventario_agregar', 'inventario_editar',
      'gastos_ver', 'gastos_agregar',
      'ordenes_ver',
      'reportes_ver',
      'turnos_abrir', 'turnos_cerrar', 'turnos_ver_historial'
    ]
  },
  'Cajero': {
    descripcion: 'Operaciones básicas de caja',
    color: 'green',
    permisos: [
      'pos_vender', 'pos_consultar_precio',
      'ventas_ver',
      'creditos_ver', 'creditos_cobrar',
      'inventario_ver',
      'turnos_abrir', 'turnos_cerrar'
    ]
  }
};

const ConfigurationView = () => {
  const { config, updateConfig } = useInventory();
  const [activeTab, setActiveTab] = useState('general');
  const [activeSubTab, setActiveSubTab] = useState('usuarios');
  
  // Estados locales
  const [businessName, setBusinessName] = useState(config?.businessName || 'InventoryPro AI');
  const [businessSlogan, setBusinessSlogan] = useState(config?.businessSlogan || 'Sistema de Gestión Inteligente');
  const [businessAddress, setBusinessAddress] = useState(config?.businessAddress || '');
  const [businessPhone, setBusinessPhone] = useState(config?.businessPhone || '');
  const [businessEmail, setBusinessEmail] = useState(config?.businessEmail || '');
  const [businessWebsite, setBusinessWebsite] = useState(config?.businessWebsite || '');
  const [businessRUT, setBusinessRUT] = useState(config?.businessRUT || '');
  
  const [currency, setCurrency] = useState(config?.currency || '$');
  const [dateFormat, setDateFormat] = useState(config?.dateFormat || 'DD/MM/YYYY');
  const [language, setLanguage] = useState(config?.language || 'es');
  
  const [shiftMode, setShiftMode] = useState(config?.shiftMode || false);
  const [mode24hrs, setMode24hrs] = useState(config?.mode24hrs || false);
  
  const [users, setUsers] = useState(config?.users || []);
  const [shiftHistory, setShiftHistory] = useState(config?.shiftHistory || []);
  const [roles, setRoles] = useState(config?.roles || ROLES_PREDEFINIDOS);
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    role: 'Cajero',
    pin: '',
    password: ''
  });
  
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [expandedShift, setExpandedShift] = useState(null);
  const [expandedRole, setExpandedRole] = useState(null);
  const [showPermisosUsuario, setShowPermisosUsuario] = useState(null);

  // Filtros para historial
  const [filterUser, setFilterUser] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [searchShift, setSearchShift] = useState('');

  // Guardar configuración
  const handleSave = () => {
    const newConfig = {
      businessName,
      businessSlogan,
      businessAddress,
      businessPhone,
      businessEmail,
      businessWebsite,
      businessRUT,
      currency,
      dateFormat,
      language,
      shiftMode,
      mode24hrs,
      users,
      shiftHistory,
      roles
    };
    updateConfig(newConfig);
    alert('✅ Configuración guardada exitosamente');
  };

  // Toggle de modo 24hrs
  const handleMode24hrsToggle = () => {
    if (!mode24hrs) {
      setMode24hrs(true);
      setShiftMode(false);
    } else {
      setMode24hrs(false);
    }
  };

  // Toggle de cierres de turno
  const handleShiftModeToggle = () => {
    if (mode24hrs) {
      setShowInfoModal(true);
    } else {
      setShiftMode(!shiftMode);
    }
  };

  // Agregar/Editar usuario
  const handleSaveUser = () => {
    if (!newUser.name || !newUser.pin || !newUser.password) {
      alert('⚠️ Por favor completa todos los campos');
      return;
    }

    if (newUser.pin.length !== 4 || isNaN(newUser.pin)) {
      alert('⚠️ El PIN debe ser de 4 dígitos');
      return;
    }

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...newUser, id: editingUser.id } : u));
    } else {
      setUsers([...users, { ...newUser, id: Date.now() }]);
    }

    setShowUserModal(false);
    setEditingUser(null);
    setNewUser({ name: '', role: 'Cajero', pin: '', password: '' });
  };

  // Eliminar usuario
  const handleDeleteUser = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  // Obtener permisos de un usuario según su rol
  const getPermisosUsuario = (userRole) => {
    return roles[userRole]?.permisos || [];
  };

  // Verificar si un usuario tiene un permiso específico
  const tienePermiso = (userRole, permiso) => {
    const permisos = getPermisosUsuario(userRole);
    return permisos.includes(permiso);
  };

  // Toggle permiso de un rol
  const togglePermisoRol = (roleName, permiso) => {
    setRoles(prev => {
      const rolActual = prev[roleName];
      const permisosActuales = rolActual.permisos || [];
      
      let nuevosPermisos;
      if (permisosActuales.includes(permiso)) {
        nuevosPermisos = permisosActuales.filter(p => p !== permiso);
      } else {
        nuevosPermisos = [...permisosActuales, permiso];
      }
      
      return {
        ...prev,
        [roleName]: {
          ...rolActual,
          permisos: nuevosPermisos
        }
      };
    });
  };

  // Agrupar permisos por categoría
  const permisosAgrupados = Object.entries(PERMISOS_DISPONIBLES).reduce((acc, [key, value]) => {
    if (!acc[value.categoria]) {
      acc[value.categoria] = [];
    }
    acc[value.categoria].push({ key, ...value });
    return acc;
  }, {});

  // Filtrar historial de turnos
  const filteredShiftHistory = shiftHistory.filter(shift => {
    if (filterUser !== 'all' && shift.userId !== parseInt(filterUser)) {
      return false;
    }
    if (filterPeriod !== 'all') {
      const shiftDate = new Date(shift.endTime);
      const now = new Date();
      if (filterPeriod === 'today') {
        return shiftDate.toDateString() === now.toDateString();
      } else if (filterPeriod === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return shiftDate >= weekAgo;
      } else if (filterPeriod === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return shiftDate >= monthAgo;
      }
    }
    if (searchShift) {
      return shift.userName.toLowerCase().includes(searchShift.toLowerCase());
    }
    return true;
  }).sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

  // Ranking de vendedores
  const ranking = users.map(user => {
    const userShifts = shiftHistory.filter(s => s.userId === user.id);
    const totalProducts = userShifts.reduce((sum, shift) => sum + (shift.productsSold || 0), 0);
    const totalSales = userShifts.reduce((sum, shift) => sum + (shift.totalSales || 0), 0);
    const totalHours = userShifts.reduce((sum, shift) => sum + (shift.duration || 0), 0);
    const shiftsWorked = userShifts.length;
    
    return {
      ...user,
      totalProducts,
      totalSales,
      totalHours: (totalHours / 60).toFixed(1),
      shiftsWorked,
      avgSales: shiftsWorked > 0 ? (totalSales / shiftsWorked).toFixed(0) : 0,
      avgProducts: shiftsWorked > 0 ? (totalProducts / shiftsWorked).toFixed(1) : 0
    };
  }).sort((a, b) => b.totalProducts - a.totalProducts);

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      'Administrador': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
      'Gerente': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
      'Supervisor': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
      'Cajero': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' }
    };
    return colors[role] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
  };

  return (
    <div className="space-y-6">
      {/* Tabs principales */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'general' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings size={20} />
              General
            </button>
            <button
              onClick={() => setActiveTab('turnos')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'turnos' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock size={20} />
              Gestión de Turnos
            </button>
            <button
              onClick={() => setActiveTab('regional')}
              className={`px-6 py-4 font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'regional' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Globe size={20} />
              Regional
            </button>
          </nav>
        </div>
      </div>

      {/* TAB GENERAL */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Settings className="text-blue-600" size={24} />
              Identidad del Negocio
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Negocio</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Mi Negocio"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slogan</label>
                <input
                  type="text"
                  value={businessSlogan}
                  onChange={(e) => setBusinessSlogan(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Tu mejor opción"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">RUT/NIT</label>
                <input
                  type="text"
                  value={businessRUT}
                  onChange={(e) => setBusinessRUT(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="12.345.678-9"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="contacto@negocio.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sitio Web</label>
                <input
                  type="text"
                  value={businessWebsite}
                  onChange={(e) => setBusinessWebsite(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="www.minegocio.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
                <input
                  type="text"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Calle Principal #123, Comuna, Ciudad"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2"
            >
              <Save size={20} />
              Guardar Configuración
            </button>
          </div>
        </div>
      )}

      {/* TAB GESTIÓN DE TURNOS */}
      {activeTab === 'turnos' && (
        <div className="space-y-6">
          {/* Toggles de modos */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6">⚙️ Configuración de Turnos</h3>
            
            <div className="space-y-6">
              {/* Cierres de Turno */}
              <div className="flex items-center justify-between pb-6 border-b">
                <div className="flex items-center gap-3">
                  <Clock className="text-blue-600" size={24} />
                  <div>
                    <h4 className="font-bold text-lg">Cierres de Turno</h4>
                    <p className="text-sm text-gray-600">Registra cierres de caja sin usuarios</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShiftModeToggle}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      shiftMode ? 'bg-blue-600' : 'bg-gray-300'
                    } ${mode24hrs ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={mode24hrs}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        shiftMode ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  {mode24hrs && (
                    <button
                      onClick={() => setShowInfoModal(true)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Info size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Modo 24 Horas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="text-purple-600" size={24} />
                  <div>
                    <h4 className="font-bold text-lg">Modo 24 Horas</h4>
                    <p className="text-sm text-gray-600">Sistema completo con usuarios y control</p>
                  </div>
                </div>
                <button
                  onClick={handleMode24hrsToggle}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    mode24hrs ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      mode24hrs ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Sub-tabs si modo 24hrs está activo */}
          {mode24hrs && (
            <>
              <div className="bg-white rounded-lg shadow">
                <div className="border-b">
                  <nav className="flex overflow-x-auto">
                    <button
                      onClick={() => setActiveSubTab('usuarios')}
                      className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
                        activeSubTab === 'usuarios' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'
                      }`}
                    >
                      <Users size={18} className="inline mr-2" />
                      Usuarios
                    </button>
                    <button
                      onClick={() => setActiveSubTab('roles')}
                      className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
                        activeSubTab === 'roles' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'
                      }`}
                    >
                      <Shield size={18} className="inline mr-2" />
                      Roles y Permisos
                    </button>
                    <button
                      onClick={() => setActiveSubTab('historial')}
                      className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
                        activeSubTab === 'historial' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'
                      }`}
                    >
                      <History size={18} className="inline mr-2" />
                      Historial ({shiftHistory.length})
                    </button>
                    <button
                      onClick={() => setActiveSubTab('ranking')}
                      className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
                        activeSubTab === 'ranking' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'
                      }`}
                    >
                      <Trophy size={18} className="inline mr-2" />
                      Ranking
                    </button>
                  </nav>
                </div>
              </div>

              {/* SUB-TAB: USUARIOS */}
              {activeSubTab === 'usuarios' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">👥 Gestión de Usuarios</h3>
                    <button
                      onClick={() => {
                        setEditingUser(null);
                        setNewUser({ name: '', role: 'Cajero', pin: '', password: '' });
                        setShowUserModal(true);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold flex items-center gap-2"
                    >
                      <User size={18} />
                      Agregar Usuario
                    </button>
                  </div>

                  {users.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Users size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No hay usuarios creados</p>
                      <p className="text-sm mt-2">Agrega tu primer usuario para comenzar</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users.map(user => {
                        const roleColor = getRoleColor(user.role);
                        const permisosUsuario = getPermisosUsuario(user.role);
                        
                        return (
                          <div key={user.id} className={`border-2 rounded-lg p-4 hover:shadow-md transition ${roleColor.border}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                                  user.role === 'Administrador' ? 'bg-gradient-to-br from-red-500 to-red-700' :
                                  user.role === 'Gerente' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                                  user.role === 'Supervisor' ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                                  'bg-gradient-to-br from-green-500 to-green-700'
                                }`}>
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-lg">{user.name}</p>
                                  <div className="flex items-center gap-3 text-sm">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleColor.bg} ${roleColor.text}`}>
                                      {user.role === 'Administrador' && <Shield size={12} className="inline mr-1" />}
                                      {user.role}
                                    </span>
                                    <span className="text-gray-500">PIN: ••••</span>
                                    <span className="text-gray-400">|</span>
                                    <span className="text-gray-500">{permisosUsuario.length} permisos</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setShowPermisosUsuario(showPermisosUsuario === user.id ? null : user.id)}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                  title="Ver permisos"
                                >
                                  <Key size={18} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingUser(user);
                                    setNewUser(user);
                                    setShowUserModal(true);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                            
                            {/* Panel de permisos expandible */}
                            {showPermisosUsuario === user.id && (
                              <div className="mt-4 pt-4 border-t">
                                <p className="text-sm font-semibold text-gray-700 mb-3">
                                  🔐 Permisos de {user.role}:
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                  {permisosUsuario.map(permiso => (
                                    <div key={permiso} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                                      <Check size={12} />
                                      {PERMISOS_DISPONIBLES[permiso]?.nombre || permiso}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB: ROLES Y PERMISOS */}
              {activeSubTab === 'roles' && (
                <div className="space-y-6">
                  {/* Info */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Info className="text-blue-600 mt-1" size={20} />
                      <div>
                        <p className="font-semibold text-blue-800">Sistema de Roles y Permisos</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Configura qué acciones puede realizar cada rol. Los cambios afectarán a todos los usuarios con ese rol.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Roles */}
                  {Object.entries(roles).map(([roleName, roleData]) => {
                    const isExpanded = expandedRole === roleName;
                    const roleColor = getRoleColor(roleName);
                    const totalPermisos = roleData.permisos?.length || 0;
                    const totalDisponibles = Object.keys(PERMISOS_DISPONIBLES).length;
                    
                    return (
                      <div key={roleName} className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${roleColor.border}`}>
                        {/* Header del rol */}
                        <div 
                          className={`p-4 cursor-pointer hover:bg-gray-50 transition ${roleColor.bg}`}
                          onClick={() => setExpandedRole(isExpanded ? null : roleName)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                roleName === 'Administrador' ? 'bg-red-600' :
                                roleName === 'Gerente' ? 'bg-blue-600' :
                                roleName === 'Supervisor' ? 'bg-purple-600' :
                                'bg-green-600'
                              }`}>
                                <Shield className="text-white" size={24} />
                              </div>
                              <div>
                                <h4 className={`font-bold text-lg ${roleColor.text}`}>{roleName}</h4>
                                <p className="text-sm text-gray-600">{roleData.descripcion}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-700">{totalPermisos} / {totalDisponibles}</p>
                                <p className="text-xs text-gray-500">permisos activos</p>
                              </div>
                              {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                            </div>
                          </div>
                          
                          {/* Barra de progreso */}
                          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                roleName === 'Administrador' ? 'bg-red-500' :
                                roleName === 'Gerente' ? 'bg-blue-500' :
                                roleName === 'Supervisor' ? 'bg-purple-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${(totalPermisos / totalDisponibles) * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Permisos expandidos */}
                        {isExpanded && (
                          <div className="p-6 border-t">
                            {Object.entries(permisosAgrupados).map(([categoria, permisos]) => (
                              <div key={categoria} className="mb-6 last:mb-0">
                                <h5 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                  {categoria}
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {permisos.map(permiso => {
                                    const tieneEstePermiso = roleData.permisos?.includes(permiso.key);
                                    const esAdmin = roleName === 'Administrador';
                                    
                                    return (
                                      <div 
                                        key={permiso.key}
                                        className={`flex items-center justify-between p-3 rounded-lg border-2 transition ${
                                          tieneEstePermiso 
                                            ? 'bg-green-50 border-green-300' 
                                            : 'bg-gray-50 border-gray-200'
                                        } ${esAdmin ? 'opacity-75' : 'hover:shadow-sm'}`}
                                      >
                                        <div className="flex-1">
                                          <p className={`font-medium text-sm ${tieneEstePermiso ? 'text-green-800' : 'text-gray-600'}`}>
                                            {permiso.nombre}
                                          </p>
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!esAdmin) {
                                              togglePermisoRol(roleName, permiso.key);
                                            }
                                          }}
                                          disabled={esAdmin}
                                          className={`ml-2 p-1 rounded-lg transition ${
                                            esAdmin ? 'cursor-not-allowed' :
                                            tieneEstePermiso 
                                              ? 'bg-green-500 text-white hover:bg-green-600' 
                                              : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                                          }`}
                                          title={esAdmin ? 'Administrador tiene todos los permisos' : 'Toggle permiso'}
                                        >
                                          {tieneEstePermiso ? <Check size={16} /> : <X size={16} />}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                            
                            {roleName === 'Administrador' && (
                              <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800 flex items-center gap-2">
                                  <AlertTriangle size={16} />
                                  <strong>El rol Administrador siempre tiene todos los permisos</strong>
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Botón guardar */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 font-bold flex items-center gap-2"
                    >
                      <Save size={20} />
                      Guardar Roles y Permisos
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-TAB: HISTORIAL */}
              {activeSubTab === 'historial' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-6">📚 Historial de Cierres</h3>

                  {/* Filtros */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={searchShift}
                        onChange={(e) => setSearchShift(e.target.value)}
                        placeholder="Buscar por usuario..."
                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <select
                      value={filterUser}
                      onChange={(e) => setFilterUser(e.target.value)}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    >
                      <option value="all">Todos los usuarios</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>

                    <select
                      value={filterPeriod}
                      onChange={(e) => setFilterPeriod(e.target.value)}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    >
                      <option value="all">Todo el historial</option>
                      <option value="today">Hoy</option>
                      <option value="week">Última semana</option>
                      <option value="month">Último mes</option>
                    </select>
                  </div>

                  {filteredShiftHistory.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <History size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No hay cierres de turno registrados</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredShiftHistory.map((shift, index) => (
                        <div key={shift.endTime || index} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition"
                            onClick={() => setExpandedShift(expandedShift === index ? null : index)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                  <User className="text-purple-600" size={20} />
                                </div>
                                <div>
                                  <p className="font-bold">{shift.userName}</p>
                                  <p className="text-sm text-gray-500">{formatDateTime(shift.endTime)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className="font-bold text-green-600">${shift.totalSales?.toLocaleString() || 0}</p>
                                  <p className="text-xs text-gray-500">Ventas</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">{shift.productsSold || 0}</p>
                                  <p className="text-xs text-gray-500">Productos</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">{formatDuration(shift.duration || 0)}</p>
                                  <p className="text-xs text-gray-500">Duración</p>
                                </div>
                                {expandedShift === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </div>
                            </div>
                          </div>
                          
                          {expandedShift === index && (
                            <div className="p-4 bg-gray-50 border-t">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500">Efectivo inicial</p>
                                  <p className="font-bold">${shift.initialCash?.toLocaleString() || 0}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Efectivo esperado</p>
                                  <p className="font-bold">${shift.expectedCash?.toLocaleString() || 0}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Efectivo real</p>
                                  <p className="font-bold">${shift.realCash?.toLocaleString() || 0}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Diferencia</p>
                                  <p className={`font-bold ${(shift.difference || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${shift.difference?.toLocaleString() || 0}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Paid Ins/Outs si existen */}
                              {(shift.paidIns?.length > 0 || shift.paidOuts?.length > 0) && (
                                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                                  {shift.paidIns?.length > 0 && (
                                    <div>
                                      <p className="text-xs text-gray-500 mb-2">Entradas de efectivo</p>
                                      {shift.paidIns.map((pi, i) => (
                                        <div key={i} className="text-sm bg-green-50 p-2 rounded mb-1">
                                          <span className="font-semibold text-green-700">+${pi.amount}</span>
                                          <span className="text-gray-600 ml-2">{pi.description}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {shift.paidOuts?.length > 0 && (
                                    <div>
                                      <p className="text-xs text-gray-500 mb-2">Salidas de efectivo</p>
                                      {shift.paidOuts.map((po, i) => (
                                        <div key={i} className="text-sm bg-red-50 p-2 rounded mb-1">
                                          <span className="font-semibold text-red-700">-${po.amount}</span>
                                          <span className="text-gray-600 ml-2">{po.description}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {shift.notesForNext && (
                                <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                                  <p className="text-xs text-yellow-800 font-semibold">Notas para siguiente turno:</p>
                                  <p className="text-sm text-yellow-700 mt-1">{shift.notesForNext}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB: RANKING */}
              {activeSubTab === 'ranking' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-6">🏆 Ranking de Vendedores</h3>

                  {ranking.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No hay datos de rendimiento</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ranking.map((user, index) => (
                        <div 
                          key={user.id} 
                          className={`p-4 rounded-xl border-2 ${
                            index === 0 ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50' :
                            index === 1 ? 'border-gray-300 bg-gray-50' :
                            index === 2 ? 'border-orange-300 bg-orange-50' :
                            'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                                index === 0 ? 'bg-yellow-400 text-white' :
                                index === 1 ? 'bg-gray-400 text-white' :
                                index === 2 ? 'bg-orange-400 text-white' :
                                'bg-gray-200 text-gray-600'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-bold text-lg">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.role} • {user.shiftsWorked} turnos</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6 text-right">
                              <div>
                                <p className="font-bold text-xl text-blue-600">{user.totalProducts}</p>
                                <p className="text-xs text-gray-500">Productos</p>
                              </div>
                              <div>
                                <p className="font-bold text-xl text-green-600">${user.totalSales.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Ventas</p>
                              </div>
                              <div>
                                <p className="font-bold text-xl text-purple-600">{user.totalHours}h</p>
                                <p className="text-xs text-gray-500">Horas</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Botón guardar al final */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 font-bold flex items-center gap-2"
                >
                  <Save size={20} />
                  Guardar Configuración
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB REGIONAL */}
      {activeTab === 'regional' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Globe className="text-blue-600" size={24} />
              Configuración Regional
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Moneda</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="$">$ Peso</option>
                  <option value="USD">$ Dólar USD</option>
                  <option value="€">€ Euro</option>
                  <option value="£">£ Libra</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Formato de Fecha</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Idioma</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2"
            >
              <Save size={20} />
              Guardar Configuración
            </button>
          </div>
        </div>
      )}

      {/* Modal Usuario */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingUser ? 'Editar Usuario' : 'Agregar Usuario'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rol</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  {Object.keys(roles).map(roleName => (
                    <option key={roleName} value={roleName}>{roleName}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {roles[newUser.role]?.descripcion}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">PIN (4 dígitos)</label>
                <input
                  type="text"
                  value={newUser.pin}
                  onChange={(e) => setNewUser({...newUser, pin: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="1234"
                  maxLength={4}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              {/* Preview de permisos */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Permisos del rol "{newUser.role}":
                </p>
                <p className="text-xs text-gray-500">
                  {roles[newUser.role]?.permisos?.length || 0} permisos activos
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                  setNewUser({ name: '', role: 'Cajero', pin: '', password: '' });
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                {editingUser ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Info */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <Info className="text-blue-600" size={32} />
              <h3 className="text-xl font-bold">Información</h3>
            </div>
            
            <p className="text-gray-700 mb-6">
              Esta función ya está incluida en <strong>"Modo 24 Horas"</strong>.
              <br /><br />
              Si deseas usar solo cierres de turno sin usuarios, desactiva primero el "Modo 24 Horas".
            </p>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationView;