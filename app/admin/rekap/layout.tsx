import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { checkAdminSession } from '@/app/actions/auth';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminRekapLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = await checkAdminSession();

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="container mx-auto px-4 py-6 pb-24 md:py-8 md:pb-8">
        {children}
      </main>
    </div>
  );
}
