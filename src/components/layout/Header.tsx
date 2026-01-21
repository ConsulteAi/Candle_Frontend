'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, CreditCard, User, LogIn, LogOut, Settings, Wallet } from 'lucide-react';
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
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
              <Search className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold gradient-text">
              Consulte Ai
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/consulta">
            <motion.div
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              whileHover={{ y: -1 }}
            >
              <CreditCard className="w-4 h-4" />
              Consultas
            </motion.div>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
               <Button 
                 size="sm" 
                 variant="ghost" 
                 className="h-8 px-3 rounded-full text-blue-600 hover:bg-blue-50 font-medium text-xs border border-blue-100 bg-blue-50/30"
                 onClick={() => router.push('/recarregar')}
               >
                 + Recarregar
               </Button>

               {/* Balance Badge */}
               <motion.div 
                 whileHover={{ scale: 1.05 }}
                 className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full"
               >
                  <Wallet className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-bold text-gray-700">
                    R$ {formattedBalance}
                  </span>
               </motion.div>

               {/* User Dropdown */}
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 rounded-xl px-2 hover:bg-gray-100 flex items-center gap-2 group">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      Olá, {firstName}
                    </span>
                    <Avatar className="h-8 w-8 border-2 border-white shadow-sm ring-1 ring-gray-100 group-hover:ring-blue-100 transition-all">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xs">
                        {firstName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/recarregar')} className="cursor-pointer">
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Recarregar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-primary text-white border-0 hover:opacity-90 transition-opacity" size="sm">
                  Criar Conta
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isMenuOpen ? (
            <X className="h-5 w-5 text-gray-700" />
          ) : (
            <Menu className="h-5 w-5 text-gray-700" />
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
        className="md:hidden overflow-hidden border-t border-gray-200"
      >
        <nav className="container mx-auto px-4 flex flex-col gap-4 py-4">
          <Link
            href="/consulta"
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <CreditCard className="w-4 h-4" />
            Consultas de Crédito
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                Dashboard
              </Link>

              <Link
                href="/recarregar"
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Wallet className="w-4 h-4" />
                Recarregar Carteira
              </Link>
              
               <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">Saldo</span>
                  <span className="text-sm font-semibold text-blue-600">
                    R$ {formattedBalance}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        {firstName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-gradient-primary text-white border-0">
                  Criar Conta
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </motion.div>
    </motion.header>
  );
}

export default Header;
