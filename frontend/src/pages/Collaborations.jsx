import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collabAPI } from '../api';
import { Card, Spinner, EmptyState, StatusBadge, Alert } from '../components/ui';
import { FiUsers, FiPlus, FiLogIn } from 'react-icons/fi';

const types = ['Guest Lecture', 'Mentorship Program', 'Workshop', 'Innovation Challenge', 'Live Industry Project', 'Joint Curriculum Design'];

const emptyForm = { title: '', type: 'Guest Lecture', description: '', industryDept: '', mode: 'Remote' };

export default function Collaborations() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await collabAPI.list();
    setItems(data.collaborations);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!loading) setLoading(false);
  }, [items]);

  const propose = async () => {
    setMessage('');
    try {
      await collabAPI.create(form);
      setForm(emptyForm);
      setShowForm(false);
      setMessage('Collaboration proposed! It awaits admin approval.');
      load();
    } catch (e) {
      setMessage(e.response?.data?.message || 'Error');
    }
  };

  const updateStatus = async (id, status) => {
    const { data } = await collabAPI.updateStatus(id, { status });
    setItems(items.map((c) => (c._id === id ? data.collaboration : c)));
  };

  const join = async (id) => {
    const { data } = await collabAPI.join(id);
    setItems(items.map((c) => (c._id === id ? data.collaboration : c)));
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Industry–Academia Collaboration</h1>
          <p className="text-slate-500">Mentorship, guest lectures, innovation challenges and live industry projects.</p>
        </div>
        {(user?.role === 'industry' || user?.role === 'academician') && (
          <button className="btn-accent" onClick={() => setShowForm(!showForm)}>
            <FiPlus /> {showForm ? 'Close' : 'Propose Collaboration'}
          </button>
        )}
      </div>

      <Alert message={message} type={message.includes('!') ? 'success' : 'error'} />

      {showForm && (
        <div className="card border-brand-200">
          <h3 className="section-title mb-4">Propose a Collaboration</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Joint Curriculum Design" />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {types.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea className="input min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Department / Focus area</label>
              <input className="input" value={form.industryDept} onChange={(e) => setForm({ ...form, industryDept: e.target.value })} placeholder="e.g. R&D, IT" />
            </div>
            <div>
              <label className="label">Mode</label>
              <select className="input" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                {['Remote', 'Hybrid', 'On-site'].map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <button className="btn-primary mt-5" onClick={propose}>Submit Proposal</button>
        </div>
      )}

      {items.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((c) => {
            const joined = c.participants?.includes(user?._id);
            return (
              <Card key={c._id} className="flex flex-col">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="badge bg-slate-100 text-slate-700"><FiUsers className="mr-1" />{c.type}</span>
                  <StatusBadge status={c.status} />
                </div>
                <h3 className="font-bold text-slate-800">{c.title}</h3>
                <p className="mt-1 flex-1 text-sm text-slate-500">{c.description}</p>
                <p className="mt-2 text-xs text-slate-400">Proposed by {c.proposerName} · {c.industryDept || c.proposerRole} · {c.mode}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.status === 'Approved' || c.status === 'Ongoing' ? (
                    joined ? (
                      <span className="badge bg-emerald-100 text-emerald-700">Participating ✓</span>
                    ) : (
                      <button className="btn-secondary text-sm" onClick={() => join(c._id)}><FiLogIn /> Join</button>
                    )
                  ) : null}
                  {user?.role === 'admin' && c.status === 'Proposed' && (
                    <button className="btn-primary text-sm" onClick={() => updateStatus(c._id, 'Approved')}>Approve</button>
                  )}
                  {user?.role === 'admin' && c.status === 'Approved' && (
                    <button className="btn-accent text-sm" onClick={() => updateStatus(c._id, 'Ongoing')}>Mark Ongoing</button>
                  )}
                  {user?.role === 'admin' && c.status === 'Ongoing' && (
                    <button className="btn-secondary text-sm" onClick={() => updateStatus(c._id, 'Completed')}>Mark Completed</button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon="🤝" title="No collaborations yet" desc="Propose or join industry-academia collaborations." />
      )}
    </div>
  );
}