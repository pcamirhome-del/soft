
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  permissions: any;
  isAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, permissions, isAdmin }) => {
  const menuItems = [
    { id: 'daily-sales', label: 'المبيعات اليومية', icon: '💰', show: true },
    { id: 'sales-log', label: 'سجل المبيعات', icon: '📋', show: isAdmin || permissions?.showSalesLog },
    { id: 'inventory-reg', label: 'تسجيل المخزون', icon: '📦', show: true },
    { id: 'inventory-log', label: 'سجل المخزون', icon: '🗄️', show: isAdmin || permissions?.showInventoryLog },
    { id: 'competitor-prices', label: 'أسعار المنافسين', icon: '🏷️', show: true },
    { id: 'competitor-reports', label: 'تقارير المنافسين', icon: '📊', show: isAdmin || permissions?.showCompetitorReports },
    { id: 'vacation-balance', label: 'رصيد الإجازات', icon: '🌴', show: true },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️', show: isAdmin },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl overflow-y-auto w-full md:w-64 transition-all duration-300">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">Soft Rose</h2>
        <p className="text-xs text-gray-400 mt-1">Modern Trade ERP</p>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-2">
        {menuItems.filter(item => item.show).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all duration-200 group ${
              activeTab === item.id
                ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 shadow-sm border-r-4 border-rose-500'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-rose-500'
            }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-200"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium text-sm">تسجيل الخروج</span>
        </button>
        
        <div className="text-center text-[10px] text-gray-400 pt-2">
          مع تحيات المطور<br/>
          <span className="font-bold text-rose-500">Amir Lamay</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
