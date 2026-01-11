"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getConsultaBySlug } from "@/lib/consultas";
import { Header, Footer } from "@/components/layout";
import { LGPDNotice } from "@/components/shared";
import {
  ConsultaHeader,
  ConsultaForm,
  ConsultaSidebar,
  CreditReport,
} from "@/components/credito";
import { Button } from "@/components/ui/button";
import { CreditReportResponse, PremiumCreditReportResponse } from "@/types/credit";
import { ConsultaStrategyFactory } from "@/lib/consultas/factories/ConsultaStrategyFactory";

interface ConsultaPageContentProps {
  slug: string;
}

export default function ConsultaPageContent({ slug }: ConsultaPageContentProps) {
  const consulta = getConsultaBySlug(slug);
  const strategy = ConsultaStrategyFactory.create(slug);
  const [result, setResult] = useState<CreditReportResponse | PremiumCreditReportResponse | null>(null);

  if (!consulta || !strategy) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Consulta não encontrada</h1>
            <Link href="/credito">
              <Button>Voltar às consultas</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleResult = (data: CreditReportResponse | PremiumCreditReportResponse) => {
    setResult(data);
    // Scroll to results
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <ConsultaHeader consulta={consulta} />

        <section className="py-12">
          <div className="container">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid lg:grid-cols-5 gap-12"
                >
                  {/* Form */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-3"
                  >
                    <div className="card-shadow rounded-2xl bg-card border border-border/50 p-6 md:p-8">
                      <h2 className="text-xl font-bold mb-6">
                        Dados para Consulta
                      </h2>
                      <ConsultaForm
                        strategy={strategy}
                        onResult={handleResult}
                      />
                    </div>

                    <LGPDNotice />
                  </motion.div>

                  {/* Sidebar */}
                  <div className="lg:col-span-2">
                    <ConsultaSidebar />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  id="results-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Back to Form Button */}
                  <Button
                    variant="ghost"
                    onClick={() => setResult(null)}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Nova Consulta
                  </Button>

                  {/* Results */}
                  <CreditReport report={result} />

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex justify-center gap-4 pt-8"
                  >
                    <Button
                      variant="outline"
                      onClick={() => setResult(null)}
                      size="lg"
                    >
                      Nova Consulta
                    </Button>
                    <Button
                      onClick={() => window.print()}
                      size="lg"
                      className="gradient-primary"
                    >
                      Imprimir Relatório
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
