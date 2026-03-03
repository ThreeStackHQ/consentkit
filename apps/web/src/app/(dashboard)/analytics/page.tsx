'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart3, Globe, Users, TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react';

interface DomainOption {
  id: string;
  domain: string;
}

interface ByCountry {
  country_code: string;
  count: number;
  opt_in_rate: number;
}

interface ByDay {
  date: string;
  opt_in: number;
  opt_out: number;
  partial: number;
}

interface RecentLog {
  visitor_id: string;
  country_code: string;
  action: string;
  ts: string;
}

interface Analytics {
  optInRate: number;
  optOutRate: number;
  partialRate: number;
  totalVisitors: number;
  byCountry: ByCountry[];
  byDay: ByDay[];
  recentLogs: RecentLog[];
}

const COUNTRY_NAMES: Record<string, string> = {
  US: '🇺🇸 United States', GB: '🇬🇧 United Kingdom', DE: '🇩🇪 Germany',
  FR: '🇫🇷 France', NL: '🇳🇱 Netherlands', SE: '🇸🇪 Sweden',
  CA: '🇨🇦 Canada', AU: '🇦🇺 Australia', IT: '🇮🇹 Italy',
  ES: '🇪🇸 Spain', PL: '🇵🇱 Poland', BE: '🇧🇪 Belgium',
  AT: '🇦🇹 Austria', CH: '🇨🇭 Switzerland', DK: '🇩🇰 Denmark',
  NO: '🇳🇴 Norway', FI: '🇫🇮 Finland', PT: '🇵🇹 Portugal',
};

function getCountryName(code: string) {
  return COUNTRY_NAMES[code] ?? `🌐 ${code}`;
}

