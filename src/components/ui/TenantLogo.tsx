'use client';

import { useTenant } from '@/components/layout/TenantThemeProvider';

interface TenantLogoProps {
  className?: string; // Opt-in classes
}

export function TenantLogo({ className = '' }: TenantLogoProps) {
  const tenant = useTenant();

  return (
    <img 
      src={tenant.logoUrl} 
      alt={`Logo ${tenant.name}`} 
      className={`object-contain ${className}`}
    />
  );
}
