import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../api';
import { StatCard, Card, Spinner, StatusBadge } from '../../components/ui';
import { FiBriefcase, FiFileText, FiAward, FiUsers, FiArrowRight, FiShare2 } from 'react-icons/fi';

export default function IndustryDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await dashboardAPI.get();
        setData(data.dashboard);
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
        <h1 className="text-2xl font-extrabold text-slate-800">Welcome, {user?.company} 🏭</h1>
        <p className="text-slate-500">Manage your opportunities, applications and learning programs.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<FiBriefcase />} label="Total Postings" value={data?.totalPostings} color="bg-brand-50 text-brand-700" />
        <StatCard icon={<FiFileText />} label="Applications" value={data?.totalApplications} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={<FiAward />} label="Learning Programs" value={data?.totalPrograms} color="bg-purple-50 text-purple-600" />
        <StatCard icon={<FiUsers />} label="Pipeline (viewing/selected)" value={(data?.statusCounts?.['Shortlisted'] || 0) + (data?.statusCounts?.['Under Review'] || 0)} color="bg-amber-50 text-amber-600" />
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="section-title">My Postings</h3>
          <Link to="/post-internship" className="btn-accent text-sm">+ New Posting</Link>
        </div>
        {data?.postings?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Applicants</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.postings.map((p) => (
                  <tr key={p._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-3 font-semibold text-slate-700">{p.title}</td>
                    <td className="px-3 py-3 text-slate-500">{p.type}</td>
                    <td className="px-3 py-3 text-slate-500">{p.category}</td>
                    <td className="px-3 py-3 text-slate-500">{p.applicationsCount}</td>
                    <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No postings yet.</p>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="section-title mb-4">Application Pipeline</h3>
          <div className="space-y-3">
            {Object.entries(data?.statusCounts || {}).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <StatusBadge status={k} />
                <span className="font-bold text-slate-700">{v}</span>
              </div>
            ))}
            {!data?.totalApplications && <p className="text-sm text-slate-400">No applications received yet.</p>}
          </div>
          <Link to="/manage-applications" className="btn-secondary mt-5 w-full">
            Manage Applications <FiArrowRight />
          </Link>
        </Card>

        <Card>
          <h3 className="section-title mb-4">Quick Actions</h3>
          <div className="grid gap-3">
            <Link to="/post-internship" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50">
              <span className="flex items-center gap-3">
                <FiBriefcase className="text-xl text-brand-600" />
                <span>
                  <span className="block text-sm font-semibold text-slate-700">Post an Internship / Job</span>
                  <span className="block text-xs text-slate-400">Attract students with matched skills</span>
                </span>
              </span>
              <FiArrowRight className="text-slate-400" />
            </Link>
            <Link to="/industry-programs" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50">
              <span className="flex items-center gap-3">
                <FiAward className="text-xl text-purple-600" />
                <span>
                  <span className="block text-sm font-semibold text-slate-700">Create Learning Programs</span>
                  <span className="block text-xs text-slate-400">Training, certifications & mentorship</span>
                </span>
              </span>
              <FiArrowRight className="text-slate-400" />
            </Link>
            <Link to="/collaborations" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50">
              <span className="flex items-center gap-3">
                <FiShare2 className="text-xl text-emerald-600" />
                <span>
                  <span className="block text-sm font-semibold text-slate-700">Industry-Academia Collaboration</span>
                  <span className="block text-xs text-slate-400">Guest lectures, mentorship, live projects</span>
                </span>
              </span>
              <FiArrowRight className="text-slate-400" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}