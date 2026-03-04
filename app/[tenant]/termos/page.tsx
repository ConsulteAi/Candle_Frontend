'use client';

import { motion } from 'framer-motion';
import { Card } from '@/design-system/ComponentsTailwind';
import { FileText, CheckCircle, AlertTriangle, Scale, User, Globe } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Termos de Uso
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ao utilizar nossos serviços, você concorda com os termos descritos abaixo.
            </p>
          </div>

          <Card className="bg-white/80 backdrop-blur-xl shadow-xl border-white/50 p-8 md:p-12 mb-8">
            <div className="prose prose-lg max-w-none">
              
              <div className="flex items-center gap-4 mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Scale className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary m-0">Acordo Legal</h3>
                  <p className="text-primary/80 m-0 text-sm">
                    Este é um contrato vinculativo entre você e a plataforma.
                  </p>
                </div>
              </div>

              <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mt-12 mb-6">
                <CheckCircle className="w-6 h-6 text-primary" />
                1. Aceitação dos Termos
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Ao acessar e usar a plataforma, você confirma que leu, entendeu e aceita estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
              </p>

              <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mt-12 mb-6">
                <Globe className="w-6 h-6 text-primary" />
                2. Serviços Oferecidos
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Fornecemos uma plataforma para consultas de crédito e dados públicos de pessoas físicas e jurídicas.
                Nossos serviços incluem:
              </p>
              <ul className="grid md:grid-cols-2 gap-4 list-none pl-0 my-6">
                {[
                  'Consultas de CPF e Score de Crédito',
                  'Consultas de CNPJ e Situação Cadastral',
                  'Verificação de Protestos e Restrições',
                  'Monitoramento de Dados Públicos'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-base">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>

              <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mt-12 mb-6">
                <User className="w-6 h-6 text-primary" />
                3. Responsabilidades do Usuário
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Você concorda em usar nossos serviços apenas para fins legais e autorizados. É estritamente proibido:
              </p>
              <div className="space-y-4">
                 <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold shrink-0">!</div>
                  <p className="m-0 text-gray-600">Usar os dados para fins fraudulentos ou ilícitos.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold shrink-0">!</div>
                  <p className="m-0 text-gray-600">Compartilhar suas credenciais de acesso com terceiros.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold shrink-0">!</div>
                  <p className="m-0 text-gray-600">Violar direitos de privacidade de terceiros.</p>
                </div>
              </div>

               <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mt-12 mb-6">
                <AlertTriangle className="w-6 h-6 text-primary" />
                4. Limitação de Responsabilidade
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Atuamos como intermediários de informações. Não garantimos a precisão absoluta de dados fornecidos por fontes terceiras (bureaus de crédito, órgãos públicos) e não nos responsabilizamos por decisões tomadas com base nessas informações.
              </p>

              <div className="mt-12 p-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-400 m-0">
                  Última atualização: {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
