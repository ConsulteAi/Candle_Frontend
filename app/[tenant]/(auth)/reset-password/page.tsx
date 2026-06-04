'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  KeyRound,
} from 'lucide-react';
import Link from 'next/link';

import { resetPasswordAction } from '@/actions/auth.actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TenantBrand } from '@/components/ui/TenantBrand';
import { TenantLogo } from '@/components/ui/TenantLogo';

// ─── Schema ──────────────────────────────────────────────────────────────────

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter ao menos uma letra maiúscula')
      .regex(/[a-z]/, 'Deve conter ao menos uma letra minúscula')
      .regex(/[0-9]/, 'Deve conter ao menos um número')
      .regex(/[^A-Za-z0-9]/, 'Deve conter ao menos um caractere especial'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ─── Constants (hoisted — no re-creation per render) ─────────────────────────

const REQUIREMENTS = [
  { label: 'Mínimo 8 caracteres',       test: (v: string) => v.length >= 8 },
  { label: 'Letra maiúscula (A–Z)',      test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Letra minúscula (a–z)',      test: (v: string) => /[a-z]/.test(v) },
  { label: 'Número (0–9)',               test: (v: string) => /[0-9]/.test(v) },
  { label: 'Caractere especial (!@#…)',  test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

const STRENGTH_BG    = ['', 'bg-red-500', 'bg-orange-400', 'bg-amber-400', 'bg-lime-500', 'bg-primary'];
const STRENGTH_LABEL = ['', 'Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'];
const STRENGTH_COLOR = ['', 'text-red-500', 'text-orange-500', 'text-amber-500', 'text-lime-600', 'text-primary'];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();
  const tenant       = pathname?.split('/').filter(Boolean)[0];
  const token        = searchParams.get('token');

  const [isLoading,        setIsLoading]        = useState(false);
  const [formError,        setFormError]        = useState<string | null>(null);
  const [focusedField,     setFocusedField]     = useState<string | null>(null);
  const [showPassword,     setShowPassword]     = useState(false);
  const [showConfirm,      setShowConfirm]      = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch('newPassword') ?? '';
  // Derived during render — no extra state (rerender-derived-state)
  const metCount = REQUIREMENTS.filter((r) => r.test(passwordValue)).length;
  const allMet   = metCount === REQUIREMENTS.length;

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    setIsLoading(true);
    setFormError(null);

    const result = await resetPasswordAction(token, data.newPassword, data.confirmPassword);

    if (result.success) {
      router.push('/login?message=senha-alterada');
    } else {
      setFormError(result.error ?? 'Erro ao redefinir senha.');
      setIsLoading(false);
    }
  };

  // ── Shared background ───────────────────────────────────────────────────────

  const background = (
    <>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-primary/40 to-transparent blur-3xl animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-r from-primary/30 to-transparent blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 right-[20%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-cyan-500/40 to-transparent blur-3xl animate-pulse delay-1000" />
    </>
  );

  // ── Invalid token ───────────────────────────────────────────────────────────

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-cyan-50">
        {background}
        <motion.div
          className="relative z-10 glass rounded-3xl p-10 max-w-md w-full text-center space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Link inválido</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Este link de redefinição de senha é inválido ou expirou.
              Entre em contato com um administrador para solicitar um novo link.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push(tenant ? `/${tenant}/login` : '/login')} className="rounded-xl">
            Voltar ao login
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-cyan-50">
      {background}

      <motion.div
        className="relative z-10 w-full max-w-[480px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo — identical to login page */}
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
          <p className="text-gray-600 font-medium">Redefinição de senha</p>
        </div>

        {/* Glass card */}
        <motion.div
          className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden group"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Shimmer on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

          <div className="relative z-10">
            {/* Heading */}
            <div className="mb-8 flex items-start gap-3">
              <div className="mt-1 w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-3xl font-bold text-gray-900 mb-1">
                  Nova senha
                </h2>
                <p className="text-gray-600 text-sm">
                  Escolha uma senha segura para sua conta.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Error */}
              <AnimatePresence>
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 ml-2 font-medium">
                        {formError}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Nova senha ── */}
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className={`text-sm font-semibold transition-colors ${focusedField === 'newPassword' ? 'text-primary' : 'text-gray-700'}`}
                >
                  Nova senha
                </Label>
                <div className="relative">
                  {focusedField === 'newPassword' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-primary rounded-xl opacity-20 blur-md"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register('newPassword')}
                    className={`relative z-10 h-12 bg-white/60 backdrop-blur-sm border-2 rounded-xl pr-10 transition-all duration-200 ${
                      focusedField === 'newPassword'
                        ? 'border-primary bg-white shadow-lg shadow-primary/20 focus-visible:ring-0 focus-visible:ring-offset-0'
                        : 'border-primary/20 hover:border-primary/30'
                    } ${errors.newPassword ? 'border-red-500' : ''}`}
                    onFocus={() => { setFocusedField('newPassword'); setShowRequirements(true); }}
                    onBlur={() => setFocusedField(null)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength bar */}
                <AnimatePresence>
                  {(showRequirements || passwordValue.length > 0) && passwordValue.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= metCount ? STRENGTH_BG[metCount] : 'bg-primary/15'
                            }`}
                          />
                        ))}
                      </div>
                      {metCount > 0 && (
                        <p className={`text-[11px] font-semibold mt-1 transition-colors ${STRENGTH_COLOR[metCount]}`}>
                          {STRENGTH_LABEL[metCount]}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Requirements checklist */}
                <AnimatePresence>
                  {(showRequirements || passwordValue.length > 0) && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 space-y-1.5 overflow-hidden"
                    >
                      {REQUIREMENTS.map((req, i) => {
                        const met = req.test(passwordValue);
                        return (
                          <motion.li
                            key={req.label}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                              met ? 'text-emerald-600' : 'text-slate-400'
                            }`}
                          >
                            <motion.span
                              animate={met ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                              transition={{ duration: 0.2 }}
                              className="shrink-0"
                            >
                              {met
                                ? <CheckCircle2 className="w-3.5 h-3.5" />
                                : <XCircle className="w-3.5 h-3.5" />
                              }
                            </motion.span>
                            <span className={met ? 'line-through opacity-60' : ''}>{req.label}</span>
                          </motion.li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>

                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.newPassword.message}</p>
                )}
              </div>

              {/* ── Confirmar senha ── */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className={`text-sm font-semibold transition-colors ${focusedField === 'confirmPassword' ? 'text-primary' : 'text-gray-700'}`}
                >
                  Confirmar senha
                </Label>
                <div className="relative">
                  {focusedField === 'confirmPassword' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-primary rounded-xl opacity-20 blur-md"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    className={`relative z-10 h-12 bg-white/60 backdrop-blur-sm border-2 rounded-xl pr-10 transition-all duration-200 ${
                      focusedField === 'confirmPassword'
                        ? 'border-primary bg-white shadow-lg shadow-primary/20 focus-visible:ring-0 focus-visible:ring-offset-0'
                        : 'border-primary/20 hover:border-primary/30'
                    } ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* ── Submit ── */}
              <div className="space-y-2 pt-1">
                <Button
                  type="submit"
                  disabled={isLoading || !allMet}
                  className="w-full h-12 bg-gradient-primary rounded-xl font-display font-bold text-base text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group relative disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                >
                  <span className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Redefinindo...
                      </>
                    ) : (
                      'Redefinir senha'
                    )}
                  </span>
                </Button>

                {!allMet && passwordValue.length > 0 && (
                  <p className="text-center text-xs text-slate-400">
                    {5 - metCount} {5 - metCount === 1 ? 'requisito restante' : 'requisitos restantes'}
                  </p>
                )}
              </div>

              {/* Divider + back to login */}
              <div className="flex items-center gap-4 my-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <span className="text-sm text-gray-500">ou</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>
              <div className="text-center">
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:text-primary/90 relative inline-block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-primary after:transition-all hover:after:w-full text-sm"
                >
                  Voltar ao login
                </Link>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Trust badges — identical to login page */}
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
