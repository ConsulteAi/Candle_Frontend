'use client';

import { useEffect, ReactNode, createContext, useContext } from 'react';
import { TenantConfig, DEFAULT_TENANT } from '@/lib/tenant/config';

interface TenantThemeProviderProps {
  tenant: TenantConfig;
  children: ReactNode;
}

const TenantContext = createContext<TenantConfig>(DEFAULT_TENANT);

export function useTenant() {
  return useContext(TenantContext);
}

export function TenantThemeProvider({ tenant, children }: TenantThemeProviderProps) {
  useEffect(() => {
    // We set the CSS variables on the root document so Tailwind can consume them everywhere
    const root = document.documentElement;
    if (tenant?.colors) {
      root.style.setProperty('--primary', tenant.colors.primary);
      root.style.setProperty('--primary-foreground', tenant.colors.primaryForeground);
      root.style.setProperty('--ring', tenant.colors.primary);
      
      // Update dynamic gradients to use the CSS variable instead of hardcoded hex
      root.style.setProperty(
        '--gradient-primary', 
        `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)`
      );
    }
  }, [tenant]);

  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>;
}
