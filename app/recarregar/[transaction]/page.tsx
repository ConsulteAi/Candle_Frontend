'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  QrCode,
  Barcode,
  CheckCircle,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import { Button, Card } from '@/components/candle';
import type { RechargeResponse } from '@/types/payment';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';

export default function TransactionPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.transaction as string;
  
  const { getTransactionById, checkPaymentStatus } = usePayment();
  
  const [paymentData, setPaymentData] = useState<RechargeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch transaction on mount
  useEffect(() => {
    const loadTransaction = async () => {
      setIsLoading(true);
      const result = await getTransactionById(transactionId);
      
      if (result.success && result.data) {
        setPaymentData(result.data);
        
        // If already confirmed, show success
        if (result.data.status === 'CONFIRMED' || result.data.status === 'RECEIVED') {
          toast.success('Este pagamento já foi confirmado!');
        }
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    };

    if (transactionId) {
      loadTransaction();
    }
  }, [transactionId, getTransactionById]);

  // Poll for PIX status
  useEffect(() => {
    if (!paymentData || paymentData.billingType !== 'PIX' || paymentData.status !== 'PENDING') {
      return;
    }

    const interval = setInterval(async () => {
      const result = await checkPaymentStatus(paymentData.id);

      if (result.success && result.data) {
        if (result.data.status === 'CONFIRMED' || result.data.status === 'RECEIVED') {
          clearInterval(interval);
          toast.success('Pagamento recebido!');
          router.push('/dashboard/carteira');
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentData, checkPaymentStatus, router]);

  const handleCopyPixCode = () => {
    if (paymentData?.pixCopyPaste) {
      navigator.clipboard.writeText(paymentData.pixCopyPaste);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Carregando transação...</p>
          </div>
        </main>
      </div>
    );
  }

  // Not found state
  if (notFound || !paymentData) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
              Transação não encontrada
            </h1>
            <p className="text-gray-500 mb-8">
              Não foi possível encontrar esta transação. Verifique o link e tente novamente.
            </p>
            <Button onClick={() => router.push('/recarregar')} variant="primary">
              Fazer nova recarga
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Already confirmed state
  if (paymentData.status === 'CONFIRMED' || paymentData.status === 'RECEIVED') {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/10">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-3">
              Pagamento Confirmado!
            </h1>
            <p className="text-gray-500 mb-2 text-lg">
              Sua recarga de <strong className="text-gray-900">R$ {paymentData.amount.toFixed(2)}</strong> foi processada.
            </p>
            <p className="text-gray-400 mb-8">
              O saldo já está disponível na sua carteira.
            </p>
            <Button onClick={() => router.push('/dashboard/carteira')} variant="primary" className="h-14 px-8">
              Ver minha Carteira
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="space-y-6 max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200/50">
            <Button 
              variant="secondary" 
              size="sm" 
              className="rounded-full w-10 h-10 p-0 flex items-center justify-center border-gray-200 shadow-sm hover:shadow-md transition-all"
              onClick={() => router.push('/recarregar')}
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>

            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900 tracking-tight">
                {paymentData.billingType === 'PIX' ? 'Pagamento PIX' : 'Pagamento Boleto'}
              </h1>
              <p className="text-gray-500">
                Conclua o pagamento para adicionar créditos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="glass-strong p-8 border border-white/60 shadow-xl">
                
                {/* PIX Display */}
                {paymentData.billingType === 'PIX' && (
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
                {paymentData.billingType === 'BOLETO' && (
                   <div className="text-center space-y-8 py-8">
                     <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-50 rounded-full mb-4 shadow-lg shadow-orange-500/10">
                       <Barcode className="h-12 w-12 text-orange-600" />
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
            </div>

            {/* Sidebar Summary */}
            <div className="space-y-6">
              <Card className="glass-strong p-6 border border-white/60 sticky top-6 shadow-xl">
                 <h3 className="font-display font-bold text-gray-900 mb-6 text-lg">Resumo do Pedido</h3>
                 
                 <div className="space-y-4 text-sm">
                   <div className="flex justify-between text-gray-600 items-center">
                     <span>Valor da recarga</span>
                     <span className="font-medium text-gray-900">R$ {paymentData.amount.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-gray-600 items-center">
                     <span>Método</span>
                     <span className="font-medium text-gray-900">{paymentData.billingType}</span>
                   </div>
                   <div className="flex justify-between text-gray-600 items-center">
                     <span>Taxa de serviço</span>
                     <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full text-xs">GRÁTIS</span>
                   </div>
                   <div className="h-px bg-gradient-to-r from-gray-200 to-transparent my-2" />
                   <div className="flex justify-between text-xl font-display font-bold text-blue-900 pt-2">
                     <span>Total</span>
                     <span>R$ {paymentData.amount.toFixed(2)}</span>
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
