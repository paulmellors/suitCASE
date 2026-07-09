import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PriorityBadge, StatusBadge, SLABadge, TypeBadge, Avatar } from '../ui/Badge';
import { getSLAStatus, formatRelative } from '../../utils/dateUtils';
import { TicketPanel } from './TicketPanel';

const PAGE_SIZE = 20;
const CATEGORIES = ['Incident', 'Service Request', 'Change Request', 'Problem'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

const TABLE_COLS = [
  { label: 'ID',       cls: 'w-28' },
  { label: 'Title',    cls: '' },
  { label: 'Type',     cls: 'w-32' },
  { label: 'Priority', cls: 'w-24' },
  { label: 'Status',   cls: 'w-28' },
  { label: 'SLA',      cls: 'w-24' },
  { label: 'Assignee', cls: 'w-36' },
  { label: 'Created',  cls: 'w-28' },
];

function SectionHeader({ label, count, dot }) {
  return (
    <tr>
      <td colSpan={8} className="px-4 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
          <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">{label}</span>
          <span className="text-xs font-semibold text-white px-2 py-0.5 rounded-full bg-gray-400 leading-none">{count}</span>
          <span className="flex-1 h-px bg-gray-200 ml-1" />
        </div>
      </td>
    </tr>
  );
}

function TicketRow({ ticket, agentMap, selectedTicketId, onSelect, shade }) {
  const sla = getSLAStatus(ticket);
  const assignee = ticket.assignee ? agentMap[ticket.assignee] : null;
  const isSelected = selectedTicketId === ticket.id;
  return (
    <tr
      onClick={() => onSelect(isSelected ? null : ticket.id)}
      className={`border-b border-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-indigo-50' : shade ? 'bg-gray-50/50 hover:bg-gray-50' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-semibold">{ticket.id}</td>
      <td className="px-4 py-3">
        <div className="font-medium text-gray-800 truncate max-w-xs">{ticket.title}</div>
        <div className="text-xs text-gray-400 truncate">{ticket.requester}</div>
      </td>
      <td className="px-4 py-3"><TypeBadge type={ticket.type} /></td>
      <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
      <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
      <td className="px-4 py-3"><SLABadge status={sla} /></td>
      <td className="px-4 py-3">
        {assignee ? (
          <div className="flex items-center gap-2">
            <Avatar name={assignee.name} size="sm" />
            <span className="text-xs text-gray-600 truncate">{assignee.name.split(' ')[0]}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">Unassigned</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-gray-500" title={new Date(ticket.createdAt).toLocaleString()}>
          {formatRelative(ticket.createdAt)}
        </span>
      </td>
    </tr>
  );
}

export function TicketList() {
  const { state, actions } = useApp();
  const { tickets, agents, ticketListFilters: f, ticketListPage: page, selectedTicketId, resolvedRetentionDays, caseStatuses } = state;

  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]));
  const retentionMs = resolvedRetentionDays * 86400000;
  const now = Date.now();

  const filtered = tickets.filter(t => {
    // Closed tickets never appear in the queue
    if (t.status === 'Closed') return false;
    // Resolved tickets disappear after the retention window
    if (t.status === 'Resolved' && t.resolvedAt) {
      if (now - new Date(t.resolvedAt).getTime() > retentionMs) return false;
    }
    if (f.status && t.status !== f.status) return false;
    if (f.priority && t.priority !== f.priority) return false;
    if (f.category && t.type !== f.category) return false;
    if (f.assignee && t.assignee !== f.assignee) return false;
    if (f.search) {
      const s = f.search.toLowerCase();
      if (
        !t.id.toLowerCase().includes(s) &&
        !t.title.toLowerCase().includes(s) &&
        !(t.description || '').toLowerCase().includes(s)
      ) return false;
    }
    return true;
  });

  const unassigned = filtered.filter(t => !t.assignee);
  const assigned   = filtered.filter(t =>  t.assignee);

  const activeFilterCount = Object.values(f).filter(Boolean).length;

  return (
    <div className="flex h-full">
      {/* Main list */}
      <div className={`flex flex-col flex-1 min-w-0 ${selectedTicketId ? 'hidden xl:flex' : 'flex'}`}>
        <div className="p-6 flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">All Tickets</h1>
              <p className="text-sm text-gray-500">
                {unassigned.length} unassigned · {assigned.length} assigned
              </p>
            </div>
            <button
              onClick={() => actions.setView('create')}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + New Ticket
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                placeholder="Search tickets…"
                value={f.search}
                onChange={e => actions.setFilters({ search: e.target.value })}
              />
            </div>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200" value={f.category} onChange={e => actions.setFilters({ category: e.target.value })}>
              <option value="">All Types</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200" value={f.priority} onChange={e => actions.setFilters({ priority: e.target.value })}>
              <option value="">All Priorities</option>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200" value={f.status} onChange={e => actions.setFilters({ status: e.target.value })}>
              <option value="">All Statuses</option>
              {caseStatuses.map(s => <option key={s.id}>{s.label}</option>)}
            </select>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200" value={f.assignee} onChange={e => actions.setFilters({ assignee: e.target.value })}>
              <option value="">All Assignees</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              <option value="unassigned">Unassigned</option>
            </select>
            {activeFilterCount > 0 && (
              <button
                onClick={() => actions.setFilters({ status: '', priority: '', category: '', assignee: '', search: '' })}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <X size={12} /> Clear ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-white rounded-xl border border-gray-100 shadow-sm">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-gray-600 font-medium">No open cases in suitCASE right now — great work!</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or create a new ticket.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {TABLE_COLS.map(({ label, cls }) => (
                      <th key={label} className={`text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${cls}`}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Unassigned section */}
                  {unassigned.length > 0 && (
                    <>
                      <SectionHeader
                        label="Unassigned"
                        count={unassigned.length}
                        dot="bg-amber-400"
                      />
                      {unassigned.map((t, i) => (
                        <TicketRow
                          key={t.id}
                          ticket={t}
                          agentMap={agentMap}
                          selectedTicketId={selectedTicketId}
                          onSelect={actions.selectTicket}
                          shade={i % 2 !== 0}
                        />
                      ))}
                    </>
                  )}

                  {/* Assigned section */}
                  {assigned.length > 0 && (
                    <>
                      <SectionHeader
                        label="Assigned"
                        count={assigned.length}
                        dot="bg-indigo-400"
                      />
                      {assigned.map((t, i) => (
                        <TicketRow
                          key={t.id}
                          ticket={t}
                          agentMap={agentMap}
                          selectedTicketId={selectedTicketId}
                          onSelect={actions.selectTicket}
                          shade={i % 2 !== 0}
                        />
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Slide-over panel */}
      {selectedTicketId && (
        <TicketPanel ticketId={selectedTicketId} onClose={() => actions.closeTicketPanel()} />
      )}
    </div>
  );
}
