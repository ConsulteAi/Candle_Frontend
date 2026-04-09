'use client';

import { motion } from 'framer-motion';
import { Card } from '@/design-system/ComponentsTailwind';
import { FileText, CheckCircle, AlertTriangle, Scale } from 'lucide-react';
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
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary m-0">Declaração Contratual</h3>
                  <p className="text-primary/80 m-0 text-sm">
                    Termo vinculativo para uso das informações de consulta.
                  </p>
                </div>
              </div>

              <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mt-12 mb-6">
                <CheckCircle className="w-6 h-6 text-primary" />
                A - Declaração de Enquadramento
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Declaro, para todos os fins e efeitos, preencher um dos seguintes requisitos:
              </p>
              <ol className="space-y-4 pl-6 text-gray-600">
                <li>
                  Ser pessoal natural (física), nos termos da lei, que mantém ou pretende manter relação comercial com profissional(is) liberal(is) e/ou trabalhador(es) autônomo(s) e utilizar as informações apresentadas nesta consulta, especificamente, para subsidiar tal(is) decisão(ões) de negócios com a finalidade de proteção de crédito e oferta de produtos e serviços que sejam de interesse conjunto; ou
                </li>
                <li>
                  Exercer as minhas atividades na condição de profissional liberal ou trabalhador autônomo.
                </li>
              </ol>

              <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mt-12 mb-6">
                <AlertTriangle className="w-6 h-6 text-primary" />
                B - Uso Confidencial e Responsabilidade
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                E, assim, ciente, sob pena de responsabilização civil e criminal, que:
              </p>
              <ol className="space-y-4 pl-6 text-gray-600">
                <li>
                  As informações apresentadas nesta consulta são CONFIDENCIAIS e somente poderão ser utilizadas para fins de auxílio e subsídio nos procedimentos de decisão de negócios próprios, sendo vedada à sua comercialização ou cessão, a qualquer título;
                </li>
                <li>
                  É expressamente proibido o armazenamento, reprodução total ou parcial e/ou divulgação das informações apresentadas nesta consulta à terceiros ou, ainda, por qualquer outro meio e/ou forma;
                </li>
                <li>
                  As informações apresentadas nesta consulta não poderão ser utilizadas, em nenhuma hipótese, para fins ilícitos, abusivos ou, ainda, para a prática de atos atentatórios à dignidade da justiça e aos direitos de terceiros.
                </li>
              </ol>

              <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mt-12 mb-6">
                <Scale className="w-6 h-6 text-primary" />
                C - Declarações Adicionais
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Declaro, ainda, admitir que:
              </p>
              <ol className="space-y-4 pl-6 text-gray-600">
                <li>
                  As informações apresentadas nesta consulta não são desabonadoras, não devendo constituir-se em fator restritivo à concretização de negócios, responsabilizando-me integralmente por qualquer questionamento, judicial ou extrajudicial, que venha a ser apresentado nesse sentido;
                </li>
                <li>
                  Na eventual condenação judicial da ConsultaAi, em razão do descumprimento das obrigações estabelecidas neste termo ou vinculada às informações apresentadas nesta consulta, ensejarão a minha responsabilização pelo ressarcimento de todos os custos e despesas por estes incorridos, em especial, mas não se limitando, a custas, honorários advocatícios, condenações, dentre outros, acrescido de multa no importe de 20% (vinte por cento) aplicada sobre o valor total dispendido, o qual será atualizado, desde o desembolso, com base na variação do IGP-M.
                </li>
              </ol>

              <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6">
                <p className="text-primary font-semibold m-0 text-center">
                  Por ser expressão da verdade, firmo o presente.
                </p>
              </div>

              <div className="mt-12 p-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-400 m-0">
                  Última atualização: 02/04/2026
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
