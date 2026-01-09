"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getConsultaBySlug } from "@/lib/consultas";
import { Header, Footer } from "@/components/layout";
import { LGPDNotice } from "@/components/shared";
import {
  ConsultaHeader,
  ConsultaForm,
  ConsultaSidebar,
} from "@/components/credito";
import { Button } from "@/components/ui/button";

export default function ConsultaPage() {
  const params = useParams();
  const slug = params.slug as string;
  const consulta = getConsultaBySlug(slug);

  if (!consulta) {
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <ConsultaHeader consulta={consulta} />

        <section className="py-12">
          <div className="container">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-3"
              >
                <div className="card-shadow rounded-2xl bg-card border border-border/50 p-6 md:p-8">
                  <h2 className="text-xl font-bold mb-6">Dados para Consulta</h2>
                  <ConsultaForm tipo={consulta.tipo} />
                </div>

                <LGPDNotice />
              </motion.div>

              {/* Sidebar */}
              <div className="lg:col-span-2">
                <ConsultaSidebar />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
