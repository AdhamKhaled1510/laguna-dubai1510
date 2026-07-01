import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Receipt, Search, Undo2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getInvoices, updateInvoiceStatus, Invoice } from './lib/orders';
import logoUrl from '@/assets/logo.png';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'returned' | 'partial_return'>('all');

  useEffect(() => {
    const fetch = async () => {
      setInvoices(await getInvoices());
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReturn = async (inv: Invoice) => {
    const reason = prompt('السبب (اختياري):');
    await updateInvoiceStatus(inv.id, 'returned', inv.items.map(i => ({ nameAr: i.nameAr, quantity: i.quantity })));
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'returned', returnedItems: inv.items.map(item => ({ nameAr: item.nameAr, quantity: item.quantity })) } : i));
  };

  const handlePartialReturn = async (inv: Invoice) => {
    const items = inv.items.map(i => `${i.nameAr} (${i.quantity})`).join(', ');
    const input = prompt(`اختر الأصناف للمرتجع (مثال: ${inv.items[0]?.nameAr || ''}):\nالأصناف المتاحة: ${items}`);
    if (!input) return;
    const returnedItems = inv.items
      .filter(i => input.includes(i.nameAr))
      .map(i => ({ nameAr: i.nameAr, quantity: i.quantity }));
    if (returnedItems.length === 0) {
      alert('لم يتم العثور على الأصناف المحددة');
      return;
    }
    await updateInvoiceStatus(inv.id, 'partial_return', returnedItems);
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'partial_return', returnedItems } : i));
  };

  const filtered = invoices
    .filter(inv => filter === 'all' || inv.status === filter)
    .filter(inv => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.tableNumber.toString().includes(q) ||
        inv.items.some(i => i.nameAr.includes(q))
      );
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg"><CheckCircle className="h-3 w-3" />مدفوعة</span>;
      case 'returned': return <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg"><XCircle className="h-3 w-3" />مرتجعة</span>;
      case 'partial_return': return <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg"><Undo2 className="h-3 w-3" />مرتجعة جزئياً</span>;
      default: return null;
    }
  };

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.totalPrice, 0);
  const totalReturns = invoices.filter(i => i.status === 'returned' || i.status === 'partial_return').reduce((s, i) => s + i.totalPrice, 0);

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
            <Receipt className="h-5 w-5 text-amber-600" />
            <h1 className="text-xl font-bold text-stone-800">الفواتير والمرتجعات</h1>
          </div>
          <div className="w-24" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <p className="text-xs text-stone-400 mb-1">إجمالي الإيرادات</p>
            <p className="text-2xl font-bold text-emerald-600">{totalRevenue.toLocaleString('ar-EG')} ج.م</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <p className="text-xs text-stone-400 mb-1">إجمالي المرتجعات</p>
            <p className="text-2xl font-bold text-red-500">{totalReturns.toLocaleString('ar-EG')} ج.م</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {(['all', 'paid', 'returned', 'partial_return'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              {f === 'all' ? 'الكل' : f === 'paid' ? 'مدفوعة' : f === 'returned' ? 'مرتجعة' : 'جزئي'}
            </button>
          ))}
          <div className="relative mr-auto">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-300" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث..."
              className="pr-8 pl-3 py-1.5 text-xs rounded-lg bg-white border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 outline-none w-32"
            />
          </div>
        </div>

        {/* Invoices List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Receipt className="h-12 w-12 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-400 text-sm">لا توجد فواتير</p>
            </div>
          ) : (
            filtered.map(inv => (
              <div key={inv.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-stone-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-800">{inv.invoiceNumber}</span>
                    {statusBadge(inv.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-stone-300" />
                    <span className="text-xs text-stone-400">{formatTime(inv.createdAt)}</span>
                  </div>
                </div>
                <div className="px-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-stone-400">ترابيزة</span>
                    <span className="text-sm font-bold text-stone-800">{inv.tableNumber}</span>
                  </div>
                  {inv.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5 border-b border-stone-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-stone-100 text-xxs font-bold text-stone-500 flex items-center justify-center shrink-0 text-[10px]">{item.quantity}</span>
                        <span className="text-xs font-medium text-stone-800">{item.nameAr}</span>
                      </div>
                      <span className="text-xs text-stone-400">{item.price} ج.م</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 bg-stone-50 flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-800">الإجمالي: {inv.totalPrice} ج.م</span>
                  <div className="flex gap-2">
                    {inv.status === 'paid' && (
                      <>
                        <button
                          onClick={() => handlePartialReturn(inv)}
                          className="px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                        >
                          مرتجع جزئي
                        </button>
                        <button
                          onClick={() => handleReturn(inv)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          مرتجع كلي
                        </button>
                      </>
                    )}
                    {inv.returnedItems && inv.returnedItems.length > 0 && (
                      <span className="text-xs text-stone-400">
                        المرتجع: {inv.returnedItems.map(r => `${r.nameAr} (${r.quantity})`).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <img src={logoUrl} alt="Laguna Dubai" className="h-8 w-auto mx-auto mb-2 opacity-30 brightness-0" />
          <p className="text-xs text-stone-300">LAGUNA DUBAI &bull; الفواتير تُحدث تلقائياً</p>
        </div>
      </div>
    </div>
  );
}
