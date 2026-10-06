import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { portfolioAPI, applicationAPI } from '../../api';
import { Card, Spinner, EmptyState } from '../../components/ui';
import { FiMail, FiMapPin, FiBookOpen, FiHome, FiLink, FiCheckCircle } from 'react-icons/fi';

export default function MyPortfolio() {
  const { user } = useAuth();
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(user?.resumeUrl || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await applicationAPI.mine();
        setCompleted(data.applications.filter((a) => a.status === 'Completed'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveResume = async () => {
    try {
      await portfolioAPI.resume(resume);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">My Digital Portfolio</h1>
        <p className="text-slate-500">Your verified skills, certifications, projects and internships — shareable with employers.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-3xl font-bold text-white">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h2 className="mt-3 text-lg font-extrabold text-slate-800">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.degree} · {user?.branch}</p>
            <div className="mt-4 space-y-2 text-left text-sm text-slate-500">
              <p className="flex items-center gap-2"><FiBookOpen className="text-brand-600" /> {user?.college}</p>
              <p className="flex items-center gap-2"><FiMapPin className="text-brand-600" /> {user?.location || 'Location not set'}</p>
              <p className="flex items-center gap-2"><FiMail className="text-brand-600" /> {user?.email}</p>
            </div>
          </Card>

          <Card>
            <h3 className="section-title mb-3">Connect Resume</h3>
            <input className="input" placeholder="Paste resume link (Drive/PDF URL)" value={resume} onChange={(e) => setResume(e.target.value)} />
            <button onClick={saveResume} className="btn-primary mt-3 w-full">
              <FiLink /> {saved ? 'Saved ✓' : 'Save Resume Link'}
            </button>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h3 className="section-title mb-3">Skills</h3>
            {user?.skills?.length ? (
              <div className="space-y-2">
                {user.skills.map((s) => (
                  <div key={s.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.years > 0 ? `${s.years} year(s)` : 'Recently added'}</p>
                    </div>
                    <span className={`badge ${
                      s.level === 'Expert' ? 'bg-emerald-100 text-emerald-700' :
                      s.level === 'Advanced' ? 'bg-brand-100 text-brand-700' :
                      s.level === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>{s.level}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Add skills via the Skill Map page.</p>
            )}
          </Card>

          <Card>
            <h3 className="section-title mb-3">Certifications & Completed Internships</h3>
            {completed.length ? (
              <div className="space-y-3">
                {completed.map((a) => (
                  <div key={a._id} className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                    <FiCheckCircle className="text-emerald-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">{a.internship?.title}</p>
                      <p className="text-xs text-slate-500">{a.internship?.companyName} · Completed {a.completionDate ? new Date(a.completionDate).toLocaleDateString() : ''}</p>
                    </div>
                    <span className="badge bg-emerald-100 text-emerald-700">Verified ✓</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="🥇" title="No completed internships yet" desc="Complete an internship to earn a verified certificate." />
            )}
          </Card>

          <Card>
            <h3 className="section-title mb-3">Career Interests</h3>
            <div className="flex flex-wrap gap-2">
              {(user?.interests || []).map((i) => (
                <span key={i} className="badge bg-slate-100 text-slate-700 px-3 py-1.5">
                  <FiHome className="mr-1" /> {i}
                </span>
              ))}
              {!user?.interests?.length && <p className="text-sm text-slate-400">No interests set yet.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}