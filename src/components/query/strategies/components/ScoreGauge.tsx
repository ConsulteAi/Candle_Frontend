'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/design-system/ComponentsTailwind';
import { Card } from '@/design-system/ComponentsTailwind';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  value: number;
  max?: number;
  band?: string;
  riskText?: string;
  label?: string;
  simpleMode?: boolean;
}

export function ScoreGauge({ value, max = 1000, band, riskText, label = "SCORE", simpleMode = false }: ScoreGaugeProps) {
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const circumference = 2 * Math.PI * 70; // r=70
  const offset = circumference - (percentage * circumference);

  const getColorClass = (val: number) => {
    if (val > 700) return "text-green-500";
    if (val > 400) return "text-yellow-500";
    return "text-red-500";
  };
  
  const getBadgeVariant = (val: number) => {
    if (val > 700) return "success";
    if (val > 400) return "warning";
    return "error";
  };

  const colorClass = getColorClass(value);
  const badgeVariant = getBadgeVariant(value);

  const Content = (
    <div className="relative z-10 flex flex-col items-center justify-center py-8 h-full w-full">
      <div className="relative mb-4">
        <svg className="w-40 h-40 transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          <motion.circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={cn("transition-all", colorClass)}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {value}
          </span>
          <span className="text-sm text-gray-500 font-medium">{label}</span>
        </div>
      </div>
      
      {band && (
        <Badge variant={badgeVariant} className="text-base px-4 py-1">
          {band}
        </Badge>
      )}
      {riskText && !band && (
          <Badge variant={badgeVariant} className="text-base px-4 py-1">
          {riskText}
          </Badge>
      )}
      {riskText && band && (
        <span className="text-xs text-gray-400 mt-2 font-medium">{riskText}</span>
      )}
    </div>
  );

  if (simpleMode) {
    return Content;
  }

  return (
    <Card className="h-full relative overflow-hidden border-2 border-primary/20 dark:border-primary/80 bg-gradient-to-br from-white to-primary/10 dark:from-gray-900 dark:to-gray-800 p-0">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/50/10 rounded-full blur-3xl" />
      {Content}
    </Card>
  );
}
