'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, CreditCard, Barcode, QrCode } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import { Button, Card } from '@/components/candle';
import type { BillingType, RechargeResponse } from '@/types/payment';
import { toast } from 'sonner';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_AMOUNTS = [20, 50, 100, 200, 500, 1000];

export function RechargeModal({ isOpen, onClose, onSuccess }: RechargeModalProps) {
  const { createRecharge, checkPaymentStatus } = usePayment();
  const [step, setStep] = useState<'amount' | 'method' | 'payment'>('amount');
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [billingType, setBillingType] = useState<BillingType>('PIX');
  const [paymentData, setPaymentData] = useState<RechargeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep('amount');
      setAmount(50);
      setCustomAmount('');
      setBillingType('PIX');
      setPaymentData(null);
      setCopied(false);
    }
  }, [isOpen]);

  // Check payment status periodically when in payment step
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
            onSuccess?.();
            onClose();
          }
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [step, paymentData, billingType, checkPaymentStatus, onSuccess, onClose]);

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    const numValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!isNaN(numValue)) {
      setAmount(numValue);
    }
    setCustomAmount(value);
  };

  const handleNextToMethod = () => {
    if (amount < 10) {
      toast.error('Valor mínimo de recarga é R$ 10,00');
      return;
    }
    if (amount > 10000) {
      toast.error('Valor máximo de recarga é R$ 10.000,00');
      return;
    }
    setStep('method');
  };

  const handleCreatePayment = async () => {
    setIsLoading(true);
    const result = await createRecharge({ amount, billingType });
    setIsLoading(false);

    if (result.success && result.data) {
      setPaymentData(result.data);
      setStep('payment');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="glass-strong w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/40">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold gradient-text">
              Recarregar Carteira
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Step 1: Amount Selection */}
          {step === 'amount' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Escolha o valor da recarga
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_AMOUNTS.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleAmountSelect(value)}
                      className={`p-4 rounded-xl border-2 transition-all font-semibold ${
                        amount === value && !customAmount
                          ? 'border-primary bg-primary/10 text-primary/90'
                          : 'border-gray-200 hover:border-primary/40 text-gray-700'
                      }`}
                    >
                      R$ {value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ou digite um valor personalizado
                </label>
                <input
                  type="text"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  placeholder="R$ 0,00"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleNextToMethod}
                  variant="primary"
                  className="w-full"
                >
                  Continuar - R$ {amount.toFixed(2)}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 'method' && (
            <div className="space-y-6">
              <div>
                <button
                  onClick={() => setStep('amount')}
                  className="text-sm text-primary hover:text-primary mb-4"
                >
                  ← Voltar
                </button>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Escolha o método de pagamento
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => setBillingType('PIX')}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      billingType === 'PIX'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-primary/40'
                    }`}
                  >
                    <QrCode className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">PIX</div>
                      <div className="text-sm text-gray-600">
                        Aprovação instantânea
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setBillingType('BOLETO')}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      billingType === 'BOLETO'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-primary/40'
                    }`}
                  >
                    <Barcode className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Boleto</div>
                      <div className="text-sm text-gray-600">
                        Aprovação em até 3 dias úteis
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setBillingType('CREDIT_CARD')}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      billingType === 'CREDIT_CARD'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-primary/40'
                    }`}
                  >
                    <CreditCard className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">
                        Cartão de Crédito
                      </div>
                      <div className="text-sm text-gray-600">
                        Aprovação instantânea
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <Button
                onClick={handleCreatePayment}
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                Gerar Pagamento
              </Button>
            </div>
          )}

          {/* Step 3: Payment (PIX) */}
          {step === 'payment' && billingType === 'PIX' && paymentData && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Escaneie o QR Code abaixo ou copie o código PIX
                </p>

                {/* QR Code placeholder - In production, generate actual QR code */}
                <div className="mx-auto w-64 h-64 bg-white rounded-xl p-4 border-2 border-gray-200 flex items-center justify-center mb-4">
                  {paymentData.pixQrCode ? (
                    <img
                      src={paymentData.pixQrCode}
                      alt="QR Code PIX"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <QrCode className="h-24 w-24 mx-auto mb-2" />
                      <p className="text-sm">QR Code PIX</p>
                    </div>
                  )}
                </div>

                {/* Copy PIX Code */}
                {paymentData.pixCopyPaste && (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg text-xs font-mono break-all text-gray-700">
                      {paymentData.pixCopyPaste}
                    </div>
                    <Button
                      onClick={handleCopyPixCode}
                      variant="secondary"
                      className="w-full"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Código PIX
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Status */}
                <div className="mt-6 p-4 bg-primary/10 rounded-xl">
                  <p className="text-sm font-medium text-primary/80">
                    {checkingStatus
                      ? 'Verificando pagamento...'
                      : 'Aguardando pagamento...'}
                  </p>
                  <p className="text-xs text-primary/90 mt-1">
                    O saldo será creditado automaticamente após a confirmação
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment (Boleto) */}
          {step === 'payment' && billingType === 'BOLETO' && paymentData && (
            <div className="space-y-6 text-center">
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="font-semibold text-green-900 mb-2">
                  Boleto gerado com sucesso!
                </p>
                <p className="text-sm text-green-700">
                  Vencimento: {paymentData.dueDate ? new Date(paymentData.dueDate).toLocaleDateString('pt-BR') : 'N/A'}
                </p>
              </div>

              <Button
                onClick={() => {
                  if (paymentData.invoiceUrl) {
                    window.open(paymentData.invoiceUrl, '_blank');
                  }
                }}
                variant="primary"
                className="w-full"
              >
                Visualizar Boleto
              </Button>

              <Button onClick={onClose} variant="outline" className="w-full">
                Fechar
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
