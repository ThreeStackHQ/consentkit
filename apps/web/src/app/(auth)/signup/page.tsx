export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="bg-slate-900 rounded-xl p-8 w-full max-w-md border border-slate-800">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl font-bold text-indigo-400">ConsentKit</span>
        </div>
        <h1 className="text-xl font-semibold mb-2">Create your account</h1>
        <p className="text-slate-400 text-sm mb-6">Free tier includes 1 domain, 10K visitors/mo</p>
        <form action="/api/auth/signup" method="POST">
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Your name"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Password (min 8 chars)"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            >
              Start for free
            </button>
          </div>
          <p className="text-center text-sm text-slate-400 mt-4">
            Already have an account? <a href="/login" className="text-indigo-400 hover:underline">Sign in</a>
          </p>
        </form>
      </div>
    </div>
  );
}
