import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Products } from '@/pages/Products';
import { ProductDetail } from '@/pages/ProductDetail';
import { DailySales } from '@/pages/DailySales';
import { Reports } from '@/pages/Reports';
import { Ingredients } from '@/pages/Ingredients';
import { PackagingPage } from '@/pages/Packaging';
import { Settings } from '@/pages/Settings';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } />
          
          <Route path="/" element={
            isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
          }>
            <Route index element={<Dashboard />} />
            <Route path="produtos" element={<Products />} />
            <Route path="produtos/:id" element={<ProductDetail />} />
            <Route path="vendas" element={<DailySales />} />
            <Route path="relatorios" element={<Reports />} />
            <Route path="ingredientes" element={<Ingredients />} />
            <Route path="embalagens" element={<PackagingPage />} />
            <Route path="configuracoes" element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
