import { Routes, Route } from 'react-router';
import ScanPage from './pages/ScanPage';
import ProductsPage from './pages/ProductsPage';
import DashboardPage from './pages/DashboardPage';
import StaffUsagePage from './pages/StaffUsagePage';
import HistoryPage from './pages/HistoryPage';
import StockCountPage from './pages/StockCountPage';
import StaffPage from './pages/StaffPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ScanPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/staff-usage" element={<StaffUsagePage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/counts" element={<StockCountPage />} />
      <Route path="/counts/:id" element={<StockCountPage />} />
      <Route path="/staff" element={<StaffPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
