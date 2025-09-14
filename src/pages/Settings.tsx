import { useEffect, useState } from 'react';
import { Percent, Clock, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/services/api';
import { Config } from '@/types';
import { useAuthStore } from '@/store/auth';

export function Settings() {
  const [config, setConfig] = useState<Config>({});
  const [loading, setLoading] = useState(true);
  const [, setSaving] = useState(false);
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/config');
      setConfig(response.data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (key: string, value: string) => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem alterar configurações');
      return;
    }

    try {
      setSaving(true);
      await api.put('/config', {
        key,
        value,
        description: config[key]?.description
      });
      
      setConfig(prev => ({
        ...prev,
        [key]: { ...prev[key], value }
      }));
      
      toast.success('Configuração atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const configItems = [
    {
      key: 'IFOOD_FEE_PERCENT',
      label: 'Taxa do iFood (%)',
      description: 'Porcentagem de taxa cobrada pelo iFood',
      icon: Percent,
      type: 'number',
      suffix: '%'
    },
    {
      key: 'DEFAULT_LABOR_RATE_PER_HOUR',
      label: 'Taxa de Mão de Obra por Hora',
      description: 'Valor padrão da hora de trabalho em reais',
      icon: Clock,
      type: 'number',
      prefix: 'R$'
    },
    {
      key: 'DEFAULT_MARGIN_PERCENT',
      label: 'Margem Padrão (%)',
      description: 'Margem padrão sugerida para novos produtos',
      icon: DollarSign,
      type: 'number',
      suffix: '%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure parâmetros do sistema
          </p>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {configItems.map((item) => {
          const configValue = config[item.key];
          
          return (
            <div key={item.key} className="card">
              <div className="card-content p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <item.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.label}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      {item.prefix && (
                        <span className="text-gray-500 text-sm">{item.prefix}</span>
                      )}
                      
                      <input
                        type={item.type}
                        value={configValue?.value || ''}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setConfig(prev => ({
                            ...prev,
                            [item.key]: { ...prev[item.key], value: newValue }
                          }));
                        }}
                        onBlur={(e) => {
                          const newValue = e.target.value;
                          if (newValue !== configValue?.value) {
                            updateConfig(item.key, newValue);
                          }
                        }}
                        disabled={!isAdmin}
                        className="input flex-1"
                        placeholder="0"
                        step={item.type === 'number' ? '0.01' : undefined}
                      />
                      
                      {item.suffix && (
                        <span className="text-gray-500 text-sm">{item.suffix}</span>
                      )}
                    </div>
                    
                    {!isAdmin && (
                      <p className="text-xs text-gray-500 mt-2">
                        Apenas administradores podem alterar configurações
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Informações do Usuário</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Perfil</label>
              <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user?.role === 'ADMIN' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user?.role === 'ADMIN' ? 'Administrador' : 'Operador'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Informações do Sistema</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Versão:</span>
              <span className="ml-2 font-medium">1.0.0</span>
            </div>
            
            <div>
              <span className="text-gray-600">Ambiente:</span>
              <span className="ml-2 font-medium">
                {import.meta.env.MODE === 'development' ? 'Desenvolvimento' : 'Produção'}
              </span>
            </div>
            
            <div>
              <span className="text-gray-600">API URL:</span>
              <span className="ml-2 font-medium text-xs">
                {import.meta.env.VITE_API_URL || 'http://localhost:3001'}
              </span>
            </div>
            
            <div>
              <span className="text-gray-600">Última atualização:</span>
              <span className="ml-2 font-medium">Janeiro 2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
