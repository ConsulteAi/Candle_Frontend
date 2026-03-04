'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Loader2, AlertCircle } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { loginSchema } from '@/validators/auth.schemas';
import type { LoginDTO } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TenantBrand } from '@/components/ui/TenantBrand';
import { TenantLogo } from '@/components/ui/TenantLogo';

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginDTO) => {
    setIsLoading(true);
    setLoginError(null);
    // Artificial delay for specific "premium feel" requested in design system
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    try {
      const result = await login(data);

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof LoginDTO, {
              type: 'server',
              message: messages[0],
            });
          });
        } else if (result.error) {
           setLoginError(result.error);
        }
      }
    } catch (err) {
      setLoginError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-cyan-50">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-primary/40 to-transparent blur-3xl animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-r from-primary/30 to-transparent blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 right-[20%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-cyan-500/40 to-transparent blur-3xl animate-pulse delay-1000" />

      <motion.div
        className="relative z-10 w-full max-w-[480px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo Section */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-4"
          >

        <Link href="/" className="flex-shrink-0">
          <motion.div
            className="flex items-center gap-4 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300">
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <TenantLogo className="w-12 h-12" />
            </div>
            <div className="flex flex-col text-left">
              <TenantBrand className="text-2xl tracking-tight text-slate-900 leading-none group-hover:text-primary transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 leading-none mt-1 group-hover:text-primary/70 transition-colors">
                Platform
              </span>
            </div>
          </motion.div>
        </Link>
          </motion.div>
          <p className="text-gray-600 font-medium">
            Consultas de Crédito Inteligentes
          </p>
        </div>

        {/* Login Card */}
        <motion.div
          className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden group"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
           {/* Shimmer effect on hover */}
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-8">
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
                Bem-vindo de volta
              </h2>
              <p className="text-gray-600">
                Entre com suas credenciais para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 ml-2 font-medium">
                      {loginError}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className={`text-sm font-semibold transition-colors ${focusedField === 'email' ? 'text-primary' : 'text-gray-700'}`}>
                  Email
                </Label>
                <div className="relative">
                  {focusedField === 'email' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-primary rounded-xl opacity-20 blur-md"
                      layoutId="input-glow"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register('email')}
                    className={`relative z-10 h-12 bg-white/60 backdrop-blur-sm border-2 rounded-xl transition-all duration-200 ${
                      focusedField === 'email'
                        ? 'border-primary bg-white shadow-lg shadow-primary/20 focus-visible:ring-0 focus-visible:ring-offset-0'
                        : 'border-primary/20 hover:border-primary/30'
                    } ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className={`text-sm font-semibold transition-colors ${focusedField === 'password' ? 'text-primary' : 'text-gray-700'}`}>
                    Senha
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-primary hover:text-primary/90 relative inline-block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-primary after:transition-all hover:after:w-full"
                  >
                    Esqueceu?
                  </Link>
                </div>
                <div className="relative">
                  {focusedField === 'password' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-primary rounded-xl opacity-20 blur-md"
                      layoutId="input-glow"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className={`relative z-10 h-12 bg-white/60 backdrop-blur-sm border-2 rounded-xl transition-all duration-200 ${
                      focusedField === 'password'
                        ? 'border-primary bg-white shadow-lg shadow-primary/20 focus-visible:ring-0 focus-visible:ring-offset-0'
                        : 'border-primary/20 hover:border-primary/30'
                    } ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    disabled={isLoading}
                  />
                </div>
                 {errors.password && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                 <Checkbox id="terms" className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                 <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
                  >
                    Lembrar-me neste dispositivo
                  </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-primary rounded-xl font-display font-bold text-base text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group relative"
              >
                  <span className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </span>
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <span className="text-sm text-gray-500">ou</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>

              {/* Register Link */}
              <div className="text-center">
                <span className="text-gray-600 mr-2">
                  Não tem uma conta?
                </span>
                <Link
                  href="/register"
                  className="font-semibold text-primary hover:text-primary/90 relative inline-block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-primary after:transition-all hover:after:w-full"
                >
                  Cadastre-se
                </Link>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          className="mt-8 flex items-center justify-center gap-6 text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Conexão Segura
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Dados Protegidos
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
