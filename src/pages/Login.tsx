import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Cake, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/auth';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme a senha'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      setAuth(response.user, response.token);
      toast.success(`Bem-vindo(a), ${response.user.name}!`);
      navigate('/');
    } catch (error: any) {
      console.error('Erro no login:', error);
      const message = error?.response?.data?.error || 'Email ou senha incorretos';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success('Conta criada com sucesso! Faça login para continuar.');
      setIsRegisterMode(false);
      loginForm.setValue('email', data.email);
      registerForm.reset();
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      const message = error?.response?.data?.error || 'Erro ao criar conta';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary-100 rounded-full">
            <Cake className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Mariana Doces
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRegisterMode
              ? 'Crie sua conta para acessar o sistema'
              : 'Faça login para acessar o sistema de gestão'}
          </p>
        </div>

        {!isRegisterMode ? (
          /* Login Form */
          <form className="mt-8 space-y-6" onSubmit={loginForm.handleSubmit(onLogin)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  {...loginForm.register('email')}
                  type="email"
                  id="login-email"
                  autoComplete="email"
                  className="input mt-1"
                  placeholder="seu@email.com"
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="relative mt-1">
                  <input
                    {...loginForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    autoComplete="current-password"
                    className="input pr-10"
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Criar conta
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form className="mt-8 space-y-6" onSubmit={registerForm.handleSubmit(onRegister)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="register-name" className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  {...registerForm.register('name')}
                  type="text"
                  id="register-name"
                  autoComplete="name"
                  className="input mt-1"
                  placeholder="Seu nome completo"
                />
                {registerForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  {...registerForm.register('email')}
                  type="email"
                  id="register-email"
                  autoComplete="email"
                  className="input mt-1"
                  placeholder="seu@email.com"
                />
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="relative mt-1">
                  <input
                    {...registerForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="register-password"
                    autoComplete="new-password"
                    className="input pr-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="register-confirm" className="block text-sm font-medium text-gray-700">
                  Confirmar Senha
                </label>
                <input
                  {...registerForm.register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  id="register-confirm"
                  autoComplete="new-password"
                  className="input mt-1"
                  placeholder="Repita a senha"
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Fazer login
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
