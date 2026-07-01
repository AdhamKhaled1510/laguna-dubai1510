import { useNavigate } from 'react-router';
import { ArrowLeft, Printer, QrCode } from 'lucide-react';
import logoUrl from '@/assets/logo.png';

const QR_API = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=';
const BASE = window.location.origin + (import.meta as any).env.BASE_URL;

export default function QRCodesPage() {
  const navigate = useNavigate();

  const tables = Array.from({ length: 20 }, (_, i) => i + 1);

  const qrUrl = (table: number) => {
    return `${QR_API}${encodeURIComponent(`${BASE}#/waiter?table=${table}`)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f5f0eb]" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 no-print">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">رجوع</span>
          </button>
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-amber-600" />
            <h1 className="text-xl font-bold text-stone-800">QR كود</h1>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Printer className="h-4 w-4" />
            طباعة
          </button>
        </div>

        <p className="text-sm text-stone-400 mb-6 text-center">
          امسح QR كود للدخول إلى قائمة الطعام وطلب المشروبات
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tables.map(table => (
            <div key={table} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 text-center">
              <div className="text-center mb-3">
                <span className="text-xs text-stone-400">ترابيزة</span>
                <p className="text-lg font-bold text-stone-800">{table}</p>
              </div>
              <img
                src={qrUrl(table)}
                alt={`Table ${table} QR`}
                className="w-full aspect-square object-contain rounded-xl bg-white"
                loading="lazy"
              />
              <p className="text-[10px] text-stone-300 mt-2">امسح للطلب</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center no-print">
          <img src={logoUrl} alt="Laguna Dubai" className="h-8 w-auto mx-auto mb-2 opacity-30 brightness-0" />
        </div>
      </div>
    </div>
  );
}
