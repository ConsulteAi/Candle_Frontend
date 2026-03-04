"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Login Page - Tailwind CSS First
 * Azul como cor primária do Candle
 */

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPageTailwind() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-500/40 to-transparent blur-3xl animate-float" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-r from-blue-400/40 to-transparent blur-3xl animate-float" style={{ animationDelay: '7s' }} />
      <div className="absolute top-1/2 right-[20%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-cyan-500/40 to-transparent blur-3xl animate-float" style={{ animationDelay: '14s' }} />

      <motion.div
        className="relative z-10 w-full max-w-[480px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
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
          </div>
          <p className="text-gray-600 font-medium">
            Consultas de Crédito Inteligentes
          </p>
        </div>

        {/* Login Card */}
        <motion.div
          className="glass rounded-3xl p-12 relative overflow-hidden group"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

          <div className="relative z-10">
            <div className="mb-8">
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
                Bem-vindo de volta
              </h2>
              <p className="text-gray-600">
                Entre com suas credenciais para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className={`block font-semibold text-sm mb-2 transition-colors ${
                    focusedField === 'email' ? 'text-blue-700' : 'text-gray-700'
                  }`}
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`w-full px-4 py-3.5 bg-white/60 backdrop-blur-sm border-2 rounded-xl font-body text-gray-900 transition-all duration-200 ${
                      focusedField === 'email'
                        ? 'border-blue-500 bg-white shadow-lg shadow-blue-500/20 -translate-y-0.5'
                        : 'border-blue-100 hover:border-blue-200'
                    }`}
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  {focusedField === 'email' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-primary rounded-xl opacity-20 blur-md -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                    />
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className={`block font-semibold text-sm mb-2 transition-colors ${
                    focusedField === 'password' ? 'text-blue-700' : 'text-gray-700'
                  }`}
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`w-full px-4 py-3.5 bg-white/60 backdrop-blur-sm border-2 rounded-xl font-body text-gray-900 transition-all duration-200 ${
                      focusedField === 'password'
                        ? 'border-blue-500 bg-white shadow-lg shadow-blue-500/20 -translate-y-0.5'
                        : 'border-blue-100 hover:border-blue-200'
                    }`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  {focusedField === 'password' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-primary rounded-xl opacity-20 blur-md -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                    />
                  )}
                </div>
              </div>

              {/* Forgot Password */}
              <div className="mb-6 text-right">
                <a
                  href="#"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 relative inline-block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-primary after:transition-all hover:after:w-full"
                >
                  Esqueceu sua senha?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-4 bg-gradient-primary rounded-xl font-display font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </span>
              </button>

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
                <a
                  href="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 relative inline-block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-primary after:transition-all hover:after:w-full"
                >
                  Cadastre-se
                </a>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-500">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" opacity="0.6"/>
            </svg>
            Conexão Segura
          </div>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-500">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Dados Protegidos
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
