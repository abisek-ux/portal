import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, skillAPI } from '../../api';
import { StatCard, Card, Spinner, StatusBadge, ProgressBar } from '../../components/ui';
import { FiBriefcase, FiFileText, FiAward, FiUserCheck, FiArrowRight } from 'react-icons/fi';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [d, r] = await Promise.all([dashboardAPI.get(), skillAPI.recommend()]);
        setData(d.data.dashboard);
        setRec(r.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Hi {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500">Welcome to your skill, internship and placement hub.</p>
      </div>

      <div className="card bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-brand-100">Profile Completeness</p>
            <p className="mt-1 text-3xl font-extrabold">{data?.profileProgress}%</p>
            <p className="mt-1 text-xs text-brand-200">Add your college, skills and interests to reach 100%</p>
          </div>
          <div className="w-full max-w-md">
            <ProgressBar value={data?.profileProgress || 0} color="bg-white" />
          </div>
          <Link to="/skills" className="btn bg-white text-brand-700 hover:bg-brand-50">Analyze My Skills <FiArrowRight /></Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<FiBriefcase />} label="Applications Sent" value={data?.appliedCount} color="bg-brand-50 text-brand-700" />
        <StatCard icon={<FiFileText />} label="Open Internships" value={data?.openInternships} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={<FiAward />} label="Programs Enrolled" value={data?.enrolledPrograms} color="bg-purple-50 text-purple-600" />
        <StatCard icon={<FiUserCheck />} label="Skills in Profile" value={data?.skillCount} color="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="section-title mb-4">Recommended Skills for You</h3>
          {rec?.recommendedSkills?.length ? (
            <div className="space-y-3">
              {rec.recommendedSkills.slice(0, 5).map((s) => (
                <div key={s._id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.category} · {s.relatedRoles.slice(0, 2).join(', ')}</p>
                  </div>
                  <span className="badge bg-brand-100 text-brand-700">Match {Math.min(98, 60 + Math.round(s.score * 4))}%</span>
                </div>
              ))}
              <Link to="/skills" className="btn-secondary w-full">Take Full Skills Assessment</Link>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Add skills to get personalized recommendations.</p>
          )}
        </Card>

        <Card>
          <h3 className="section-title mb-4">Recommended Roles</h3>
          <div className="flex flex-wrap gap-2">
            {rec?.recommendedRoles?.map((r) => (
              <span key={r} className="badge bg-slate-100 text-slate-700 px-3 py-1">{r}</span>
            ))}
          </div>
          <h3 className="section-title mt-5 mb-3">Target Industries</h3>
          <div className="flex flex-wrap gap-2">
            {rec?.recommendedIndustries?.map((i) => (
              <span key={i} className="badge bg-emerald-100 text-emerald-700 px-3 py-1">{i}</span>
            ))}
          </div>
          <Link to="/internships" className="btn-primary mt-5 w-full">Browse Internships</Link>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="section-title">Recent Applications</h3>
          <Link to="/my-applications" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link>
        </div>
        {data?.recentApplications?.length ? (
          <div className="space-y-3">
            {data.recentApplications.slice(-4).reverse().map((a) => (
              <div key={a._id} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{a.internship?.title}</p>
                  <p className="text-xs text-slate-400">{a.internship?.companyName} · {a.internship?.location}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No applications yet. Browse internships and apply!</p>
        )}
      </Card>
    </div>
  );
}