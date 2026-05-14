import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@/types/auth';
import { redirect } from 'next/navigation';


export const dynamic = 'force-dynamic';

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== UserRole.ADMIN && user.role !== UserRole.MASTER) {
    redirect('/');
  }

  return (
    <AdminGuard>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-display">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto relative">
           {/* Top bar background pattern if needed */}
           <div className="absolute top-0 left-0 w-full h-64 bg-slate-900 -z-10" />
           
           <div className="p-8 max-w-7xl mx-auto">
             {children}
           </div>
        </main>
      </div>
    </AdminGuard>
  );
}
