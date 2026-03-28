'use client';

import React from 'react';
import { formatCpfCnpj } from '@/lib/formatters';

interface InfoBoxProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export function InfoBox({ label, value, icon, className }: InfoBoxProps) {
  const displayValue = (() => {
    if (value == null || value === '') return 'N/A';

    // Automatically format CPF/CNPJ when the field represents a document.
    if (typeof value === 'string' && label.trim().toLowerCase() === 'documento') {
      return formatCpfCnpj(value);
    }

    return value;
  })();

  return (
    <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium text-gray-500 uppercase">{label}</span>
      </div>
      <p className="font-semibold text-gray-900 dark:text-white break-words">
        {displayValue}
      </p>
    </div>
  );
}
