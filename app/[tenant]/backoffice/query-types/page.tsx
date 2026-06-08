import { QueryTypesManager } from '@/components/admin/QueryTypesManager';

export default async function QueryTypesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Tipos de Consulta</h1>
        <p className="text-slate-500 text-lg">Gerencie os tipos de consultas disponíveis no sistema.</p>
      </div>
      <QueryTypesManager />
    </div>
  );
}
