'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Loader2 } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { loginSchema } from '@/validators/auth.schemas';
import type { LoginDTO } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    // Artificial delay for specific "premium feel" requested in design system
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    try {
      const result = await login(data);

      if (!result.success && result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          setError(field as keyof LoginDTO, {
            type: 'server',
            message: messages[0],
          });
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-500/40 to-transparent blur-3xl animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-r from-blue-400/40 to-transparent blur-3xl animate-pulse delay-700" />
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
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display text-4xl font-extrabold gradient-text">
              Candle
            </span>
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
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className={`text-sm font-semibold transition-colors ${focusedField === 'email' ? 'text-blue-600' : 'text-gray-700'}`}>
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register('email')}
                    className={`h-12 bg-white/60 backdrop-blur-sm border-2 rounded-xl transition-all duration-200 ${
                      focusedField === 'email'
                        ? 'border-blue-500 bg-white shadow-lg shadow-blue-500/20 ring-0'
                        : 'border-blue-100 hover:border-blue-200'
                    } ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    disabled={isLoading}
                  />
                  {focusedField === 'email' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-primary rounded-xl opacity-20 blur-md -z-10"
                      layoutId="input-glow"
                    />
                  )}
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className={`text-sm font-semibold transition-colors ${focusedField === 'password' ? 'text-blue-600' : 'text-gray-700'}`}>
                    Senha
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 relative inline-block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-primary after:transition-all hover:after:w-full"
                  >
                    Esqueceu?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className={`h-12 bg-white/60 backdrop-blur-sm border-2 rounded-xl transition-all duration-200 ${
                      focusedField === 'password'
                        ? 'border-blue-500 bg-white shadow-lg shadow-blue-500/20 ring-0'
                        : 'border-blue-100 hover:border-blue-200'
                    } ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    disabled={isLoading}
                  />
                  {focusedField === 'password' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-primary rounded-xl opacity-20 blur-md -z-10"
                      layoutId="input-glow"
                    />
                  )}
                </div>
                 {errors.password && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                 <Checkbox id="terms" className="border-blue-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
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
                className="w-full h-12 bg-gradient-primary rounded-xl font-display font-bold text-base text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group relative"
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
                  className="font-semibold text-blue-600 hover:text-blue-700 relative inline-block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-primary after:transition-all hover:after:w-full"
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
            <Lock className="w-4 h-4 text-blue-500" />
            Conexão Segura
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            Dados Protegidos
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
