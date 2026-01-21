'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { CategoryConfig } from '@/types/query';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: CategoryConfig;
  queryCount?: number;
  isLoading?: boolean;
  className?: string;
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
  cyan: 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
  pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
  indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
} as const;

export function CategoryCard({ category, queryCount = 0, isLoading = false, className }: CategoryCardProps) {
  const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ElementType;
  const colorClass = colorClasses[category.color as keyof typeof colorClasses] || colorClasses.blue;

  const content = (
    <motion.div
      whileHover={category.enabled ? { scale: 1.02, y: -4 } : {}}
      whileTap={category.enabled ? { scale: 0.98 } : {}}
      className={cn(
        'relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300',
        category.enabled
          ? 'bg-white/80 border-gray-200 shadow-lg hover:shadow-xl cursor-pointer'
          : 'bg-gray-50/80 border-gray-200 cursor-not-allowed opacity-75',
        className
      )}
    >
      {/* Gradient background */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-32 bg-gradient-to-br opacity-10',
          colorClass
        )}
      />

      {/* Content */}
      <div className="relative p-6 space-y-4">
        {/* Icon and Badge */}
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'p-3 rounded-xl bg-gradient-to-br shadow-md',
              colorClass
            )}
          >
            {IconComponent && <IconComponent className="w-7 h-7 text-white" />}
          </div>

          {!category.enabled && (
            <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
              Em breve
            </span>
          )}
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            {category.enabled 
              ? (isLoading ? "Carregando..." : `${queryCount} consultas disponíveis`)
              : 'Novidades em breve'}
          </span>

          {category.enabled && (
            <span className="text-sm font-semibold text-blue-600 flex items-center gap-1">
              Acessar
              <Icons.ArrowRight className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (!category.enabled) {
    return content;
  }

  return (
    <Link href={`/consulta?category=${category.slug}`} className="block">
      {content}
    </Link>
  );
}
