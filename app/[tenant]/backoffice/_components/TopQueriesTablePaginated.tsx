'use client';

import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCompact(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const PAGE_SIZE = 10;

const MEDAL_CONFIG = [
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-slate-100', text: 'text-slate-500' },
  { bg: 'bg-orange-100', text: 'text-orange-600' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QueryTypeRow {
  id: string;
  code: string;
  name: string;
  totalQueries: number;
  revenue: number;
  cost: number;
  profit: number;
}

type SortField = 'revenue' | 'volume' | 'margin' | 'name';
type SortDir = 'asc' | 'desc';

// ─── Sort button ──────────────────────────────────────────────────────────────

function SortBtn({
  field,
  current,
  dir,
  onToggle,
}: {
  field: SortField;
  current: SortField;
  dir: SortDir;
  onToggle: (f: SortField) => void;
}) {
  const active = current === field;
  return (
    <button
      onClick={() => onToggle(field)}
      className={`transition-colors ${active ? 'text-primary' : 'text-slate-300 hover:text-slate-500'}`}
    >
      {active ? (
        dir === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />
      ) : (
        <ChevronsUpDown className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  data: QueryTypeRow[];
}

export function TopQueriesTablePaginated({ data }: Props) {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (e) => e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q),
    );
  }, [data, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      const marginA = a.revenue > 0 ? a.profit / a.revenue : 0;
      const marginB = b.revenue > 0 ? b.profit / b.revenue : 0;
      if (sortField === 'revenue') cmp = a.revenue - b.revenue;
      else if (sortField === 'volume') cmp = a.totalQueries - b.totalQueries;
      else if (sortField === 'margin') cmp = marginA - marginB;
      else if (sortField === 'name') cmp = a.name.localeCompare(b.name, 'pt-BR');
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return copy;
  }, [filtered, sortField, sortDir]);

  const maxVolume = Math.max(...sorted.map((q) => q.totalQueries), 1);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDir('desc');
      setPage(1);
    }
  }

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  function pageNumbers(): number[] {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2)
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  }

  return (
    <Card className="shadow-glass border-none overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0 space-y-0.5">
            <CardTitle className="text-base font-bold">Todas as Consultas</CardTitle>
            <CardDescription className="text-xs">
              Performance por tipo de consulta
              {sorted.length > 0 && (
                <span className="text-slate-400 ml-1">— {sorted.length} produtos</span>
              )}
            </CardDescription>
          </div>

          <div className="relative shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar consulta..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="text-sm pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all w-full sm:w-52 placeholder:text-slate-400"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5 w-12">#</th>
                <th className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    Consulta
                    <SortBtn field="name" current={sortField} dir={sortDir} onToggle={toggleSort} />
                  </div>
                </th>
                <th className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    Volume
                    <SortBtn field="volume" current={sortField} dir={sortDir} onToggle={toggleSort} />
                  </div>
                </th>
                <th className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    Receita
                    <SortBtn field="revenue" current={sortField} dir={sortDir} onToggle={toggleSort} />
                  </div>
                </th>
                <th className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    Margem
                    <SortBtn field="margin" current={sortField} dir={sortDir} onToggle={toggleSort} />
                  </div>
                </th>
                <th className="px-5 py-3.5 text-right">Lucro</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((query, index) => {
                const globalIdx = (currentPage - 1) * PAGE_SIZE + index;
                const medal =
                  globalIdx < 3 && sortField === 'revenue' && sortDir === 'desc'
                    ? MEDAL_CONFIG[globalIdx]
                    : null;
                const displayRank = (currentPage - 1) * PAGE_SIZE + index + 1;
                const margin = query.revenue > 0 ? (query.profit / query.revenue) * 100 : 0;
                const volumePct = (query.totalQueries / maxVolume) * 100;

                return (
                  <tr
                    key={query.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4">
                      {medal ? (
                        <span
                          className={`w-7 h-7 rounded-lg ${medal.bg} ${medal.text} flex items-center justify-center text-xs font-black`}
                        >
                          {displayRank}°
                        </span>
                      ) : (
                        <span className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center text-xs font-semibold">
                          {displayRank}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800 text-sm leading-none mb-0.5">
                        {query.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{query.code}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-700">
                          {query.totalQueries.toLocaleString('pt-BR')}
                        </span>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary/50 rounded-full transition-all duration-700"
                            style={{ width: `${volumePct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-semibold text-slate-700">
                        {fmtCompact(query.revenue)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          margin >= 40
                            ? 'bg-emerald-50 text-emerald-700'
                            : margin >= 20
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {margin.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`font-bold text-sm ${
                          query.profit >= 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {fmtCompact(query.profit)}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-300 text-sm">
                    {search
                      ? 'Nenhuma consulta encontrada para essa busca.'
                      : 'Nenhuma consulta realizada neste período.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-400 font-medium">
              {sorted.length === 0
                ? '0 resultados'
                : `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                    currentPage * PAGE_SIZE,
                    sorted.length,
                  )} de ${sorted.length}`}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {pageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                    p === currentPage
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-500 hover:bg-white hover:text-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
