import { useEffect, useState } from 'react';
import { dashboardAPI } from '../../api';
import { StatCard, Card, Spinner, ProgressBar } from '../../components/ui';
import { FiUsers, FiBriefcase, FiFileText, FiAward, FiShare2, FiUserCheck, FiCheckCircle } from 'react-icons/fi';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [topSkills, setTopSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [d, t] = await Promise.all([dashboardAPI.get(), dashboardAPI.topSkills()]);
        setData(d.data.dashboard);
        setTopSkills(t.data.skills);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  const max = Math.max(...Object.values(data?.statusCounts || {}), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Institution Analytics</h1>
        <p className="text-slate-500">Monitor skill development, internship participation and placement progress across the platform.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<FiUsers />} label="Students" value={data?.totalStudents} color="bg-brand-50 text-brand-700" />
        <StatCard icon={<FiBriefcase />} label="Industry Partners" value={data?.totalIndustry} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={<FiUserCheck />} label="Academicians" value={data?.totalAcademic} color="bg-purple-50 text-purple-600" />
        <StatCard icon={<FiFileText />} label="Total Applications" value={data?.totalApplications} color="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="section-title mb-4">Opportunities</h3>
          <div className="grid gap-3">
            {[
              { label: 'Total Internships', value: data?.totalInternships },
              { label: 'Currently Open', value: data?.openInternships },
              { label: 'Learning Programs', value: data?.totalPrograms },
              { label: 'Collaborations', value: data?.totalCollaborations },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">{r.label}</span>
                <span className="text-lg font-extrabold text-slate-800">{r.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="section-title mb-4 flex items-center gap-2"><FiCheckCircle className="text-emerald-600" /> Placement Progress</h3>
          <div className="grid gap-3">
            {[
              { label: 'Students Selected', value: data?.placedStudents, icon: <FiUserCheck /> },
              { label: 'Internships Completed', value: data?.completedApplications, icon: <FiAward /> },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between rounded-lg bg-emerald-50/60 px-4 py-3">
                <span className="text-sm text-slate-600">{r.label}</span>
                <span className="text-lg font-extrabold text-emerald-700">{r.value}</span>
              </div>
            ))}
          </div>

          <p className="label mt-5 text-xs">Placements by Branch</p>
          {data?.placementByBranch?.length ? (
            <div className="space-y-2">
              {data.placementByBranch.map((b) => (
                <div key={b._id || 'na'}>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">{b._id || 'Not specified'}</span>
                    <span className="font-bold text-slate-700">{b.count}</span>
                  </div>
                  <ProgressBar value={(b.count / (data.totalApplications || 1)) * 100} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No data yet</p>
          )}
        </Card>

        <Card>
          <h3 className="section-title mb-4 flex items-center gap-2"><FiShare2 className="text-brand-600" /> Most In-Demand Skills</h3>
          <div className="space-y-3">
            {topSkills.map((s) => (
              <div key={s._id}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{s.name}</span>
                  <span className="text-xs text-slate-400">{s.category}</span>
                </div>
                <ProgressBar value={s.popularity} />
                <p className="mt-0.5 text-xs text-slate-400">{s.relatedRoles.slice(0, 3).join(', ')}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="section-title mb-3">Ecosystem at a Glance</h3>
        <div className="flex flex-wrap items-end gap-6">
          {Object.entries(data?.statusCounts || {}).map(([k, v]) => (
            <div key={k} className="text-center">
              <div className="flex h-28 items-end overflow-hidden rounded-lg bg-brand-50 p-1">
                <div className="w-10 rounded bg-brand-600" style={{ height: `${(v / max) * 100}%` }} title={k} />
              </div>
              <p className="mt-1 text-xs font-medium text-slate-600">{k}</p>
              <p className="text-sm font-bold text-slate-800">{v}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}