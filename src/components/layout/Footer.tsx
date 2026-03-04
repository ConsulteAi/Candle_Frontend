'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { TenantBrand } from '@/components/ui/TenantBrand';
import { TenantLogo } from '@/components/ui/TenantLogo';
import { useTenant } from '@/components/layout/TenantThemeProvider';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const tenant = useTenant();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16"
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex-shrink-0 mb-6 block">
              <motion.div
                className="flex items-center gap-4 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300">
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <TenantLogo className="h-10 w-10" />
                </div>
                <div className="flex flex-col">
                  <TenantBrand className="text-xl tracking-tight text-white leading-none group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-none mt-1 group-hover:text-primary/70 transition-colors">
                    Platform
                  </span>
                </div>
              </motion.div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Plataforma completa de consultas de crédito para CPF e CNPJ.
              Informações seguras, rápidas e confiáveis.
            </p>
          </div>

          {/* Produtos */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-white">
              Produtos
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/consulta"
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  Consultas de Crédito
                </Link>
              </li>

              <li>
                <Link
                  href="/carteira"
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  Recargas
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-white">
              Empresa
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/sobre"
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  href="/termos"
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-de-privacidade"
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  Política de Privacidade
                </Link>
              </li>

            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-white">
              Contato
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <a
                  href={`mailto:${tenant.contactEmail}`}
                  className="hover:text-primary transition-colors"
                >
                  {tenant.contactEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left flex items-center gap-1">
              © {currentYear} <TenantBrand />. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/termos"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                Termos
              </Link>
              <Link
                href="/politica-de-privacidade"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                Privacidade
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
