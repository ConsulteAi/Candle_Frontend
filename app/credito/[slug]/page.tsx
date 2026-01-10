import { use } from "react";
import { ConsultaPageContent } from "@/components/credito";

interface ConsultaPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ConsultaPage({ params }: ConsultaPageProps) {
  const { slug } = use(params);

  return <ConsultaPageContent slug={slug} />;
}
