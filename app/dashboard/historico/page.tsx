'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Eye, Download, X, Zap, Filter } from 'lucide-react';
import Link from 'next/link';
import { useQueryExecution } from '@/hooks/useQueryExecution';
import { QueryResultDisplay } from '@/components/query';
import { Card, Button, Badge } from '@/components/candle';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold gradient-text">
          Histórico de Consultas
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass p-6 border border-white/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Consultas</p>
              <p className="text-2xl font-display font-bold text-gray-900">
                {filteredQueries.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass p-6 border border-white/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cache</p>
              <p className="text-2xl font-display font-bold text-gray-900">
                {cachedQueries}
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass p-6 border border-white/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Gasto</p>
              <p className="text-2xl font-display font-bold text-gray-900">
                R$ {totalSpent.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Queries Table */}
      <Card className="glass p-6 border border-white/40">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-semibold text-gray-900">
            Consultas Realizadas
          </h3>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as QueryCategory | 'all')}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas Categorias</option>
              <option value="CREDIT">Crédito</option>
              <option value="VEHICLE">Veículos</option>
              <option value="COMPANY">Empresarial</option>
              <option value="PERSON">Pessoa Física</option>
              <option value="PHONE">Telefone</option>
              <option value="ADDRESS">Endereço</option>
              <option value="OTHER">Outros</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 mt-4">Carregando histórico...</p>
          </div>
        ) : filteredQueries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Nenhuma consulta encontrada</p>
            <p className="text-sm mt-1">Suas consultas aparecerão aqui</p>
            <Link
              href="/"
              className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Fazer uma consulta
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Data
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Tipo
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Categoria
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Protocolo
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Custo
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredQueries.map((query) => {
                  const mainCategory = query.queryType.category.length > 0 ? query.queryType.category[0] : QueryCategory.OTHER;
                  const categoryConfig = getCategoryConfig(mainCategory);

                  return (
                    <tr
                      key={query.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(query.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-gray-900">
                          {query.queryType.name}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {categoryConfig.name}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-mono text-gray-600">
                        {query.id.substring(0, 8)}...
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={query.status === 'SUCCESS' ? 'success' : 'error'}
                            size="sm"
                          >
                            {query.status === 'SUCCESS' ? 'Concluída' : 'Erro'}
                          </Badge>
                          {query.isCached && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              Cache
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">
                        R$ {query.price.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewQuery(query)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Ver resultado"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* View Report Modal */}
      {isModalOpen && selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="glass-strong w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/40 rounded-2xl">
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm p-6 border-b border-gray-200 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-display font-bold gradient-text">
                  Resultado da Consulta
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedQuery.queryType.name} - Protocolo: {selectedQuery.id}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <QueryResultDisplay query={selectedQuery} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
