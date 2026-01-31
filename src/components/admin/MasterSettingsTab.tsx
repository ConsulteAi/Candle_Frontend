import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryTypesManager } from "./QueryTypesManager";
import { ProvidersManager } from "./ProvidersManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MasterSettingsTab() {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Configurações do Sistema</CardTitle>
        <CardDescription>Gerencie tipos de consulta e provedores externos.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Tabs defaultValue="query-types" className="w-full">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="query-types">Tipos de Consulta</TabsTrigger>
            <TabsTrigger value="providers">Provedores API</TabsTrigger>
          </TabsList>
          <TabsContent value="query-types" className="mt-6">
            <QueryTypesManager />
          </TabsContent>
          <TabsContent value="providers" className="mt-6">
            <ProvidersManager />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
