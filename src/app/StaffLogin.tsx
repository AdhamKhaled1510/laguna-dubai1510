import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Coffee, CookingPot, BarChart3, QrCode, Receipt, Lock, X } from 'lucide-react';
import logoUrl from '@/assets/logo.png';
import { getPassword } from './lib/orders';

const DEFAULT_PASSWORDS: Record<string, string> = {
  waiter: '1234',
  barista: '1234',
  reports: '1234',
  invoices: '1234',
};

export default function StaffLogin() {
  const navigate = useNavigate();
  const [passwordModal, setPasswordModal] = useState<{ role: string; path: string } | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'waiter',
      label: 'ويتر',
      desc: 'تسجيل الطلبات',
      path: '/waiter',
      icon: Coffee,
      gradient: 'from-amber-500 to-amber-600',
      shadow: 'shadow-amber-900/30',
      hover: 'hover:from-amber-400 hover:to-amber-500',
    },
    {
      id: 'barista',
      label: 'باريستا',
      desc: 'تحضير المشروبات',
      path: '/barista',
      icon: CookingPot,
      gradient: 'from-stone-700 to-stone-800',
      shadow: 'shadow-stone-900/30',
      hover: 'hover:from-stone-600 hover:to-stone-700',
    },
    {
      id: 'reports',
      label: 'التقارير',
      desc: 'إحصائيات المبيعات',
      path: '/reports',
      icon: BarChart3,
      gradient: 'from-emerald-600 to-emerald-700',
      shadow: 'shadow-emerald-900/30',
      hover: 'hover:from-emerald-500 hover:to-emerald-600',
    },
  ];

  const handleRoleClick = async (role: (typeof roles)[0]) => {
    setPasswordModal({ role: role.id, path: role.path });
    setPassword('');
    setPasswordError(false);
  };

  const handlePasswordSubmit = async () => {
    setLoading(true);
    setPasswordError(false);
    try {
      const stored = await getPassword(passwordModal!.role as any);
      const expected = stored || DEFAULT_PASSWORDS[passwordModal!.role] || '1234';
      if (password === expected) {
        setPasswordModal(null);
        navigate(passwordModal!.path);
      } else {
        setPasswordError(true);
      }
    } catch {
      setPasswordError(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2242] via-[#0d2d52] to-[#0A2242] flex flex-col items-center justify-center p-6 text-white" dir="rtl">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm mx-auto text-center">
        <div className="mb-8">
          <img src={logoUrl} alt="Laguna Dubai" className="h-20 md:h-24 w-auto mx-auto mb-4 brightness-0 invert" />
          <h1 className="text-xl md:text-2xl font-bold tracking-[0.12em]" style={{ fontFamily: "'Playfair Display', serif" }}>LAGUNA DUBAI</h1>
          <p className="text-[10px] md:text-xs text-white/40 tracking-[0.25em] mt-1">STAFF PORTAL</p>
        </div>
        <p className="text-base md:text-lg text-white/70 mb-8">مرحباً بك، اختر وظيفتك</p>
        <div className="space-y-3 md:space-y-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleClick(role)}
                className={`w-full py-4 md:py-5 px-6 bg-gradient-to-l ${role.gradient} ${role.hover} text-white font-bold text-base md:text-lg rounded-2xl shadow-2xl ${role.shadow} transition-all duration-200 active:scale-[0.98] flex items-center gap-4`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-right flex-1">
                  <p className="font-bold">{role.label}</p>
                  <p className="text-xs text-white/60 font-normal">{role.desc}</p>
                </div>
                <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6"/></svg>
              </button>
            );
          })}
        </div>

        {/* Quick links */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/qrcodes')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white/80 text-sm transition-colors"
          >
            <QrCode className="h-4 w-4" />
            QR الكود
          </button>
          <button
            onClick={() => {
              const pw = prompt('الرجاء إدخال كلمة سر التقارير للدخول إلى الفواتير');
              if (pw) {
                getPassword('invoices').then(stored => {
                  const expected = stored || DEFAULT_PASSWORDS.invoices;
                  if (pw === expected) {
                    navigate('/invoices');
                  } else {
                    alert('كلمة السر خطأ');
                  }
                });
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white/80 text-sm transition-colors"
          >
            <Receipt className="h-4 w-4" />
            الفواتير
          </button>
        </div>

        <p className="text-[10px] text-white/20 mt-12">اختر وظيفتك للدخول إلى لوحة التحكم الخاصة بك</p>
      </div>

      {/* Password Modal */}
      {passwordModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setPasswordModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{animation: 'fadeIn 0.15s ease-out'}}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setPasswordModal(null)}
                className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-700 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-lg font-bold text-stone-800 mb-1">
                {passwordModal.role === 'waiter' ? 'ويتر' : passwordModal.role === 'barista' ? 'باريستا' : 'التقارير'}
              </h2>
              <p className="text-xs text-stone-400 mb-5">الرجاء إدخال كلمة السر</p>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordError(false); }}
                onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="كلمة السر"
                autoFocus
                className={`w-full px-4 py-3 text-center text-sm rounded-xl border transition-colors outline-none ${
                  passwordError
                    ? 'border-red-300 bg-red-50 text-red-700 placeholder:text-red-300'
                    : 'border-stone-200 bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20'
                }`}
              />
              {passwordError && (
                <p className="text-xs text-red-500 mt-2">كلمة السر خطأ، حاول مرة أخرى</p>
              )}
              <button
                onClick={handlePasswordSubmit}
                disabled={loading || !password}
                className="w-full mt-4 py-3 bg-gradient-to-l from-stone-800 to-stone-700 hover:from-stone-700 hover:to-stone-600 text-white font-bold text-sm rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'جاري التحقق...' : 'دخول'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
