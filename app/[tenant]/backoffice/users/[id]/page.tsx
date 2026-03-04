import { AdminService } from '@/services/admin.service';
import { UserDetailsView } from '@/components/admin/UserDetailsView';
import { notFound } from 'next/navigation';

interface UserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailsPage({ params }: UserPageProps) {
  // Await params in Next.js 15+
  const { id } = await params;

  try {
    const user = await AdminService.getUserById(id);

    if (!user) {
      notFound();
    }

    return <UserDetailsView user={user} />;
  } catch (error) {
    if ((error as any)?.response?.status === 404) {
      notFound();
    }
    throw error;
  }
}
