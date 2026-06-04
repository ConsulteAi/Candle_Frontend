import { Card, CardContent, CardHeader } from '@/components/ui/card';

function StatCardSkeleton() {
  return (
    <Card className="border-none shadow-glass h-full">
      <CardContent className="p-6">
        <div className="h-10 w-10 bg-slate-100 rounded-xl animate-pulse mb-4" />
        <div className="h-3 w-24 bg-slate-100 rounded animate-pulse mb-2" />
        <div className="h-8 w-32 bg-slate-100 rounded animate-pulse mb-3" />
        <div className="h-3 w-40 bg-slate-100 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Chart skeleton */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="h-5 w-40 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-56 bg-slate-100 rounded animate-pulse mt-1" />
            </CardHeader>
            <CardContent>
              <div className="h-[350px] bg-slate-50 rounded-xl animate-pulse" />
            </CardContent>
          </Card>

          {/* Table skeleton */}
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader>
              <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="p-0">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-50">
                  <div className="h-8 w-8 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-40 bg-slate-100 rounded animate-pulse mb-1" />
                    <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
          {/* Providers skeleton */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="h-5 w-40 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-56 bg-slate-100 rounded animate-pulse mt-1" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </CardContent>
          </Card>

          {/* Operational summary skeleton */}
          <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
