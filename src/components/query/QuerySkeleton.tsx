import { Skeleton } from '@/components/ui/skeleton';

export function QuerySkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-3xl p-8 border border-gray-100 bg-white shadow-sm space-y-6">
          <div className="flex justify-between items-start">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <Skeleton className="w-20 h-6 rounded-full" />
          </div>
          
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4 bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-100" />
            <Skeleton className="h-4 w-2/3 bg-gray-100" />
          </div>

          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
             <Skeleton className="h-8 w-24" />
             <Skeleton className="h-12 w-32 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
