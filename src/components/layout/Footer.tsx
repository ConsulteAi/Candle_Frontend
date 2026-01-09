"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-foreground text-background py-16"
    >
      <div className="container">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Search className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Consulte<span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Plataforma líder em consultas de CPF no Brasil. Informações
              seguras, rápidas e confiáveis com Inteligência Artificial.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Links Úteis</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#consultar-cpf"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Consultar CPF
                </a>
              </li>
              <li>
                <a
                  href="#como-funciona"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Como Funciona
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Termos de Uso
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail className="h-4 w-4 text-primary" />
                contato@consulteai.com.br
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Phone className="h-4 w-4 text-primary" />
                (11) 99999-9999
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-muted-foreground/20 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} ConsulteAI. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
