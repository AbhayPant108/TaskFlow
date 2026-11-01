'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import {
  loginSchema,
  registerSchema,
  LoginFormValues,
  RegisterFormValues,
} from '@/schemas/authSchema';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  LogIn,
  UserPlus,
  ShieldCheck,
  Eye,
  EyeOff,
  FolderKanban,
  CheckSquare,
  Users,
  Sparkles,
} from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, status, error, login, register: registerAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Password visibility toggles (see / unsee)
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);

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
      // error handled in Redux state
    }
  };

  const onRegister = async (data: RegisterFormValues) => {
    try {
      await registerAuth(data);
      resetRegister();
    } catch {
      // error handled in Redux state
    }
  };

  const setDemoUser = (email: string) => {
    setActiveTab('login');
    setLoginValue('email', email);
    setLoginValue('password', 'AdminPass123!');
  };

  // 1. Initial authentication loading state
  if (status === 'loading' && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/70 dark:bg-gray-950 p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xl shadow-xl animate-pulse mb-4">
          TF
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
          <span>Verifying session with TaskFlow...</span>
        </div>
      </div>
    );
  }

  // 2. Authenticated state: grant access to the application
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // 3. Unauthenticated state: display the secure Access Gate
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-12">
      {/* Decorative gradient blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xl shadow-xl shadow-indigo-500/20 mb-2">
            TF
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 px-3 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="h-3 w-3" /> Protected Team Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Welcome to TaskFlow
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            Please sign in to access your projects, tasks, and team members.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-medium text-gray-600 dark:text-gray-400">
          <div className="flex flex-col items-center p-2 rounded-lg bg-white/70 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-800/70 shadow-2xs">
            <FolderKanban className="h-4 w-4 mb-1 text-indigo-600 dark:text-indigo-400" />
            <span>Projects</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-white/70 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-800/70 shadow-2xs">
            <CheckSquare className="h-4 w-4 mb-1 text-purple-600 dark:text-purple-400" />
            <span>Tasks</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-white/70 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-800/70 shadow-2xs">
            <Users className="h-4 w-4 mb-1 text-emerald-600 dark:text-emerald-400" />
            <span>Teams</span>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="border border-gray-200 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:shadow-none bg-white dark:bg-gray-900">
          <CardHeader className="p-5 pb-3">
            {/* Quick Demo Credentials Pill */}
            <div className="rounded-lg bg-indigo-50/80 p-3 border border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/50">
              <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-1.5 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> 1-Click Demo Logins:
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  onClick={() => setDemoUser('admin@taskflow.dev')}
                  className="text-xs px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 font-medium cursor-pointer transition-colors"
                >
                  Alex (Admin)
                </Button>
                <button
                  type="button"
                  onClick={() => setDemoUser('sarah.chen@taskflow.dev')}
                  className="text-xs px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 font-medium cursor-pointer transition-colors"
                >
                  Sarah (Manager)
                </button>
                <button
                  type="button"
                  onClick={() => setDemoUser('david.kim@taskflow.dev')}
                  className="text-xs px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 font-medium cursor-pointer transition-colors"
                >
                  David (Member)
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-600 border border-red-200 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300 mt-2">
                {error}
              </div>
            )}
          </CardHeader>

          <CardContent className="p-5 pt-0">
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as 'login' | 'register')}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="flex items-center gap-1.5 text-xs font-semibold">
                  <LogIn className="h-3.5 w-3.5" /> Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-1.5 text-xs font-semibold">
                  <UserPlus className="h-3.5 w-3.5" /> Register
                </TabsTrigger>
              </TabsList>

              {/* SIGN IN TAB */}
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="alex@taskflow.dev"
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
                    <div className="relative">
                      <Input
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...regLogin('password')}
                        className={`pr-10 ${loginErrors.password ? 'border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer focus:outline-none"
                        aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="text-xs text-red-500">{loginErrors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-2 font-semibold"
                    disabled={isLoginSubmitting}
                  >
                    {isLoginSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <LogIn className="h-4 w-4 mr-2" />
                    )}
                    Sign In
                  </Button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-500">
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('register')}
                        className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                      >
                        Create an account
                      </button>
                    </p>
                  </div>
                </form>
              </TabsContent>

              {/* REGISTER TAB */}
              <TabsContent value="register">
                <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-3">
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
                    <div className="relative">
                      <Input
                        type={showRegisterPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...regRegister('password')}
                        className={`pr-10 ${registerErrors.password ? 'border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer focus:outline-none"
                        aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {registerErrors.password && (
                      <p className="text-xs text-red-500">{registerErrors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showRegisterConfirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...regRegister('password_confirm')}
                        className={`pr-10 ${registerErrors.password_confirm ? 'border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterConfirm((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer focus:outline-none"
                        aria-label={showRegisterConfirm ? 'Hide password' : 'Show password'}
                      >
                        {showRegisterConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {registerErrors.password_confirm && (
                      <p className="text-xs text-red-500">{registerErrors.password_confirm.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-2 font-semibold"
                    disabled={isRegisterSubmitting}
                  >
                    {isRegisterSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Create Account
                  </Button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-500">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                      >
                        Sign in instead
                      </button>
                    </p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
