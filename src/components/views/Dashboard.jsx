import { useApp } from '../../context/AppContext';
import { getSLAStatus } from '../../utils/dateUtils';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Legend
} from 'recharts';
import { Avatar, PriorityBadge, StatusBadge } from '../ui/Badge';

const COLORS = ['#EF4444', '#F97316', '#EAB308', '#3B82F6'];

function MetricCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { state, actions } = useApp();
  const { tickets, agents } = state;

  const openTickets = tickets.filter(t => !['Resolved', 'Closed'].includes(t.status));
  const slaBreaches = tickets.filter(t => getSLAStatus(t) === 'breached').length;
  const resolvedToday = tickets.filter(t => {
    if (t.status !== 'Resolved' && t.status !== 'Closed') return false;
    const lastComment = [...(t.comments || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    const ts = lastComment ? new Date(lastComment.createdAt) : new Date(t.createdAt);
    return Date.now() - ts.getTime() < 86400000;
  }).length;

  // Avg resolution time (mock – from resolved tickets with comments)
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved' && (t.comments || []).length > 0);
  const avgResolution = resolvedTickets.length > 0
    ? Math.round(resolvedTickets.reduce((acc, t) => {
        const last = [...t.comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        return acc + (new Date(last.createdAt) - new Date(t.createdAt)) / 3600000;
      }, 0) / resolvedTickets.length)
    : 0;

  // Bar chart data
  const byCategory = ['Incident', 'Service Request', 'Change Request', 'Problem'].map(cat => ({
    name: cat.replace(' Request', ' Req.').replace('Change', 'CHG'),
    count: tickets.filter(t => t.type === cat).length,
  }));

  // Line chart – last 7 days
  const lineData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-GB', { weekday: 'short' });
    const count = tickets.filter(t => {
      const td = new Date(t.createdAt);
      return td.toDateString() === d.toDateString();
    }).length;
    return { day: label, tickets: count };
  });

  // Priority pie
  const priorityData = ['Critical', 'High', 'Medium', 'Low'].map(p => ({
    name: p,
    value: tickets.filter(t => t.priority === p).length,
  })).filter(d => d.value > 0);

  // Agent leaderboard
  const leaderboard = agents.map(agent => ({
    ...agent,
    resolved: tickets.filter(t => t.assignee === agent.id && ['Resolved', 'Closed'].includes(t.status)).length,
  })).sort((a, b) => b.resolved - a.resolved).slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">suitCASE at a glance</p>
        </div>
        <button
          onClick={() => actions.setView('create')}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Ticket
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Open Tickets" value={openTickets.length} icon={Ticket_} color="bg-indigo-500" sub="Across all categories" />
        <MetricCard label="SLA Breaches" value={slaBreaches} icon={AlertTriangle} color="bg-red-500" sub="Requires immediate action" />
        <MetricCard label="Avg Resolution" value={`${avgResolution}h`} icon={Clock} color="bg-amber-500" sub="Based on resolved tickets" />
        <MetricCard label="Resolved Today" value={resolvedToday} icon={CheckCircle} color="bg-green-500" sub="Great work, team!" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm xl:col-span-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tickets by Category</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={byCategory} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm xl:col-span-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Ticket Volume – Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={lineData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="tickets" stroke="#4F46E5" strokeWidth={2} dot={{ fill: '#4F46E5', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm xl:col-span-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tickets by Priority</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={priorityData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Leaderboard */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><Users size={15} />Agent Leaderboard</h3>
          <div className="space-y-3">
            {leaderboard.map((agent, i) => (
              <div key={agent.id} className="flex items-center gap-3">
                <span className={`w-5 text-center text-xs font-bold ${i === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>{i + 1}</span>
                <Avatar name={agent.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{agent.name}</div>
                  <div className="text-xs text-gray-400">{agent.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-indigo-600">{agent.resolved}</div>
                  <div className="text-xs text-gray-400">resolved</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent tickets */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Open Tickets</h3>
          <div className="space-y-2">
            {openTickets.slice(0, 5).map(t => (
              <button
                key={t.id}
                onClick={() => { actions.selectTicket(t.id); actions.setView('tickets'); }}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-xs font-mono text-indigo-600 font-medium w-20 flex-shrink-0">{t.id}</span>
                <span className="text-sm text-gray-700 flex-1 truncate">{t.title}</span>
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
              </button>
            ))}
          </div>
          <button
            onClick={() => actions.setView('tickets')}
            className="mt-3 w-full text-center text-xs text-indigo-600 hover:underline"
          >
            View all tickets →
          </button>
        </div>
      </div>
    </div>
  );
}

// Mini icon workaround for recharts context
function Ticket_({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
    </svg>
  );
}
