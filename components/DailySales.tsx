
import React, { useState, useEffect } from 'react';
import { db, ref, onValue, set, push } from '../firebase';
import { UserProfile, Product, SaleRecord } from '../types';
import { SOFT_ROSE_PRODUCTS } from '../constants';
import { getCurrentDateStr, formatCurrency } from '../utils';

interface DailySalesProps {
  user: UserProfile;
}

const DailySales: React.FC<DailySalesProps> = ({ user }) => {
  const [markets, setMarkets] = useState<string[]>([]);
  const [selectedMarket, setSelectedMarket] = useState('');
  const [salesItems, setSalesItems] = useState<Array<{ productName: string, price: number, quantity: number }>>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>(SOFT_ROSE_PRODUCTS);

  useEffect(() => {
    onValue(ref(db, 'markets'), (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        // User sees only default markets + markets they added (unless admin)
        const list = Object.values(data)
          .filter((m: any) => user.role === 'admin' || m.addedBy === user.id || m.isDefault)
          .map((m: any) => m.name);
        setMarkets(list);
      }
    });
  }, [user]);

  const addMarket = async () => {
    const name = prompt('أدخل اسم الماركت الجديد:');
    if (name) {
      const newRef = push(ref(db, 'markets'));
      await set(newRef, { name, addedBy: user.id, isDefault: false });
    }
  };

  const addItem = (product: Product) => {
    setSalesItems([...salesItems, { productName: product.name, price: 0, quantity: 1 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...salesItems];
    (newItems[index] as any)[field] = value;
    setSalesItems(newItems);
  };

  const removeItem = (index: number) => {
    setSalesItems(salesItems.filter((_, i) => i !== index));
  };

  const saveSale = async () => {
    if (!selectedMarket || salesItems.length === 0) return alert('برجاء اختيار ماركت وإضافة أصناف');
    
    const total = salesItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const sale: SaleRecord = {
      id: Date.now().toString(),
      marketId: selectedMarket,
      marketName: selectedMarket,
      items: salesItems,
      total,
      date: getCurrentDateStr(),
      timestamp: Date.now(),
      userId: user.id,
      username: user.username
    };

    await set(ref(db, `sales/${user.id}/${sale.id}`), sale);
    setSalesItems([]);
    setSelectedMarket('');
    alert('تم حفظ وترحيل المبيعات بنجاح');
  };

  const totalSales = salesItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const renderCategory = (title: string, category: string) => (
    <div className="space-y-2 mb-6">
      <div className="bg-gray-400 text-white px-4 py-2 rounded-lg font-bold text-sm">{title}</div>
      <div className="flex flex-wrap gap-2">
        {SOFT_ROSE_PRODUCTS.filter(p => p.category === category).map(p => (
          <button 
            key={p.name}
            onClick={() => addItem(p)}
            className="text-[11px] px-3 py-1.5 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-full hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm"
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
        <h2 className="text-xl font-bold text-rose-600 mb-6 border-b pb-4">المبيعات اليومية</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">اسم الماركت</label>
            <div className="flex gap-2">
              <select 
                className="flex-1 p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 ring-rose-500/20"
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
              >
                <option value="">اختر الماركت...</option>
                {markets.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <button onClick={addMarket} className="bg-rose-500 text-white px-4 rounded-xl hover:bg-rose-600">أضف ماركت</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold border-r-4 border-rose-500 pr-3">قائمة الأصناف</h3>
            {renderCategory('مناديل السحب', 'مناديل السحب')}
            {renderCategory('مناديل مطبخ', 'مناديل المطبخ')}
            {renderCategory('مناديل تواليت', 'مناديل تواليت')}
            {renderCategory('مناديل دولفن', 'مناديل دولفن')}
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-4 border border-dashed dark:border-gray-700">
            <h3 className="font-bold mb-4 flex justify-between">
              <span>الأصناف المختارة</span>
              <span className="text-xs text-gray-400">({salesItems.length})</span>
            </h3>
            
            <div className="space-y-3">
              {salesItems.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">قم باختيار صنف من القائمة اليمنى</div>
              ) : (
                salesItems.map((item, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border dark:border-gray-700 animate-in fade-in slide-in-from-left-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-bold truncate max-w-[150px]">{item.productName}</span>
                      <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600">✕</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-400">السعر</label>
                        <input 
                          type="number" 
                          className="w-full p-1.5 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400">الكمية</label>
                        <input 
                          type="number" 
                          className="w-full p-1.5 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t dark:border-gray-700">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>إجمالي المبيعات:</span>
                <span className="text-rose-600">{formatCurrency(totalSales)}</span>
              </div>
              <button 
                onClick={saveSale}
                className="w-full bg-rose-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600 active:scale-[0.98] transition-all"
              >
                حفظ وترحيل
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySales;
