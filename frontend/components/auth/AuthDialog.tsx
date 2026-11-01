'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import {
  loginSchema,
  registerSchema,
  LoginFormValues,
  RegisterFormValues,
} from '@/schemas/authSchema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, LogIn, UserPlus, ShieldCheck } from 'lucide-react';

export function AuthDialog() {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuth,
    login,
    register: registerAuth,
    error,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalMode);

  // Sync activeTab when authModalMode changes
  if (isAuthModalOpen && activeTab !== authModalMode) {
    setActiveTab(authModalMode);
  }

  // Login Form
  const {
    register: regLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    reset: resetLogin,
    setValue: setLoginValue,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Register Form
  const {
    register: regRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
    reset: resetRegister,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password_confirm: '',
    },
  });

  const onLogin = async (data: LoginFormValues) => {
    try {
      await login(data);
      resetLogin();
    } catch {
      // Error handled in redux state
    }
  };

  const onRegister = async (data: RegisterFormValues) => {
    try {
      await registerAuth(data);
      resetRegister();
    } catch {
      // Error handled in redux state
    }
  };

  // Quick Demo Account Helper
  const setDemoUser = (email: string) => {
    setLoginValue('email', email);
    setLoginValue('password', 'AdminPass123!');
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuth()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
              TF
            </span>
            TaskFlow Account
          </DialogTitle>
          <DialogDescription>
            Sign in to manage projects, assign tasks, and collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        {/* Demo Credentials Quick-Select Pill */}
        <div className="rounded-lg bg-indigo-50 p-3 border border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/50">
          <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-1.5 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Quick Demo Accounts (Click to autofill):
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setDemoUser('admin@taskflow.dev');
              }}
              className="text-xs px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 font-medium cursor-pointer"
            >
              Alex (Admin)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setDemoUser('sarah.chen@taskflow.dev');
              }}
              className="text-xs px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 font-medium cursor-pointer"
            >
              Sarah (Manager)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setDemoUser('david.kim@taskflow.dev');
              }}
              className="text-xs px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 font-medium cursor-pointer"
            >
              David (Member)
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
            {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-1.5">
              <LogIn className="h-4 w-4" /> Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-1.5">
              <UserPlus className="h-4 w-4" /> Register
            </TabsTrigger>
          </TabsList>

          {/* SIGN IN TAB */}
          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="name@taskflow.dev"
                  {...regLogin('email')}
                  className={loginErrors.email ? 'border-red-500' : ''}
                />
                {loginErrors.email && (
                  <p className="text-xs text-red-500">{loginErrors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...regLogin('password')}
                  className={loginErrors.password ? 'border-red-500' : ''}
                />
                {loginErrors.password && (
                  <p className="text-xs text-red-500">{loginErrors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isLoginSubmitting}
              >
                {isLoginSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                Sign In
              </Button>
            </form>
          </TabsContent>

          {/* REGISTER TAB */}
          <TabsContent value="register">
            <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <Input
                    placeholder="Alex"
                    {...regRegister('first_name')}
                    className={registerErrors.first_name ? 'border-red-500' : ''}
                  />
                  {registerErrors.first_name && (
                    <p className="text-xs text-red-500">{registerErrors.first_name.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <Input
                    placeholder="Morgan"
                    {...regRegister('last_name')}
                    className={registerErrors.last_name ? 'border-red-500' : ''}
                  />
                  {registerErrors.last_name && (
                    <p className="text-xs text-red-500">{registerErrors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="alex@example.com"
                  {...regRegister('email')}
                  className={registerErrors.email ? 'border-red-500' : ''}
                />
                {registerErrors.email && (
                  <p className="text-xs text-red-500">{registerErrors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Password (min 8 characters)
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...regRegister('password')}
                  className={registerErrors.password ? 'border-red-500' : ''}
                />
                {registerErrors.password && (
                  <p className="text-xs text-red-500">{registerErrors.password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...regRegister('password_confirm')}
                  className={registerErrors.password_confirm ? 'border-red-500' : ''}
                />
                {registerErrors.password_confirm && (
                  <p className="text-xs text-red-500">
                    {registerErrors.password_confirm.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isRegisterSubmitting}
              >
                {isRegisterSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
