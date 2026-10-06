import { useEffect, useState } from 'react';
import { programAPI } from '../../api';
import { Card, Spinner, EmptyState, Alert } from '../../components/ui';
import { FiAward, FiClock, FiUsers, FiBookOpen } from 'react-icons/fi';

export default function LearningPrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await programAPI.list();
        setPrograms(data.programs);
        setEnrolledIds(data.programs.filter((p) => p.enrolledStudents?.length).map((p) => p._id));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const enroll = async (id) => {
    setMessage('');
    try {
      await programAPI.enroll(id);
      setEnrolledIds([...enrolledIds, id]);
      setMessage('Successfully enrolled in the program!');
      setTimeout(() => setMessage(''), 4000);
    } catch (e) {
      setMessage(e.response?.data?.message || 'Error enrolling');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Industry Learning Programs</h1>
        <p className="text-slate-500">Upskill with training programs, certification courses and workshops from industry.</p>
      </div>

      <Alert message={message} type={message.includes('enrolled') ? 'success' : 'error'} />

      {programs.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <Card key={p._id} className="flex flex-col">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-purple-50 text-xl text-purple-600">
                <FiBookOpen />
              </div>
              <div className="mb-1 flex items-center gap-2 text-xs">
                <span className="badge bg-purple-100 text-purple-700">{p.type}</span>
                {p.certificatesOffered && <span className="badge bg-emerald-100 text-emerald-700">Certificate</span>}
              </div>
              <h3 className="font-bold text-slate-800">{p.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{p.companyName}</p>
              <p className="mt-2 flex-1 text-sm text-slate-500">{p.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="badge bg-slate-100 text-slate-600"><FiClock className="mr-1" />{p.duration}</span>
                <span className="badge bg-slate-100 text-slate-600"><FiUsers className="mr-1" />{p.maxSeats} seats</span>
                <span className="badge bg-emerald-50 text-emerald-700">{p.cost}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.skillsCovered?.map((s) => <span key={s} className="badge bg-brand-50 text-brand-700">{s}</span>)}
              </div>
              <button
                className={`mt-4 w-full ${enrolledIds.includes(p._id) ? 'btn-secondary' : 'btn-accent'}`}
                onClick={() => enroll(p._id)}
                disabled={enrolledIds.includes(p._id)}
              >
                <FiAward /> {enrolledIds.includes(p._id) ? 'Enrolled ✓' : 'Enroll Now'}
              </button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon="🎓" title="No programs available" desc="Industry learning programs will appear here." />
      )}
    </div>
  );
}