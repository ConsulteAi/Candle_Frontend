'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Loader2 } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { registerSchema, type RegisterFormData } from '@/validators/auth.schemas';
import type { RegisterDTO } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCpf, formatPhone } from '@/lib/formatters';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    control,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    // Remove confirmPassword and terms before sending to API
    const { confirmPassword, terms, ...registerData } = data;
    setIsLoading(true);
    // Artificial delay for premium feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Map to backend DTO structure
      const payload: RegisterDTO = {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        // Backend expects cpfCnpj field, clean formatting
        cpfCnpj: (registerData.cpf || registerData.cnpj || '').replace(/\D/g, ''),
        // Clean phone formatting
        phone: registerData.phone ? registerData.phone.replace(/\D/g, '') : undefined,
      };

      const result = await registerUser(payload);

      if (!result.success && result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          setError(field as keyof RegisterFormData, {
            type: 'server',
            message: messages[0],
          });
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    id: string, 
    label: string, 
    placeholder: string, 
    type: string = 'text',
    reg: any,
    maskFunction?: (value: string) => string
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id} className={`text-sm font-semibold transition-colors ${focusedField === id ? 'text-blue-600' : 'text-gray-700'}`}>
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          {...reg}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
             if (maskFunction) {
                 e.target.value = maskFunction(e.target.value);
             }
             reg.onChange(e);
          }}
          className={`h-12 bg-white/60 backdrop-blur-sm border-2 rounded-xl transition-all duration-200 ${
            focusedField === id
              ? 'border-blue-500 bg-white shadow-lg shadow-blue-500/20 ring-0'
              : 'border-blue-100 hover:border-blue-200'
          } ${errors[id as keyof RegisterFormData] ? 'border-red-500 focus:border-red-500' : ''}`}
          onFocus={() => setFocusedField(id)}
          onBlur={() => setFocusedField(null)}
          disabled={isLoading}
        />
        {focusedField === id && (
          <motion.div
            className="absolute inset-0 bg-gradient-primary rounded-xl opacity-20 blur-md -z-10"
            layoutId={`input-glow-${id}`}
          />
        )}
      </div>
      {errors[id as keyof RegisterFormData] && (
        <p className="text-red-500 text-xs mt-1 font-medium">{errors[id as keyof RegisterFormData]?.message}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-500/40 to-transparent blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-400/40 to-transparent blur-3xl animate-pulse delay-500" />
      <div className="absolute top-1/2 right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-cyan-500/40 to-transparent blur-3xl animate-pulse delay-1000" />

      <motion.div
        className="relative z-10 w-full max-w-[520px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-2"
          >
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display text-3xl font-extrabold gradient-text">
              Candle
            </span>
          </motion.div>
          <p className="text-gray-600 font-medium text-sm">
            Crie sua conta em segundos
          </p>
        </div>

        {/* Register Card */}
        <motion.div
          className="glass rounded-3xl p-8 relative overflow-hidden group"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
           {/* Shimmer effect */}
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 text-center">
              Criar nova conta
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {renderInput('name', 'Nome Completo', 'João da Silva', 'text', register('name'))}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {renderInput('cpf', 'CPF', '000.000.000-00', 'text', register('cpf'), formatCpf)}
                 {renderInput('phone', 'Telefone', '(00) 00000-0000', 'tel', register('phone'), formatPhone)}
              </div>

              {renderInput('email', 'Email', 'seu@email.com', 'email', register('email'))}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {renderInput('password', 'Senha', '••••••••', 'password', register('password'))}
                 {renderInput('confirmPassword', 'Confirmar Senha', '••••••••', 'password', register('confirmPassword'))}
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <Controller
                    name="terms"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="terms"
                        className="mt-1 border-blue-200 data-[state=checked]:bg-blue-600"
                        checked={field.value as boolean}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed font-normal cursor-pointer">
                    Concordo com os{' '}
                    <Link href="/termos" className="text-blue-600 hover:underline font-medium">
                      Termos de Uso
                    </Link>{' '}
                    e{' '}
                    <Link href="/privacidade" className="text-blue-600 hover:underline font-medium">
                      Política de Privacidade
                    </Link>
                    . Seus dados estarão protegidos pela LGPD.
                  </Label>
                </div>
                {errors.terms && (
                  <p className="text-red-500 text-xs font-medium px-1">
                    {errors.terms.message}
                  </p>
                )}
              </div>

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
                        Criando conta...
                      </>
                    ) : (
                      'Criar conta'
                    )}
                  </span>
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <span className="text-xs text-gray-500">ou</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>

              {/* Login Link */}
              <div className="text-center text-sm">
                <span className="text-gray-600 mr-2">
                  Já tem uma conta?
                </span>
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 relative inline-block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-primary after:transition-all hover:after:w-full"
                >
                  Fazer login
                </Link>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          className="mt-6 flex items-center justify-center gap-6 text-gray-500 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <Lock className="w-3 h-3 text-blue-500" />
            Criptografia SSL
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-blue-500" />
            Dados Auditados
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
