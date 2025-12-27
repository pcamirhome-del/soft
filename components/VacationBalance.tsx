
import React, { useState, useEffect } from 'react';
import { db, ref, onValue, set, push, remove } from '../firebase';
import { UserProfile, UserRole, VacationRequest } from '../types';
import { getMonthPeriod } from '../utils';

interface VacationBalanceProps {
  user: UserProfile;
}

const VacationBalance: React.FC<VacationBalanceProps> = ({ user }) => {
  const [vacations, setVacations] = useState<VacationRequest[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [selectedUserForAction, setSelectedUserForAction] = useState<string>(user.id);
  const [newVacation, setNewVacation] = useState({
    date: new Date().toISOString().split('T')[0],
    days: 1,
    type: 'annual' as 'annual' | 'casual' | 'sick' | 'exam'
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = user.role === UserRole.ADMIN;
  const currentPeriod = getMonthPeriod();

  useEffect(() => {
    // Sync vacations
    const vacRef = ref(db, 'vacations');
    onValue(vacRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const list: VacationRequest[] = [];
        Object.keys(data).forEach(userId => {
          Object.values(data[userId]).forEach((v: any) => list.push(v));
        });
        setVacations(list);
      }
    });

    // Sync users for Admin
    if (isAdmin) {
      onValue(ref(db, 'users'), (snap) => {
        if (snap.exists()) setAllUsers(Object.values(snap.val()));
      });
    }
  }, [isAdmin]);

  const handleAddVacation = async () => {
    const targetUser = allUsers.find(u => u.id === selectedUserForAction) || user;
    const vacRef = ref(db, `vacations/${selectedUserForAction}`);
    const newRef = push(vacRef);
    
    const request: VacationRequest = {
      id: newRef.key!,
      userId: selectedUserForAction,
      username: targetUser.username,
      ...newVacation,
      timestamp: Date.now()
    };

    await set(newRef, request);
    
    // Logic to deduct from balance would go here if we want automatic tracking
    // For now, it's a log.
    setIsModalOpen(false);
  };

  const deleteVacation = async (userId: string, id: string) => {
    if (!isAdmin) return;
    await remove(ref(db, `vacations/${userId}/${id}`));
  };

  const filteredVacations = vacations.filter(v => {
    const isUserMatch = isAdmin ? true : v.userId === user.id;
    // Check if within current period (21-20)
    return isUserMatch && v.date >= currentPeriod.start && v.date <= currentPeriod.end;
  });

  const getBalance = (u: UserProfile) => u.vacationBalance || { annual: 21, casual: 7, sick: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-rose-600">رصيد الإجازات</h2>
          <p className="text-sm text-gray-500 mt-1">{currentPeriod.label}</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-rose-500 text-white px-6 py-2 rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-200"
          >
            + تسجيل إجازة موظف
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Cards (Personal or All if Admin) */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-gray-700 dark:text-gray-200">الأرصدة المتبقية</h3>
          {(isAdmin ? allUsers : [user]).map(u => (
            <div key={u.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm">
              <div className="flex justify-between mb-3 border-b pb-2">
                <span className="font-bold text-rose-600">{u.username}</span>
                <span className="text-xs text-gray-400">كود: {u.employeeCode}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                  <p className="text-[10px] text-blue-600">سنوي</p>
                  <p className="font-bold">{getBalance(u).annual}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                  <p className="text-[10px] text-orange-600">عارضة</p>
                  <p className="font-bold">{getBalance(u).casual}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                  <p className="text-[10px] text-green-600">مرضي</p>
                  <p className="font-bold">{getBalance(u).sick}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 className="font-bold">سجل إجازات الفترة</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 text-sm">
                  <th className="p-4">الموظف</th>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4">النوع</th>
                  <th className="p-4">المدة</th>
                  {isAdmin && <th className="p-4">إجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredVacations.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">لا توجد إجازات مسجلة في هذه الفترة</td></tr>
                ) : (
                  filteredVacations.sort((a,b) => b.timestamp - a.timestamp).map(v => (
                    <tr key={v.id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="p-4 font-medium">{v.username}</td>
                      <td className="p-4">{v.date}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          v.type === 'annual' ? 'bg-blue-100 text-blue-700' : 
                          v.type === 'casual' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {v.type === 'annual' ? 'سنوي' : v.type === 'casual' ? 'عارضة' : v.type === 'sick' ? 'مرضي' : 'امتحانات'}
                        </span>
                      </td>
                      <td className="p-4">{v.days} يوم</td>
                      {isAdmin && (
                        <td className="p-4 flex gap-2">
                          <button onClick={() => deleteVacation(v.userId, v.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-hidden">
            <h3 className="text-xl font-bold mb-6 text-rose-600 border-b pb-4">تسجيل إجازة جديدة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">الموظف</label>
                <select 
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
                  value={selectedUserForAction}
                  onChange={(e) => setSelectedUserForAction(e.target.value)}
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.username}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">التاريخ</label>
                <input 
                  type="date" 
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
                  value={newVacation.date}
                  onChange={(e) => setNewVacation({...newVacation, date: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">نوع الإجازة</label>
                  <select 
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
                    value={newVacation.type}
                    onChange={(e) => setNewVacation({...newVacation, type: e.target.value as any})}
                  >
                    <option value="annual">سنوي</option>
                    <option value="casual">عارضة</option>
                    <option value="sick">مرضي</option>
                    <option value="exam">امتحانات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">عدد الأيام</label>
                  <input 
                    type="number" 
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
                    value={newVacation.days}
                    onChange={(e) => setNewVacation({...newVacation, days: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={handleAddVacation}
                className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 transition-colors"
              >
                حفظ وتسجيل
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacationBalance;
