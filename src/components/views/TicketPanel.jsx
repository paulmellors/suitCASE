import { useState } from 'react';
import { X, MessageSquare, Lock, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PriorityBadge, StatusBadge, SLABadge, TypeBadge, Avatar } from '../ui/Badge';
import { getSLAStatus, formatRelative, formatFull } from '../../utils/dateUtils';
import { Modal } from '../ui/Modal';

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

const SLA_COLORS = {
  on_track: 'text-green-600 bg-green-50 border-green-200',
  at_risk:  'text-amber-600 bg-amber-50 border-amber-200',
  breached: 'text-red-600 bg-red-50 border-red-200',
  resolved: 'text-gray-500 bg-gray-50 border-gray-200',
};

export function TicketPanel({ ticketId, onClose }) {
  const { state, actions } = useApp();
  const ticket = state.tickets.find(t => t.id === ticketId);
  const [commentBody, setCommentBody] = useState('');
  const [commentType, setCommentType] = useState('public');
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  if (!ticket) return null;

  const isClosed   = ticket.status === 'Closed';
  const isResolved = ticket.status === 'Resolved';
  const agentMap   = Object.fromEntries(state.agents.map(a => [a.id, a]));
  const currentUser = state.agents.find(a => a.id === state.currentUserId) || state.agents[0];
  const assignee   = ticket.assignee ? agentMap[ticket.assignee] : null;
  const sla        = getSLAStatus(ticket);

  // Build status options from the configured case statuses
  const allStatusLabels = state.caseStatuses.map(s => s.label);
  // Active tickets: all statuses except Closed
  const activeStatusOptions = allStatusLabels.filter(l => l !== 'Closed');
  // Resolved tickets: Resolved + all non-Closed non-Resolved options so they can reopen, plus Closed
  const resolvedStatusOptions = allStatusLabels;

  const statusOptions = isResolved ? resolvedStatusOptions : activeStatusOptions;

  const handleStatusChange = (status) => {
    if (isClosed) return;
    if (status === 'Resolved') {
      setPendingStatus(status);
      setShowResolutionModal(true);
    } else {
      actions.updateTicket(ticket.id, { status });
    }
  };

  const handleResolve = (notify) => {
    actions.updateTicket(ticket.id, { status: pendingStatus });
    if (notify) {
      actions.addComment(ticket.id, {
        author: currentUser.id,
        type: 'public',
        body: `Resolution notification sent to ${ticket.requester}. Ticket resolved.`,
      });
    }
    setShowResolutionModal(false);
  };

  const handleAddComment = () => {
    if (!commentBody.trim() || isClosed) return;
    actions.addComment(ticket.id, { author: currentUser.id, type: commentType, body: commentBody.trim() });
    setCommentBody('');
  };

  return (
    <div className="w-full xl:w-[680px] flex-shrink-0 h-full border-l border-gray-100 bg-white flex flex-col overflow-hidden shadow-xl">
      {/* Panel header */}
      <div className={`px-5 py-4 border-b flex items-start justify-between gap-4 ${isClosed ? 'bg-gray-50 border-gray-200' : 'border-gray-100'}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-xs text-indigo-600 font-bold">{ticket.id}</span>
            <TypeBadge type={ticket.type} />
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
            {sla && <SLABadge status={sla} />}
            {isClosed && (
              <span className="flex items-center gap-1 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-medium">
                <Lock size={10} /> Locked
              </span>
            )}
            {ticket.isKnownError && (
              <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded font-medium">Known Error</span>
            )}
          </div>
          <h2 className="text-base font-semibold text-gray-900 leading-snug">{ticket.title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Raised by <span className="text-gray-600">{ticket.requester}</span> · {formatRelative(ticket.createdAt)}
            {ticket.resolvedAt && (
              <span> · Resolved {formatRelative(ticket.resolvedAt)}</span>
            )}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={18} /></button>
      </div>

      {/* Closed banner */}
      {isClosed && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 border-b border-gray-200 text-xs text-gray-600">
          <Lock size={13} className="text-gray-500" />
          This ticket is <strong>closed and locked</strong>. No changes can be made.
        </div>
      )}

      {/* Resolved reopen hint */}
      {isResolved && (
        <div className="flex items-center gap-2 px-5 py-2 bg-green-50 border-b border-green-100 text-xs text-green-700">
          <AlertCircle size={13} />
          Resolved — change status to <strong>Open</strong> or <strong>In Progress</strong> to reopen this ticket.
        </div>
      )}

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left: details */}
          <div className="lg:w-72 flex-shrink-0 border-r border-gray-100 p-4 space-y-4">

            <Section title="Status">
              {isClosed ? (
                <div className="text-xs rounded-lg px-3 py-2 bg-gray-100 text-gray-500 border border-gray-200 font-medium flex items-center gap-1.5">
                  <Lock size={11} /> Closed — cannot be changed
                </div>
              ) : (
                <select
                  value={ticket.status}
                  onChange={e => handleStatusChange(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {statusOptions.map(s => <option key={s}>{s}</option>)}
                </select>
              )}
            </Section>

            <Section title="Priority">
              <select
                value={ticket.priority}
                disabled={isClosed}
                onChange={e => actions.updateTicket(ticket.id, { priority: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </Section>

            <Section title="Assignee">
              <select
                value={ticket.assignee || ''}
                disabled={isClosed}
                onChange={e => actions.updateTicket(ticket.id, { assignee: e.target.value || null })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value="">Unassigned</option>
                {state.agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.role})</option>)}
              </select>
              {assignee && (
                <div className="flex items-center gap-2 mt-2">
                  <Avatar name={assignee.name} size="sm" />
                  <div className="text-xs">
                    <div className="text-gray-700 font-medium">{assignee.name}</div>
                    <div className="text-gray-400">{assignee.team}</div>
                  </div>
                </div>
              )}
            </Section>

            {/* SLA */}
            {ticket.slaDue && (
              <Section title="SLA Due">
                <div className={`text-xs rounded-lg px-3 py-2 border font-medium ${SLA_COLORS[sla] || 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                  {formatFull(ticket.slaDue)}
                  {sla === 'breached' && ' — BREACHED'}
                  {sla === 'at_risk'  && ' — AT RISK'}
                  {sla === 'on_track' && ' — On Track'}
                </div>
              </Section>
            )}

            {/* Approval */}
            {ticket.approvalStatus && !isClosed && (
              <Section title="Approval">
                <div className="flex gap-2">
                  <button onClick={() => actions.approveTicket(ticket.id)} className="flex-1 text-xs py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors font-medium">Approve</button>
                  <button onClick={() => actions.rejectTicket(ticket.id)} className="flex-1 text-xs py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors font-medium">Reject</button>
                </div>
                <div className="mt-1 text-xs text-gray-500">Current: <StatusBadge status={ticket.approvalStatus} /></div>
              </Section>
            )}

            <Section title="Description">
              <p className="text-xs text-gray-600 leading-relaxed">{ticket.description}</p>
            </Section>

            {ticket.tags?.length > 0 && (
              <Section title="Tags">
                <div className="flex flex-wrap gap-1">
                  {ticket.tags.map(tag => (
                    <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </Section>
            )}

            {ticket.affectedAsset && (
              <Section title="Affected Asset">
                <span className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">{ticket.affectedAsset}</span>
              </Section>
            )}

            {ticket.type === 'Change Request' && (
              <>
                <Section title="Change Type"><span className="text-xs text-gray-700">{ticket.changeType}</span></Section>
                <Section title="Risk Level"><span className="text-xs text-gray-700">{ticket.riskLevel}</span></Section>
                {ticket.scheduledStart && <Section title="Scheduled Window"><span className="text-xs text-gray-600">{formatFull(ticket.scheduledStart)} → {formatFull(ticket.scheduledEnd)}</span></Section>}
                {ticket.implementationPlan && <Section title="Implementation Plan"><p className="text-xs text-gray-600 leading-relaxed">{ticket.implementationPlan}</p></Section>}
                {ticket.rollbackPlan && <Section title="Rollback Plan"><p className="text-xs text-gray-600 leading-relaxed">{ticket.rollbackPlan}</p></Section>}
              </>
            )}

            {ticket.type === 'Problem' && (
              <>
                {ticket.rootCause && <Section title="Root Cause"><p className="text-xs text-gray-600 leading-relaxed">{ticket.rootCause}</p></Section>}
                {ticket.workaround && <Section title="Workaround"><p className="text-xs text-gray-600 leading-relaxed">{ticket.workaround}</p></Section>}
                <Section title="Known Error"><span className={`text-xs font-medium ${ticket.isKnownError ? 'text-orange-600' : 'text-gray-500'}`}>{ticket.isKnownError ? 'Yes — Known Error DB' : 'No'}</span></Section>
              </>
            )}

            {/* Close ticket button — only for active tickets */}
            {!isClosed && !isResolved && (
              <button
                onClick={() => actions.updateTicket(ticket.id, { status: 'Closed' })}
                className="w-full py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                Close Ticket
              </button>
            )}
          </div>

          {/* Right: activity stream */}
          <div className="flex-1 min-w-0 flex flex-col p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Activity</h3>
            <div className="flex-1 space-y-3 overflow-y-auto mb-4">
              <ActivityItem
                icon={<AlertCircle size={13} className="text-indigo-500" />}
                author="System"
                body={`Ticket ${ticket.id} created by ${ticket.requester}`}
                time={ticket.createdAt}
                internal={false}
              />
              {(ticket.comments || []).map(c => (
                <ActivityItem
                  key={c.id}
                  icon={c.type === 'internal' ? <Lock size={13} className="text-amber-500" /> : <MessageSquare size={13} className="text-blue-500" />}
                  author={agentMap[c.author]?.name || c.author}
                  body={c.body}
                  time={c.createdAt}
                  internal={c.type === 'internal'}
                />
              ))}
            </div>

            {/* Comment input — disabled for closed tickets */}
            {isClosed ? (
              <div className="border-t border-gray-100 pt-3 flex items-center gap-2 text-xs text-gray-400">
                <Lock size={13} /> Comments are disabled on closed tickets.
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-3">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setCommentType('public')}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${commentType === 'public' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <MessageSquare size={11} className="inline mr-1" />Public Reply
                  </button>
                  <button
                    onClick={() => setCommentType('internal')}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${commentType === 'internal' ? 'bg-amber-100 text-amber-700' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Lock size={11} className="inline mr-1" />Internal Note
                  </button>
                </div>
                <textarea
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 placeholder-gray-400"
                  placeholder={commentType === 'internal' ? 'Add an internal note…' : 'Add a public reply…'}
                  rows={3}
                  value={commentBody}
                  onChange={e => setCommentBody(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={!commentBody.trim()}
                    className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {commentType === 'internal' ? 'Add Note' : 'Send Reply'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolution modal */}
      {showResolutionModal && (
        <Modal title="Send Resolution Notification?" onClose={() => setShowResolutionModal(false)} size="sm">
          <p className="text-sm text-gray-600 mb-6">
            Would you like to send a resolution notification to <strong>{ticket.requester}</strong>?
          </p>
          <div className="flex gap-3">
            <button onClick={() => handleResolve(true)} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Yes, notify requester
            </button>
            <button onClick={() => handleResolve(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              No, just resolve
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{title}</div>
      {children}
    </div>
  );
}

function ActivityItem({ icon, author, body, time, internal }) {
  return (
    <div className={`flex gap-3 p-3 rounded-lg ${internal ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50 border border-gray-100'}`}>
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-gray-700">{author}</span>
          {internal && <span className="text-[10px] text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded font-medium">Internal</span>}
          <span className="text-[11px] text-gray-400 ml-auto" title={formatFull(time)}>{formatRelative(time)}</span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
