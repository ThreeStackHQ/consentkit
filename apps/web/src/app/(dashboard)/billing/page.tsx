import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { CreditCard } from 'lucide-react';

export const metadata = { title: 'Billing' };

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-slate-400 mt-1">Manage your subscription and payment methods.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { name: 'Free', price: '$0/mo', domains: '1 domain', visitors: '10k visitors/mo', current: true },
          { name: 'Starter', price: '$9/mo', domains: '5 domains', visitors: '100k visitors/mo', current: false },
          { name: 'Pro', price: '$29/mo', domains: 'Unlimited', visitors: '1M visitors/mo', current: false },
        ].map((plan) => (
          <div
            key={plan.name}
            className={`bg-[#1a1a2e] border rounded-xl p-6 ${plan.current ? 'border-indigo-500' : 'border-indigo-500/20'}`}
          >
            {plan.current && (
              <span className="inline-block bg-indigo-600 text-white text-xs font-medium px-2 py-0.5 rounded mb-3">
                Current Plan
              </span>
            )}
            <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{plan.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>✓ {plan.domains}</li>
              <li>✓ {plan.visitors}</li>
              <li>✓ GDPR/CCPA compliant</li>
              <li>✓ Geo-based display</li>
            </ul>
            {!plan.current && (
              <button className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors">
                Upgrade to {plan.name}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-[#1a1a2e] border border-indigo-500/20 rounded-xl p-6 flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium">Payment Method</h3>
          <p className="text-slate-400 text-sm mt-0.5">Manage your payment details via Stripe portal</p>
        </div>
        <form action="/api/stripe/portal" method="POST">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#0f0f1a] border border-indigo-500/20 hover:border-indigo-500/50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Manage Billing
          </button>
        </form>
      </div>
    </div>
  );
}
