import { useApp } from '../../context/AppContext';
import { PriorityBadge, StatusBadge, Avatar } from '../ui/Badge';
import { formatRelative, formatFull } from '../../utils/dateUtils';
import { GitBranch, Calendar, Shield } from 'lucide-react';

const CHANGE_STATUSES = ['Submitted', 'Under Review', 'Approved', 'Scheduled', 'Implemented', 'Closed'];
const STATUS_ORDER = { Submitted: 0, 'Under Review': 1, Approved: 2, Scheduled: 3, Implemented: 4, Closed: 5 };

const RISK_COLORS = { Low: 'text-green-600 bg-green-50 border-green-200', Medium: 'text-amber-600 bg-amber-50 border-amber-200', High: 'text-red-600 bg-red-50 border-red-200' };
const TYPE_COLORS = { Standard: 'bg-blue-100 text-blue-700', Normal: 'bg-purple-100 text-purple-700', Emergency: 'bg-red-100 text-red-700' };

export function ChangeManagement() {
  const { state, actions } = useApp();
  const changes = state.tickets.filter(t => t.type === 'Change Request');
  const agentMap = Object.fromEntries(state.agents.map(a => [a.id, a]));

  const advanceStatus = (ticket) => {
    const current = STATUS_ORDER[ticket.changeStatus] ?? STATUS_ORDER[ticket.status] ?? 0;
    const nextStatus = CHANGE_STATUSES[Math.min(current + 1, CHANGE_STATUSES.length - 1)];
    actions.updateTicket(ticket.id, { changeStatus: nextStatus, status: nextStatus });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Change Management</h1>
          <p className="text-sm text-gray-500">{changes.length} change requests</p>
        </div>
        <button onClick={() => actions.setView('create')} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          + New Change Request
        </button>
      </div>

      {/* CAB pipeline */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><GitBranch size={15} />Change Advisory Board Pipeline</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CHANGE_STATUSES.map((s, i) => {
            const count = changes.filter(c => (c.changeStatus || c.status) === s).length;
            return (
              <div key={s} className="flex items-center gap-2 flex-shrink-0">
                <div className={`flex flex-col items-center p-3 rounded-xl min-w-24 ${count > 0 ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50 border border-gray-100'}`}>
                  <span className={`text-2xl font-bold ${count > 0 ? 'text-indigo-700' : 'text-gray-400'}`}>{count}</span>
                  <span className={`text-[10px] font-medium mt-1 text-center ${count > 0 ? 'text-indigo-600' : 'text-gray-400'}`}>{s}</span>
                </div>
                {i < CHANGE_STATUSES.length - 1 && <span className="text-gray-300 text-lg">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Change cards */}
      <div className="space-y-4">
        {changes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>No change requests in suitCASE.</p>
          </div>
        ) : (
          changes.map(ticket => {
            const assignee = ticket.assignee ? agentMap[ticket.assignee] : null;
            const changeStatus = ticket.changeStatus || ticket.status;
            const statusIdx = STATUS_ORDER[changeStatus] ?? 0;
            const canAdvance = statusIdx < CHANGE_STATUSES.length - 1;

            return (
              <div key={ticket.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs text-indigo-600 font-bold">{ticket.id}</span>
                      {ticket.changeType && <span className={`text-xs px-2 py-0.5 rounded font-medium ${TYPE_COLORS[ticket.changeType]}`}>{ticket.changeType}</span>}
                      {ticket.riskLevel && <span className={`text-xs px-2 py-0.5 rounded border font-medium ${RISK_COLORS[ticket.riskLevel]}`}><Shield size={10} className="inline mr-1" />Risk: {ticket.riskLevel}</span>}
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                    <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{ticket.description.slice(0, 150)}{ticket.description.length > 150 ? '…' : ''}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <StatusBadge status={changeStatus} />
                    {canAdvance && (
                      <button onClick={() => advanceStatus(ticket)} className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors font-medium">
                        → Advance to {CHANGE_STATUSES[statusIdx + 1]}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex gap-1 mb-3">
                  {CHANGE_STATUSES.map((s, i) => (
                    <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= statusIdx ? 'bg-indigo-500' : 'bg-gray-100'}`} title={s} />
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  {assignee && (
                    <div className="flex items-center gap-1.5">
                      <Avatar name={assignee.name} size="sm" />
                      <span>{assignee.name}</span>
                    </div>
                  )}
                  {ticket.scheduledStart && (
                    <div className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{formatFull(ticket.scheduledStart)}</span>
                    </div>
                  )}
                  <span>Created {formatRelative(ticket.createdAt)}</span>
                  {ticket.linkedIncidents?.length > 0 && (
                    <span className="text-indigo-500">Linked: {ticket.linkedIncidents.join(', ')}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
