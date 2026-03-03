'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Shield,
  Globe,
  List,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/domains', label: 'Domains', icon: Globe },
  { href: '/consent-logs', label: 'Consent Logs', icon: List },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/billing', label: 'Billing', icon: CreditCard },
];

interface Props {
  email: string;
  pageTitle: string;
}

export function DashboardSidebar({ email, pageTitle }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-indigo-500/10">
        <Shield className="w-6 h-6 text-indigo-400 flex-shrink-0" />
        <span className="text-white font-semibold text-lg tracking-tight">ConsentKit</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user section */}
      <div className="px-3 py-4 border-t border-indigo-500/10">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-slate-500 truncate">{email}</p>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 bg-[#1a1a2e] border-r border-indigo-500/10 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile header bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#1a1a2e] border-b border-indigo-500/10 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          <span className="text-white font-semibold">ConsentKit</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-slate-400 hover:text-white p-1"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile slide-over */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div className="relative z-10 flex flex-col w-64 bg-[#1a1a2e] border-r border-indigo-500/10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-indigo-500/10">
              <div className="flex items-center gap-2.5">
                <Shield className="w-6 h-6 text-indigo-400" />
                <span className="text-white font-semibold text-lg">ConsentKit</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
