import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiGrid, FiBriefcase, FiAward, FiFileText, FiUsers } from 'react-icons/fi';

const roleNavs = {
  student: [
    { to: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
    { to: '/skills', label: 'Skill Map', icon: <FiAward /> },
    { to: '/internships', label: 'Internships', icon: <FiBriefcase /> },
    { to: '/my-applications', label: 'My Applications', icon: <FiFileText /> },
    { to: '/portfolio', label: 'My Portfolio', icon: <FiUsers /> },
    { to: '/programs', label: 'Learning Programs', icon: <FiAward /> },
  ],
  industry: [
    { to: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
    { to: '/post-internship', label: 'Post Opportunity', icon: <FiBriefcase /> },
    { to: '/manage-applications', label: 'Applications', icon: <FiFileText /> },
    { to: '/industry-programs', label: 'Learning Programs', icon: <FiAward /> },
    { to: '/collaborations', label: 'Collaborations', icon: <FiUsers /> },
  ],
  academician: [
    { to: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
    { to: '/academia-opportunities', label: 'FDPs & Training', icon: <FiBriefcase /> },
    { to: '/collaborations', label: 'Collaborations', icon: <FiUsers /> },
    { to: '/my-applications', label: 'My Applications', icon: <FiFileText /> },
  ],
  admin: [
    { to: '/dashboard', label: 'Analytics', icon: <FiGrid /> },
    { to: '/collaborations', label: 'Collaborations', icon: <FiUsers /> },
  ],
};

const roleLabels = { student: 'Student', academician: 'Academician', industry: 'Industry', admin: 'Admin' };

const Navbar = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navs = roleNavs[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg text-white">SB</span>
          <span className="text-lg font-extrabold text-slate-800">
            Skill<span className="text-brand-600">Bridge</span>
          </span>
        </Link>

        <div className="mb-6 rounded-lg bg-brand-50 px-3 py-2">
          <p className="text-xs font-semibold text-brand-700">{user?.name}</p>
          <p className="text-[11px] text-brand-500">{roleLabels[user?.role]}</p>
        </div>

        <nav className="flex flex-col gap-1">
          {navs.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <span className="text-lg">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <button onClick={handleLogout} className="btn-ghost w-full justify-start">
            <FiLogOut className="text-lg" /> Logout
          </button>
        </div>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-3 md:hidden">
            <span className="rounded-lg bg-brand-600 px-2 py-1 text-sm font-bold text-white">SB</span>
          </div>
          <span className="hidden text-sm font-medium text-slate-400 md:block">
            Portal for Academia–Industry Collaboration
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-600">{user?.name}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
        </header>
        <main className="px-6 py-6">{children}</main>
      </div>
    </div>
  );
};

export default Navbar;