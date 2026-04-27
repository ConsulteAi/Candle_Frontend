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
    const root = document.documentElement;
    if (tenant?.colors) {
      root.style.setProperty('--primary', tenant.colors.primary);
      root.style.setProperty('--primary-foreground', tenant.colors.primaryForeground);
      root.style.setProperty('--ring', tenant.colors.primary);

      // Derive accent from primary so ghost-button hovers, select triggers,
      // and all accent-based states use the tenant color instead of default blue
      root.style.setProperty('--accent', tenant.colors.primary);
      root.style.setProperty('--accent-foreground', tenant.colors.primaryForeground);

      // Secondary as a tinted version of primary (10% opacity background)
      root.style.setProperty('--secondary', `${tenant.colors.primary} / 0.1`);
      root.style.setProperty('--secondary-foreground', tenant.colors.primary);

      // Sidebar accent alignment
      root.style.setProperty('--sidebar-accent', `${tenant.colors.primary} / 0.1`);
      root.style.setProperty('--sidebar-accent-foreground', tenant.colors.primary);
      root.style.setProperty('--sidebar-ring', tenant.colors.primary);

      // Update dynamic gradients to use the CSS variable instead of hardcoded hex
      root.style.setProperty(
        '--gradient-primary',
        `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)`
      );
    }
  }, [tenant]);

  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>;
}
