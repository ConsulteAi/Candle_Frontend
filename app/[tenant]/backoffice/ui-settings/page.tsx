'use client';

import { UiSettingsManager } from '@/components/admin/UiSettingsManager';

export default function UiSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight mb-2">
          Identidade Visual
        </h1>
        <p className="text-slate-500 text-lg">
          Gerencie as cores, logotipos e configurações visuais do seu ambiente.
        </p>
      </div>
      <UiSettingsManager />
    </div>
  );
}
