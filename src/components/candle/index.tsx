"use client";

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Componentes Reutilizáveis - Tailwind CSS First
 * Azul como cor primária do Candle
 *
 * Este arquivo contém componentes base que podem ser usados em todo o projeto
 */

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-display font-bold rounded-xl transition-all duration-200 relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none';

  const variants = {
    primary: 'bg-gradient-primary text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5',
    secondary: 'bg-white/80 backdrop-blur-sm text-blue-700 border-2 border-blue-500 hover:bg-blue-50 hover:-translate-y-0.5',
    outline: 'bg-transparent text-blue-700 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50',
    ghost: 'bg-transparent text-blue-700 hover:bg-blue-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {variant === 'primary' && (
        <span className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      )}
      <span className="relative flex items-center justify-center gap-2">
        {isLoading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </span>
    </button>
  );
}

// ============================================================================
// CARD COMPONENT (GLASSMORPHISM)
// ============================================================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function Card({ children, className = '', hover = false, gradient = false }: CardProps) {
  return (
    <motion.div
      className={`glass rounded-2xl p-6 ${
        hover ? 'hover:-translate-y-1 hover:shadow-glass-strong cursor-pointer' : ''
      } ${
        gradient ? 'bg-gradient-to-br from-white/80 to-blue-50/80' : ''
      } transition-all duration-200 ${className}`}
      whileHover={hover ? { y: -4 } : undefined}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// INPUT COMPONENT
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="w-full">
      {label && (
        <label
          className={`block font-semibold text-sm mb-2 transition-colors ${
            isFocused ? 'text-blue-700' : 'text-gray-700'
          }`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`w-full px-4 py-3 bg-white/60 backdrop-blur-sm border-2 rounded-xl font-body text-gray-900 transition-all duration-200 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:shadow-lg focus:shadow-red-500/20'
              : isFocused
              ? 'border-blue-500 bg-white shadow-lg shadow-blue-500/20 -translate-y-0.5'
              : 'border-blue-100 hover:border-blue-200'
          } ${className}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isFocused && !error && (
          <motion.div
            className="absolute inset-0 bg-gradient-primary rounded-xl opacity-20 blur-md -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
          />
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" opacity="0.2"/>
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: number;
  delay?: number;
}

export function StatsCard({ icon, label, value, trend, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-glass-strong transition-all duration-200 cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-600 font-medium mb-1">
            {label}
          </div>
          <div className="font-display text-2xl font-bold text-gray-900 mb-1">
            {value}
          </div>
          {trend !== undefined && (
            <div className={`text-sm font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// BADGE COMPONENT
// ============================================================================


interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'primary', size = 'md', className = '' }: BadgeProps) {
  const variants = {
    primary: 'bg-blue-100 text-blue-700 border-blue-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}


// ============================================================================
// BALANCE BADGE COMPONENT (Dashboard)
// ============================================================================

interface BalanceBadgeProps {
  balance: number;
  onClick?: () => void;
}

export function BalanceBadge({ balance, onClick }: BalanceBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="px-6 py-3 bg-gradient-primary rounded-xl text-white font-bold text-lg shadow-lg shadow-blue-500/30 flex items-center gap-2">
        <span>💰</span>
        <span>R$ {balance.toFixed(2)}</span>
      </div>
      {onClick && (
        <button
          onClick={onClick}
          className="px-5 py-3 bg-white/90 backdrop-blur-sm border-2 border-blue-500 rounded-xl text-blue-700 font-bold hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200"
        >
          + Recarregar
        </button>
      )}
    </div>
  );
}

// ============================================================================
// CONSULTATION CARD (Catálogo)
// ============================================================================

interface ConsultationCardProps {
  name: string;
  description: string;
  price: number;
  features: string[];
  icon: React.ReactNode;
  isPremium?: boolean;
  isPopular?: boolean;
  onClick?: () => void;
}

export function ConsultationCard({
  name,
  description,
  price,
  features,
  icon,
  isPremium = false,
  isPopular = false,
  onClick,
}: ConsultationCardProps) {
  return (
    <motion.div
      className={`glass rounded-3xl p-8 hover:-translate-y-2 hover:shadow-glass-strong transition-all duration-300 cursor-pointer relative overflow-hidden group ${
        isPremium ? 'bg-gradient-to-br from-blue-50/80 to-white/80 border-2 border-blue-200' : ''
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onClick={onClick}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            {icon}
          </div>
          {isPremium && (
            <Badge variant="primary" size="sm">
              ⭐ Premium
            </Badge>
          )}
          {isPopular && !isPremium && (
            <Badge variant="warning" size="sm">
              🔥 Popular
            </Badge>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">
          {name}
        </h3>
        <p className="text-gray-600 leading-relaxed mb-6">
          {description}
        </p>

        {/* Features */}
        <ul className="space-y-2 mb-6">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-gray-700">
              <span className="text-green-600 font-bold text-lg">✓</span>
              {feature}
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-blue-100">
          <div className="font-display text-3xl font-extrabold gradient-text">
            R$ {price.toFixed(2)}
          </div>
          <button className="px-6 py-3 bg-gradient-primary rounded-xl text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 group-hover:scale-105">
            Consultar →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MODAL COMPONENT
// ============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl max-h-[90vh] glass-strong rounded-3xl p-8 z-50 overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-3xl font-bold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200 hover:rotate-90 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {children}
      </motion.div>
    </>
  );
}

// ============================================================================
// LOADING SPINNER
// ============================================================================

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`${sizes[size]} border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
  );
}

// ============================================================================
// SKELETON LOADING
// ============================================================================

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded ${className}`} />
  );
}
