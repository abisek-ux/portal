import { useEffect, useState } from 'react';
import { internshipAPI } from '../../api';
import { Card, Spinner, EmptyState, Alert, StatusBadge } from '../../components/ui';
import { FiSearch, FiMapPin, FiClock, FiBriefcase, FiSend } from 'react-icons/fi';

const categories = ['All', 'Technical', 'Healthcare', 'Ayurveda', 'Analytics', 'Design', 'Communication', 'Management', 'Research', 'Legal', 'Finance'];

export default function Internships() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [mode, setMode] = useState('All');
  const [applying, setApplying] = useState(null);
  const [cover, setCover] = useState('');
  const [message, setMessage] = useState('');
  const [appliedIds, setAppliedIds] = useState(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (category !== 'All') params.category = category;
      if (mode !== 'All') params.mode = mode;
      const { data } = await internshipAPI.list(params);
      setList(data.internships);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const apply = async () => {
    if (!applying) return;
    setMessage('');
    try {
      const { data } = await internshipAPI.apply(applying._id, { coverLetter: cover });
      setAppliedIds(new Set([...appliedIds, data.application.internship]));
      setApplying(null);
      setCover('');
      setMessage('Application submitted successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (e) {
      setMessage(e.response?.data?.message || 'Error applying');
    }
  };

  const hasApplied = (id) => appliedIds.has(id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Internship & Job Opportunities</h1>
        <p className="text-slate-500">Search, filter and apply directly to industry openings.</p>
      </div>

      <Alert message={message} type={message.includes('success') ? 'success' : 'error'} />

      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-2.5 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Search by title, company..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </div>
          <select className="input md:w-40" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="input md:w-36" value={mode} onChange={(e) => setMode(e.target.value)}>
            {['All', 'Remote', 'Hybrid', 'On-site'].map((m) => <option key={m}>{m}</option>)}
          </select>
          <button onClick={load} className="btn-primary">Search</button>
        </div>
      </Card>

      {loading ? <Spinner /> : list.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((i) => (
            <Card key={i._id} className="flex flex-col">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-800">{i.title}</h3>
                  <p className="text-sm text-slate-500">{i.companyName}</p>
                </div>
                <StatusBadge status={i.status} />
              </div>
              <p className="line-clamp-3 text-sm text-slate-500">{i.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="badge bg-brand-50 text-brand-700"><FiBriefcase className="mr-1" />{i.type}</span>
                <span className="badge bg-slate-100 text-slate-600"><FiMapPin className="mr-1" />{i.location} · {i.mode}</span>
                <span className="badge bg-emerald-50 text-emerald-700"><FiClock className="mr-1" />{i.duration}</span>
                <span className="badge bg-amber-50 text-amber-700">{i.stipend}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {i.requiredSkills?.map((s) => (
                  <span key={s} className="badge bg-purple-50 text-purple-700">{s}</span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">{i.seats} seat(s)</span>
                {hasApplied(i._id) ? (
                  <span className="badge bg-emerald-100 text-emerald-700">Applied ✓</span>
                ) : (
                  <button onClick={() => setApplying(i)} className="btn-accent">
                    <FiSend className="text-sm" /> Apply Now
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon="🔍" title="No internships found" desc="Try changing your search filters or check back later." />
      )}

      {/* Apply modal */}
      {applying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setApplying(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800">Apply to {applying.title}</h3>
            <p className="text-sm text-slate-500">{applying.companyName}</p>
            <label className="label mt-4">Cover letter (optional)</label>
            <textarea
              className="input min-h-[120px]"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder="Tell the company why you're a great fit..."
            />
            <div className="mt-4 flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setApplying(null)}>Cancel</button>
              <button className="btn-accent flex-1" onClick={apply}>Submit Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}