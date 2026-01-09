"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { consultasCredito, type TipoDocumento } from "@/lib/consultas";
import { Header, Footer } from "@/components/layout";
import { PageHeader } from "@/components/shared";
import { ConsultaFilters, ConsultasList } from "@/components/credito";

export default function CreditoPage() {
  const [filtro, setFiltro] = useState<TipoDocumento | "todos">("todos");
  const [busca, setBusca] = useState("");

  const consultasFiltradas = consultasCredito.filter((consulta) => {
    const matchTipo = filtro === "todos" || consulta.tipo === filtro;
    const matchBusca =
      busca === "" ||
      consulta.nome.toLowerCase().includes(busca.toLowerCase()) ||
      consulta.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchBusca;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <PageHeader
          backHref="/"
          backLabel="Voltar ao início"
          icon={CreditCard}
          badge="Consultas de Crédito"
          title={
            <>
              Análise de crédito{" "}
              <span className="text-gradient">completa e precisa</span>
            </>
          }
          description="Escolha o tipo de consulta de crédito que você precisa. Oferecemos diversas opções para pessoa física e jurídica."
        />

        <ConsultaFilters
          filtro={filtro}
          onFiltroChange={setFiltro}
          busca={busca}
          onBuscaChange={setBusca}
        />

        <section className="py-12">
          <div className="container">
            <ConsultasList consultas={consultasFiltradas} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