function actionBadge(action: string) {
  const lower = action.toLowerCase();
  if (lower === 'accept' || lower === 'opt_in') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Accept</span>;
  }
  if (lower === 'reject' || lower === 'opt_out') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Reject</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Partial</span>;
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// SVG trend chart
function TrendChart({ data }: { data: ByDay[] }) {
  if (!data || data.length < 2) return (
    <div className="h-32 flex items-center justify-center text-slate-600 text-sm">No data</div>
  );

  const width = 400;
  const height = 100;
  const pad = 10;

  const values = data.map((d) => d.opt_in);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - minVal) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(' ');
  const areaPoints = `${pad},${height - pad} ${polyline} ${width - pad},${height - pad}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#chartGrad)" />
      <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => {
        const [x, y] = points[i].split(',').map(Number);
        return <circle key={i} cx={x} cy={y} r="3" fill="#6366f1" />;
      })}
    </svg>
  );
}

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const initialDomain = searchParams.get('domain') ?? '';

  const [domains, setDomains] = useState<DomainOption[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>(initialDomain);
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [domainDropdown, setDomainDropdown] = useState(false);

  useEffect(() => {
    fetch('/api/domains')
      .then((r) => r.json())
      .then((data: DomainOption[]) => {
        setDomains(data);
        if (!selectedDomain && data.length > 0) {
          setSelectedDomain(data[0].id);
        }
      })
      .catch(() => {});
  }, [selectedDomain]);

  const fetchAnalytics = useCallback(async () => {
    if (!selectedDomain) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/${selectedDomain}?range=${range}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [selectedDomain, range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const selectedDomainName = domains.find((d) => d.id === selectedDomain)?.domain ?? 'Select domain';

  const categoryBars = [
    { label: 'Necessary', pct: 100, color: 'bg-indigo-500' },
    { label: 'Analytics', pct: analytics ? Math.round(analytics.optInRate * 0.85) : 0, color: 'bg-blue-500' },
    { label: 'Marketing', pct: analytics ? Math.round(analytics.optInRate * 0.60) : 0, color: 'bg-purple-500' },
    { label: 'Preferences', pct: analytics ? Math.round(analytics.optInRate * 0.75) : 0, color: 'bg-pink-500' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">Consent rates and visitor breakdown.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Domain selector */}
          <div className="relative">
            <button
              onClick={() => setDomainDropdown((v) => !v)}
              className="flex items-center gap-2 bg-[#1a1a2e] border border-indigo-500/20 hover:border-indigo-500/50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors min-w-40"
            >
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="truncate">{selectedDomainName}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-auto" />
            </button>
            {domainDropdown && (
              <div className="absolute top-full mt-1 left-0 z-20 bg-[#1a1a2e] border border-indigo-500/20 rounded-lg shadow-xl min-w-[160px]">
                {domains.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setSelectedDomain(d.id); setDomainDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      d.id === selectedDomain ? 'text-indigo-400' : 'text-slate-300'
                    }`}
                  >
                    {d.domain}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Range tabs */}
          <div className="flex bg-[#1a1a2e] border border-indigo-500/20 rounded-lg p-0.5">
            {(['7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  range === r ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-[#1a1a2e] border border-indigo-500/20 rounded-xl p-5 animate-pulse">
              <div className="h-3 bg-slate-700/50 rounded w-2/3 mb-3" />
              <div className="h-8 bg-slate-700/50 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && analytics && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Opt-in Rate', value: `${analytics.optInRate?.toFixed(1)}%`, icon: TrendingUp, color: 'text-green-400' },
              { label: 'Opt-out Rate', value: `${analytics.optOutRate?.toFixed(1)}%`, icon: TrendingDown, color: 'text-red-400' },
              { label: 'Total Visitors', value: (analytics.totalVisitors ?? 0).toLocaleString(), icon: Users, color: 'text-indigo-400' },
              { label: 'Partial Consent', value: `${analytics.partialRate?.toFixed(1)}%`, icon: Minus, color: 'text-yellow-400' },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-[#1a1a2e] border border-indigo-500/20 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                  <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              );
            })}
          </div>

          {/* Trend chart */}
          <div className="bg-[#1a1a2e] border border-indigo-500/20 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Opt-in Rate Trend</h2>
            <TrendChart data={analytics.byDay ?? []} />
            {analytics.byDay && analytics.byDay.length > 1 && (
              <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
                <span>{analytics.byDay[0]?.date}</span>
                <span>{analytics.byDay[analytics.byDay.length - 1]?.date}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Country breakdown */}
            <div className="bg-[#1a1a2e] border border-indigo-500/20 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">By Country</h2>
              {analytics.byCountry && analytics.byCountry.length > 0 ? (
                <div className="space-y-3">
                  {analytics.byCountry.slice(0, 8).map((c) => (
                    <div key={c.country_code} className="flex items-center gap-3">
                      <span className="text-sm text-slate-300 w-40 truncate flex-shrink-0">{getCountryName(c.country_code)}</span>
                      <div className="flex-1 bg-[#0f0f1a] rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, c.opt_in_rate)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-12 text-right flex-shrink-0">{c.opt_in_rate?.toFixed(0)}%</span>
                      <span className="text-xs text-slate-600 w-14 text-right flex-shrink-0">{c.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No country data yet.</p>
              )}
            </div>

            {/* Category breakdown */}
            <div className="bg-[#1a1a2e] border border-indigo-500/20 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">By Category</h2>
              <div className="space-y-4">
                {categoryBars.map((cat) => (
                  <div key={cat.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-slate-300">{cat.label}</span>
                      <span className="text-sm text-slate-400">{cat.pct}%</span>
                    </div>
                    <div className="w-full bg-[#0f0f1a] rounded-full h-2.5">
                      <div
                        className={`${cat.color} h-2.5 rounded-full transition-all`}
                        style={{ width: `${cat.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent consent logs */}
          <div className="bg-[#1a1a2e] border border-indigo-500/20 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Recent Consent Events</h2>
            {analytics.recentLogs && analytics.recentLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-indigo-500/10">
                      <th className="text-left py-2 pr-4">Visitor</th>
                      <th className="text-left py-2 pr-4">Country</th>
                      <th className="text-left py-2 pr-4">Action</th>
                      <th className="text-right py-2">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-500/10">
                    {analytics.recentLogs.slice(0, 10).map((log, i) => (
                      <tr key={i} className="hover:bg-white/2 transition-colors">
                        <td className="py-2.5 pr-4">
                          <span className="font-mono text-slate-300">{log.visitor_id?.slice(0, 8)}…</span>
                        </td>
                        <td className="py-2.5 pr-4 text-slate-400">{getCountryName(log.country_code)}</td>
                        <td className="py-2.5 pr-4">{actionBadge(log.action)}</td>
                        <td className="py-2.5 text-right text-slate-500">{timeAgo(log.ts)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No consent events yet for this domain.</p>
            )}
          </div>
        </>
      )}

      {!loading && !analytics && !selectedDomain && (
        <div className="bg-[#1a1a2e] border border-indigo-500/20 rounded-xl flex flex-col items-center justify-center py-20 text-center">
          <BarChart3 className="w-10 h-10 text-indigo-400 mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">Select a Domain</h2>
          <p className="text-slate-400 text-sm">Choose a domain from the dropdown above to view consent analytics.</p>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading analytics…</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
