
import React, { useState, useEffect } from 'react';
import { db, ref, onValue, set, get } from './firebase';
import { UserProfile, UserRole, AppSettings, NotificationMessage } from './types';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import DailySales from './components/DailySales';
import SalesLog from './components/SalesLog';
import InventoryRegistration from './components/InventoryRegistration';
import InventoryLog from './components/InventoryLog';
import CompetitorPrices from './components/CompetitorPrices';
import CompetitorReports from './components/CompetitorReports';
import VacationBalance from './components/VacationBalance';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('daily-sales');
  const [theme, setTheme] = useState<'light' | 'dark' | 'glass' | 'professional'>('light');
  const [settings, setSettings] = useState<AppSettings>({
    tickerText: "أهلاً بكم في سوفت روز للمجارة الحديثة",
    showDailySalesTicker: true,
    showMonthlySalesTicker: true,
    whatsappNumber: "",
    programName: "Soft Rose Modern Trade"
  });
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Sync settings
  useEffect(() => {
    const settingsRef = ref(db, 'settings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) setSettings(snapshot.val());
    });
    return () => unsubscribe();
  }, []);

  // Sync connectivity & Online users
  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snap) => setConnected(snap.val() === true));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const userStatusRef = ref(db, `users/${user.id}/isOnline`);
      set(userStatusRef, true);
      const interval = setInterval(() => {
        set(ref(db, `users/${user.id}/lastActive`), Date.now());
      }, 30000);
      return () => {
        set(userStatusRef, false);
        clearInterval(interval);
      };
    }
  }, [user]);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snap) => {
      if (snap.exists()) {
        const users = snap.val();
        const online: Record<string, boolean> = {};
        Object.keys(users).forEach(id => {
          const u = users[id];
          online[id] = u.isOnline && (Date.now() - (u.lastActive || 0) < 120000);
        });
        setOnlineUsers(online);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Notifications
  useEffect(() => {
    if (user) {
      const notifRef = ref(db, `notifications/${user.id}`);
      const unsubscribe = onValue(notifRef, (snap) => {
        if (snap.exists()) {
          const data = snap.val();
          setNotifications(Object.values(data));
        } else {
          setNotifications([]);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const getThemeClass = () => {
    switch (theme) {
      case 'dark': return 'dark bg-gray-900 text-white';
      case 'glass': return 'bg-gradient-to-br from-blue-50 to-rose-50 dark:from-gray-800 dark:to-gray-900';
      case 'professional': return 'bg-slate-50 text-slate-900';
      default: return 'bg-white text-gray-900';
    }
  };

  const handleLogin = (profile: UserProfile) => setUser(profile);
  const handleLogout = () => setUser(null);

  if (!user) return <Login onLogin={handleLogin} />;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-all duration-300 ${getThemeClass()}`} dir="rtl">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        permissions={user.permissions} 
        isAdmin={user.role === UserRole.ADMIN} 
      />

      <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b dark:border-gray-700 shadow-sm z-30 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-rose-600 dark:text-rose-400">{settings.programName}</h1>
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_8px_green]' : 'bg-red-500 shadow-[0_0_8px_red]'}`} title={connected ? 'متصل' : 'غير متصل'}></div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Selector */}
            <select 
              className="p-1 text-xs border rounded bg-white dark:bg-gray-700"
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
            >
              <option value="light">كلاسيك</option>
              <option value="dark">داكن</option>
              <option value="glass">زجاجي</option>
              <option value="professional">احترافي</option>
            </select>

            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 text-gray-500 hover:text-rose-500 transition-colors"
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {settings.whatsappNumber && (
              <a 
                href={`https://wa.me/${settings.whatsappNumber}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm hover:bg-green-600 transition-transform active:scale-95"
              >
                <span>💬</span>
                <span className="hidden sm:inline">تواصل واتس أب</span>
              </a>
            )}
          </div>
        </header>

        {/* Marquee Ticker */}
        <div className="h-8 bg-gray-100 dark:bg-gray-900 flex items-center overflow-hidden border-b dark:border-gray-800 shrink-0">
          <div className="whitespace-nowrap inline-block animate-marquee hover:pause cursor-default text-sm text-gray-700 dark:text-gray-300">
            {settings.tickerText} | {settings.showDailySalesTicker && "أعلى مبيعات يومية: جارِ التحميل..."} | {settings.showMonthlySalesTicker && "أعلى مبيعات شهرية: جارِ التحميل..."}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent">
          {activeTab === 'daily-sales' && <DailySales user={user} />}
          {activeTab === 'sales-log' && <SalesLog user={user} />}
          {activeTab === 'inventory-reg' && <InventoryRegistration user={user} />}
          {activeTab === 'inventory-log' && <InventoryLog user={user} />}
          {activeTab === 'competitor-prices' && <CompetitorPrices user={user} />}
          {activeTab === 'competitor-reports' && <CompetitorReports user={user} />}
          {activeTab === 'vacation-balance' && <VacationBalance user={user} />}
          {activeTab === 'settings' && <Settings user={user} onlineUsers={onlineUsers} />}
        </div>

        {/* Notifications Modal */}
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsNotificationsOpen(false)}>
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-rose-50 dark:bg-gray-900/50">
                <h3 className="font-bold text-rose-600">الرسائل والإشعارات</h3>
                <button onClick={() => setIsNotificationsOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4">
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">لا توجد رسائل حالياً</p>
                ) : (
                  notifications.sort((a,b) => b.timestamp - a.timestamp).map(notif => (
                    <div key={notif.id} className={`p-4 rounded-xl border-l-4 ${notif.isRead ? 'bg-gray-50 border-gray-300' : 'bg-rose-50 border-rose-500 shadow-sm'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-rose-600">من: {notif.senderName}</span>
                        <span className="text-[10px] text-gray-400">{new Date(notif.timestamp).toLocaleString('ar-EG')}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{notif.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-center">
                <button className="text-xs text-rose-500 font-bold hover:underline">تحديد الكل كمقروء</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          padding-left: 100%;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default App;
