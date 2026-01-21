'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Lock, Calendar, User, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { Button, Input, Card } from '@/components/candle';
import { ValidationService } from '@/lib/consultas/services/ValidationService';

const creditCardSchema = z.object({
  // Card Details
  cardNumber: z.string().min(13, 'Número do cartão inválido').transform(v => v.replace(/\s/g, '')),
  holderName: z.string().min(3, 'Nome impresso no cartão é obrigatório').toUpperCase(),
  expirationDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Data inválida (MM/AAAA)'),
  ccv: z.string().min(3, 'CVV inválido').max(4, 'CVV inválido'),

  // Holder Info

  docNumber: z.string().refine((val) => {
    const clean = val.replace(/\D/g, '');
    return ValidationService.validateCPF(clean) || ValidationService.validateCNPJ(clean);
  }, 'CPF ou CNPJ inválido'),

  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  postalCode: z.string().min(8, 'CEP inválido').transform(v => v.replace(/\D/g, '')),
  addressNumber: z.string().min(1, 'Número é obrigatório'),
  addressComplement: z.string().optional(),
});

type CreditCardFormData = z.infer<typeof creditCardSchema>;

interface CreditCardFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  onCancel: () => void;
  amount: number;
}

export function CreditCardForm({ onSubmit, isLoading, onCancel, amount }: CreditCardFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
  });

  const handleFormSubmit = (data: CreditCardFormData) => {
    const [month, year] = data.expirationDate.split('/');
    
    // Transform flat form data into nested structure expected by backend
    const formattedData = {
      creditCard: {
        holderName: data.holderName,
        number: data.cardNumber,
        expiryMonth: month,
        expiryYear: year,
        ccv: data.ccv,
      },
      creditCardHolderInfo: {
        name: data.holderName, // Assuming holder is the same for simplicity, or we could add specific field
        email: data.email,
        cpfCnpj: data.docNumber.replace(/\D/g, ''),
        postalCode: data.postalCode,
        addressNumber: data.addressNumber,
        addressComplement: data.addressComplement,
        phone: data.phone.replace(/\D/g, ''),
      },
    };

    onSubmit(formattedData);
  };

  // Masks
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    setValue('cardNumber', value);
  };

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 6);
    }
    setValue('expirationDate', value);
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    let formatted = value;
    if (value.length <= 11) {
      formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      formatted = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    setValue('docNumber', formatted);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-8 flex justify-between items-center shadow-sm">
        <div>
          <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-1">Valor a Pagar</p>
          <p className="text-3xl font-display font-extrabold text-blue-900">R$ {amount.toFixed(2)}</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
          <CreditCard className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Card Data */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            Dados do Cartão
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número do Cartão
            </label>
            <div className="relative">
              <Input
                {...register('cardNumber')}
                onChange={handleCardNumberChange}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                className="pl-10"
              />
              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            {errors.cardNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Impresso
            </label>
            <div className="relative">
              <Input
                {...register('holderName')}
                placeholder="NOME COMO NO CARTAO"
                className="pl-10 uppercase"
              />
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            {errors.holderName && (
              <p className="text-red-500 text-xs mt-1">{errors.holderName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validade
              </label>
              <div className="relative">
                <Input
                  {...register('expirationDate')}
                  onChange={handleExpirationChange}
                  placeholder="MM/AAAA"
                  maxLength={7}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {errors.expirationDate && (
                <p className="text-red-500 text-xs mt-1">{errors.expirationDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <div className="relative">
                <Input
                  {...register('ccv')}
                  placeholder="123"
                  maxLength={4}
                  className="pl-10"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {errors.ccv && (
                <p className="text-red-500 text-xs mt-1">{errors.ccv.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Holder Data */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Dados do Titular
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF/CNPJ
            </label>
            <div className="relative">
              <Input
                {...register('docNumber')}
                onChange={handleDocChange}
                placeholder="000.000.000-00"
                maxLength={18}
                className="pl-10"
              />
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            {errors.docNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.docNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Input
                  {...register('email')}
                  placeholder="email@exemplo.com"
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <div className="relative">
                <Input
                  {...register('phone')}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, '');
                    v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
                    v = v.replace(/(\d)(\d{4})$/, '$1-$2');
                    setValue('phone', v);
                  }}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="pl-10"
                />
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP
              </label>
              <div className="relative">
                <Input
                  {...register('postalCode')}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, '');
                    v = v.replace(/^(\d{5})(\d)/, '$1-$2');
                    setValue('postalCode', v);
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {errors.postalCode && (
                <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>
              )}
            </div>

            <div className="col-span-1">
               <label className="block text-sm font-medium text-gray-700 mb-1">
                Número
              </label>
              <Input {...register('addressNumber')} placeholder="123" />
               {errors.addressNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.addressNumber.message}</p>
              )}
            </div>
          </div>
          
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complemento (Opcional)
              </label>
              <Input {...register('addressComplement')} placeholder="Apto, Bloco..." />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-gray-100">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="w-full"
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
        >
          Pagar R$ {amount.toFixed(2)}
        </Button>
      </div>
    </form>
  );
}
