import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/DashboardSidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const email = session.user.email ?? '';
  const initials = email ? email[0].toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex">
      <DashboardSidebar email={email} pageTitle="" />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-indigo-500/10 bg-[#0f0f1a] sticky top-0 z-10">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
