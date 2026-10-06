import { useEffect, useState } from 'react';
import { applicationAPI } from '../../api';
import { Card, Spinner, EmptyState, StatusBadge, ProgressBar } from '../../components/ui';
import { FiBriefcase, FiCalendar, FiClock } from 'react-icons/fi';

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await applicationAPI.mine();
        setApps(data.applications);
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
        <h1 className="text-2xl font-extrabold text-slate-800">My Applications</h1>
        <p className="text-slate-500">Track your internship applications, progress and feedback.</p>
      </div>

      {apps.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {apps.map((a) => (
            <Card key={a._id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-800">{a.internship?.title}</h3>
                  <p className="text-sm text-slate-500">{a.internship?.companyName}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="badge bg-slate-100 text-slate-600"><FiBriefcase className="mr-1" />{a.internship?.type}</span>
                <span className="badge bg-slate-100 text-slate-600"><FiCalendar className="mr-1" />{a.internship?.duration}</span>
                <span className="badge bg-amber-50 text-amber-700">{a.internship?.stipend}</span>
              </div>

              {a.status === 'Under Review' || a.status === 'Shortlisted' || a.status === 'Selected' ? (
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-slate-500">In-progress completion</span>
                    <span className="font-bold text-brand-600">{a.progress}%</span>
                  </div>
                  <ProgressBar value={a.progress} />
                  {a.feedback && <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">💬 {a.feedback}</p>}
                </div>
              ) : a.status === 'Completed' ? (
                <p className="mt-3 text-xs text-emerald-600">
                  🎉 Internship completed{a.completionDate ? ` on ${new Date(a.completionDate).toLocaleDateString()}` : ''}
                  {a.rating ? ` · Rated ${a.rating}/5` : ''}
                </p>
              ) : a.feedback ? (
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">💬 {a.feedback}</p>
              ) : null}

              <p className="mt-3 text-xs text-slate-400 flex items-center gap-1">
                <FiClock className="inline" /> Applied {new Date(a.createdAt).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon="📄" title="No applications yet" desc="Browse internships and submit your first application." />
      )}
    </div>
  );
}