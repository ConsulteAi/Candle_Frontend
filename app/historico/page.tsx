'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Eye, Download, X, Zap, Filter } from 'lucide-react';
import Link from 'next/link';
import { useQueryExecution } from '@/hooks/useQueryExecution';
import { QueryResultDisplay } from '@/components/query';
import { Card, Button, Badge } from '@/components/candle';
import { Header, Footer } from '@/components/layout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/glass-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QueryCategory, type QueryHistoryEntry } from '@/types/query';
import { getCategoryConfig } from '@/constants/query-categories';

export default function HistoricoPage() {
  const { getHistory, isLoading } = useQueryExecution();
  const [queries, setQueries] = useState<QueryHistoryEntry[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<QueryHistoryEntry[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<QueryHistoryEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<QueryCategory | 'all'>('all');

  // Load query history
  const loadQueries = async () => {
    const result = await getHistory(1, 50);
    if (result) {
      setQueries(result.data);
      setFilteredQueries(result.data);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  // Apply category filter
  useEffect(() => {
    if (categoryFilter === 'all') {
      setFilteredQueries(queries);
    } else {
      setFilteredQueries(
        queries.filter((q) => q.queryType.category.includes(categoryFilter as QueryCategory))
      );
    }
  }, [categoryFilter, queries]);

  const handleViewQuery = (query: QueryHistoryEntry) => {
    setSelectedQuery(query);
    setIsModalOpen(true);
  };

  const totalSpent = filteredQueries.reduce((sum, q) => sum + q.price, 0);
  const cachedQueries = filteredQueries.filter((q) => q.isCached).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8 pb-20">
          {/* Header Section with Atmosphere */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full mix-blend-multiply pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 mb-2">
                  Histórico de Consultas
                </h1>
                <p className="text-gray-500 font-medium text-lg">
                  Gerencie e monitore todas as suas atividades em tempo real.
                </p>
              </div>
            </div>
          </div>

          {/* Glass Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden border-0 bg-white/40 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                    <Search className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100/50 px-3 py-1 rounded-full border border-blue-200/50">
                    Total
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Consultas</p>
                  <p className="text-4xl font-display font-black text-gray-900 tracking-tight">
                    {filteredQueries.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-white/40 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-500">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-100/50 px-3 py-1 rounded-full border border-purple-200/50">
                    Investimento
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Total Gasto</p>
                  <p className="text-4xl font-display font-black text-gray-900 tracking-tight">
                    R$ {totalSpent.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="relative">
             {/* Table Glass Container */}
            <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden p-1">
              
              {/* Table Header Controls */}
              <div className="p-6 border-b border-gray-200/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-gray-800">
                    Transações Recentes
                  </h3>
                </div>

                {/* Premium Filter */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Filtrar por:</span>
                  <div className="w-[200px]">
                    <Select
                      value={categoryFilter}
                      onValueChange={(value) => setCategoryFilter(value as QueryCategory | 'all')}
                    >
                      <SelectTrigger className="h-10 bg-white/50 border-white/50 focus:bg-white transition-colors shadow-sm text-gray-700 font-medium rounded-xl">
                        <SelectValue placeholder="Todas Categorias" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/90 backdrop-blur-xl border-gray-200/50 shadow-2xl rounded-xl">
                        <SelectItem value="all" className="font-medium">Todas Categorias</SelectItem>
                        <SelectItem value="CREDIT">Crédito</SelectItem>
                        <SelectItem value="VEHICLE">Veículos</SelectItem>
                        <SelectItem value="COMPANY">Empresarial</SelectItem>
                        <SelectItem value="PERSON">Pessoa Física</SelectItem>
                        <SelectItem value="PHONE">Telefone</SelectItem>
                        <SelectItem value="ADDRESS">Endereço</SelectItem>
                        <SelectItem value="OTHER">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                  </div>
                  <p className="text-gray-500 font-medium animate-pulse">Carregando dados...</p>
                </div>
              ) : filteredQueries.length === 0 ? (
                <div className="text-center py-20 px-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Search className="h-8 w-8 text-gray-300" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Nenhum registro encontrado</h4>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Não encontramos nenhuma consulta correspondente aos seus filtros atuais.
                  </p>
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 rounded-xl px-8 py-6 font-bold h-auto">
                      Nova Consulta
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden bg-white/20">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-200/30 hover:bg-transparent bg-gray-50/30">
                        <TableHead className="w-[160px] pl-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Data</TableHead>
                        <TableHead className="font-bold text-gray-400 uppercase text-xs tracking-wider">Tipo</TableHead>
                        <TableHead className="font-bold text-gray-400 uppercase text-xs tracking-wider">Categoria</TableHead>
                        <TableHead className="font-bold text-gray-400 uppercase text-xs tracking-wider">Protocolo</TableHead>
                        <TableHead className="font-bold text-gray-400 uppercase text-xs tracking-wider">Status</TableHead>
                        <TableHead className="text-right font-bold text-gray-400 uppercase text-xs tracking-wider">Custo</TableHead>
                  <TableHead className="text-center font-bold text-gray-400 uppercase text-xs tracking-wider">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueries.map((query) => {
                    const mainCategory = query.queryType.category.length > 0 ? query.queryType.category[0] : QueryCategory.OTHER;
                    const categoryConfig = getCategoryConfig(mainCategory);

                    return (
                      <TableRow key={query.id} className="border-b border-gray-100/50 hover:bg-white/40 transition-colors group">
                        <TableCell className="pl-6 font-semibold text-gray-600">
                          {new Date(query.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                          <span className="block text-xs font-normal text-gray-400">
                             {new Date(query.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-gray-800">
                            {query.queryType.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {categoryConfig.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                            {query.id.substring(0, 8)}...
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             <div className={`
                                flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm
                                ${query.status === 'SUCCESS' 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : 'bg-red-50 text-red-700 border-red-200'}
                             `}>
                                <div className={`w-1.5 h-1.5 rounded-full ${query.status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`} />
                                {query.status === 'SUCCESS' ? 'Concluída' : 'Erro'}
                             </div>
                            
                            {query.isCached && (
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-600" title="Cache">
                                <Zap className="w-3 h-3 fill-yellow-500" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-display font-bold text-gray-900">
                          R$ {query.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                               <div className="flex items-center justify-center">
                                 <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewQuery(query)}
                                  className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 hover:border-blue-300 shadow-sm transition-all active:scale-95"
                                  title="Ver Detalhes"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          {/* View Report Modal - Premium Glass Style */}
          {isModalOpen && selectedQuery && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md overflow-hidden animate-fade-in">
              <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col glass-strong rounded-3xl shadow-2xl animate-scale-in border border-white/50">
                
                {/* Modal Header */}
                <div className="flex-none p-6 border-b border-gray-200/50 bg-white/50 backdrop-blur-md flex items-center justify-between rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-gray-900">
                        Detalhes da Consulta
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-gray-500">Protocolo:</span>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700">{selectedQuery.id}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 bg-white/40">
                  <QueryResultDisplay query={selectedQuery} />
                </div>

                {/* Modal Footer */}
                <div className="flex-none p-6 border-t border-gray-200/50 bg-white/50 backdrop-blur-md flex justify-end gap-3 rounded-b-3xl">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Fechar
                  </Button>
                  <Button 
                    className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
