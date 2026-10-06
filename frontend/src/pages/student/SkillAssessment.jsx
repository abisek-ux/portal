import { useEffect, useState } from 'react';
import { skillAPI, authAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Card, Spinner, Alert, ProgressBar } from '../../components/ui';
import { FiAward, FiBriefcase, FiUsers, FiCheck, FiPlus } from 'react-icons/fi';

export default function SkillAssessment() {
  const { user, updateUser } = useAuth();
  const [catalog, setCatalog] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [interests, setInterests] = useState('');
  const [rec, setRec] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [cat, cats] = await Promise.all([skillAPI.list(), skillAPI.categories()]);
        setCatalog(cat.data.skills);
        setCategories(cats.data.categories);
        setSelected((user?.skills || []).map((s) => s.name));
        setInterests((user?.interests || []).join(', '));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = catalog.filter((s) => {
    const matchCat = category === 'All' || s.category === category;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggle = (name) => {
    if (selected.includes(name)) setSelected(selected.filter((n) => n !== name));
    else setSelected([...selected, name]);
  };

  const analyze = async () => {
    setMessage('');
    const skills = (user?.skills || [])
      .filter((s) => selected.includes(s.name))
      .map((s) => s);

    const newSkills = selected
      .filter((n) => !user?.skills?.some((s) => s.name === n))
      .map((n) => ({ name: n, level: 'Beginner', years: 0 }));

    const allSkills = [...skills, ...newSkills];
    const interestList = interests.split(',').map((i) => i.trim()).filter(Boolean);

    try {
      await authAPI.updateProfile({ skills: allSkills, interests: interestList });
      const up = { ...user, skills: allSkills, interests: interestList };
      updateUser(up);
      const { data } = await skillAPI.recommend();
      setRec(data);
      setMessage('Skill profile updated! Here are your recommendations.');
    } catch (e) {
      setMessage(e.response?.data?.message || 'Error analyzing skills');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Skill Mapping & Assessment</h1>
        <p className="text-slate-500">Select the skills you have — we'll match you to industries, roles and programs.</p>
      </div>

      <Alert message={message} type={message.toLowerCase().includes('error') ? 'error' : 'success'} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategory('All')}
                  className={`badge px-3 py-1.5 ${category === 'All' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`badge px-3 py-1.5 ${category === c ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <input className="input sm:w-52" placeholder="Search skills..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {filtered.map((s) => {
                const isSel = selected.includes(s.name);
                return (
                  <button
                    key={s._id}
                    onClick={() => toggle(s.name)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                      isSel ? 'border-brand-500 bg-brand-50 font-semibold text-brand-700' : 'border-slate-200 hover:border-brand-200'
                    }`}
                  >
                    {s.name}
                    {isSel && <FiCheck className="text-brand-600" />}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <label className="label">Career interests (comma separated)</label>
            <input
              className="input"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Ayurveda, Pharmaceuticals, Data Science, Research"
            />
            <button onClick={analyze} className="btn-accent mt-4 w-full">
              <FiAward /> Analyze My Skills
            </button>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="section-title mb-3">Selected Skills ({selected.length})</h3>
            <div className="flex flex-wrap gap-2">
              {selected.map((s) => (
                <button key={s} onClick={() => toggle(s)} className="badge bg-brand-100 text-brand-700 px-3 py-1 hover:bg-brand-200">
                  {s} <FiPlus className="ml-1 rotate-45" />
                </button>
              ))}
              {!selected.length && <p className="text-sm text-slate-400">Click skills to add them</p>}
            </div>
          </Card>

          {rec && (
            <div className="space-y-4">
              <Card>
                <h3 className="section-title flex items-center gap-2"><FiBriefcase /> Recommended Roles</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {rec.recommendedRoles.map((r) => <span key={r} className="badge bg-slate-100 text-slate-700 px-3 py-1">{r}</span>)}
                </div>
              </Card>
              <Card>
                <h3 className="section-title flex items-center gap-2"><FiUsers /> Target Industries</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {rec.recommendedIndustries.map((i) => <span key={i} className="badge bg-emerald-100 text-emerald-700 px-3 py-1">{i}</span>)}
                </div>
              </Card>
              <Card>
                <h3 className="section-title mb-3">Upskill Next</h3>
                <div className="space-y-3">
                  {rec.recommendedSkills.slice(0, 5).map((s) => (
                    <div key={s._id}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{s.name}</span>
                        <span className="text-brand-600">{Math.min(98, 60 + Math.round(s.score * 4))}% match</span>
                      </div>
                      <ProgressBar value={Math.min(98, 60 + Math.round(s.score * 4))} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}