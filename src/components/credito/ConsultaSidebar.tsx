"use client";

import { motion } from "framer-motion";
import { Shield, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConsultaSidebar() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-6"
    >
      <div className="rounded-2xl bg-muted/50 p-6">
        <h3 className="font-bold mb-4">Informações da Consulta</h3>
        <ul className="space-y-4">
          <li className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Tempo de resposta</p>
              <p className="text-sm text-muted-foreground">
                Menos de 3 segundos
              </p>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Dados seguros</p>
              <p className="text-sm text-muted-foreground">
                Criptografia end-to-end
              </p>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Dados atualizados</p>
              <p className="text-sm text-muted-foreground">
                Informações em tempo real
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white">
        <h3 className="font-bold mb-2">Precisa de ajuda?</h3>
        <p className="text-sm text-white/80 mb-4">
          Nossa equipe está disponível para tirar suas dúvidas sobre esta
          consulta.
        </p>
        <Button
          variant="secondary"
          className="w-full bg-white text-blue-600 hover:bg-white/90"
        >
          Falar com suporte
        </Button>
      </div>
    </motion.div>
  );
}
