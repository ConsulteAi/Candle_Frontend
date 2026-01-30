'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  Wallet,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import { Button, Card, Badge } from '@/components/candle';
import type { RechargeResponse } from '@/types/payment';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_AMOUNTS = [50, 100, 200, 300, 500, 1000];

export default function RechargePage() {
  const router = useRouter();
  const { createRecharge, getPendingPayment } = usePayment();
  
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<RechargeResponse | null>(null);
  const [limitError, setLimitError] = useState(false);

  // Check for pending payments on mount
  useEffect(() => {
    const checkPendingPayments = async () => {
      const result = await getPendingPayment();
      if (result.success && result.data && result.data.status === 'PENDING') {
        setPendingPayment(result.data);
      }
    };
    checkPendingPayments();
  }, [getPendingPayment]);

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    const numValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
    
    // Check limit
    if (!isNaN(numValue) && numValue > 10000) {
      setLimitError(true);
      setTimeout(() => setLimitError(false), 2000);
      return;
    }

    if (!isNaN(numValue)) {
      setAmount(numValue);
    }
    setCustomAmount(value);
  };

  const handlePixPayment = async () => {
    if (amount < 5) {
      toast.error('Valor mínimo de recarga é R$ 5,00');
      return;
    }
    if (amount > 10000) {
      toast.error('Valor máximo de recarga é R$ 10.000,00');
      return;
    }

    setIsLoading(true);
    
    // Create PIX transaction
    const result = await createRecharge({
      amount,
      billingType: 'PIX'
    });

    setIsLoading(false);

    if (result.success && result.data) {
      // Redirect to transaction page which handles the QR Code display
      router.push(`/recarregar/${result.data.id}`);
    } else {
      toast.error('Erro ao gerar PIX. Tente novamente.');
    }
  };

  const isCustomSelected = !!customAmount;

  return (
    <div className="min-h-screen bg-slate-50/50 selection:bg-emerald-100 selection:text-emerald-900">
      <Header />
      
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-12">
            <div>
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-200/50"
               >
                 <Zap className="w-3 h-3 fill-emerald-500" />
                 Pagamento Instantâneo
               </motion.div>
               <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-slate-900 mb-2">
                 Recarregar Carteira
               </h1>
               <p className="text-slate-500 text-lg">
                 Adicione créditos via PIX para começar a usar.
               </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Selection */}
            <div className="lg:col-span-8 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glass-strong p-0 overflow-hidden border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100">
                  <div className="p-8 md:p-10 relative">
                     {/* Background Decoration */}
                     <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-emerald-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl -z-10 opacity-50 pointer-events-none" />

                     <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
                         <Wallet className="w-6 h-6" />
                       </div>
                       <div>
                         <h2 className="text-xl font-display font-bold text-slate-900">Valor da Recarga</h2>
                         <p className="text-slate-400 text-sm">Selecione ou digite o valor desejado</p>
                       </div>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        {PRESET_AMOUNTS.map((val) => {
                          const isSelected = amount === val && !customAmount;
                          return (
                            <button
                              key={val}
                              onClick={() => handleAmountSelect(val)}
                              className={`
                                relative group p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-1
                                ${isSelected 
                                  ? 'border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/10 scale-[1.02] z-10' 
                                  : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50 hover:shadow-md'
                                }
                              `}
                            >
                              <span className={`text-xs font-semibold uppercase tracking-wider ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`}>
                                Crédito
                              </span>
                              <span className={`text-2xl md:text-3xl font-display font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                                R$ {val}
                              </span>
                              {isSelected && (
                                <motion.div 
                                  layoutId="ring"
                                  className="absolute inset-0 border-2 border-emerald-500 rounded-2xl"
                                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                              )}
                            </button>
                          );
                        })}
                     </div>

                     <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100 flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex-1">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1 block">
                            Outro Valor
                          </label>
                          <p className={`text-xs transition-colors duration-300 ${limitError ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                            {limitError ? '• Valor limite de R$ 10.000,00 atingido' : 'Mínimo R$ 5,00 • Máximo R$ 10.000,00'}
                          </p>
                        </div>
                        <motion.div 
                          animate={limitError ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                          transition={{ duration: 0.4 }}
                          className="relative group w-full md:w-64"
                        >
                           <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-display text-xl font-bold transition-colors ${limitError ? 'text-red-500' : (isCustomSelected ? 'text-emerald-600' : 'text-slate-400')}`}>R$</span>
                           <input
                            type="text"
                            value={customAmount}
                            onChange={(e) => handleCustomAmountChange(e.target.value)}
                            placeholder="0,00"
                            className={`
                              w-full h-14 pl-12 pr-4 rounded-xl border-2 outline-none font-display text-xl font-bold bg-white transition-all
                              ${limitError
                                ? 'border-red-400 text-red-600 focus:border-red-500 bg-red-50/50'
                                : (isCustomSelected 
                                  ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 text-emerald-900' 
                                  : 'border-slate-200 text-slate-900 focus:border-emerald-400')
                              }
                            `}
                           />
                        </motion.div>
                     </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4"
              >
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">Por que usar PIX?</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">
                      O pagamento via PIX é processado instantaneamente pelo sistema do Candle. 
                      Seus créditos são liberados em questão de segundos após a confirmação do pagamento, 
                      permitindo que você continue suas consultas sem interrupções.
                    </p>
                  </div>
              </motion.div>
            </div>

            {/* Right Column: Checkout */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="glass-strong border-0 shadow-2xl shadow-slate-200/50 bg-white relative overflow-hidden ring-1 ring-slate-100">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                  
                  <div className="p-5 md:p-8 space-y-6">
                    <h3 className="font-display font-bold text-slate-900 text-xl md:text-2xl">Resumo</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-slate-600 text-sm md:text-base">
                        <span>Recarga</span>
                        <span className="font-medium text-slate-900">R$ {amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 p-2.5 rounded-xl">
                        <span className="flex items-center gap-2 text-sm font-bold">
                           <Zap className="w-4 h-4 fill-emerald-600" /> PIX
                        </span>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Instantâneo</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total a pagar</span>
                        <div className="flex items-baseline gap-1 flex-wrap">
                          <span className="text-lg font-bold text-slate-400">R$</span>
                          <span className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tight break-all">{amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handlePixPayment} 
                      disabled={isLoading}
                      className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold text-lg rounded-xl shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-[0.98] transition-all group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                           <>Gerando QR Code...</>
                        ) : (
                           <>
                             Gerar PIX
                             <QrCode className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                           </>
                        )}
                      </span>
                      {/* Button shine effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Ambiente 100% seguro por SSL
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Pending Payment Card (Mini) */}
              <AnimatePresence>
                {pendingPayment && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-amber-50 border border-amber-100 rounded-xl p-4 shadow-sm"
                  >
                     <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-full text-amber-500 shadow-sm shrink-0">
                           <Wallet className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                           <p className="text-amber-900 font-bold text-sm mb-0.5">Pagamento Pendente</p>
                           <p className="text-amber-700/80 text-xs mb-3">
                             Você já possui um PIX de R$ {pendingPayment.amount.toFixed(2)} aguardando.
                           </p>
                           <Button 
                             onClick={() => router.push(`/recarregar/${pendingPayment.id}`)}
                             size="sm" 
                             className="w-full bg-white text-amber-700 border border-amber-200 hover:bg-amber-100"
                           >
                             Continuar Pagamento
                           </Button>
                        </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
