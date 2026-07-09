import { useState } from 'react';
import { Briefcase, Search, Plus, FileText, BookOpen, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { formatRelative } from '../../utils/dateUtils';

const STEPS = ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'];
const STEP_IDX = Object.fromEntries(STEPS.map((s, i) => [s, i]));

export function SelfServicePortal() {
  const { state, actions } = useApp();
  const [tab, setTab] = useState('submit');
  const [search, setSearch] = useState('');

  const currentUser = state.agents.find(a => a.id === state.currentUserId);
  const myName = currentUser?.name ?? '';
  const myTickets = state.tickets.filter(t => t.requester === myName);
  const kbResults = search
    ? state.kbArticles.filter(a => a.status === 'Published' && (a.title.toLowerCase().includes(search.toLowerCase()) || a.tags.some(t => t.includes(search.toLowerCase()))))
    : state.kbArticles.filter(a => a.status === 'Published').slice(0, 4);

  return (
    <div className="min-h-full bg-gradient-to-br from-indigo-50 to-white">
      {/* Portal header */}
      <div className="bg-indigo-700 text-white px-8 py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
            <Briefcase size={20} className="text-indigo-600" />
          </div>
          <div>
            <div className="text-xl font-bold"><span className="font-light text-indigo-300">suit</span><span className="font-extrabold">CASE</span> Self-Service Portal</div>
            <div className="text-indigo-300 text-sm">Every case. Suited.</div>
          </div>
        </div>
        <p className="text-indigo-200 text-sm mt-4 max-w-xl">Submit requests, track your tickets, search the knowledge base, and browse the service catalog — all in one place.</p>
        <div className="mt-6">
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" />
            <input
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-300 focus:outline-none focus:bg-white/20 text-sm"
              placeholder="Search knowledge base…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 py-4 bg-white border-b border-gray-100 flex gap-6">
        {[
          { id: 'submit', label: 'Submit a Request', icon: Plus },
          { id: 'mytickets', label: `My Tickets (${myTickets.length})`, icon: FileText },
          { id: 'catalog', label: 'Service Catalog', icon: ChevronRight },
          { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 text-sm font-medium pb-2 border-b-2 transition-colors ${tab === id ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
          >
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      <div className="px-8 py-6 max-w-4xl">
        {/* Submit request tab */}
        {tab === 'submit' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Submit a New Request</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Report an Incident', desc: 'Something is broken or not working correctly', icon: '🚨', type: 'Incident' },
                { title: 'Service Request', desc: 'Request new hardware, software, or access', icon: '📋', type: 'Service Request' },
                { title: 'Password Reset', desc: 'Account locked or need to reset your password', icon: '🔑', type: 'Service Request' },
                { title: 'Report a Problem', desc: 'Recurring issue or systemic failure', icon: '⚠️', type: 'Problem' },
              ].map(item => (
                <button
                  key={item.title}
                  onClick={() => actions.setView('create')}
                  className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left"
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.desc}</div>
                  <div className="mt-3 text-xs text-indigo-600 font-medium flex items-center gap-1">Get started <ChevronRight size={12} /></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* My tickets tab */}
        {tab === 'mytickets' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">My Tickets</h2>
            {myTickets.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">🎉</div>
                <p>No active tickets for you in suitCASE right now — great work!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myTickets.map(ticket => {
                  const statusIdx = STEP_IDX[ticket.status] ?? 0;
                  return (
                    <div key={ticket.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-indigo-600 font-bold">{ticket.id}</span>
                            <PriorityBadge priority={ticket.priority} />
                          </div>
                          <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">Submitted {formatRelative(ticket.createdAt)}</p>
                        </div>
                        <StatusBadge status={ticket.status} />
                      </div>
                      {/* Progress tracker */}
                      <div className="flex items-center gap-1">
                        {STEPS.map((step, i) => (
                          <div key={step} className="flex items-center flex-1">
                            <div className={`flex-1 flex flex-col items-center gap-1`}>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${i <= statusIdx ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                                {i < statusIdx ? '✓' : i + 1}
                              </div>
                              <span className={`text-[9px] font-medium text-center ${i <= statusIdx ? 'text-indigo-600' : 'text-gray-400'}`}>{step}</span>
                            </div>
                            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mb-3 ${i < statusIdx ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Service catalog */}
        {tab === 'catalog' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Service Catalog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.catalogItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => actions.setView('catalog')}
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left"
                >
                  <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.description.slice(0, 80)}…</div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span>⏱ {item.estimatedTime}</span>
                    {item.requiresApproval && <span className="text-amber-600">Approval needed</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* KB search */}
        {tab === 'kb' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Knowledge Base</h2>
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Search knowledge base…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              {kbResults.map(article => (
                <div key={article.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="font-medium text-gray-900 text-sm mb-1">{article.title}</div>
                  <div className="text-xs text-gray-500">{article.category}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
              {kbResults.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">No articles found matching "{search}"</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
