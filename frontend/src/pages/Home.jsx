import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiSearch, FiTarget, FiBriefcase, FiUsers, FiAward, FiPieChart, FiBookOpen, FiArrowRight,
} from 'react-icons/fi';

const features = [
  { icon: <FiTarget className="text-2xl" />, title: 'Skill Mapping', desc: 'Take an assessment and get matched to industries, job roles and skill programs.' },
  { icon: <FiBriefcase />, title: 'Internship Portal', desc: 'Industries post internships, apprenticeships & entry-level jobs. Students apply & track.' },
  { icon: <FiBookOpen />, title: 'Industry Learning', desc: 'Certification courses, workshops and mentorship initiatives from companies.' },
  { icon: <FiUsers />, title: 'Academician Portal', desc: 'Faculty internships, FDPs, consultancy and collaborative research opportunities.' },
  { icon: <FiSearch />, title: 'Smart Matching', desc: 'Students matched to opportunities based on their verified skill profiles.' },
  { icon: <FiPieChart />, title: 'Institution Analytics', desc: 'Dashboards to monitor skill development, internship participation & placements.' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg text-white">SB</span>
            <span className="text-lg font-extrabold text-slate-800">Skill<span className="text-brand-600">Bridge</span></span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-accent">Go to Dashboard <FiArrowRight /></Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Login</Link>
                <Link to="/register" className="btn-accent">Create Account</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 py-20 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <span className="badge bg-white/15 text-white">SIH 2026 · SIH26044 · Ministry of Ayush</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
              Bridging Academia & Industry for Skill, Internships & Placements
            </h1>
            <p className="mt-4 text-lg text-brand-100">
              One unified platform connecting students, industries, academicians and institutions —
              for skill mapping, internships, learning programs and collaborative research.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn bg-accent-400 text-white hover:bg-accent-500">Get Started Free</Link>
              <a href="#features" className="btn bg-white/10 text-white hover:bg-white/20">Explore Features</a>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-extrabold text-slate-800">What the Platform Solves</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-500">
          The 7 pillars of the SIH26044 problem statement — solved in one system.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card hover:shadow-soft hover:border-brand-200 transition">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                {f.icon}
              </div>
              <h3 className="font-bold text-slate-800">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-14 md:grid-cols-4">
          {[
            { icon: <FiAward />, title: 'Verified Portfolios', desc: 'Skills, certifications & internships in one digital showcase.' },
            { icon: <FiBriefcase />, title: 'Apply & Track', desc: 'Apply to opportunities and track progress in real time.' },
            { icon: <FiSearch />, title: 'No More Scams', desc: 'Institution-verified companies only. No fake certificates.' },
            { icon: <FiUsers />, title: 'Collaboration', desc: 'Guest lectures, mentorship and innovation challenges.' },
          ].map((b) => (
            <div key={b.title} className="flex gap-3">
              <span className="mt-1 text-2xl text-brand-600">{b.icon}</span>
              <div>
                <p className="font-bold text-slate-800">{b.title}</p>
                <p className="mt-1 text-sm text-slate-500">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-slate-400">
        SkillBridge · Built for Smart India Hackathon 2026 · Problem Statement SIH26044
      </footer>
    </div>
  );
}