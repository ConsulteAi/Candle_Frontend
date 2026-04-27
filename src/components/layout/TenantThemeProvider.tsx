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

      // Ghost-button hover uses hsl(var(--accent)) as background.
      // If we set --accent = primary, the background becomes solid purple → icon invisible.
      // Instead we set --accent to a very light tint of primary via CSS custom property trick:
      // We define a helper var --primary-h/s/l if the format allows, but the simplest safe
      // approach is to set --accent as a fixed "light" rendition using secondary-level lightness.
      // We DON'T change --accent background value — we instead keep it as muted and only
      // change --accent-foreground to primary so text/icon picks up tenant color on hover.
      //
      // This means: ghost hover bg = muted (neutral, always readable)
      //             ghost hover text/icon = primary (tenant color) ✓
      root.style.setProperty('--accent', '214 32% 91%'); // same neutral muted as default
      root.style.setProperty('--accent-foreground', tenant.colors.primary);

      // Sidebar accent: light tint so selected item background is soft
      root.style.setProperty('--sidebar-accent', '214 32% 91%');
      root.style.setProperty('--sidebar-accent-foreground', tenant.colors.primary);
      root.style.setProperty('--sidebar-ring', tenant.colors.primary);

      // Update dynamic gradients to use the CSS variable
      root.style.setProperty(
        '--gradient-primary',
        `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)`
      );
    }
  }, [tenant]);

  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>;
}
