import { useEffect, useState } from 'react';
import { programAPI, apiErr } from '../../api';
import { Card, Spinner, EmptyState, Alert } from '../../components/ui';
import { FiBookOpen, FiTrash2 } from 'react-icons/fi';

const emptyForm = {
  title: '',
  type: 'Training Program',
  description: '',
  skillsCovered: '',
  duration: '2 weeks',
  cost: 'Free',
  mode: 'Remote',
  maxSeats: 100,
  certificatesOffered: true,
};

export default function IndustryPrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await programAPI.list();
    setPrograms(data.programs);
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    setMessage('');
    try {
      await programAPI.create({
        ...form,
        skillsCovered: form.skillsCovered.split(',').map((s) => s.trim()).filter(Boolean),
        maxSeats: Number(form.maxSeats) || 100,
      });
      setForm(emptyForm);
      setShowForm(false);
      setMessage('Learning program created!');
      load();
    } catch (e) {
      setMessage(apiErr(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Industry Learning Programs</h1>
          <p className="text-slate-500">Publish training programs, certification courses, workshops and mentorship initiatives.</p>
        </div>
        <button className="btn-accent" onClick={() => setShowForm(!showForm)}>
          <FiBookOpen /> {showForm ? 'Close' : 'New Program'}
        </button>
      </div>

      <Alert message={message} type={message.includes('created') ? 'success' : 'error'} />

      {showForm && (
        <div className="card border-brand-200">
          <h3 className="section-title mb-4">Create Learning Program</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label">Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Certification in Ayurvedic Product Development" />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {['Training Program', 'Certification Course', 'Workshop', 'Mentorship Initiative'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Mode</label>
              <select className="input" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                {['Remote', 'Hybrid', 'On-site'].map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea className="input min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Skills covered (comma separated)</label>
              <input className="input" value={form.skillsCovered} onChange={(e) => setForm({ ...form, skillsCovered: e.target.value })} placeholder="e.g. Data Analytics, Python" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Duration</label>
                <input className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div>
                <label className="label">Cost</label>
                <input className="input" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Max seats</label>
                <input className="input" type="number" min="1" value={form.maxSeats} onChange={(e) => setForm({ ...form, maxSeats: e.target.value })} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={form.certificatesOffered} onChange={(e) => setForm({ ...form, certificatesOffered: e.target.checked })} className="h-4 w-4 accent-brand-600" />
                  Offers certificate
                </label>
              </div>
            </div>
          </div>
          <button className="btn-primary mt-5" onClick={submit}>Publish Program</button>
        </div>
      )}

      {loading ? <Spinner /> : programs.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <Card key={p._id} className="flex flex-col">
              <div className="mb-2 flex items-center justify-between">
                <span className="badge bg-purple-100 text-purple-700">{p.type}</span>
                <span className="badge bg-emerald-100 text-emerald-700">{p.certificatesOffered ? 'Certificate' : 'No cert'}</span>
              </div>
              <h3 className="font-bold text-slate-800">{p.title}</h3>
              <p className="mt-1 flex-1 text-sm text-slate-500">{p.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="badge bg-slate-100 text-slate-600">{p.duration}</span>
                <span className="badge bg-slate-100 text-slate-600">{p.enrolledStudents.length}/{p.maxSeats} enrolled</span>
                <span className="badge bg-emerald-50 text-emerald-700">{p.cost}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon="🎓" title="No programs yet" desc="Create programs to help students acquire in-demand skills." />
      )}
    </div>
  );
}