import React from 'react';

export const KPICard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className={color.replace('bg-', 'text-').replace('100', '600')} size={24} />
      </div>
    </div>
  </div>
);