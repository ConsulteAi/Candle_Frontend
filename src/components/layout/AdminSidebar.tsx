'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Settings, 
  BarChart3, 
  Database,
  Search,
  LogOut,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

const menuItems = [
  { name: 'Dashboard', href: '/backoffice', icon: LayoutDashboard },
  { name: 'Usuários', href: '/backoffice/users', icon: Users },
  { name: 'Transações', href: '/backoffice/transactions', icon: Wallet },
  { name: 'Tipos de Consulta', href: '/backoffice/query-types', icon: Database, role: UserRole.MASTER },
  { name: 'Provedores', href: '/backoffice/providers', icon: Activity, role: UserRole.MASTER },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="h-screen w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-xl flex-shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2 group">
           <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all">
             <BarChart3 className="h-5 w-5 text-white" />
           </div>
           <div className="flex flex-col">
             <span className="font-display font-bold text-lg text-white leading-none tracking-tight">Consulte Ai</span>
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">Backoffice</span>
           </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.role && user?.role !== item.role) return null;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                <span className="font-medium text-sm">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="ml-auto w-1 h-1 rounded-full bg-white"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4 px-2">
            <div className="bg-slate-800 h-8 w-8 rounded-full flex items-center justify-center border border-slate-700">
               <span className="text-xs font-bold text-slate-300">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Administrador'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@candle.com'}</p>
            </div>
        </div>
        
        <Button 
            variant="outline" 
            className="w-full justify-start gap-2 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/50 transition-colors"
            onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}
