import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { getOrders, clearAllOrders, saveDailyReport, getDailyReports, getInvoices, DailyReport, Order, Invoice } from './lib/orders';
import { ArrowLeft, BarChart3, Coffee, DollarSign, ShoppingBag, TrendingUp, Trash2, Calendar, ChevronDown, LayoutDashboard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import logoUrl from '@/assets/logo.png';

type ViewMode = 'today' | 'day' | 'month' | 'dashboard';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedReports, setSavedReports] = useState<DailyReport[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [clearing, setClearing] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

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
  const last7Days = useMemo(() => {
    const days: { date: string; revenue: number; orders: number; items: number; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const report = savedReports.find(r => r.date === dateStr);
      const label = d.toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric' });
      days.push({
        date: dateStr,
        revenue: report?.totalRevenue || 0,
        orders: report?.totalOrders || 0,
        items: report?.totalItems || 0,
        label,
      });
    }
    return days;
  }, [savedReports]);

  const topDrinks = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of savedReports) {
      for (const d of r.drinks) {
        map.set(d.nameAr, (map.get(d.nameAr) || 0) + d.revenue);
      }
    }
    return Array.from(map.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [savedReports]);

  const returnsTotal = useMemo(() => {
    return invoices
      .filter(i => i.status === 'returned' || i.status === 'partial_return')
      .reduce((s, i) => s + i.totalPrice, 0);
  }, [invoices]);

  const netRevenue = last7Days.reduce((s, d) => s + d.revenue, 0) - returnsTotal;

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white shadow-lg border border-stone-100 rounded-xl p-3 text-xs">
          <p className="font-bold text-stone-800 mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }} className="font-medium">
              {p.name}: {p.value.toLocaleString('ar-EG')} {p.name === 'المبيعات' ? 'ج.م' : ''}
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
          {viewMode === 'today' && orders.length > 0 && (
            <button
              onClick={handleClearToday}
              disabled={clearing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {clearing ? 'جاري الأرشفة...' : 'أرشفة ومسح'}
            </button>
          )}
          {viewMode !== 'today' && <div className="w-24" />}
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
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                <p className="text-xs text-stone-400 mb-1">إجمالي الإيرادات (7 أيام)</p>
                <p className="text-xl font-bold text-amber-600">{last7Days.reduce((s, d) => s + d.revenue, 0).toLocaleString('ar-EG')} ج.م</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                <p className="text-xs text-stone-400 mb-1">المرتجعات</p>
                <p className="text-xl font-bold text-red-500">{returnsTotal.toLocaleString('ar-EG')} ج.م</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                <p className="text-xs text-stone-400 mb-1">صافي الربح</p>
                <p className="text-xl font-bold text-emerald-600">{netRevenue.toLocaleString('ar-EG')} ج.م</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                <p className="text-xs text-stone-400 mb-1">إجمالي الطلبات</p>
                <p className="text-xl font-bold text-stone-800">{last7Days.reduce((s, d) => s + d.orders, 0)}</p>
              </div>
            </div>

            {/* Revenue chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-bold text-stone-800">اتجاه الإيرادات (آخر 7 أيام)</h2>
              </div>
              {last7Days.some(d => d.revenue > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={last7Days}>
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="المبيعات" radius={[6, 6, 0, 0]} fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-sm text-stone-400 py-8">لا توجد بيانات كافية</p>
              )}
            </div>

            {/* Top drinks + Orders chart */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Coffee className="h-4 w-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-stone-800">أعلى المشروبات إيراداً</h2>
                </div>
                {topDrinks.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={topDrinks} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenue" name="الإيرادات" radius={[0, 6, 6, 0]} fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-sm text-stone-400 py-8">لا توجد بيانات</p>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="h-4 w-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-stone-800">توزيع الطلبات (7 أيام)</h2>
                </div>
                {last7Days.some(d => d.orders > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={last7Days.filter(d => d.orders > 0)} dataKey="orders" nameKey="label" cx="50%" cy="50%" outerRadius={80} label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                        {last7Days.filter(d => d.orders > 0).map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-sm text-stone-400 py-8">لا توجد بيانات</p>
                )}
              </div>
            </div>

            {/* Day-by-day table */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-stone-100">
                <h2 className="text-sm font-bold text-stone-800">تفصيل الأيام</h2>
              </div>
              <div className="divide-y divide-stone-50">
                {last7Days.map(day => (
                  <div key={day.date} className="flex items-center justify-between px-5 py-3 hover:bg-stone-50/50 transition-colors">
                    <span className="text-sm font-medium text-stone-800">{day.label}</span>
                    <div className="flex items-center gap-4 text-xs text-stone-500">
                      <span>{day.orders} طلب</span>
                      <span>{day.items} قطعة</span>
                      <span className="font-bold text-amber-600">{day.revenue.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                  </div>
                ))}
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
