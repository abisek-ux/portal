import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/ui';

const roles = [
  { value: 'student', label: 'Student', icon: '🎓', desc: 'I want internships & skill mapping' },
  { value: 'industry', label: 'Industry', icon: '🏭', desc: 'I want to hire interns & post programs' },
  { value: 'academician', label: 'Academician', icon: '👨‍🏫', desc: 'I want FDPs & industry collaboration' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
    college: '', branch: '', year: '',
    company: '', industrySector: '',
    institution: '', facultyDepartment: '', designation: '',
  });

  const next = () => {
    if (step === 1 && (!form.name || !form.email || form.password.length < 6)) {
      setError('Please fill your name, a valid email and a password of at least 6 characters.');
      return;
    }
    setError('');
    setStep(2);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await register(form);
    setLoading(false);
    if (res.ok) navigate('/dashboard');
    else setError(res.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg text-white">SB</span>
            <span className="text-lg font-extrabold text-slate-800">Skill<span className="text-brand-600">Bridge</span></span>
          </Link>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-extrabold text-slate-800">Create your account</h2>
          <p className="mt-1 text-sm text-slate-500">Step {step} of 2</p>

          <div className="mt-4 flex gap-2">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-brand-600' : 'bg-slate-200'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-brand-600' : 'bg-slate-200'}`} />
          </div>

          <Alert message={error} />

          {step === 1 ? (
            <form onSubmit={(e) => { e.preventDefault(); next(); }} className="mt-5 space-y-4">
              <div>
                <label className="label">I am a...</label>
                <div className="grid gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm({ ...form, role: r.value })}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                        form.role === r.value ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'
                      }`}
                    >
                      <span className="text-2xl">{r.icon}</span>
                      <span>
                        <span className="block font-semibold text-slate-800">{r.label}</span>
                        <span className="block text-xs text-slate-500">{r.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Full name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" required />
              </div>
              <button className="btn-accent w-full">Continue</button>
            </form>
          ) : (
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              {form.role === 'student' && (
                <>
                  <div>
                    <label className="label">College</label>
                    <input className="input" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="Your college name" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Branch/Course</label>
                      <input className="input" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="e.g. BAMS, B.Tech" />
                    </div>
                    <div>
                      <label className="label">Year</label>
                      <input className="input" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="e.g. 3rd Year" />
                    </div>
                  </div>
                </>
              )}

              {form.role === 'industry' && (
                <>
                  <div>
                    <label className="label">Company name</label>
                    <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
                  </div>
                  <div>
                    <label className="label">Sector</label>
                    <input className="input" value={form.industrySector} onChange={(e) => setForm({ ...form, industrySector: e.target.value })} placeholder="e.g. Pharmaceuticals" />
                  </div>
                </>
              )}

              {form.role === 'academician' && (
                <>
                  <div>
                    <label className="label">Institution</label>
                    <input className="input" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="Your institution" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Department</label>
                      <input className="input" value={form.facultyDepartment} onChange={(e) => setForm({ ...form, facultyDepartment: e.target.value })} placeholder="Department" />
                    </div>
                    <div>
                      <label className="label">Designation</label>
                      <input className="input" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Professor" />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">Back</button>
                <button className="btn-accent flex-1" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-semibold text-brand-600">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}