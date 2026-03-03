import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Settings } from 'lucide-react';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and notification preferences.</p>
      </div>
      <div className="bg-[#1a1a2e] border border-indigo-500/20 rounded-xl flex flex-col items-center justify-center py-20 text-center">
        <Settings className="w-10 h-10 text-indigo-400 mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Settings Coming Soon</h2>
        <p className="text-slate-400 text-sm max-w-sm">
          Account settings, email preferences, and API configuration will be available here.
        </p>
      </div>
    </div>
  );
}
