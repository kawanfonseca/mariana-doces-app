import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut,
  User,
  Cake,
  Archive,
  Warehouse,
  FileText,
  Users,
  ClipboardList
} from 'lucide-react';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Produtos', href: '/produtos', icon: Cake },
    { name: 'Ingredientes', href: '/ingredientes', icon: Package },
    { name: 'Embalagens', href: '/embalagens', icon: Archive },
    { name: 'Gerenciamento de Estoque', href: '/gerenciamento-estoque', icon: Warehouse },
    { name: 'Relatórios de Estoque', href: '/relatorios-estoque', icon: FileText },
    { name: 'Adicionar Vendas', href: '/vendas', icon: ShoppingCart },
    { name: 'Histórico de Vendas', href: '/historico-vendas', icon: ClipboardList },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
    ...(user?.role === 'ADMIN' ? [{ name: 'Usuários', href: '/usuarios', icon: Users }] : []),
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
          <h1 className="text-xl font-bold text-white">Mariana Doces</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role === 'ADMIN' ? 'Administrador' : 'Operador'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
