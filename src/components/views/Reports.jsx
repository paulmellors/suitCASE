import { useApp } from '../../context/AppContext';
import { getSLAStatus } from '../../utils/dateUtils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';

const COLORS = ['#4F46E5', '#7C3AED', '#DB2777', '#EA580C', '#16A34A', '#0891B2'];
const PRIORITY_COLORS = { Critical: '#EF4444', High: '#F97316', Medium: '#EAB308', Low: '#3B82F6' };

export function Reports() {
  const { state } = useApp();
  const { tickets, agents } = state;

  // Tickets by category
  const byCategory = ['Incident', 'Service Request', 'Change Request', 'Problem'].map(cat => ({
    name: cat.replace(' Request', ' Req'),
    total: tickets.filter(t => t.type === cat).length,
    resolved: tickets.filter(t => t.type === cat && ['Resolved', 'Closed'].includes(t.status)).length,
  }));

  // Tickets by priority
  const byPriority = ['Critical', 'High', 'Medium', 'Low'].map(p => ({
    name: p,
    value: tickets.filter(t => t.priority === p).length,
    color: PRIORITY_COLORS[p],
  })).filter(d => d.value > 0);

  // SLA compliance
  const slaStats = {
    on_track: tickets.filter(t => getSLAStatus(t) === 'on_track').length,
    at_risk: tickets.filter(t => getSLAStatus(t) === 'at_risk').length,
    breached: tickets.filter(t => getSLAStatus(t) === 'breached').length,
    resolved: tickets.filter(t => getSLAStatus(t) === 'resolved').length,
  };
  const slaTotal = Object.values(slaStats).reduce((a, b) => a + b, 0);
  const slaCompliance = slaTotal > 0 ? Math.round(((slaStats.on_track + slaStats.resolved) / slaTotal) * 100) : 100;

  // Volume last 14 days
  const volumeData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
      day: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      created: tickets.filter(t => new Date(t.createdAt).toDateString() === d.toDateString()).length,
      resolved: tickets.filter(t =>
        ['Resolved', 'Closed'].includes(t.status) &&
        (t.comments || []).some(c => new Date(c.createdAt).toDateString() === d.toDateString())
      ).length,
    };
  });

  // Agent performance
  const agentPerf = agents.map(a => ({
    agent: a.name.split(' ')[0],
    open: tickets.filter(t => t.assignee === a.id && !['Resolved', 'Closed'].includes(t.status)).length,
    resolved: tickets.filter(t => t.assignee === a.id && ['Resolved', 'Closed'].includes(t.status)).length,
  }));

  // Status breakdown
  const byStatus = ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'].map(s => ({
    name: s,
    value: tickets.filter(t => t.status === s).length,
  })).filter(d => d.value > 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-gray-500">suitCASE performance overview</p>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'SLA Compliance', value: `${slaCompliance}%`, color: slaCompliance >= 80 ? 'text-green-600' : 'text-red-600', bg: 'bg-green-50' },
          { label: 'Total Tickets', value: tickets.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'SLA Breaches', value: slaStats.breached, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Resolved', value: slaStats.resolved, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(m => (
          <div key={m.label} className={`${m.bg} rounded-xl p-4 border border-current/10`}>
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
            <div className="text-xs font-medium text-gray-600 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Ticket Volume – Last 14 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={volumeData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconSize={10} />
              <Line type="monotone" dataKey="created" stroke="#4F46E5" strokeWidth={2} name="Created" dot={{ r: 2 }} />
              <Line type="monotone" dataKey="resolved" stroke="#16A34A" strokeWidth={2} name="Resolved" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Agent Performance (Open vs Resolved)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={agentPerf} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="agent" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconSize={10} />
              <Bar dataKey="open" fill="#4F46E5" name="Open" radius={[3, 3, 0, 0]} />
              <Bar dataKey="resolved" fill="#16A34A" name="Resolved" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">By Category</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byCategory} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
              <Tooltip />
              <Bar dataKey="total" fill="#4F46E5" name="Total" radius={[0, 3, 3, 0]} />
              <Bar dataKey="resolved" fill="#16A34A" name="Resolved" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">By Priority</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={byPriority} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                {byPriority.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">SLA Status</h3>
          <div className="space-y-3 mt-2">
            {[
              { label: 'On Track', value: slaStats.on_track, color: 'bg-green-500' },
              { label: 'At Risk', value: slaStats.at_risk, color: 'bg-amber-500' },
              { label: 'Breached', value: slaStats.breached, color: 'bg-red-500' },
              { label: 'Resolved', value: slaStats.resolved, color: 'bg-gray-300' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${s.color}`} />
                <span className="text-sm text-gray-600 flex-1">{s.label}</span>
                <span className="text-sm font-semibold text-gray-800">{s.value}</span>
                <span className="text-xs text-gray-400 w-10 text-right">{slaTotal > 0 ? Math.round(s.value / slaTotal * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
