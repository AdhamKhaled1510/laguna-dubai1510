import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from 'react-router';
import StaffLogin from "./app/StaffLogin";
import WaiterPage from "./app/App";
import BaristaPage from "./app/BaristaPage";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename="/laguna-dubai1510">
    <Routes>
      <Route path="/" element={<StaffLogin />} />
      <Route path="/waiter" element={<WaiterPage />} />
      <Route path="/barista" element={<BaristaPage />} />
    </Routes>
  </BrowserRouter>
);
