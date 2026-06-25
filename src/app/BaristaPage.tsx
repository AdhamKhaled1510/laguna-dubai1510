import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import logoUrl from '@/assets/logo.png';
import { getOrders, completeOrder, Order } from './lib/orders';

export default function BaristaPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  const refresh = useCallback(() => {
    setOrders(getOrders().filter(o => o.status === 'pending'));
  }, []);

  useEffect(() => {
    refresh();
    const handle = () => refresh();
    window.addEventListener('storage', handle);
    const interval = setInterval(refresh, 2000);
    return () => {
      window.removeEventListener('storage', handle);
      clearInterval(interval);
    };
  }, [refresh]);

  const handleComplete = (id: string) => {
    completeOrder(id);
    refresh();
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#f5f0eb]" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-b from-[#0A2242] to-[#0d2d52] text-white px-4 py-3 sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Laguna Dubai" className="h-8 w-auto brightness-0 invert" />
            <div>
              <h1 className="text-sm font-bold tracking-[0.1em]" style={{ fontFamily: "'Playfair Display', serif" }}>LAGUNA DUBAI</h1>
              <p className="text-[10px] text-white/40 tracking-[0.2em]">BARISTA PANEL</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/60 bg-white/10 px-2.5 py-1 rounded-lg">
              الطلبات: {orders.length}
            </span>
            <button onClick={() => navigate('/')} className="text-xs text-white/40 hover:text-white/60 transition-colors">
              خروج
            </button>
          </div>
        </div>
      </header>

      {/* Orders */}
      <main className="container mx-auto px-3 py-4 max-w-3xl">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow-sm">
              <svg className="h-8 w-8 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-stone-400">لا توجد طلبات جديدة</p>
            <p className="text-sm text-stone-300 mt-1">بانتظار طلب جديد...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-stone-800 text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">ترابيزة {order.tableNumber}</span>
                    <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded">
                      {formatTime(order.timestamp)}
                    </span>
                  </div>
                  <span className="text-xs text-white/60">#</span>
                </div>

                {/* Order Items */}
                <div className="px-4 py-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 text-xs font-bold flex items-center justify-center">
                          {item.quantity}
                        </span>
                        <span className="text-sm font-medium text-stone-800">{item.nameAr}</span>
                      </div>
                      <span className="text-xs text-stone-400">{item.price} ج.م</span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="bg-stone-50 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-800">
                    الإجمالي: {order.totalPrice} ج.م
                  </span>
                  <button
                    onClick={() => handleComplete(order.id)}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-colors active:scale-95"
                  >
                    تم
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
