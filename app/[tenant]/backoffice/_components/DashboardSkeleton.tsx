import { Card, CardContent, CardHeader } from '@/components/ui/card';

function KpiCardSkeleton() {
  return (
    <Card className="border-none shadow-glass h-full">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="h-9 w-9 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-6 w-14 bg-slate-100 rounded-full animate-pulse" />
        </div>
        <div className="h-3 w-24 bg-slate-100 rounded animate-pulse mb-2" />
        <div className="h-8 w-28 bg-slate-100 rounded animate-pulse mb-3" />
        <div className="h-3 w-36 bg-slate-100 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

function SectionTitleSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-3 w-36 bg-slate-100 rounded animate-pulse" />
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <SectionTitleSkeleton />

      {/* 6 KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <SectionTitleSkeleton />

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <Card className="border-none shadow-glass">
            <CardHeader>
              <div className="h-5 w-40 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-52 bg-slate-100 rounded animate-pulse mt-1" />
            </CardHeader>
            <CardContent>
              <div className="h-[350px] bg-slate-50 rounded-xl animate-pulse" />
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                <div className="h-2.5 bg-slate-100 rounded-full animate-pulse" />
                <div className="flex gap-4">
                  <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>

          <SectionTitleSkeleton />

          {/* Table */}
          <Card className="border-none shadow-glass overflow-hidden">
            <CardHeader className="border-b border-slate-50">
              <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-44 bg-slate-100 rounded animate-pulse mt-1" />
            </CardHeader>
            <CardContent className="p-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-50">
                  <div className="h-7 w-7 bg-slate-100 rounded-lg animate-pulse shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-36 bg-slate-100 rounded animate-pulse mb-1.5" />
                    <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                  <div className="h-5 w-12 bg-slate-100 rounded-full animate-pulse" />
                  <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <SectionTitleSkeleton />

          {/* Providers */}
          <Card className="border-none shadow-glass">
            <CardHeader>
              <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-48 bg-slate-100 rounded animate-pulse mt-1.5" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </CardContent>
          </Card>

          <SectionTitleSkeleton />

          {/* Operational summary */}
          <div className="h-72 bg-primary/8 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
