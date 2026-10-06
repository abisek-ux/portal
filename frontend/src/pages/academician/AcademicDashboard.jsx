import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../api';
import { StatCard, Card, Spinner, EmptyState, StatusBadge } from '../../components/ui';
import { FiBriefcase, FiFileText, FiUsers, FiArrowRight } from 'react-icons/fi';

export default function AcademicDashboard() {
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
        <h1 className="text-2xl font-extrabold text-slate-800">Welcome, {user?.name?.split(' ')[0]} 👨‍🏫</h1>
        <p className="text-slate-500">{user?.designation} · {user?.facultyDepartment} · {user?.institution}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<FiBriefcase />} label="Open FDP / Training Programs" value={data?.openAcademicOpportunities} color="bg-brand-50 text-brand-700" />
        <StatCard icon={<FiFileText />} label="My Applications" value={data?.myApplications} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={<FiUsers />} label="My Collaborations" value={data?.myCollaborations} color="bg-purple-50 text-purple-600" />
      </div>

      {data?.expertise && (
        <Card>
          <h3 className="section-title mb-3">My Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {(user?.expertise || []).map((e) => <span key={e} className="badge bg-brand-100 text-brand-700 px-3 py-1.5">{e}</span>)}
            {!user?.expertise?.length && <p className="text-sm text-slate-400">Add your areas of expertise to get matched with collaborations.</p>}
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="section-title">My Collaborations</h3>
            <Link to="/collaborations" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link>
          </div>
          {data?.collaborations?.length ? (
            <div className="space-y-3">
              {data.collaborations.slice(-4).reverse().map((c) => (
                <div key={c._id} className="rounded-lg border border-slate-100 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">{c.title}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{c.type} · Proposed by {c.proposerName}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No collaborations yet.</p>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="section-title">Quick Actions</h3>
            <Link to="/academia-opportunities" className="text-sm font-semibold text-brand-600 hover:underline">All opportunities</Link>
          </div>
          <div className="grid gap-3">
            <Link to="/academia-opportunities" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50">
              <span>
                <span className="block text-sm font-semibold text-slate-700">Explore FDPs, Training & Faculty Internships</span>
                <span className="block text-xs text-slate-400">Get practical industry exposure and upskill</span>
              </span>
              <FiArrowRight className="text-slate-400" />
            </Link>
            <Link to="/collaborations" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50">
              <span>
                <span className="block text-sm font-semibold text-slate-700">Collaborate with Industry</span>
                <span className="block text-xs text-slate-400">Consultancy, research, guest lectures, curriculum co-design</span>
              </span>
              <FiArrowRight className="text-slate-400" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}