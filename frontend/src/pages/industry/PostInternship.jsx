import { useState } from 'react';
import { internshipAPI, apiErr } from '../../api';
import { Alert } from '../../components/ui';

const categories = ['Technical', 'Healthcare', 'Ayurveda', 'Analytics', 'Design', 'Communication', 'Management', 'Research', 'Legal', 'Finance'];
const types = ['Internship', 'Apprenticeship', 'Entry-Level Job', 'Live Project'];
const modes = ['Remote', 'Hybrid', 'On-site'];

const emptyForm = {
  title: '',
  type: 'Internship',
  description: '',
  category: 'Technical',
  requiredSkills: '',
  preferredSkills: '',
  stipend: '',
  duration: '3 months',
  location: '',
  mode: 'Remote',
  seats: 1,
  isInternshipForAcademician: false,
  academicProgramType: 'FDP',
};

export default function PostInternship() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(null);

  const set = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (academic) => {
    setMessage('');
    try {
      const payload = {
        ...form,
        requiredSkills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        preferredSkills: form.preferredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        seats: Number(form.seats) || 1,
        isInternshipForAcademician: academic,
      };
      const { data } = await internshipAPI.create(payload);
      setSaved(data.internship);
      setForm(emptyForm);
      setMessage(academic ? 'Academician program posted successfully!' : 'Opportunity posted successfully!');
    } catch (e) {
      setMessage(apiErr(e));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Post an Opportunity</h1>
        <p className="text-slate-500">Create internships, apprenticeships, jobs — or programs for academicians (FDP, training).</p>
      </div>

      <Alert message={message} type={message.includes('successfully') ? 'success' : 'error'} />

      {saved && (
        <div className="card border-emerald-200 bg-emerald-50">
          <p className="font-semibold text-emerald-700">✅ Posted: {saved.title}</p>
          <p className="text-sm text-emerald-600">Students can now discover and apply to this posting.</p>
        </div>
      )}

      <div className="card">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Ayurveda Research Intern" />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea className="input min-h-[100px]" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the role, responsibilities and what the candidate will learn..." />
          </div>
          <div>
            <label className="label">Required skills (comma separated)</label>
            <input className="input" value={form.requiredSkills} onChange={(e) => set('requiredSkills', e.target.value)} placeholder="e.g. Ayurveda Pharmacology, Herbal Medicine" />
          </div>
          <div>
            <label className="label">Preferred skills (optional)</label>
            <input className="input" value={form.preferredSkills} onChange={(e) => set('preferredSkills', e.target.value)} placeholder="e.g. Data Analytics" />
          </div>
          <div>
            <label className="label">Stipend</label>
            <input className="input" value={form.stipend} onChange={(e) => set('stipend', e.target.value)} placeholder="e.g. Rs. 10,000/month or Unpaid" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Duration</label>
              <input className="input" value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="e.g. 3 months" />
            </div>
            <div>
              <label className="label">Seats</label>
              <input className="input" type="number" min="1" value={form.seats} onChange={(e) => set('seats', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Bengaluru / Remote" />
          </div>
          <div>
            <label className="label">Mode</label>
            <select className="input" value={form.mode} onChange={(e) => set('mode', e.target.value)}>
              {modes.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button className="btn-primary flex-1" onClick={() => submit(false)}>Post for Students</button>
          <button className="btn-secondary flex-1" onClick={() => submit(true)}>Post for Academicians (FDP/Training)</button>
        </div>
      </div>
    </div>
  );
}