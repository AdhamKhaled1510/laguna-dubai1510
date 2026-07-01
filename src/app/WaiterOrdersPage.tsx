import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import logoUrl from '@/assets/logo.png';
import { getOrders, Order, clearNotification, getNotifications } from './lib/orders';
import { ArrowLeft, Bell, Clock, CheckCircle } from 'lucide-react';

export default function WaiterOrdersPage() {
  const navigate = useNavigate();
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [showNewBadge, setShowNewBadge] = useState(false);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('laguna-auth') || '{}');
      if (auth.role !== 'waiter' || Date.now() - auth.at > 14400000) {
        localStorage.removeItem('laguna-auth');
        navigate('/');
      }
    } catch { navigate('/'); }
  }, [navigate]);

  const refresh = useCallback(async () => {
    const all = await getOrders();
    const cutoff = Date.now() - 60 * 60 * 1000;
    const completed = all
      .filter(o => o.status === 'completed' && o.timestamp > cutoff)
      .sort((a, b) => b.timestamp - a.timestamp);
    setCompletedOrders(prev => {
      if (completed.length > prev.length) setShowNewBadge(true);
      return completed;
    });
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    const fetch = async () => {
      const notifs = await getNotifications();
      setNewCount(notifs.length);
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} د`;
    return `منذ ${Math.floor(mins / 60)} س`;
  };

  return (
    <div className="min-h-screen bg-[#f5f0eb]" dir="rtl">
      <header className="bg-gradient-to-b from-[#0A2242] to-[#0d2d52] text-white px-4 py-3 sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Laguna Dubai" className="h-8 w-auto brightness-0 invert" />
            <div>
              <h1 className="text-sm font-bold tracking-[0.1em]" style={{ fontFamily: "'Playfair Display', serif" }}>LAGUNA DUBAI</h1>
              <p className="text-[10px] text-white/40 tracking-[0.2em]">WAITER PANEL</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                setShowNewBadge(false);
                const notifs = await getNotifications();
                await Promise.all(notifs.map(n => clearNotification(n.id)));
                setNewCount(0);
              }}
              className="relative text-xs text-white/60 bg-white/10 px-2.5 py-1 rounded-lg"
            >
              <Bell className="h-3.5 w-3.5 inline ml-1" />
              {completedOrders.length}
              {(showNewBadge || newCount > 0) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
            <button onClick={() => navigate('/')} className="text-xs text-white/40 hover:text-white/60 transition-colors">
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 py-4 max-w-3xl">
        {completedOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow-sm">
              <CheckCircle className="h-8 w-8 text-stone-300" />
            </div>
            <p className="text-lg font-semibold text-stone-400">لا توجد طلبات مكتملة</p>
            <p className="text-sm text-stone-300 mt-1">بانتظار تجهيز الطلبات...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedOrders.map(order => (
              <div key={order.id} className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">ترابيزة {order.tableNumber}</span>
                    <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded">
                      {formatTime(order.timestamp)}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-100 bg-white/10 px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo(order.timestamp)}
                  </span>
                </div>
                <div className="px-4 py-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-500 text-xs font-bold flex items-center justify-center">
                          {item.quantity}
                        </span>
                        <span className="text-sm font-medium text-stone-800">{item.nameAr}</span>
                      </div>
                      <span className="text-xs text-stone-400">{item.price} ج.م</span>
                    </div>
                  ))}
                </div>
                <div className="bg-stone-50 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-800">
                    الإجمالي: {order.totalPrice} ج.م
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    <CheckCircle className="h-3 w-3" />
                    مكتمل
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
