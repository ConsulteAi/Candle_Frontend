'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Loader2, Megaphone, MessageSquareText, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { updateRechargeSuspendedNoticeAction } from '@/actions/global-config.actions';
import { DEFAULT_RECHARGE_SUSPENDED_NOTICE } from '@/lib/global-config/recharge-suspended-notice';
import type { RechargeSuspendedNoticeConfig } from '@/types/admin';

const stepSchema = z.object({
  title: z.string().trim().min(1, 'Obrigatório').max(120, 'Máximo de 120 caracteres'),
  detail: z.string().trim().min(1, 'Obrigatório').max(300, 'Máximo de 300 caracteres'),
});

const noticeSchema = z.object({
  title: z.string().trim().min(1, 'Obrigatório').max(160, 'Máximo de 160 caracteres'),
  subtitle: z.string().trim().min(1, 'Obrigatório').max(500, 'Máximo de 500 caracteres'),
  steps: z.tuple([stepSchema, stepSchema, stepSchema]),
});

type NoticeFormData = z.infer<typeof noticeSchema>;

interface RechargeSuspendedNoticeSettingsViewProps {
  initialConfig: RechargeSuspendedNoticeConfig | null;
}

function toFormDefaults(config: RechargeSuspendedNoticeConfig | null): NoticeFormData {
  const source = config ?? DEFAULT_RECHARGE_SUSPENDED_NOTICE;
  // O schema exige exatamente 3 passos — completa/trunca defensivamente caso
  // a config salva no banco tenha um número diferente.
  const steps = [0, 1, 2].map(
    (i) => source.steps[i] ?? DEFAULT_RECHARGE_SUSPENDED_NOTICE.steps[i],
  ) as [NoticeFormData['steps'][0], NoticeFormData['steps'][1], NoticeFormData['steps'][2]];

  return { title: source.title, subtitle: source.subtitle, steps };
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export function RechargeSuspendedNoticeSettingsView({
  initialConfig,
}: RechargeSuspendedNoticeSettingsViewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    defaultValues: toFormDefaults(initialConfig),
  });

  const onSubmit = async (data: NoticeFormData) => {
    setIsSaving(true);
    try {
      const result = await updateRechargeSuspendedNoticeAction(data);
      if (result.success) {
        toast.success('Aviso de recarga atualizado com sucesso!');
        reset(data);
      } else {
        toast.error(result.error || 'Erro ao salvar o aviso.');
      }
    } catch {
      toast.error('Erro ao salvar o aviso.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    setIsResetting(true);
    try {
      const result = await updateRechargeSuspendedNoticeAction(DEFAULT_RECHARGE_SUSPENDED_NOTICE);
      if (result.success) {
        toast.success('Texto original restaurado com sucesso!');
        reset(toFormDefaults(null));
      } else {
        toast.error(result.error || 'Erro ao restaurar o texto original.');
      }
    } catch {
      toast.error('Erro ao restaurar o texto original.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Aviso de Recarga</h1>
        <p className="text-slate-500">
          Texto exibido em /recarregar quando a recarga automática de um tenant está
          suspensa. Config global — vale para todos os tenants, sem precisar de deploy.
        </p>
      </motion.div>

      <motion.div variants={item} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
        <Megaphone className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-sm text-slate-500">
          Isso não liga nem desliga a recarga suspensa — esse gatilho continua por tenant
          (campo <code className="text-xs">rechargeDisabled</code>). Aqui você só edita o
          texto que aparece quando ela já está suspensa.
        </p>
      </motion.div>

      <motion.form variants={item} onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <MessageSquareText className="w-5 h-5 text-primary" />
              Conteúdo do banner
            </CardTitle>
            <CardDescription>Título, subtítulo e os 3 passos do fluxo manual.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-slate-700">
                Título
              </Label>
              <Input id="title" {...register('title')} className="border-slate-200" />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle" className="text-sm font-semibold text-slate-700">
                Subtítulo
              </Label>
              <Textarea
                id="subtitle"
                rows={3}
                {...register('subtitle')}
                className="border-slate-200"
              />
              {errors.subtitle && (
                <p className="text-xs text-red-500">{errors.subtitle.message}</p>
              )}
            </div>

            <div className="space-y-5">
              <Label className="text-sm font-semibold text-slate-700">Passos</Label>
              {([0, 1, 2] as const).map((index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2"
                >
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Passo {index + 1}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`steps.${index}.title`}
                      className="text-xs font-medium text-slate-600"
                    >
                      Título do passo
                    </Label>
                    <Input
                      id={`steps.${index}.title`}
                      {...register(`steps.${index}.title` as const)}
                      className="border-slate-200"
                    />
                    {errors.steps?.[index]?.title && (
                      <p className="text-xs text-red-500">{errors.steps[index]?.title?.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`steps.${index}.detail`}
                      className="text-xs font-medium text-slate-600"
                    >
                      Detalhe do passo
                    </Label>
                    <Input
                      id={`steps.${index}.detail`}
                      {...register(`steps.${index}.detail` as const)}
                      className="border-slate-200"
                    />
                    {errors.steps?.[index]?.detail && (
                      <p className="text-xs text-red-500">{errors.steps[index]?.detail?.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetToDefault}
                disabled={isSaving || isResetting}
                className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                {isResetting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                Restaurar texto original
              </Button>

              <Button
                type="submit"
                disabled={isSaving || isResetting || !isDirty}
                className="min-w-[160px] bg-primary hover:bg-primary/90 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando
                  </>
                ) : (
                  'Salvar alterações'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.form>
    </motion.div>
  );
}
