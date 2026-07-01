import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { getOrders, clearAllOrders, clearOrdersByDate, deleteDailyReport, saveDailyReport, getDailyReports, getInvoices, clearAllData, DailyReport, Order, Invoice } from './lib/orders';
import { ArrowLeft, BarChart3, Coffee, DollarSign, ShoppingBag, TrendingUp, Trash2, Calendar, ChevronDown, LayoutDashboard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import logoUrl from '@/assets/logo.png';

type ViewMode = 'today' | 'day' | 'month' | 'dashboard';
type DashPeriod = 'day' | 'week' | 'month';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedReports, setSavedReports] = useState<DailyReport[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [clearing, setClearing] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dashboardPeriod, setDashboardPeriod] = useState<DashPeriod>('week');

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  useEffect(() => {
    const fetchData = async () => {
      const [all, reports, invs] = await Promise.all([getOrders(), getDailyReports(), getInvoices()]);
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      setOrders(all.filter(o => o.timestamp >= cutoff));
      setSavedReports(reports);
      setInvoices(invs);
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClearToday = async () => {
    if (!window.confirm('هل تريد أرشفة بيانات اليوم ومسح الطلبات؟')) return;
    setClearing(true);
    try {
      const drinkMap = new Map<string, { quantity: number; revenue: number }>();
      for (const o of orders) {
        for (const item of o.items) {
          const existing = drinkMap.get(item.nameAr);
          if (existing) {
            existing.quantity += item.quantity;
            existing.revenue += item.price * item.quantity;
          } else {
            drinkMap.set(item.nameAr, { quantity: item.quantity, revenue: item.price * item.quantity });
          }
        }
      }
      const report: DailyReport = {
        date: todayStr,
        totalOrders: orders.length,
        totalItems: orders.reduce((s, o) => s + o.items.reduce((s2, i) => s2 + i.quantity, 0), 0),
        totalRevenue: orders.reduce((s, o) => s + o.totalPrice, 0),
        drinks: Array.from(drinkMap.entries()).map(([nameAr, val]) => ({ nameAr, ...val })),
      };
      await saveDailyReport(report);
      await clearAllOrders();
      setOrders([]);
      setSavedReports(prev => [report, ...prev.filter(r => r.date !== todayStr)]);
    } catch {
      alert('حدث خطأ');
    }
    setClearing(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatMonth = (monthStr: string) => {
    const d = new Date(monthStr + '-01T12:00:00');
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });
  };

  const displayedDayReport = selectedDay ? savedReports.find(r => r.date === selectedDay) ?? null : null;

  const monthlyReports = useMemo(() => {
    if (!selectedMonth) return null;
    const prefix = selectedMonth;
    const days = savedReports.filter(r => r.date.startsWith(prefix));
    if (days.length === 0) return null;
    const drinkMap = new Map<string, { quantity: number; revenue: number }>();
    for (const day of days) {
      for (const d of day.drinks) {
        const existing = drinkMap.get(d.nameAr);
        if (existing) {
          existing.quantity += d.quantity;
          existing.revenue += d.revenue;
        } else {
          drinkMap.set(d.nameAr, { quantity: d.quantity, revenue: d.revenue });
        }
      }
    }
    return {
      totalOrders: days.reduce((s, d) => s + d.totalOrders, 0),
      totalItems: days.reduce((s, d) => s + d.totalItems, 0),
      totalRevenue: days.reduce((s, d) => s + d.totalRevenue, 0),
      days: days.length,
      drinks: Array.from(drinkMap.entries()).map(([nameAr, val]) => ({ nameAr, ...val })).sort((a, b) => b.quantity - a.quantity),
    };
  }, [selectedMonth, savedReports]);

  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    for (const r of savedReports) {
      months.add(r.date.slice(0, 7));
    }
    return Array.from(months).sort().reverse();
  }, [savedReports]);

  const dayOptions = useMemo(() => {
    return savedReports.map(r => r.date).sort().reverse();
  }, [savedReports]);

  const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrders = orders.length;

  const drinksMap = new Map<string, { nameAr: string; quantity: number; revenue: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const existing = drinksMap.get(item.nameAr);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        drinksMap.set(item.nameAr, { nameAr: item.nameAr, quantity: item.quantity, revenue: item.price * item.quantity });
      }
    }
  }
  const drinks = Array.from(drinksMap.values()).sort((a, b) => b.quantity - a.quantity);

  // ── Dashboard data ──────────────────────────────────────────
  const dashData = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const days: { date: string; label: string; revenue: number; orders: number; returns: number; items: number }[] = [];

    // Helper: get live totals for a given date (for today only, past days have no live orders)
    const liveForDay = (dateStr: string) => {
      if (dateStr !== todayStr) return { revenue: 0, orders: 0 };
      const dayEnd = todayStart + 86400000;
      let rev = 0, cnt = 0;
      for (const o of orders) {
        if (o.timestamp >= todayStart && o.timestamp < dayEnd) {
          rev += o.totalPrice;
          cnt += 1;
        }
      }
      return { revenue: rev, orders: cnt };
    };

    // Helper: returns total for a date from archived report + live orders
    const totalForDay = (dateStr: string) => {
      const report = savedReports.find(r => r.date === dateStr);
      const live = liveForDay(dateStr);
      let returns = 0;
      for (const inv of invoices) {
        if (new Date(inv.createdAt).toISOString().slice(0, 10) === dateStr) {
          if (inv.status === 'returned') returns += inv.totalPrice;
          else if (inv.status === 'partial_return' && inv.returnedItems) {
            returns += inv.returnedItems.reduce((sum, ri) => {
              const item = inv.items.find(i => i.nameAr === ri.nameAr);
              return sum + (item ? item.price * ri.quantity : 0);
            }, 0);
          }
        }
      }
      return {
        revenue: (report?.totalRevenue || 0) + live.revenue,
        orders: (report?.totalOrders || 0) + live.orders,
        items: report?.totalItems || 0,
        returns,
      };
    };

    if (dashboardPeriod === 'day') {
      // Hourly breakdown from live orders only (archived report has no hourly data)
      const hourTotals: Record<number, { revenue: number; orders: number; returns: number }> = {};
      for (let h = 0; h < 24; h++) hourTotals[h] = { revenue: 0, orders: 0, returns: 0 };

      for (const o of orders) {
        if (o.timestamp >= todayStart) {
          const h = new Date(o.timestamp).getHours();
          hourTotals[h].revenue += o.totalPrice;
          hourTotals[h].orders += 1;
        }
      }
      for (const inv of invoices) {
        if (new Date(inv.createdAt).toISOString().slice(0, 10) === todayStr) {
          let refund = 0;
          if (inv.status === 'returned') refund = inv.totalPrice;
          else if (inv.status === 'partial_return' && inv.returnedItems) {
            refund = inv.returnedItems.reduce((sum, ri) => {
              const item = inv.items.find(i => i.nameAr === ri.nameAr);
              return sum + (item ? item.price * ri.quantity : 0);
            }, 0);
          }
          if (refund > 0) {
            const h = new Date(inv.createdAt).getHours();
            hourTotals[h].returns += refund;
          }
        }
      }
      for (let h = 0; h < 24; h++) {
        const d = new Date(now);
        d.setHours(h, 0, 0, 0);
        days.push({ date: `${h}`, label: d.toLocaleTimeString('ar-EG', { hour: '2-digit' }), ...hourTotals[h], items: 0 });
      }
    } else if (dashboardPeriod === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const totals = totalForDay(dateStr);
        days.push({ date: dateStr, label: d.toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric' }), ...totals });
      }
    } else {
      // Month
      const monthPrefix = todayStr.slice(0, 7);
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(now.getFullYear(), now.getMonth(), i);
        const dateStr = d.toISOString().slice(0, 10);
        if (dateStr > todayStr) break;
        const totals = totalForDay(dateStr);
        days.push({ date: dateStr, label: d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }), ...totals });
      }
    }
    return days;
  }, [savedReports, invoices, orders, dashboardPeriod, todayStr]);

  const dashTotalRevenue = dashData.reduce((s, d) => s + d.revenue, 0);
  const dashTotalOrders = dashData.reduce((s, d) => s + d.orders, 0);
  const dashTotalReturns = dashData.reduce((s, d) => s + d.returns, 0);
  const dashNetRevenue = dashTotalRevenue - dashTotalReturns;

  const topDrinks = useMemo(() => {
    const map = new Map<string, number>();
    const cutoff = dashboardPeriod === 'day'
      ? new Date().getTime() - 24 * 60 * 60 * 1000
      : dashboardPeriod === 'week'
        ? new Date().getTime() - 7 * 24 * 60 * 60 * 1000
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

    for (const r of savedReports) {
      const rMs = new Date(r.date + 'T12:00:00').getTime();
      if (rMs >= cutoff) {
        for (const d of r.drinks) {
          map.set(d.nameAr, (map.get(d.nameAr) || 0) + d.revenue);
        }
      }
    }
    return Array.from(map.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [savedReports, dashboardPeriod]);

  const periodLabel = dashboardPeriod === 'day' ? 'اليوم' : dashboardPeriod === 'week' ? 'آخر 7 أيام' : 'هذا الشهر';

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white shadow-lg border border-stone-100 rounded-xl p-3 text-xs">
          <p className="font-bold text-stone-800 mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }} className="font-medium">
              {p.name}: {p.value.toLocaleString('ar-EG')} {p.name === 'الإيرادات' || p.name === 'المرتجعات' ? 'ج.م' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#f5f0eb]" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">رجوع</span>
          </button>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-600" />
            <h1 className="text-xl font-bold text-stone-800">التقارير</h1>
          </div>
          <div className="flex items-center gap-2">
            {viewMode === 'today' && orders.length > 0 && (
              <button
                onClick={handleClearToday}
                disabled={clearing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {clearing ? 'جاري الأرشفة...' : 'أرشفة ومسح'}
              </button>
            )}
            <button
              onClick={async () => {
                if (!window.confirm('⚠️ مسح جميع البيانات؟')) return;
                try {
                  await clearAllData();
                  setOrders([]);
                  setSavedReports([]);
                  setInvoices([]);
                  alert('✅ تم مسح جميع البيانات');
                } catch {
                  alert('❌ فشل المسح، حاول مرة أخرى');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              مسح الكل
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setViewMode('today')}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              viewMode === 'today' ? 'bg-amber-100 text-amber-800' : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 inline ml-1" />
            اليوم
          </button>

          {dayOptions.length > 0 && (
            <div className="relative">
              <select
                value={selectedDay}
                onChange={e => { setSelectedDay(e.target.value); setViewMode('day'); setSelectedMonth(''); }}
                className={`appearance-none shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === 'day' ? 'bg-amber-100 text-amber-800' : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-200'
                }`}
              >
                <option value="">اختر يوم</option>
                {dayOptions.map(d => (
                  <option key={d} value={d}>{formatDate(d)}</option>
                ))}
              </select>
              <ChevronDown className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none ${viewMode === 'day' ? 'text-amber-800' : 'text-stone-400'}`} />
            </div>
          )}

          {monthOptions.length > 0 && (
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={e => { setSelectedMonth(e.target.value); setViewMode('month'); setSelectedDay(''); }}
                className={`appearance-none shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === 'month' ? 'bg-amber-100 text-amber-800' : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-200'
                }`}
              >
                <option value="">تقرير شهري</option>
                {monthOptions.map(m => (
                  <option key={m} value={m}>{formatMonth(m)}</option>
                ))}
              </select>
              <ChevronDown className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none ${viewMode === 'month' ? 'text-amber-800' : 'text-stone-400'}`} />
            </div>
          )}

          <button
            onClick={() => setViewMode('dashboard')}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              viewMode === 'dashboard' ? 'bg-amber-100 text-amber-800' : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5 inline ml-1" />
            داشبورد
          </button>
        </div>

        {/* Today View */}
        {viewMode === 'today' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-stone-400 font-medium">إجمالي الطلبات</span>
                  <ShoppingBag className="h-5 w-5 text-stone-300" />
                </div>
                <p className="text-3xl font-bold text-stone-800">{totalOrders}</p>
                <p className="text-xs text-stone-400 mt-1">آخر 24 ساعة</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-stone-400 font-medium">المشروبات المباعة</span>
                  <Coffee className="h-5 w-5 text-stone-300" />
                </div>
                <p className="text-3xl font-bold text-stone-800">{totalItems}</p>
                <p className="text-xs text-stone-400 mt-1">إجمالي القطع</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-stone-400 font-medium">الإيرادات</span>
                  <DollarSign className="h-5 w-5 text-stone-300" />
                </div>
                <p className="text-3xl font-bold text-amber-600">{totalRevenue.toLocaleString('ar-EG')} <span className="text-lg">ج.م</span></p>
                <p className="text-xs text-stone-400 mt-1">إجمالي المبيعات</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-stone-800">تفصيل المشروبات</h2>
                </div>
                <span className="text-xs text-stone-400">{drinks.length} صنف</span>
              </div>
              {drinks.length === 0 ? (
                <div className="text-center py-12">
                  <Coffee className="h-10 w-10 text-stone-200 mx-auto mb-3" />
                  <p className="text-stone-400 text-sm">لا توجد طلبات اليوم</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-50">
                  {drinks.map((drink, idx) => (
                    <div key={drink.nameAr} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-stone-100 text-xs font-bold text-stone-500 flex items-center justify-center shrink-0">{idx + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-stone-800">{drink.nameAr}</p>
                          <p className="text-xs text-stone-400">{drink.quantity} قطعة</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-stone-800">{drink.revenue.toLocaleString('ar-EG')} ج.م</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Day View */}
        {viewMode === 'day' && displayedDayReport && (
          <>
            <div className="mb-4">
              <p className="text-sm text-stone-400 font-medium">{formatDate(displayedDayReport.date)}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-stone-400 font-medium">إجمالي الطلبات</span>
                  <ShoppingBag className="h-5 w-5 text-stone-300" />
                </div>
                <p className="text-3xl font-bold text-stone-800">{displayedDayReport.totalOrders}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-stone-400 font-medium">المشروبات المباعة</span>
                  <Coffee className="h-5 w-5 text-stone-300" />
                </div>
                <p className="text-3xl font-bold text-stone-800">{displayedDayReport.totalItems}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-stone-400 font-medium">الإيرادات</span>
                  <DollarSign className="h-5 w-5 text-stone-300" />
                </div>
                <p className="text-3xl font-bold text-amber-600">{displayedDayReport.totalRevenue.toLocaleString('ar-EG')} <span className="text-lg">ج.م</span></p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-stone-800">تفصيل المشروبات</h2>
                </div>
                <span className="text-xs text-stone-400">{displayedDayReport.drinks.length} صنف</span>
              </div>
              <div className="divide-y divide-stone-50">
                {displayedDayReport.drinks.sort((a, b) => b.quantity - a.quantity).map((drink, idx) => (
                  <div key={drink.nameAr} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-stone-100 text-xs font-bold text-stone-500 flex items-center justify-center shrink-0">{idx + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-stone-800">{drink.nameAr}</p>
                        <p className="text-xs text-stone-400">{drink.quantity} قطعة</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-stone-800">{drink.revenue.toLocaleString('ar-EG')} ج.م</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {viewMode === 'day' && !displayedDayReport && (
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-400 text-sm">اختر يوماً من القائمة لعرض التقرير</p>
          </div>
        )}

        {/* Month View */}
        {viewMode === 'month' && monthlyReports && (
          <>
            <div className="mb-4">
              <p className="text-sm text-stone-400 font-medium">{formatMonth(selectedMonth)} &bull; {monthlyReports.days} يوم</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-stone-400 font-medium">إجمالي الطلبات</span>
                  <ShoppingBag className="h-5 w-5 text-stone-300" />
                </div>
                <p className="text-3xl font-bold text-stone-800">{monthlyReports.totalOrders}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-stone-400 font-medium">المشروبات المباعة</span>
                  <Coffee className="h-5 w-5 text-stone-300" />
                </div>
                <p className="text-3xl font-bold text-stone-800">{monthlyReports.totalItems}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-stone-400 font-medium">الإيرادات</span>
                  <DollarSign className="h-5 w-5 text-stone-300" />
                </div>
                <p className="text-3xl font-bold text-amber-600">{monthlyReports.totalRevenue.toLocaleString('ar-EG')} <span className="text-lg">ج.م</span></p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-stone-800">تفصيل المشروبات</h2>
                </div>
                <span className="text-xs text-stone-400">{monthlyReports.drinks.length} صنف</span>
              </div>
              <div className="divide-y divide-stone-50">
                {monthlyReports.drinks.map((drink, idx) => (
                  <div key={drink.nameAr} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-stone-100 text-xs font-bold text-stone-500 flex items-center justify-center shrink-0">{idx + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-stone-800">{drink.nameAr}</p>
                        <p className="text-xs text-stone-400">{drink.quantity} قطعة</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-stone-800">{drink.revenue.toLocaleString('ar-EG')} ج.م</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {viewMode === 'month' && !monthlyReports && (
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-400 text-sm">اختر شهراً من القائمة لعرض التقرير الشهري</p>
          </div>
        )}

        {/* Dashboard View */}
        {viewMode === 'dashboard' && (
          <div style={{animation: 'fadeIn 0.3s ease-out'}}>
            {/* Period selector */}
            <div className="flex items-center gap-2 mb-6">
              {(['day', 'week', 'month'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setDashboardPeriod(p)}
                  className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    dashboardPeriod === p
                      ? 'bg-gradient-to-l from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 scale-105'
                      : 'bg-white text-stone-500 hover:text-stone-700 hover:shadow-md border border-stone-200'
                  }`}
                >
                  {p === 'day' ? '📅 يوم' : p === 'week' ? '📊 أسبوع' : '📈 شهر'}
                </button>
              ))}
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'إجمالي الإيرادات', value: `${dashTotalRevenue.toLocaleString('ar-EG')} ج.م`, color: 'text-amber-600', bg: 'from-amber-50 to-amber-100', icon: '💰' },
                { label: 'المرتجعات', value: `${dashTotalReturns.toLocaleString('ar-EG')} ج.م`, color: 'text-red-500', bg: 'from-red-50 to-red-100', icon: '↩️' },
                { label: 'صافي الربح', value: `${dashNetRevenue.toLocaleString('ar-EG')} ج.م`, color: 'text-emerald-600', bg: 'from-emerald-50 to-emerald-100', icon: '✅' },
                { label: 'إجمالي الطلبات', value: dashTotalOrders, color: 'text-stone-800', bg: 'from-stone-50 to-stone-100', icon: '📋' },
              ].map((card, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${card.bg} rounded-2xl p-4 shadow-sm border border-white/60 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-stone-400 font-medium">{card.label}</span>
                    <span className="text-lg">{card.icon}</span>
                  </div>
                  <p className={`text-xl font-bold ${card.color} leading-tight`}>{card.value}</p>
                  <p className="text-[10px] text-stone-300 mt-1">{periodLabel}</p>
                </div>
              ))}
            </div>

            {/* Combined chart: Revenue + Returns + Orders */}
            <div className="bg-white rounded-2xl shadow-md border border-stone-100 p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-sm font-bold text-stone-800">الإيرادات والطلبات والمرتجعات ({periodLabel})</h2>
              </div>
              {dashData.some(d => d.revenue > 0 || d.orders > 0) ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={dashData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#999' }} axisLine={{ stroke: '#eee' }} tickLine={false} interval={dashboardPeriod === 'day' ? 2 : 'preserveStartEnd'} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f0eb' }} />
                    <Bar yAxisId="left" dataKey="revenue" name="الإيرادات" radius={[4, 4, 0, 0]} fill="#f59e0b" maxBarSize={32} />
                    <Bar yAxisId="left" dataKey="returns" name="المرتجعات" radius={[4, 4, 0, 0]} fill="#ef4444" maxBarSize={32} />
                    <Bar yAxisId="right" dataKey="orders" name="الطلبات" radius={[4, 4, 0, 0]} fill="#3b82f6" opacity={0.5} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-10">
                  <TrendingUp className="h-10 w-10 text-stone-200 mx-auto mb-2" />
                  <p className="text-sm text-stone-400">لا توجد بيانات كافية</p>
                </div>
              )}
            </div>

            {/* Top drinks + Orders pie */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-md border border-stone-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
                    <Coffee className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-sm font-bold text-stone-800">أعلى المشروبات إيراداً</h2>
                </div>
                {topDrinks.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={topDrinks} layout="vertical" margin={{ left: 0, right: 10 }}>
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#999' }} axisLine={{ stroke: '#eee' }} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} width={85} />
                      <Tooltip cursor={{ fill: '#f5f0eb' }} />
                      <Bar dataKey="revenue" name="الإيرادات" radius={[0, 6, 6, 0]} fill="#10b981" maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-10">
                    <Coffee className="h-10 w-10 text-stone-200 mx-auto mb-2" />
                    <p className="text-sm text-stone-400">لا توجد بيانات</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-stone-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                    <ShoppingBag className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-sm font-bold text-stone-800">توزيع الطلبات ({periodLabel})</h2>
                </div>
                {dashData.some(d => d.orders > 0) ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={dashData.filter(d => d.orders > 0)} dataKey="orders" nameKey="label" cx="50%" cy="50%" outerRadius={85} innerRadius={30} label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#ddd', strokeWidth: 1 }}>
                        {dashData.filter(d => d.orders > 0).map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="white" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-10">
                    <ShoppingBag className="h-10 w-10 text-stone-200 mx-auto mb-2" />
                    <p className="text-sm text-stone-400">لا توجد بيانات</p>
                  </div>
                )}
              </div>
            </div>

            {/* Period detail table */}
            <div className="bg-white rounded-2xl shadow-md border border-stone-100 overflow-hidden">
              <div className="px-5 py-3.5 bg-gradient-to-l from-stone-50 to-stone-100 border-b border-stone-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-stone-700">تفصيل {dashboardPeriod === 'day' ? 'الساعات' : 'الأيام'}</h2>
                <span className="text-[10px] text-stone-400">{dashData.filter(d => d.revenue > 0 || d.orders > 0).length} فترة</span>
              </div>
              <div className="divide-y divide-stone-50">
                {dashData.filter(d => d.revenue > 0 || d.orders > 0 || d.returns > 0).length > 0 ? (
                  dashData.filter(d => d.revenue > 0 || d.orders > 0 || d.returns > 0).map(row => (
                    <div key={row.date} className="flex items-center justify-between px-5 py-3 hover:bg-amber-50/30 transition-colors">
                      <span className="text-sm font-semibold text-stone-700">{row.label}</span>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-stone-500">{row.orders} <span className="text-stone-300">طلب</span></span>
                        {row.returns > 0 && <span className="text-red-500 font-medium">-{row.returns.toLocaleString('ar-EG')} <span className="text-red-300">ج.م</span></span>}
                        <span className="font-bold text-amber-600">{row.revenue.toLocaleString('ar-EG')} <span className="text-amber-400 font-normal">ج.م</span></span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-stone-400 text-sm">لا توجد بيانات</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <img src={logoUrl} alt="Laguna Dubai" className="h-8 w-auto mx-auto mb-2 opacity-30 brightness-0" />
          <p className="text-xs text-stone-300">LAGUNA DUBAI &bull; التقارير تُحدث تلقائياً كل 10 ثواني</p>
        </div>
      </div>
    </div>
  );
}
