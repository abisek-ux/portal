import { useEffect, useState } from 'react';
import { internshipAPI } from '../../api';
import { Card, Spinner, EmptyState, Alert, StatusBadge } from '../../components/ui';
import { FiMapPin, FiClock, FiBriefcase, FiSend } from 'react-icons/fi';

export default function AcademiaOpportunities() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [cover, setCover] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await internshipAPI.list({ forAcademician: true });
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
      await internshipAPI.apply(applying._id, { coverLetter: cover });
      setApplying(null);
      setCover('');
      setMessage('Application submitted successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (e) {
      setMessage(e.response?.data?.message || 'Error applying');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">FDPs, Industrial Training & Faculty Internships</h1>
        <p className="text-slate-500">Industry programs designed for academicians — grow your practical exposure.</p>
      </div>

      <Alert message={message} type={message.includes('successfully') ? 'success' : 'error'} />

      {list.length ? (
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
              {i.academicProgramType && <span className="badge mb-2 bg-purple-100 text-purple-700 w-fit">{i.academicProgramType}</span>}
              <p className="flex-1 text-sm text-slate-500">{i.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="badge bg-slate-100 text-slate-600"><FiMapPin className="mr-1" />{i.location} · {i.mode}</span>
                <span className="badge bg-slate-100 text-slate-600"><FiClock className="mr-1" />{i.duration}</span>
                <span className="badge bg-emerald-50 text-emerald-700">{i.stipend}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {i.requiredSkills?.map((s) => <span key={s} className="badge bg-brand-50 text-brand-700">{s}</span>)}
              </div>
              <button className="btn-accent mt-4 w-full" onClick={() => setApplying(i)}>
                <FiSend /> Apply
              </button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon="🎓" title="No academician programs available" desc="Industry FDPs and training opportunities will appear here." />
      )}

      {applying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setApplying(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800">Apply to {applying.title}</h3>
            <p className="text-sm text-slate-500">{applying.companyName}</p>
            <label className="label mt-4">Why are you interested?</label>
            <textarea className="input min-h-[100px]" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Share your research/expertise relevance..." />
            <div className="mt-4 flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setApplying(null)}>Cancel</button>
              <button className="btn-accent flex-1" onClick={apply}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}