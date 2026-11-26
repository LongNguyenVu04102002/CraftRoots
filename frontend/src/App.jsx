// COMPONENT GỐC
// Nhiệm vụ: kết hợp bộ định tuyến và các thành phần giao diện cấp cao.
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}