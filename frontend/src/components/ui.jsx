// Shared UI components
export const Spinner = ({ size = 'h-6 w-6' }) => (
  <div className="flex justify-center py-10">
    <div className={`${size} animate-spin rounded-full border-4 border-brand-200 border-t-brand-600`} />
  </div>
);

export const StatCard = ({ icon, label, value, sub, color = 'bg-brand-50 text-brand-700' }) => (
  <div className="card flex items-start justify-between gap-3">
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-slate-800">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl ${color}`}>
      {icon}
    </div>
  </div>
);

export const Badge = ({ children, color = 'bg-slate-100 text-slate-600' }) => (
  <span className={`badge ${color}`}>{children}</span>
);

const statusColors = {
  Applied: 'bg-blue-100 text-blue-700',
  'Under Review': 'bg-amber-100 text-amber-700',
  Shortlisted: 'bg-purple-100 text-purple-700',
  Selected: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-700',
  Completed: 'bg-teal-100 text-teal-700',
  Open: 'bg-emerald-100 text-emerald-700',
  Closed: 'bg-slate-200 text-slate-600',
  Filled: 'bg-amber-100 text-amber-700',
  Proposed: 'bg-blue-100 text-blue-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Ongoing: 'bg-purple-100 text-purple-700',
};

export const StatusBadge = ({ status }) => (
  <Badge color={statusColors[status] || 'bg-slate-100 text-slate-600'}>{status}</Badge>
);

export const ProgressBar = ({ value, color = 'bg-brand-600' }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
  </div>
);

export const EmptyState = ({ icon = '📭', title = 'Nothing here yet', desc = '' }) => (
  <div className="card flex flex-col items-center justify-center py-12 text-center">
    <span className="text-4xl">{icon}</span>
    <p className="mt-3 font-semibold text-slate-700">{title}</p>
    {desc && <p className="mt-1 text-sm text-slate-400">{desc}</p>}
  </div>
);

export const Alert = ({ message, type = 'error' }) => {
  if (!message) return null;
  const colors = {
    error: 'bg-rose-50 text-rose-700 border-rose-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    info: 'bg-brand-50 text-brand-700 border-brand-200',
  };
  return (
    <div className={`mb-4 rounded-lg border px-4 py-3 text-sm font-medium ${colors[type] || colors.info}`}>
      {message}
    </div>
  );
};

export const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`}>{children}</div>
);