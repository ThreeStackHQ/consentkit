import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { List } from 'lucide-react';

export const metadata = { title: 'Consent Logs' };

export default async function ConsentLogsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Consent Logs</h1>
        <p className="text-slate-400 mt-1">View all visitor consent events across your domains.</p>
      </div>
      <div className="bg-[#1a1a2e] border border-indigo-500/20 rounded-xl flex flex-col items-center justify-center py-20 text-center">
        <List className="w-10 h-10 text-indigo-400 mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Consent Logs Coming Soon</h2>
        <p className="text-slate-400 text-sm max-w-sm">
          Detailed per-visitor consent audit logs will be available here. For now, view analytics on the Analytics page.
        </p>
      </div>
    </div>
  );
}
