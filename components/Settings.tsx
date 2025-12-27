
import React, { useState, useEffect } from 'react';
import { db, ref, onValue, set, push, update, remove, get } from '../firebase';
import { UserProfile, UserRole, AppSettings, NotificationMessage } from '../types';

interface SettingsProps {
  user: UserProfile;
  onlineUsers: Record<string, boolean>;
}

const Settings: React.FC<SettingsProps> = ({ user, onlineUsers }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [msgContent, setMsgContent] = useState('');
  const [msgRecipient, setMsgRecipient] = useState('');

  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    if (isAdmin) {
      onValue(ref(db, 'users'), (snap) => {
        if (snap.exists()) setUsers(Object.values(snap.val()));
      });
      onValue(ref(db, 'settings'), (snap) => {
        if (snap.exists()) setAppSettings(snap.val());
      });
    }
  }, [isAdmin]);

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    await update(ref(db, `users/${selectedUser.id}`), selectedUser);
    setSelectedUser(null);
    alert('تم تحديث البيانات بنجاح');
  };

  const sendMessage = async () => {
    if (!msgRecipient || !msgContent) return;
    const msgId = Date.now().toString();
    const message: NotificationMessage = {
      id: msgId,
      recipientId: msgRecipient,
      senderId: user.id,
      senderName: user.username,
      content: msgContent,
      timestamp: Date.now(),
      isRead: false
    };
    await set(ref(db, `notifications/${msgRecipient}/${msgId}`), message);
    setMsgContent('');
    alert('تم إرسال الرسالة بنجاح');
  };

  const backupData = async () => {
    const snap = await get(ref(db));
    const data = snap.val();
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `softrose_backup_${Date.now()}.json`;
    a.click();
  };

  if (!isAdmin) return <div className="p-8 text-center text-red-500 font-bold">عذراً، هذه الصفحة للأدمن فقط</div>;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
      {/* App Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
        <h3 className="text-xl font-bold mb-6 text-rose-600">إعدادات النظام</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم البرنامج</label>
            <input 
              type="text" 
              className="w-full p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              value={appSettings?.programName || ''}
              onChange={(e) => setAppSettings(prev => prev ? {...prev, programName: e.target.value} : null)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نص الشريط المتحرك</label>
            <textarea 
              className="w-full p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              value={appSettings?.tickerText || ''}
              onChange={(e) => setAppSettings(prev => prev ? {...prev, tickerText: e.target.value} : null)}
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={appSettings?.showDailySalesTicker || false}
                onChange={(e) => setAppSettings(prev => prev ? {...prev, showDailySalesTicker: e.target.checked} : null)}
              />
              تفعيل مبيعات اليوم
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={appSettings?.showMonthlySalesTicker || false}
                onChange={(e) => setAppSettings(prev => prev ? {...prev, showMonthlySalesTicker: e.target.checked} : null)}
              />
              تفعيل مبيعات الشهر
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم الواتس أب للتواصل</label>
            <input 
              type="text" 
              className="w-full p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              value={appSettings?.whatsappNumber || ''}
              onChange={(e) => setAppSettings(prev => prev ? {...prev, whatsappNumber: e.target.value} : null)}
            />
          </div>
          <button 
            onClick={() => set(ref(db, 'settings'), appSettings)}
            className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all"
          >
            حفظ الإعدادات العامة
          </button>
        </div>

        <div className="mt-8 pt-8 border-t dark:border-gray-700 grid grid-cols-2 gap-4">
          <button onClick={backupData} className="bg-blue-500 text-white p-3 rounded-xl font-bold hover:bg-blue-600">نسخة احتياطية 💾</button>
          <button className="bg-emerald-500 text-white p-3 rounded-xl font-bold hover:bg-emerald-600">استعادة البيانات 🔄</button>
        </div>
      </div>

      {/* Messaging */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
        <h3 className="text-xl font-bold mb-6 text-rose-600">مركز الإشعارات والمراسلة</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">الموظف المستلم</label>
            <select 
              className="w-full p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
              value={msgRecipient}
              onChange={(e) => setMsgRecipient(e.target.value)}
            >
              <option value="">اختر موظف...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">محتوى الرسالة (حتى 1000 حرف)</label>
            <textarea 
              maxLength={1000}
              className="w-full p-2.5 border rounded-xl h-32 dark:bg-gray-700 dark:border-gray-600"
              placeholder="اكتب رسالتك هنا..."
              value={msgContent}
              onChange={(e) => setMsgContent(e.target.value)}
            />
          </div>
          <button 
            onClick={sendMessage}
            className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 transition-all"
          >
            إرسال إشعار فوري
          </button>
        </div>
      </div>

      {/* User Management & Online Status */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 overflow-x-auto">
        <h3 className="text-xl font-bold mb-6 text-rose-600">إدارة المستخدمين والصلاحيات</h3>
        <table className="w-full text-right">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 text-sm">
              <th className="p-3">الحالة</th>
              <th className="p-3">اسم المستخدم</th>
              <th className="p-3">الكود</th>
              <th className="p-3">الصلاحية</th>
              <th className="p-3">رؤية الكل</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {users.map(u => (
              <tr key={u.id} className="text-sm">
                <td className="p-3">
                  <span className={`w-3 h-3 rounded-full inline-block ${onlineUsers[u.id] ? 'bg-blue-500 shadow-[0_0_8px_blue]' : 'bg-red-500'}`}></span>
                </td>
                <td className="p-3 font-bold">{u.username}</td>
                <td className="p-3">{u.employeeCode}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}>
                    {u.role === 'admin' ? 'مدير' : 'موظف'}
                  </span>
                </td>
                <td className="p-3">
                  <input 
                    type="checkbox" 
                    checked={u.permissions?.showAllSales}
                    onChange={async (e) => {
                      await update(ref(db, `users/${u.id}/permissions`), { showAllSales: e.target.checked });
                    }}
                  />
                </td>
                <td className="p-3">
                  <button onClick={() => setSelectedUser(u)} className="text-rose-500 hover:underline">تعديل 📝</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 border-b pb-4">تعديل حساب: {selectedUser.username}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">اسم المستخدم</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-700"
                  value={selectedUser.username}
                  onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">كلمة المرور الجديدة</label>
                <input 
                  type="password" 
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-700"
                  placeholder="اتركها فارغة لعدم التغيير"
                  onChange={(e) => setSelectedUser({...selectedUser, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">كود الموظف</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-700"
                  value={selectedUser.employeeCode}
                  onChange={(e) => setSelectedUser({...selectedUser, employeeCode: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={selectedUser.permissions?.showSalesLog}
                    onChange={(e) => setSelectedUser({...selectedUser, permissions: {...selectedUser.permissions, showSalesLog: e.target.checked}})}
                  />
                  سجل مبيعات
                </label>
                <label className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={selectedUser.permissions?.showInventoryLog}
                    onChange={(e) => setSelectedUser({...selectedUser, permissions: {...selectedUser.permissions, showInventoryLog: e.target.checked}})}
                  />
                  سجل مخزون
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={handleUpdateUser} className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold">حفظ التغييرات</button>
              <button onClick={() => setSelectedUser(null)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
