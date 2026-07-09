import { useApp } from '../../context/AppContext';
import { PriorityBadge, Avatar } from '../ui/Badge';
import { formatRelative } from '../../utils/dateUtils';
import { Link, AlertTriangle, CheckCircle } from 'lucide-react';

const PROBLEM_STATUSES = ['Identified', 'Root Cause Analysis', 'Workaround Available', 'Resolved'];
const STATUS_ORDER = { Identified: 0, 'Root Cause Analysis': 1, 'Workaround Available': 2, Resolved: 3 };
const STATUS_COLORS = {
  Identified: 'bg-red-100 text-red-700 border border-red-200',
  'Root Cause Analysis': 'bg-amber-100 text-amber-700 border border-amber-200',
  'Workaround Available': 'bg-blue-100 text-blue-700 border border-blue-200',
  Resolved: 'bg-green-100 text-green-700 border border-green-200',
};

export function ProblemManagement() {
  const { state, actions } = useApp();
  const problems = state.tickets.filter(t => t.type === 'Problem');
  const agentMap = Object.fromEntries(state.agents.map(a => [a.id, a]));

  const advanceStatus = (ticket) => {
    const current = STATUS_ORDER[ticket.problemStatus] ?? 0;
    const next = PROBLEM_STATUSES[Math.min(current + 1, PROBLEM_STATUSES.length - 1)];
    actions.updateTicket(ticket.id, { problemStatus: next, status: next === 'Resolved' ? 'Resolved' : ticket.status });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Problem Management</h1>
          <p className="text-sm text-gray-500">{problems.length} problem records</p>
        </div>
        <button onClick={() => actions.setView('create')} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          + New Problem Record
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {PROBLEM_STATUSES.map(s => {
          const count = problems.filter(p => p.problemStatus === s).length;
          return (
            <div key={s} className={`rounded-xl p-4 border text-center ${STATUS_COLORS[s]}`}>
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs font-medium mt-0.5 opacity-80">{s}</div>
            </div>
          );
        })}
      </div>

      {/* Problem records */}
      <div className="space-y-4">
        {problems.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <AlertTriangle size={36} className="mx-auto mb-3 text-gray-300" />
            <p>No problem records in suitCASE.</p>
          </div>
        ) : (
          problems.map(ticket => {
            const assignee = ticket.assignee ? agentMap[ticket.assignee] : null;
            const problemStatus = ticket.problemStatus || 'Identified';
            const statusIdx = STATUS_ORDER[problemStatus] ?? 0;
            const canAdvance = statusIdx < PROBLEM_STATUSES.length - 1;

            return (
              <div key={ticket.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs text-indigo-600 font-bold">{ticket.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[problemStatus]}`}>{problemStatus}</span>
                      <PriorityBadge priority={ticket.priority} />
                      {ticket.isKnownError && (
                        <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded font-medium">Known Error</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{ticket.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {canAdvance && (
                      <button onClick={() => advanceStatus(ticket)} className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-100 font-medium">
                        → {PROBLEM_STATUSES[statusIdx + 1]}
                      </button>
                    )}
                    {!canAdvance && (
                      <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} />Resolved</span>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="flex gap-1 mb-4">
                  {PROBLEM_STATUSES.map((s, i) => (
                    <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= statusIdx ? 'bg-orange-400' : 'bg-gray-100'}`} title={s} />
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {ticket.rootCause && (
                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                      <div className="text-[10px] font-semibold text-red-500 uppercase tracking-wide mb-1">Root Cause</div>
                      <p className="text-xs text-red-700">{ticket.rootCause}</p>
                    </div>
                  )}
                  {ticket.workaround && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <div className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide mb-1">Workaround</div>
                      <p className="text-xs text-blue-700">{ticket.workaround}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  {assignee && (
                    <div className="flex items-center gap-1.5">
                      <Avatar name={assignee.name} size="sm" />
                      <span>{assignee.name}</span>
                    </div>
                  )}
                  <span>Created {formatRelative(ticket.createdAt)}</span>
                  {ticket.linkedIncidents?.length > 0 && (
                    <div className="flex items-center gap-1 text-indigo-500">
                      <Link size={11} />
                      <span>Linked incidents: {ticket.linkedIncidents.join(', ')}</span>
                    </div>
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
