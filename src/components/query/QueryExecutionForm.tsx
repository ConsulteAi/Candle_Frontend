'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import type { QueryType, ExecuteQueryResponse } from '@/types/query';
import { QueryCategory } from '@/types/query';
import { ValidationService } from '@/lib/consultas/services/ValidationService';
import { useQueryExecution } from '@/hooks/useQueryExecution';
import { useBalance } from '@/hooks/useBalance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface QueryExecutionFormProps {
  queryType: QueryType;
  onSuccess?: (result: ExecuteQueryResponse) => void;
  className?: string;
}

const createSchema = (queryType: QueryType) => {
  const schemaObj: any = {
    input: z.string().min(1, 'Campo obrigatório'),
  };



  return z.object(schemaObj);
};

export function QueryExecutionForm({
  queryType,
  onSuccess,
  className,
}: QueryExecutionFormProps) {
  const { balance, formattedBalance } = useBalance();
  const { executeQuery, isLoading, error: executionError } = useQueryExecution();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const schema = createSchema(queryType);
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const inputValue = watch('input');

  // Determine input configuration based on categories
  const isPerson = queryType.category.includes(QueryCategory.PERSON);
  const isCompany = queryType.category.includes(QueryCategory.COMPANY);
  
  // Logic: 
  // If Person AND Company -> Both
  // If Person only -> CPF
  // If Company only -> CNPJ
  // Else (e.g. Credit only or other) -> Default to Both if Credit, or generic text
  const isBoth = isPerson && isCompany;
  const isCredit = queryType.category.includes(QueryCategory.CREDIT); // Usually implies document

  let label = 'Informação para consulta';
  let placeholder = 'Digite a informação';
  let inputMode: 'text' | 'cpf' | 'cnpj' | 'both' = 'text';

  if (isBoth) {
    label = 'CPF ou CNPJ';
    placeholder = 'Digite o CPF ou CNPJ';
    inputMode = 'both';
  } else if (isPerson) {
    label = 'CPF';
    placeholder = '000.000.000-00';
    inputMode = 'cpf';
  } else if (isCompany) {
    label = 'CNPJ';
    placeholder = '00.000.000/0000-00';
    inputMode = 'cnpj';
  } else if (isCredit) {
    // Fallback for generic credit query without specific person/company tag
    label = 'CPF ou CNPJ';
    placeholder = 'Digite o CPF ou CNPJ';
    inputMode = 'both';
  }

  // Masking logic
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (inputMode === 'cpf' || inputMode === 'cnpj' || inputMode === 'both') {
      // Remove non-digits
      const rawValue = value.replace(/\D/g, '');
      
      if (inputMode === 'cpf') {
        value = rawValue
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})/, '$1-$2')
          .replace(/(-\d{2})\d+?$/, '$1');
      } else if (inputMode === 'cnpj') {
        value = rawValue
          .replace(/^(\d{2})(\d)/, '$1.$2')
          .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
          .replace(/\.(\d{3})(\d)/, '.$1/$2')
          .replace(/(\d{4})(\d)/, '$1-$2')
          .replace(/(-\d{2})\d+?$/, '$1');
      } else {
        // Both: Switch based on length
        if (rawValue.length <= 11) {
           value = rawValue
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
        } else {
           value = rawValue
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
        }
      }
    }
    
    setValue('input', value);
    if (validationError) setValidationError(null);
  };

  const validateInput = (input: string): { isValid: boolean; error?: string } => {
    if (inputMode !== 'text') {
      const cleaned = ValidationService.cleanDocument(input);
      const docType = ValidationService.getDocumentType(cleaned);

      if (docType === 'invalid') {
        return { isValid: false, error: 'Documento inválido' };
      }
      
      // Enforce type match if specific
      if (inputMode === 'cpf' && docType !== 'cpf') {
         return { isValid: false, error: 'Por favor, insira um CPF válido' };
      }
      if (inputMode === 'cnpj' && docType !== 'cnpj') {
         return { isValid: false, error: 'Por favor, insira um CNPJ válido' };
      }

      const result = ValidationService.validateDocument(cleaned, docType);
      return result;
    }

    if (!input || input.trim() === '') {
      return { isValid: false, error: 'Campo obrigatório' };
    }

    return { isValid: true };
  };

  const onSubmit = async (data: FormData) => {
    const validation = validateInput(data.input);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Entrada inválida');
      return;
    }

    setValidationError(null);

    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    const cleanedInput = inputMode !== 'text' 
      ? ValidationService.cleanDocument(data.input) 
      : data.input;

    const result = await executeQuery(queryType.code, cleanedInput);

    if (result) {
      onSuccess?.(result);
      setShowConfirmation(false);
    } else {
      // If error, exit confirmation text so user can edit
      setShowConfirmation(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const currentPrice = queryType.cachedPrice < queryType.price ? queryType.cachedPrice : queryType.price;
  const hasSufficientBalance = balance >= currentPrice;

  // React Hook Form requires manual registration for controlled input with custom onChange
  const { ref, ...restRegister } = register('input');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      {/* Input field */}
      <div className="space-y-2">
        <Label htmlFor="input" className="text-sm font-medium text-gray-700">
          {label}
        </Label>
        <Input
          id="input"
          {...restRegister}
          ref={ref}
          onChange={(e) => {
            handleInputChange(e);
            restRegister.onChange(e); // Propagate to hook form
          }}
          placeholder={placeholder}
          maxLength={inputMode === 'cpf' ? 14 : inputMode === 'cnpj' ? 18 : 18}
          className="h-12 text-lg font-medium tracking-wide"
          disabled={isLoading || showConfirmation}
          autoComplete="off"
        />
        {errors.input?.message && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.input.message as string}
          </p>
        )}
        {validationError && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validationError}
          </p>
        )}
      </div>



      {/* Price info */}
      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Valor da consulta:</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">
              R$ {currentPrice.toFixed(2)}
            </span>
            {queryType.cachedPrice < queryType.price && (
              <p className="text-xs text-green-600 font-medium">
                Cache ativo - Economize R${' '}
                {(queryType.price - queryType.cachedPrice).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Balance warning */}
      {!hasSufficientBalance && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Saldo insuficiente. Seu saldo atual: R$ {formattedBalance}
          </p>
        </div>
      )}

      {/* Execution Error Alert */}
      {executionError && (
        <div className="p-4 rounded-lg bg-orange-50 border border-orange-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex gap-3">
             <div className="p-2 bg-orange-100 rounded-full h-fit">
               <AlertCircle className="h-5 w-5 text-orange-600" />
             </div>
             <div>
               <h4 className="font-semibold text-orange-900 mb-1">
                 {(() => {
                   const err = executionError.toUpperCase();
                   if (err.includes('NAO ENCONTRADA') || err.includes('NOT FOUND')) return 'Dados não localizados';
                   if (err.includes('TIMEOUT') || err.includes('TIME OUT')) return 'Instabilidade momentânea';
                   return 'Não foi possível concluir';
                 })()}
               </h4>
               <p className="text-sm text-orange-800/90 leading-relaxed">
                 {(() => {
                   const err = executionError.toUpperCase();
                   if (err.includes('NAO ENCONTRADA') || err.includes('NOT FOUND')) {
                     return 'Não encontramos registros para os dados informados. O valor da consulta não foi debitado.';
                   }
                   if (err.includes('TIMEOUT') || err.includes('TIME OUT')) {
                     return 'O provedor está respondendo mais lentamente que o normal. Por favor, tente novamente em alguns instantes.';
                   }
                   return 'Houve um problema técnico ao processar sua consulta. O valor não foi debitado do seu saldo. Tente novamente.';
                 })()}
               </p>
             </div>
          </div>
        </div>
      )}

      {/* Confirmation message */}
      {showConfirmation && !executionError && (
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <p className="text-sm text-yellow-800 font-medium">
            Confirma a execução desta consulta? O valor de R$ {currentPrice.toFixed(2)} será
            debitado do seu saldo.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {showConfirmation ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !hasSufficientBalance}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Consultando...
                </>
              ) : (
                'Confirmar e Consultar'
              )}
            </Button>
          </>
        ) : (
          <Button
            type="submit"
            disabled={isLoading || !inputValue || !hasSufficientBalance}
            className="w-full h-12"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Consultando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Consultar
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
