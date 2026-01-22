'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CreditCard,
  QrCode,
  Barcode,
  CheckCircle,
  Wallet,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  AlertCircle
} from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import { Button, Card, Badge } from '@/components/candle';
import { CreditCardForm } from '@/components/payment/CreditCardForm';
import type { BillingType, RechargeResponse } from '@/types/payment';
import { toast } from 'sonner';



import { Header } from '@/components/layout/Header';
import { motion } from 'framer-motion';


const PRESET_AMOUNTS = [50, 100, 200, 300, 500, 1000];

export default function RechargePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createRecharge, checkPaymentStatus, getTransactionById, getPendingPayment } = usePayment();
  
  // Steps: amount -> method -> payment (form or display) -> success
  const [step, setStep] = useState<'amount' | 'method' | 'payment'>('amount');
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [billingType, setBillingType] = useState<BillingType>('PIX');
  const [paymentData, setPaymentData] = useState<RechargeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  
  // Pending payment banner
  const [pendingPayment, setPendingPayment] = useState<RechargeResponse | null>(null);
  const [showPendingBanner, setShowPendingBanner] = useState(false);

  // Check for tx param or pending payments on mount
  useEffect(() => {
    const txId = searchParams.get('tx');
    
    const loadTransaction = async () => {
      if (txId) {
        // Resume specific transaction from URL
        const result = await getTransactionById(txId);
        if (result.success && result.data) {
          setPaymentData(result.data);
          setAmount(result.data.amount);
          setBillingType(result.data.billingType || 'PIX');
          setStep('payment');
        }
      } else {
        // Check for any pending payments
        const result = await getPendingPayment();
        if (result.success && result.data) {
          setPendingPayment(result.data);
          setShowPendingBanner(true);
        }
      }
    };

    loadTransaction();
  }, [searchParams, getTransactionById, getPendingPayment]);

  // Resume pending payment from banner
  const handleResumePendingPayment = () => {
    if (pendingPayment) {
      setPaymentData(pendingPayment);
      setAmount(pendingPayment.amount);
      setBillingType(pendingPayment.billingType || 'PIX');
      setStep('payment');
      setShowPendingBanner(false);
      // Update URL
      router.replace(`/recarregar?tx=${pendingPayment.id}`, { scroll: false });
    }
  };

  // Poll for PIX status
  useEffect(() => {
    if (step === 'payment' && paymentData && billingType === 'PIX') {
      const interval = setInterval(async () => {
        setCheckingStatus(true);
        const result = await checkPaymentStatus(paymentData.id);
        setCheckingStatus(false);

        if (result.success && result.data) {
          if (
            result.data.status === 'CONFIRMED' ||
            result.data.status === 'RECEIVED'
          ) {
            clearInterval(interval);
            toast.success('Pagamento recebido!');
            router.push('/dashboard/carteira');
          }
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [step, paymentData, billingType, checkPaymentStatus, router]);

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    // Allow digits and one comma/dot
    const numValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!isNaN(numValue)) {
      setAmount(numValue);
    }
    setCustomAmount(value);
  };

  const handleNextToMethod = () => {
    if (amount < 5) {
      toast.error('Valor mínimo de recarga é R$ 5,00');
      return;
    }
    if (amount > 10000) {
      toast.error('Valor máximo de recarga é R$ 10.000,00');
      return;
    }
    setStep('method');
  };

  const initPayment = async (type: BillingType) => {
    setBillingType(type);
    if (type === 'CREDIT_CARD') {
       // Just move to payment step to show the form
       setStep('payment');
    } else {
       // PIX or BOLETO create immediately
       handleCreatePayment(type);
    }
  };

  const handleCreatePayment = async (type: BillingType = billingType, creditCardData?: any) => {
    setIsLoading(true);
    
    const payload: any = {
      amount,
      billingType: type
    };

    if (type === 'CREDIT_CARD' && creditCardData) {
      payload.creditCard = creditCardData.creditCard;
      payload.creditCardHolderInfo = creditCardData.creditCardHolderInfo;
    }

    const result = await createRecharge(payload);
    setIsLoading(false);

    if (result.success && result.data) {
      setPaymentData(result.data);
      if (type === 'PIX' || type === 'BOLETO') {
         setStep('payment');
         // Update URL with transaction ID for resumption
         router.replace(`/recarregar?tx=${result.data.id}`, { scroll: false });
      } else if (type === 'CREDIT_CARD') {
         // Credit Card usually returns instant status, check if CONFIRMED
         if (result.data.status === 'CONFIRMED' || result.data.status === 'RECEIVED') {
           toast.success('Recarga realizada com sucesso!');
           router.push('/dashboard/carteira');
         } else if (result.data.status === 'PENDING') {
           // Maybe manual review or processing
           toast.info('Pagamento em processamento.');
           router.push('/dashboard/carteira');
         } else {
           // Error or declined
           toast.error('Pagamento não aprovado. Tente novamente.');
         }
      }
    }
  };

  const handleCopyPixCode = () => {
    if (paymentData?.pixCopyPaste) {
      navigator.clipboard.writeText(paymentData.pixCopyPaste);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="space-y-6 max-w-5xl mx-auto">


      {/* Header with improved styling */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 pb-6 border-b border-gray-200/50">
        <div className="flex items-center gap-4">
          <Button 
            variant="secondary" 
            size="sm" 
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center border-gray-200 shadow-sm hover:shadow-md transition-all"
            onClick={() => step === 'amount' ? router.back() : setStep(prev => prev === 'payment' ? 'method' : 'amount')}
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>

          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
              Recarregar Carteira
            </h1>
            <p className="text-gray-500 font-medium">
              Escolha um valor para adicionar créditos na sua conta
            </p>
          </div>
        </div>
      </div>

      {/* Pending Payment Banner */}
      {showPendingBanner && pendingPayment && step === 'amount' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-900">
                Você tem um pagamento {pendingPayment.billingType} pendente
              </p>
              <p className="text-sm text-amber-700">
                Valor: R$ {pendingPayment.amount.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPendingBanner(false)}
              className="text-amber-700 hover:text-amber-900"
            >
              Ignorar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleResumePendingPayment}
              className="bg-amber-600 hover:bg-amber-700 shadow-amber-500/30"
            >
              Continuar Pagamento
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Amount */}
          {step === 'amount' && (
            <Card className="glass-strong p-8 border border-white/60 shadow-xl animate-scale-in relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl -z-10" />

              <h2 className="text-xl font-display font-bold mb-8 flex items-center gap-3 text-gray-900">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Wallet className="h-5 w-5" />
                </div>
                Selecione o valor da recarga
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-10">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    onClick={() => handleAmountSelect(val)}
                    className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                      amount === val && !customAmount
                        ? 'border-blue-500 bg-blue-50/50 shadow-blue-500/20 shadow-lg scale-[1.02]'
                        : 'border-gray-100 hover:border-blue-300 hover:bg-white/60 bg-white/40'
                    }`}
                  >
                    <span className={`text-sm font-medium ${amount === val && !customAmount ? 'text-blue-600' : 'text-gray-500'}`}>
                      Crédito de
                    </span>
                    <span className={`text-2xl font-display font-bold ${amount === val && !customAmount ? 'text-blue-700' : 'text-gray-900'}`}>
                      R$ {val}
                    </span>
                    {amount === val && !customAmount && (
                      <motion.div 
                        layoutId="active-ring"
                        className="absolute inset-0 border-2 border-blue-500 rounded-2xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="relative p-1 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50 mb-8">
                <div className="bg-white p-6 rounded-xl relative overflow-hidden">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Outro valor
                  </label>
                  <div className="relative group">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 font-display text-2xl font-bold pl-4 transition-colors group-focus-within:text-blue-500">R$</span>
                    <input
                      type="text"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-14 pr-4 py-4 rounded-xl border-2 border-gray-100 bg-gray-50/30 focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10 outline-none transition-all text-2xl font-display font-bold text-gray-900 placeholder:text-gray-300"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 pl-1">
                    Mínimo: R$ 5,00 • Máximo: R$ 10.000,00
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleNextToMethod} 
                variant="primary" 
                className="w-full text-lg h-14 font-display font-bold shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                Continuar <span className="opacity-70 mx-2">•</span> R$ {amount.toFixed(2)}
              </Button>
            </Card>
          )}



          {/* Step 2: Method */}
          {step === 'method' && (
            <Card className="glass-strong p-8 border border-white/60 shadow-xl animate-scale-in relative overflow-hidden">
               <h2 className="text-xl font-display font-bold mb-8 flex items-center gap-3 text-gray-900">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                Como você prefere pagar?
              </h2>

              <div className="space-y-4">
                <button
                  onClick={() => initPayment('PIX')}
                  disabled={isLoading}
                  className="w-full p-6 rounded-2xl border-2 border-gray-100 hover:border-green-500 hover:bg-green-50/10 transition-all group flex items-start gap-5 bg-white/60 text-left relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">PIX</h3>
                      <Badge variant="success" size="sm" className="shadow-none bg-green-100 text-green-700">Recomendado</Badge>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Aprovação instantânea, disponível 24h por dia.
                      <span className="block text-green-600 font-medium mt-1">Liberado na hora! ⚡</span>
                    </p>
                  </div>
                  <div className="self-center">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-green-500 group-hover:bg-green-500 transition-colors flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => initPayment('CREDIT_CARD')}
                  disabled={isLoading}
                  className="w-full p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/10 transition-all group flex items-start gap-5 bg-white/60 text-left relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">Cartão de Crédito</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Parcele em até 12x no cartão.
                      <span className="block text-gray-400 text-xs mt-1">Visa, Mastercard, Elo, Amex</span>
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => initPayment('BOLETO')}
                  disabled={isLoading}
                  className="w-full p-6 rounded-2xl border-2 border-gray-100 hover:border-orange-500 hover:bg-orange-50/10 transition-all group flex items-start gap-5 bg-white/60 text-left relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                    <Barcode className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">Boleto Bancário</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Vencimento em 3 dias úteis.
                      <span className="block text-orange-600 font-medium mt-1">Aprovação em até 2 dias úteis</span>
                    </p>
                  </div>
                </button>
              </div>
            </Card>
          )}

          {/* Step 3: Payment Details */}
          {step === 'payment' && (

            <Card className="glass-strong p-8 border border-white/60 shadow-xl animate-slide-up">
              
              {/* Credit Card Form */}
              {billingType === 'CREDIT_CARD' && (
                <CreditCardForm 
                  amount={amount}
                  onSubmit={(data) => handleCreatePayment('CREDIT_CARD', data)}
                  onCancel={() => setStep('method')}
                  isLoading={isLoading}
                />
              )}

              {/* PIX Display */}
              {billingType === 'PIX' && paymentData && (
                <div className="text-center space-y-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2 animate-bounce">
                       <QrCode className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-gray-900">
                      Pague com PIX
                    </h2>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Escaneie o QR Code abaixo ou use o código Copia e Cola. O pagamento é aprovado instantaneamente.
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl inline-block border-2 border-blue-100 shadow-lg relative group">
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none scale-105" />
                    {paymentData.pixQrCode ? (
                      <img 
                        src={paymentData.pixQrCode.startsWith('data:image') ? paymentData.pixQrCode : `data:image/png;base64,${paymentData.pixQrCode}`}
                        alt="QR Code PIX" 
                        className="w-64 h-64 object-contain"
                      />
                    ) : (
                      <div className="w-64 h-64 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                           <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                           <span className="text-sm font-medium">Gerando QR Code...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="max-w-md mx-auto space-y-3">
                    <div className="flex items-center justify-between text-sm font-medium text-gray-700 px-1">
                      <span>Código Copia e Cola</span>
                      <span className="text-xs text-blue-600">Expira em 30 min</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-gray-100/80 p-4 rounded-xl flex-1 font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap border border-gray-200 text-gray-600 shadow-inner">
                        {paymentData.pixCopyPaste}
                      </div>
                      <Button 
                        onClick={handleCopyPixCode} 
                        variant={copied ? 'primary' : 'secondary'}
                        className={`shrink-0 w-12 h-[50px] rounded-xl transition-all p-0 flex items-center justify-center ${copied ? 'bg-green-500 text-white border-green-500' : ''}`}
                      >
                        {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>

                  <div className="py-6 flex justify-center">
                    <div className="flex items-center gap-3 text-blue-700 bg-blue-50 px-6 py-3 rounded-full animate-pulse border border-blue-100">
                      <Clock className="h-5 w-5" />
                      <span className="text-sm font-bold">Aguardando pagamento...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Boleto Display */}
              {billingType === 'BOLETO' && paymentData && (
                 <div className="text-center space-y-8 py-8">
                   <div className="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-full mb-4 shadow-lg shadow-green-500/10">
                     <CheckCircle className="h-12 w-12 text-green-600" />
                   </div>
                   
                   <div>
                     <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">Boleto Gerado!</h2>
                     <p className="text-gray-500 max-w-md mx-auto text-lg">
                       O pagamento pode levar até <strong className="text-gray-800">3 dias úteis</strong> para ser compensado.
                     </p>
                   </div>

                   <div className="flex flex-col gap-4 max-w-sm mx-auto pt-4">
                     <Button 
                       onClick={() => paymentData.invoiceUrl && window.open(paymentData.invoiceUrl, '_blank')}
                       variant="primary"
                       className="w-full h-14 font-bold text-lg shadow-lg shadow-blue-500/30"
                     >
                       <Barcode className="h-5 w-5 mr-3" />
                       Visualizar Boleto
                     </Button>
                     <Button 
                       onClick={() => router.push('/dashboard/carteira')}
                       variant="outline"
                       className="w-full h-14 font-medium text-gray-600 border-2"
                     >
                       Voltar para Carteira
                     </Button>
                   </div>
                 </div>
              )}

            </Card>
          )}

        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <Card className="glass-strong p-6 border border-white/60 sticky top-6 shadow-xl">
             <h3 className="font-display font-bold text-gray-900 mb-6 text-lg">Resumo do Pedido</h3>
             
             <div className="space-y-4 text-sm">
               <div className="flex justify-between text-gray-600 items-center">
                 <span>Valor da recarga</span>
                 <span className="font-medium text-gray-900">R$ {amount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-gray-600 items-center">
                 <span>Taxa de serviço</span>
                 <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full text-xs">GRÁTIS</span>
               </div>
               <div className="h-px bg-gradient-to-r from-gray-200 to-transparent my-2" />
               <div className="flex justify-between text-xl font-display font-bold text-blue-900 pt-2">
                 <span>Total</span>
                 <span>R$ {amount.toFixed(2)}</span>
               </div>
             </div>

             <div className="mt-8 bg-blue-50/50 p-4 rounded-xl flex gap-3 text-sm text-blue-800 leading-relaxed border border-blue-100">
               <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />
               <p>
                 <span className="font-bold block text-blue-900 mb-1">Pagamento Seguro</span>
                 Seus dados estão protegidos com criptografia de ponta a ponta.
               </p>
             </div>
          </Card>
        </div>
      </div>

        </div>
      </main>
    </div>
  );
}

