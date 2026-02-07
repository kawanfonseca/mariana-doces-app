import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Products } from '@/pages/Products';
import { ProductDetail } from '@/pages/ProductDetail';
import { ProductForm } from '@/pages/ProductForm';
import { DailySales } from '@/pages/DailySales';
import { Reports } from '@/pages/Reports';
import { Ingredients } from '@/pages/Ingredients';
import { IngredientForm } from '@/pages/IngredientForm';
import { PackagingPage } from '@/pages/Packaging';
import { PackagingForm } from '@/pages/PackagingForm';
import { ProductRecipe } from '@/pages/ProductRecipe';
import { Inventory } from '@/pages/Inventory';
import { StockManagement } from '@/pages/StockManagement';
import { StockReports } from '@/pages/StockReports';
import { Settings } from '@/pages/Settings';
import { UserManagement } from '@/pages/UserManagement';
import { SalesHistory } from '@/pages/SalesHistory';

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
            <Route path="produtos/novo" element={<ProductForm />} />
            <Route path="produtos/:id" element={<ProductDetail />} />
            <Route path="produtos/:id/editar" element={<ProductForm />} />
            <Route path="produtos/:id/receita" element={<ProductRecipe />} />
            <Route path="vendas" element={<DailySales />} />
            <Route path="historico-vendas" element={<SalesHistory />} />
            <Route path="relatorios" element={<Reports />} />
            <Route path="ingredientes" element={<Ingredients />} />
            <Route path="ingredientes/novo" element={<IngredientForm />} />
            <Route path="ingredientes/:id/editar" element={<IngredientForm />} />
            <Route path="embalagens" element={<PackagingPage />} />
            <Route path="embalagens/novo" element={<PackagingForm />} />
            <Route path="embalagens/:id/editar" element={<PackagingForm />} />
            <Route path="estoque" element={<Inventory />} />
            <Route path="gerenciamento-estoque" element={<StockManagement />} />
            <Route path="relatorios-estoque" element={<StockReports />} />
            <Route path="usuarios" element={<UserManagement />} />
            <Route path="configuracoes" element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
