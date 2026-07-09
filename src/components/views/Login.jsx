import { useState } from 'react';
import { Briefcase, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ROLE_COLORS = { Admin: 'text-purple-600 bg-purple-50', Manager: 'text-blue-600 bg-blue-50', Agent: 'text-green-600 bg-green-50' };

export function Login() {
  const { state, actions } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate async auth
    setTimeout(() => {
      const agent = state.agents.find(
        a => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
      );
      if (agent) {
        actions.login(agent.id);
      } else {
        setError('Invalid email or password. Please try again.');
      }
      setLoading(false);
    }, 400);
  };

  const handleQuickLogin = (agent) => {
    setEmail(agent.email);
    setPassword(agent.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-800 to-indigo-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <Briefcase size={24} className="text-indigo-600" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white tracking-tight">
              <span className="font-light text-indigo-300">suit</span>CASE
            </div>
            <div className="text-indigo-300 text-sm">Every case. Suited.</div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">Sign in to suitCASE</h1>
            <p className="text-sm text-gray-500 mt-0.5">ITSM Helpdesk Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Work Email</label>
              <input
                type="email"
                autoComplete="email"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                placeholder="you@suitcase.io"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Quick login helper */}
          <div className="px-8 pb-6">
            <p className="text-xs text-gray-400 text-center mb-3">— Demo accounts —</p>
            <div className="space-y-1.5">
              {state.agents.map(agent => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => handleQuickLogin(agent)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors text-left group"
                >
                  <div className={`text-xs font-semibold px-2 py-0.5 rounded-full w-16 text-center flex-shrink-0 ${ROLE_COLORS[agent.role]}`}>
                    {agent.role}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-800">{agent.name}</div>
                    <div className="text-[10px] text-gray-400">{agent.email}</div>
                  </div>
                  <div className="text-[10px] text-gray-300 group-hover:text-indigo-400 font-mono">{agent.password}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-indigo-300 text-xs mt-6">
          © 2026 suitCASE — ITSM Helpdesk Platform
        </p>
      </div>
    </div>
  );
}
