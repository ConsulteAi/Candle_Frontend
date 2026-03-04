'use client';

import { motion } from 'framer-motion';
import { Card } from '@/design-system/ComponentsTailwind';
import { 
  Building2, 
  Search, 
  ShieldCheck, 
  Zap, 
  FileText, 
  CheckCircle2, 
  Mail 
} from 'lucide-react';
import { TenantBrand } from '@/components/ui/TenantBrand';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useTenant } from '@/components/layout/TenantThemeProvider';

export default function AboutPage() {
  const tenant = useTenant();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-12"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Sobre Nós
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simplificando o acesso à informação para decisões mais seguras.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl blur-3xl" />
            <Card className="relative bg-white/80 backdrop-blur-xl shadow-xl border-white/50 overflow-hidden">
              <div className="grid md:grid-cols-[1fr,2fr] gap-8 p-8 md:p-12 items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 rounded-2xl opacity-10 rotate-3" />
                  <div className="relative bg-white rounded-2xl p-8 border border-primary/20 shadow-sm text-center">
                    <Building2 className="w-16 h-16 text-primary mx-auto mb-4" />
                    <div className="font-display font-bold text-gray-900"><TenantBrand /></div>
                    <div className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Platform</div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <p className="text-xl text-gray-700 font-medium leading-relaxed">
                    A <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 font-bold"><TenantBrand /></span> nasceu com o propósito de simplificar o acesso às informações de crédito e dados públicos.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    A partir do CPF ou CNPJ, você pode obter dados atualizados e oficiais sobre situação cadastral, score e histórico financeiro. Reunimos em um só lugar consultas rápidas, seguras e completas.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {['Análise de Risco', 'Vendas', 'Parcerias', 'Negociações'].map((tag, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Services Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-8 bg-primary/5 border-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Consulta Básica</h3>
              <p className="text-gray-600">
                Verifique dados essenciais como situação na Receita Federal, Score de crédito, localização e dados de contato básicos.
              </p>
            </Card>

            <Card className="p-8 bg-primary/5 border-primary/10">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Consulta Completa</h3>
              <p className="text-gray-600">
                Acesse relatórios detalhados com informações sobre protestos, dívidas ativas, cheques sem fundo, participações societárias, renda estimada e muito mais.
              </p>
            </Card>
          </div>

          {/* How it works */}
          <div className="py-8">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-8 text-center">
              Como funciona a consulta
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { title: 'Crie sua Conta', desc: 'Cadastre-se gratuitamente em nossa plataforma em poucos segundos.' },
                { title: 'Adicione Créditos', desc: 'Recarregue sua carteira via PIX. O valor entra na hora.' },
                { title: 'Escolha a Consulta', desc: 'Selecione o tipo de consulta que deseja realizar no catálogo.' },
                { title: 'Receba os Dados', desc: 'O relatório completo é gerado instantaneamente na sua tela.' }
              ].map((step, i) => (
                <div key={i} className="relative">
                  <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4 mx-auto md:mx-0">
                    {i + 1}
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 text-center md:text-left">{step.title}</h4>
                  <p className="text-sm text-gray-500 text-center md:text-left">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Why Choose */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="flex items-center gap-2 font-display text-xl font-bold text-gray-900 mb-4">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                Segurança e Legalidade
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Todos os relatórios são gerados a partir de bases públicas e dados oficiais, respeitando rigorosamente as diretrizes da LGPD (Lei Geral de Proteção de Dados). Garantimos sigilo total e não armazenamos informações sensíveis das consultas além do necessário para o serviço.
              </p>
            </div>
            <div>
              <h3 className="flex items-center gap-2 font-display text-xl font-bold text-gray-900 mb-4">
                <Zap className="w-6 h-6 text-amber-500" />
                Por que escolher
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Com a plataforma, você tem acesso a informações completas, atualizadas e organizadas, sem complicação ou burocracia. Nosso foco é entregar a melhor experiência de análise de dados — simples, direta e 100% confiável.
              </p>
            </div>
          </div>

          {/* Contact */}
          <Card className="bg-gray-900 text-white p-8 md:p-12 text-center">
             <h2 className="font-display text-2xl font-bold mb-4">
              Suporte e Contato
            </h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Em caso de dúvidas, suporte técnico ou solicitações comerciais, entre em contato com nossa equipe especializada.
            </p>
            <a 
              href={`mailto:${tenant.contactEmail}`}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              <Mail className="w-5 h-5" />
              {tenant.contactEmail}
            </a>
          </Card>

        </motion.div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
