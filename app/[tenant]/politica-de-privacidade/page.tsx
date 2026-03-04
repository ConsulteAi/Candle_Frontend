'use client';

import { motion } from 'framer-motion';
import { Card } from '@/design-system/ComponentsTailwind';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPolicyPage() {
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
              Política de Privacidade
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sua privacidade é nossa prioridade. Entenda como coletamos, usamos e protegemos seus dados.
            </p>
          </div>

          <Card className="bg-white/80 backdrop-blur-xl shadow-xl border-white/50 p-8 md:p-12 mb-8">
            <div className="prose prose-lg max-w-none">
              <div className="flex items-center gap-4 mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary m-0">Compromisso com a Segurança</h3>
                  <p className="text-primary/80 m-0 text-sm">
                    Utilizamos criptografia de ponta a ponta e seguimos rigorosamente a LGPD.
                  </p>
                </div>
              </div>

              <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mt-12 mb-6">
                <Eye className="w-6 h-6 text-primary" />
                1. Coleta de Dados
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Coletamos apenas as informações necessárias para fornecer nossos serviços de consulta de crédito e análise de risco. Isso inclui:
              </p>
              <ul className="grid md:grid-cols-2 gap-4 list-none pl-0 my-6">
                {[
                  'Dados de identificação (Nome, CPF/CNPJ)',
                  'Informações de contato (Email, Telefone)',
                  'Histórico de consultas realizadas',
                  'Dados de navegação e uso da plataforma'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-base">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>

              <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mt-12 mb-6">
                <Lock className="w-6 h-6 text-primary" />
                2. Uso das Informações
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                As informações coletadas são utilizadas exclusivamente para:
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold shrink-0">1</div>
                  <p className="m-0 text-gray-600">Processar suas consultas nos bureaus de crédito parceiros.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold shrink-0">2</div>
                  <p className="m-0 text-gray-600">Melhorar a segurança da sua conta e prevenir fraudes.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold shrink-0">3</div>
                  <p className="m-0 text-gray-600">Enviar comunicações importantes sobre o serviço.</p>
                </div>
              </div>

              <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mt-12 mb-6">
                <FileText className="w-6 h-6 text-primary" />
                3. Seus Direitos (LGPD)
              </h2>
              <p className="text-gray-600 leading-relaxed">
                De acordo com a Lei Geral de Proteção de Dados, você tem o direito de:
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                {[
                  { title: 'Acesso', desc: 'Solicitar cópia dos seus dados' },
                  { title: 'Correção', desc: 'Corrigir dados incompletos' },
                  { title: 'Exclusão', desc: 'Solicitar remoção dos dados' }
                ].map((card, i) => (
                  <div key={i} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
                    <h4 className="font-bold text-gray-900 mb-2">{card.title}</h4>
                    <p className="text-sm text-gray-500 m-0">{card.desc}</p>
                  </div>
                ))}
              </div>

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
