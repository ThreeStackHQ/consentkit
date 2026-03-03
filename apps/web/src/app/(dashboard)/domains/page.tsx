'use client';

import { useEffect, useState } from 'react';
import { Globe, Plus, Copy, BarChart3, Trash2, X, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface Domain {
  id: string;
  domain: string;
  api_key: string;
  plan: string;
  is_active: boolean;
  opt_in_rate: number;
  total_visitors: number;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addInput, setAddInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDomains = async () => {
    try {
      const res = await fetch('/api/domains');
      if (res.ok) {
        const data = await res.json();
        setDomains(data);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addInput.trim()) return;
    setAdding(true);
    setAddError('');
    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: addInput.trim() }),
      });
      if (res.ok) {
        setAddInput('');
        setShowAddModal(false);
        await fetchDomains();
      } else {
        const err = await res.json().catch(() => ({}));
        setAddError(err.error ?? 'Failed to add domain');
      }
    } catch {
      setAddError('Network error — please try again');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/domains/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteId(null);
        await fetchDomains();
      }
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const copySnippet = (domain: Domain) => {
    const snippet = `<script src="https://cdn.consentkit.io/v1/banner.js" data-key="${domain.api_key}"></script>`;
    navigator.clipboard.writeText(snippet);
    setCopiedId(domain.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const SkeletonCard = () => (
    <div className="bg-[#1a1a2e] border border-indigo-500/20 rounded-xl p-6 animate-pulse">
      <div className="h-5 bg-slate-700/50 rounded w-1/2 mb-4" />
      <div className="h-10 bg-slate-700/50 rounded w-1/4 mb-4" />
      <div className="h-4 bg-slate-700/50 rounded w-1/3 mb-6" />
      <div className="flex gap-2">
        <div className="h-9 bg-slate-700/50 rounded flex-1" />
        <div className="h-9 bg-slate-700/50 rounded flex-1" />
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Domains</h1>
          <p className="text-slate-400 mt-1">Manage your cookie consent integrations.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Domain
        </button>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && domains.length === 0 && (
        <div className="bg-[#1a1a2e] border border-indigo-500/20 rounded-xl p-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-indigo-600/10 flex items-center justify-center">
              <Globe className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">No domains yet</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            Add your first domain to get a unique snippet that you can paste into your site.
          </p>
          <div className="bg-[#0f0f1a] rounded-lg p-4 text-left text-sm mb-6 max-w-lg mx-auto">
            <p className="text-slate-400 mb-2">Quick setup guide:</p>
            <ol className="space-y-1.5 text-slate-300">
              <li><span className="text-indigo-400 font-medium">1.</span> Click &quot;Add Domain&quot; above</li>
              <li><span className="text-indigo-400 font-medium">2.</span> Enter your domain (e.g. myapp.com)</li>
              <li><span className="text-indigo-400 font-medium">3.</span> Copy the generated script snippet</li>
              <li><span className="text-indigo-400 font-medium">4.</span> Paste it before <code className="text-indigo-300">&lt;/head&gt;</code> on your site</li>
            </ol>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Domain
          </button>
        </div>
      )}

      {/* Domain cards */}
      {!loading && domains.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {domains.map((domain) => (
            <div key={domain.id} className="bg-[#1a1a2e] border border-indigo-500/20 rounded-xl p-6 flex flex-col">
              {/* Domain name + badge */}
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <Globe className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <h3 className="text-white font-medium text-sm truncate">{domain.domain}</h3>
                </div>
                <span className={`flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  domain.is_active
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${domain.is_active ? 'bg-green-400' : 'bg-slate-500'}`} />
                  {domain.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Opt-in rate */}
              <div className="mb-4">
                <div className="text-4xl font-bold text-green-400">
                  {domain.opt_in_rate?.toFixed(1) ?? '0.0'}%
                </div>
                <div className="text-xs text-slate-500 mt-0.5">opt-in rate</div>
              </div>

              {/* Visitors */}
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>{(domain.total_visitors ?? 0).toLocaleString()} total visitors</span>
              </div>

              {/* Actions */}
              <div className="mt-auto flex flex-col gap-2">
                <button
                  onClick={() => copySnippet(domain)}
                  className="flex items-center justify-center gap-2 w-full bg-[#0f0f1a] border border-indigo-500/20 hover:border-indigo-500/50 text-slate-300 hover:text-white rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                >
                  {copiedId === domain.id ? (
                    <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" />Copy Snippet</>
                  )}
                </button>
                <div className="flex gap-2">
                  <Link
                    href={`/analytics?domain=${domain.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Analytics
                  </Link>
                  <button
                    onClick={() => setDeleteId(domain.id)}
                    className="flex items-center justify-center w-9 h-9 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors flex-shrink-0"
                    title="Delete domain"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddModal(false)} />
          <div className="relative z-10 bg-[#1a1a2e] border border-indigo-500/20 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Add Domain</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Domain name</label>
                <input
                  type="text"
                  value={addInput}
                  onChange={(e) => setAddInput(e.target.value)}
                  placeholder="example.com"
                  className="w-full bg-[#0f0f1a] border border-indigo-500/20 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 outline-none transition-colors"
                  autoFocus
                />
                {addError && <p className="text-red-400 text-xs mt-1.5">{addError}</p>}
              </div>
              <p className="text-xs text-slate-500">
                Enter just the domain (no https://). We&apos;ll generate a unique script snippet for you.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-[#0f0f1a] border border-indigo-500/20 hover:border-indigo-500/40 text-slate-300 rounded-lg py-2.5 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
                >
                  {adding ? 'Adding…' : 'Add Domain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 bg-[#1a1a2e] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Delete Domain</h2>
                <p className="text-slate-400 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-5">
              All consent data and analytics for this domain will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-[#0f0f1a] border border-indigo-500/20 hover:border-indigo-500/40 text-slate-300 rounded-lg py-2.5 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
