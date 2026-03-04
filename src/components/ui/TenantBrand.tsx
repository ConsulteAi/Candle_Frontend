'use client';

import { useTenant } from '@/components/layout/TenantThemeProvider';

interface TenantBrandProps {
  className?: string; // Opt-in classes
}

export function TenantBrand({ className = '' }: TenantBrandProps) {
  const tenant = useTenant();

  return (
    <span className={`font-display font-bold ${className}`}>
      {tenant.name}
    </span>
  );
}
