import { Routes, Route } from 'react-router';
import ScanPage from './pages/ScanPage';
import InventoryPage from './pages/InventoryPage';
import HistoryPage from './pages/HistoryPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ScanPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
