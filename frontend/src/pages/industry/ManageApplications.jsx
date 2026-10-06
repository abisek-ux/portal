import { useEffect, useState } from 'react';
import { internshipAPI, applicationAPI } from '../../api';
import { Card, Spinner, EmptyState, StatusBadge, ProgressBar, Alert } from '../../components/ui';
import { FiInbox, FiUser, FiMail, FiMapPin } from 'react-icons/fi';

const statuses = ['Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected', 'Completed'];

export default function ManageApplications() {
  const [postings, setPostings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await internshipAPI.list();
        setPostings(data.internships);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectPosting = async (id) => {
    setSelected(id);
    setApps([]);
    const { data } = await applicationAPI.byInternship(id);
    setApps(data.applications);
  };

  const update = async (appId, patch) => {
    try {
      const { data } = await applicationAPI.updateStatus(appId, patch);
      setApps(apps.map((a) => (a._id === appId ? { ...a, ...data.application } : a)));
      setMessage(`Application updated → ${data.application.status}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage(e.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Manage Applications</h1>
        <p className="text-slate-500">Review applicants, update statuses, and provide progress feedback & mentorship.</p>
      </div>

      <Alert message={message} type={message.includes('failed') ? 'error' : 'success'} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          <p className="label flex items-center gap-2"><FiInbox /> Select a posting</p>
          {postings.length ? postings.map((p) => (
            <button
              key={p._id}
              onClick={() => selectPosting(p._id)}
              className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                selected === p._id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'
              }`}
            >
              <p className="text-sm font-semibold text-slate-700">{p.title}</p>
              <p className="text-xs text-slate-400">{p.applicationsCount} applicant(s) · {p.type}</p>
            </button>
          )) : (
            <EmptyState icon="📭" title="No postings" desc="Post an opportunity first." />
          )}
        </div>

        <div className="space-y-3 lg:col-span-2">
          {!selected ? (
            <EmptyState icon="👆" title="Select a posting" desc="Choose an opportunity from the left to view its applicants." />
          ) : apps.length ? (
            apps.map((a) => (
              <Card key={a._id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                      {a.applicant?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{a.applicant?.name}</p>
                      <p className="text-xs text-slate-500">{a.applicant?.degree} · {a.applicant?.branch} · {a.applicant?.college}</p>
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                {a.coverLetter && <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">💬 {a.coverLetter}</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-600"><FiMail className="mr-1" />{a.applicant?.email}</span>
                  {a.applicant?.location && <span className="badge bg-slate-100 text-slate-600"><FiMapPin className="mr-1" />{a.applicant.location}</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {a.relevantSkills?.map((s) => <span key={s} className="badge bg-brand-50 text-brand-700">{s}</span>)}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="label text-xs">Status</p>
                    <select className="input text-sm" value={a.status} onChange={(e) => update(a._id, { status: e.target.value })}>
                      {statuses.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="label text-xs">Progress (for selected candidates)</p>
                    <input
                      className="input text-sm"
                      type="number"
                      min="0"
                      max="100"
                      value={a.progress}
                      onChange={(e) => update(a._id, { progress: Number(e.target.value) })}
                    />
                    <ProgressBar value={a.progress} className="mt-1" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="label text-xs">Mentor feedback</p>
                  <textarea
                    className="input text-sm min-h-[60px]"
                    value={a.feedback}
                    onChange={(e) => update(a._id, { feedback: e.target.value })}
                    placeholder="Provide feedback to the student..."
                  />
                </div>
              </Card>
            ))
          ) : (
            <EmptyState icon="📥" title="No applicants yet" desc="Applications will show up here once students apply." />
          )}
        </div>
      </div>
    </div>
  );
}