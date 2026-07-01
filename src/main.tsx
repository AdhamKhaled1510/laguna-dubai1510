import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from 'react-router';
import StaffLogin from "./app/StaffLogin";
import WaiterPage from "./app/App";
import BaristaPage from "./app/BaristaPage";
import ReportsPage from "./app/ReportsPage";
import InvoicesPage from "./app/InvoicesPage";
import QRCodesPage from "./app/QRCodesPage";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<StaffLogin />} />
      <Route path="/waiter" element={<WaiterPage />} />
      <Route path="/barista" element={<BaristaPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/invoices" element={<InvoicesPage />} />
      <Route path="/qrcodes" element={<QRCodesPage />} />
    </Routes>
  </HashRouter>
);
