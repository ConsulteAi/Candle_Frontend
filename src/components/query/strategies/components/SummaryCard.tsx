'use client';

import React from 'react';
import { Card } from '@/design-system/ComponentsTailwind';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, FileWarning, TrendingDown, Info } from 'lucide-react';

type SummaryColor = 'blue' | 'red' | 'green' | 'gray' | 'yellow' | 'orange' | 'purple';

interface SummaryCardProps {
  title: string;
  value: number | string;
  subtitle?: string; // e.g. "percentage" or detail text
  color?: SummaryColor;
  icon?: React.ReactNode;
  isCurrency?: boolean;
}

export function SummaryCard({ 
  title, 
  value, 
  subtitle, 
  color = 'gray', 
  icon,
  isCurrency = false
}: SummaryCardProps) {
  
  const colors = {
    blue: "bg-primary/10 text-primary/90 border-primary/20",
    red: "bg-red-50 text-red-700 border-red-100",
    green: "bg-green-50 text-green-700 border-green-100",
    gray: "bg-gray-50 text-gray-700 border-gray-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
  };

  const formatCurrency = (val: number | string) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
  };

  const displayValue = isCurrency ? formatCurrency(value) : value;

  // Default icons if not provided
  const getIcon = () => {
    if (icon) return icon;
    if (color === 'red') return <AlertTriangle className="w-5 h-5" />;
    if (color === 'orange') return <FileWarning className="w-5 h-5" />;
    if (color === 'yellow') return <CheckCircle2 className="w-5 h-5" />; // Check used for checks often
    if (color === 'green') return <CheckCircle2 className="w-5 h-5" />;
    return <Info className="w-5 h-5" />;
  };

  return (
    <Card className={cn("p-4 border shadow-sm hover:shadow-md transition-shadow", colors[color])}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm opacity-90">{title}</span>
        {getIcon()}
      </div>
      <div className="text-2xl font-bold">
        {displayValue}
      </div>
      {subtitle && (
        <div className="text-xs mt-1 font-medium opacity-80">
          {subtitle}
        </div>
      )}
    </Card>
  );
}
