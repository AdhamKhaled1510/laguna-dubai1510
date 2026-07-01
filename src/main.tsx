import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, useNavigate } from 'react-router';
import StaffLogin from "./app/StaffLogin";
import WaiterPage from "./app/App";
import WaiterOrdersPage from "./app/WaiterOrdersPage";
import BaristaPage from "./app/BaristaPage";
import ReportsPage from "./app/ReportsPage";
import InvoicesPage from "./app/InvoicesPage";
import QRCodesPage from "./app/QRCodesPage";
import "./styles/index.css";

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f5f0eb] flex flex-col items-center justify-center p-6" dir="rtl">
      <h1 className="text-6xl font-bold text-stone-300 mb-4">404</h1>
      <p className="text-lg text-stone-400 mb-6">الصفحة غير موجودة</p>
      <button onClick={() => navigate('/')} className="px-6 py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition-colors">
        العودة للرئيسية
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<StaffLogin />} />
      <Route path="/waiter" element={<WaiterPage />} />
      <Route path="/waiter-orders" element={<WaiterOrdersPage />} />
      <Route path="/barista" element={<BaristaPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/invoices" element={<InvoicesPage />} />
      <Route path="/qrcodes" element={<QRCodesPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </HashRouter>
);
