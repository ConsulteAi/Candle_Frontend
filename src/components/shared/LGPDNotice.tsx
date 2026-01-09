"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function LGPDNotice() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-6 card-shadow rounded-xl bg-card p-5 border border-border/50"
    >
      <div className="flex gap-4">
        <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold mb-1">Proteção de Dados (LGPD)</h4>
          <p className="text-sm text-muted-foreground">
            Ao consultar, você concorda com nossos{" "}
            <a href="#" className="text-primary hover:underline">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="#" className="text-primary hover:underline">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </motion.div>
  );
}
