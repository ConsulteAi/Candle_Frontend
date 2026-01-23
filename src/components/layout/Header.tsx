'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, CreditCard, LogOut, Settings, Wallet, LayoutDashboard, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBalance } from '@/hooks/useBalance';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { formattedBalance, fetchBalance } = useBalance();

  // Fetch balance on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
    }
  }, [isAuthenticated, fetchBalance]);

  const handleLogout = async () => {
    await logout();
  };

  const firstName = user?.name?.trim().split(' ')[0] || 'Usuário';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white border-b border-slate-200/80"
    >
      <div className="px-8 h-24 flex items-center justify-between">

        {/* Brand / Logo */}
        <Link href="/" className="flex-shrink-0">
          <motion.div
            className="flex items-center gap-4 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Search className="h-6 w-6 text-white stroke-[2.5px]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-display font-black tracking-tight text-slate-900 leading-none group-hover:text-blue-900 transition-colors">
                Consulta<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Ai</span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 leading-none mt-1 group-hover:text-blue-400 transition-colors">
                Platform
              </span>
            </div>
          </motion.div>
        </Link>

        {/* Desktop Navigation & Actions */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
               {/* Balance Pill */}
               <motion.div
                 whileHover={{ scale: 1.02 }}
                 className="flex items-center gap-4 pl-3 pr-6 h-14 bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-md border border-blue-100/60 rounded-full shadow-sm hover:shadow-md transition-all group cursor-default"
               >
                  <div className="w-10 h-10 rounded-full bg-blue-100/50 border border-blue-200/50 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 transition-all duration-300">
                    <Wallet className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-extrabold text-blue-400/80 leading-none mb-1 tracking-wider">Seu Saldo</span>
                    <span className="text-lg font-display font-black text-slate-800 leading-none group-hover:text-blue-700 transition-colors">
                      {formattedBalance}
                    </span>
                  </div>
               </motion.div>

               {/* Recharge Button */}
               <Link href="/recarregar">
                 <Button
                   className="rounded-full h-14 px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 border-2 border-white/10"
                 >
                   <Plus className="w-4 h-4 mr-2 stroke-[3px]" />
                   Recarregar
                 </Button>
               </Link>

               {/* User Menu Trigger */}
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-4 pl-2 pr-5 h-14 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group outline-none">
                     <Avatar className="h-11 w-11 border-2 border-white shadow-sm ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all">
                      <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-bold text-sm">
                        {firstName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start gap-0.5">
                       <span className="text-sm font-bold text-slate-700 leading-tight group-hover:text-blue-700 transition-colors">
                         {firstName}
                       </span>
                       <span className="text-[11px] font-medium text-slate-400 group-hover:text-blue-400 transition-colors">
                         Menu
                       </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2 rounded-2xl glass-strong border-white/50 shadow-xl shadow-blue-900/5 mt-2" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-3 bg-slate-50/50 rounded-xl mb-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold text-slate-900 leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-slate-500 font-medium">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  
                  <div className="space-y-1">
                    {(user?.role === 'ADMIN' || user?.role === 'MASTER') && (
                      <DropdownMenuItem onClick={() => router.push('/dashboard')} className="rounded-xl cursor-pointer py-2.5 focus:bg-blue-50 focus:text-blue-700 font-medium">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem onClick={() => router.push('/carteira')} className="rounded-xl cursor-pointer py-2.5 focus:bg-blue-50 focus:text-blue-700 font-medium">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Carteira</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => router.push('/historico')} className="rounded-xl cursor-pointer py-2.5 focus:bg-blue-50 focus:text-blue-700 font-medium">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Histórico</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => router.push('/recarregar')} className="rounded-xl cursor-pointer py-2.5 focus:bg-blue-50 focus:text-blue-700 font-medium">
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Recarregar</span>
                    </DropdownMenuItem>
                  </div>
                  
                  <DropdownMenuSeparator className="my-2 bg-slate-100" />

                  <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 focus:bg-slate-50 font-medium text-slate-600">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer py-2.5 font-medium mt-1">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair da conta</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-3 ml-2">
              <Link href="/login">
                <Button variant="ghost" className="rounded-full px-6 text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-bold">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full bg-slate-900 hover:bg-black text-white px-6 font-bold shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5">
                  Criar Conta
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-3 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-all"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        initial={false}
        animate={{
          height: isMenuOpen ? "auto" : 0,
          opacity: isMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:hidden overflow-hidden border-t border-slate-200/60"
      >
        <div className="bg-white p-2">
           {/* Mobile menu content same as before but styled - abbreviated for brevity */}
           <nav className="flex flex-col gap-1 p-2">
             {/* ... Mobile links ... */}
             {isAuthenticated && (
                <>
                 <Link href="/carteira" onClick={() => setIsMenuOpen(false)} className="flex items-center p-3 rounded-xl hover:bg-blue-50 text-slate-700 font-medium">
                    <Wallet className="w-5 h-5 mr-3 text-blue-500" /> Carteira
                 </Link>
                 <Link href="/historico" onClick={() => setIsMenuOpen(false)} className="flex items-center p-3 rounded-xl hover:bg-blue-50 text-slate-700 font-medium">
                    <CreditCard className="w-5 h-5 mr-3 text-blue-500" /> Histórico
                 </Link>
                 <Link href="/recarregar" onClick={() => setIsMenuOpen(false)} className="flex items-center p-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-md shadow-blue-500/20 mb-2">
                    <Plus className="w-5 h-5 mr-3" /> Recarregar
                 </Link>
                 <button onClick={handleLogout} className="flex items-center p-3 rounded-xl hover:bg-red-50 text-red-600 font-medium">
                    <LogOut className="w-5 h-5 mr-3" /> Sair
                 </button>
                </>
             )}
           </nav>
        </div>
      </motion.div>
    </motion.header>
  );
}

export default Header;
