export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="bg-slate-900 rounded-xl p-8 w-full max-w-md border border-slate-800">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl font-bold text-indigo-400">ConsentKit</span>
        </div>
        <h1 className="text-xl font-semibold mb-6">Sign in to your account</h1>
        <form action="/api/auth/signin/credentials" method="POST">
          <div className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
          <p className="text-center text-sm text-slate-400 mt-4">
            No account? <a href="/signup" className="text-indigo-400 hover:underline">Sign up free</a>
          </p>
        </form>
      </div>
    </div>
  );
}
