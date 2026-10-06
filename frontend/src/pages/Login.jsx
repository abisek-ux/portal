import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'student@demo.com', password: 'password123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(form.email, form.password);
    setLoading(false);
    if (res.ok) navigate('/dashboard');
    else setError(res.message);
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-lg font-bold">SB</span>
          <span className="text-xl font-extrabold">SkillBridge</span>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold">Welcome back!</h1>
          <p className="mt-3 text-brand-100">
            Continue your journey of skill mapping, internships and industry collaboration.
          </p>
        </div>
        <p className="text-sm text-brand-200">SIH26044 · Portal for Academia-Industry Collaboration</p>
      </div>

      <div className="flex w-full items-center justify-center bg-slate-50 px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-extrabold text-slate-800">Login to your account</h2>
          <p className="mt-1 text-sm text-slate-500">Choose a demo account or use your own credentials.</p>

          <Alert message={error} />

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button className="btn-accent w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Demo accounts</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => setForm({ email: 'student@demo.com', password: 'password123' })} className="rounded bg-slate-100 px-2 py-1.5 text-left hover:bg-brand-50">🎓 Student</button>
              <button onClick={() => setForm({ email: 'faculty@demo.com', password: 'password123' })} className="rounded bg-slate-100 px-2 py-1.5 text-left hover:bg-brand-50">👨‍🏫 Faculty</button>
              <button onClick={() => setForm({ email: 'industry@demo.com', password: 'password123' })} className="rounded bg-slate-100 px-2 py-1.5 text-left hover:bg-brand-50">🏭 Industry</button>
              <button onClick={() => setForm({ email: 'admin@demo.com', password: 'admin123' })} className="rounded bg-slate-100 px-2 py-1.5 text-left hover:bg-brand-50">🛡️ Admin</button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            New here? <Link to="/register" className="font-semibold text-brand-600">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}