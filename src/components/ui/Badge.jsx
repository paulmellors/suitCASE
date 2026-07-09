import { useApp } from '../../context/AppContext';
import { STATUS_COLOR_OPTIONS } from '../../data/sampleData';

// Non-case statuses (workflow states for approvals, changes etc.) keep static colours
const STATIC_STATUS_MAP = {
  Scheduled:          'bg-indigo-100 text-indigo-700 border border-indigo-200',
  Implemented:        'bg-green-100 text-green-700 border border-green-200',
  'Under Review':     'bg-yellow-100 text-yellow-700 border border-yellow-200',
  Approved:           'bg-green-100 text-green-700 border border-green-200',
  Rejected:           'bg-red-100 text-red-700 border border-red-200',
  'Awaiting Approval':'bg-amber-100 text-amber-700 border border-amber-200',
  'Not Required':     'bg-gray-100 text-gray-500 border border-gray-200',
};

const COLOR_CLS = Object.fromEntries(STATUS_COLOR_OPTIONS.map(o => [o.key, o.cls]));

export function StatusBadge({ status }) {
  const { state } = useApp();
  const cs = state.caseStatuses?.find(s => s.label === status);
  const cls = cs
    ? (COLOR_CLS[cs.color] || 'bg-gray-100 text-gray-600')
    : (STATIC_STATUS_MAP[status] || 'bg-gray-100 text-gray-600');

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const map = {
    Critical: 'bg-red-100 text-red-700 border border-red-200',
    High:     'bg-orange-100 text-orange-700 border border-orange-200',
    Medium:   'bg-yellow-100 text-yellow-700 border border-yellow-200',
    Low:      'bg-blue-100 text-blue-700 border border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[priority] || 'bg-gray-100 text-gray-600'}`}>
      {priority}
    </span>
  );
}

export function SLABadge({ status }) {
  if (!status || status === 'resolved') return null;
  const map = {
    on_track: 'bg-green-100 text-green-700',
    at_risk:  'bg-amber-100 text-amber-700',
    breached: 'bg-red-100 text-red-700',
  };
  const label = { on_track: 'On Track', at_risk: 'At Risk', breached: 'Breached' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
}

export function Avatar({ name, size = 'sm' }) {
  const initials = name?.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-teal-500', 'bg-green-500', 'bg-orange-500'];
  const color = colors[name?.charCodeAt(0) % colors.length] || 'bg-gray-400';
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'md' ? 'w-9 h-9 text-sm' : 'w-11 h-11 text-base';
  return (
    <span className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </span>
  );
}

export function TypeBadge({ type }) {
  const map = {
    Incident:          'bg-red-50 text-red-600 border border-red-200',
    'Service Request': 'bg-blue-50 text-blue-600 border border-blue-200',
    'Change Request':  'bg-purple-50 text-purple-600 border border-purple-200',
    Problem:           'bg-orange-50 text-orange-600 border border-orange-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[type] || 'bg-gray-100 text-gray-600'}`}>
      {type}
    </span>
  );
}
