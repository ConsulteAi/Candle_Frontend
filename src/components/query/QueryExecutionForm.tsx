'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import type { QueryType, ExecuteQueryResponse } from '@/types/query';
import { ValidationService } from '@/lib/consultas/services/ValidationService';
import { useQueryExecution } from '@/hooks/useQueryExecution';
import { useBalance } from '@/hooks/useBalance';
import { QueryCategory } from '@/types/query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface QueryExecutionFormProps {
  queryType: QueryType;
  onSuccess?: (result: ExecuteQueryResponse) => void;
  className?: string;
}

// Dynamic schema based on query type
const createSchema = (queryType: QueryType) => {
  // For now, assume input is document (CPF/CNPJ) or generic string
  // In the future, this could be more sophisticated based on queryType.inputType
  return z.object({
    input: z.string().min(1, 'Campo obrigatório'),
  });
};

export function QueryExecutionForm({
  queryType,
  onSuccess,
  className,
}: QueryExecutionFormProps) {
  const { balance, formattedBalance } = useBalance();
  const { executeQuery, isLoading } = useQueryExecution();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const schema = createSchema(queryType);
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const inputValue = watch('input');

  // Validate input based on category
  const validateInput = (input: string): { isValid: boolean; error?: string } => {
    // For CREDIT category, validate CPF/CNPJ
    if (queryType.category.includes(QueryCategory.CREDIT)) {
      const cleaned = ValidationService.cleanDocument(input);
      const docType = ValidationService.getDocumentType(cleaned);

      if (docType === 'invalid') {
        return { isValid: false, error: 'CPF ou CNPJ inválido' };
      }

      const result = ValidationService.validateDocument(cleaned, docType);
      return result;
    }

    // For other categories, just check if not empty
    if (!input || input.trim() === '') {
      return { isValid: false, error: 'Campo obrigatório' };
    }

    return { isValid: true };
  };

  const onSubmit = async (data: FormData) => {
    // Validate input
    const validation = validateInput(data.input);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Entrada inválida');
      return;
    }

    setValidationError(null);

    // Show confirmation if not shown yet
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    // Execute query
    const result = await executeQuery(queryType.code, data.input);

    if (result) {
      onSuccess?.(result);
      setShowConfirmation(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const currentPrice = queryType.cachedPrice < queryType.price ? queryType.cachedPrice : queryType.price;
  const hasSufficientBalance = balance >= currentPrice;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      {/* Input field */}
      <div className="space-y-2">
        <Label htmlFor="input" className="text-sm font-medium text-gray-700">
          {queryType.category.includes(QueryCategory.CREDIT) ? 'CPF ou CNPJ' : 'Documento/Informação'}
        </Label>
        <Input
          id="input"
          {...register('input')}
          placeholder={
            queryType.category.includes(QueryCategory.CREDIT)
              ? 'Digite o CPF ou CNPJ'
              : 'Digite a informação para consulta'
          }
          className="h-12"
          disabled={isLoading || showConfirmation}
        />
        {errors.input && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.input.message}
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
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Valor da consulta:</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-600">
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

      {/* Confirmation message */}
      {showConfirmation && (
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
