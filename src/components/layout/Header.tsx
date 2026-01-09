"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Menu, X, CreditCard, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Search className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Consulte<span className="text-primary">AI</span>
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/credito">
            <motion.div
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ y: -1 }}
            >
              <CreditCard className="w-4 h-4" />
              Crédito
            </motion.div>
          </Link>
          <span className="text-sm text-muted-foreground/50 cursor-not-allowed">
            Veículos
          </span>
          <span className="text-sm text-muted-foreground/50 cursor-not-allowed">
            Processos
          </span>
          <Button variant="default" size="sm" className="gradient-primary button-shadow ml-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Entrar
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
        className="md:hidden overflow-hidden border-t border-border/50"
      >
        <nav className="container flex flex-col gap-4 py-4">
          <Link
            href="/credito"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <CreditCard className="w-4 h-4" />
            Consultas de Crédito
          </Link>
          <span className="text-sm text-muted-foreground/50">
            Veículos (em breve)
          </span>
          <span className="text-sm text-muted-foreground/50">
            Processos (em breve)
          </span>
          <Button variant="default" size="sm" className="gradient-primary button-shadow w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            Entrar
          </Button>
        </nav>
      </motion.div>
    </motion.header>
  );
};

export default Header;
