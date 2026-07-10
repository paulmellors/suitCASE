import { useState } from 'react';
import { Briefcase, Search, Plus, FileText, BookOpen, ChevronRight, Clock, ThumbsUp, ThumbsDown, Eye, CheckCircle, AlertCircle, Laptop, Package, KeyRound, Shield, UserPlus, Smartphone, Monitor, Cloud } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { formatRelative } from '../../utils/dateUtils';

const STEPS = ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'];
const STEP_IDX = Object.fromEntries(STEPS.map((s, i) => [s, i]));
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const INCIDENT_TYPES = [
  { title: 'Report an Incident', desc: 'Something is broken or not working correctly', icon: '🚨', type: 'Incident' },
  { title: 'Service Request', desc: 'Request new hardware, software, or access', icon: '📋', type: 'Service Request' },
  { title: 'Password Reset', desc: 'Account locked or need to reset your password', icon: '🔑', type: 'Service Request' },
  { title: 'Report a Problem', desc: 'Recurring issue or systemic failure', icon: '⚠️', type: 'Problem' },
];
const ICON_MAP = { Laptop, Package, KeyRound, Shield, UserPlus, Smartphone, Monitor, Cloud };
const CAT_COLORS = {
  Hardware: 'bg-blue-100 text-blue-700', Software: 'bg-purple-100 text-purple-700',
  Access: 'bg-green-100 text-green-700', Network: 'bg-amber-100 text-amber-700',
  'HR IT': 'bg-pink-100 text-pink-700', Facilities: 'bg-teal-100 text-teal-700',
};
const STATUS_COLORS = { Published: 'bg-green-100 text-green-700', Draft: 'bg-amber-100 text-amber-700', Archived: 'bg-gray-100 text-gray-500' };

function inputCls(error) {
  return `w-full text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 transition-colors ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200'}`;
}

export function SelfServicePortal() {
  const { state, actions } = useApp();
  const [tab, setTab] = useState('submit');
  const [search, setSearch] = useState('');

  // Submit request modal state
  const [submitItem, setSubmitItem] = useState(null); // { title, type, icon }
  const [submitForm, setSubmitForm] = useState({ title: '', description: '', priority: 'Medium' });
  const [submitErrors, setSubmitErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Catalog modal state
  const [catalogItem, setCatalogItem] = useState(null);
  const [catalogNotes, setCatalogNotes] = useState('');
  const [catalogSuccess, setCatalogSuccess] = useState(null);

  // KB article modal state
  const [kbArticle, setKbArticle] = useState(null);
  const [votedIds, setVotedIds] = useState({});

  const currentUser = state.agents.find(a => a.id === state.currentUserId);
  const myName = currentUser?.name ?? '';
  const myTickets = state.tickets.filter(t => t.requester === myName);

  const kbResults = search
    ? state.kbArticles.filter(a => a.status === 'Published' && (a.title.toLowerCase().includes(search.toLowerCase()) || a.tags.some(t => t.includes(search.toLowerCase()))))
    : state.kbArticles.filter(a => a.status === 'Published').slice(0, 6);

  const handleOpenSubmit = (item) => {
    setSubmitItem(item);
    setSubmitForm({ title: '', description: '', priority: 'Medium' });
    setSubmitErrors({});
  };

  const handleSubmitTicket = () => {
    const errors = {};
    if (!submitForm.title.trim()) errors.title = 'Required';
    if (!submitForm.description.trim()) errors.description = 'Required';
    if (Object.keys(errors).length) { setSubmitErrors(errors); return; }

    actions.createTicket({
      type: submitItem.type,
      title: submitForm.title,
      description: submitForm.description,
      priority: submitForm.priority,
      category: submitItem.type,
      requester: myName,
      assignee: '',
      tags: [],
      status: 'Open',
      approvalStatus: submitItem.type === 'Service Request' ? 'Not Required' : undefined,
    }, { stayOnPortal: true });

    setSubmitSuccess(submitForm.title);
    setSubmitItem(null);
    setTab('mytickets');
  };

  const handleCatalogRequest = () => {
    if (!catalogItem) return;
    actions.createTicket({
      type: 'Service Request',
      title: catalogItem.name,
      description: `${catalogItem.description}${catalogNotes ? '\n\nAdditional notes: ' + catalogNotes : ''}`,
      category: 'Service Request',
      priority: 'Medium',
      requester: myName,
      assignee: '',
      tags: [catalogItem.category.toLowerCase()],
      approvalStatus: catalogItem.requiresApproval ? 'Awaiting Approval' : 'Not Required',
    }, { stayOnPortal: true });

    setCatalogSuccess(catalogItem.name);
    setCatalogItem(null);
    setCatalogNotes('');
    setTab('mytickets');
  };

  const handleKbOpen = (article) => {
    actions.kbView(article.id);
    setKbArticle(article.id);
  };

  const handleVote = (id, vote) => {
    if (votedIds[id]) return;
    actions.kbVote(id, vote);
    setVotedIds(prev => ({ ...prev, [id]: vote }));
  };

  const selectedKbArticle = kbArticle ? state.kbArticles.find(a => a.id === kbArticle) : null;

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
              onChange={e => { setSearch(e.target.value); if (e.target.value) setTab('kb'); }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 py-4 bg-white border-b border-gray-100 flex gap-6">
        {[
          { id: 'submit', label: 'Submit a Request', icon: Plus },
          { id: 'mytickets', label: `My Tickets (${myTickets.length})`, icon: FileText },
          { id: 'catalog', label: 'Service Catalog', icon: Package },
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
            {submitSuccess && (
              <div className="mb-4 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                <CheckCircle size={16} />
                Your request "<strong>{submitSuccess}</strong>" has been submitted. <button className="underline ml-1" onClick={() => setSubmitSuccess(null)}>Dismiss</button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INCIDENT_TYPES.map(item => (
                <button
                  key={item.title}
                  onClick={() => handleOpenSubmit(item)}
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
                            <div className="flex-1 flex flex-col items-center gap-1">
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

        {/* Service catalog tab */}
        {tab === 'catalog' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Service Catalog</h2>
            {catalogSuccess && (
              <div className="mb-4 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                <CheckCircle size={16} />
                Service request for "<strong>{catalogSuccess}</strong>" submitted. <button className="underline ml-1" onClick={() => setCatalogSuccess(null)}>Dismiss</button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.catalogItems.map(item => {
                const Icon = ICON_MAP[item.icon] || Package;
                return (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm">{item.name}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${CAT_COLORS[item.category] || 'bg-gray-100 text-gray-600'}`}>{item.category}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={11} />{item.estimatedTime}
                        {item.requiresApproval && <span className="ml-2 text-amber-600">· Approval needed</span>}
                      </div>
                      <button
                        onClick={() => { setCatalogItem(item); setCatalogNotes(''); }}
                        className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                      >
                        Request
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* KB tab */}
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
                <button
                  key={article.id}
                  onClick={() => handleKbOpen(article)}
                  className="w-full bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left"
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="font-medium text-gray-900 text-sm">{article.title}</div>
                    <Eye size={13} className="text-gray-300 flex-shrink-0 mt-0.5" />
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{article.category}</div>
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">{tag}</span>
                    ))}
                  </div>
                </button>
              ))}
              {kbResults.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">No articles found matching "{search}"</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Submit request modal */}
      {submitItem && (
        <Modal title={`${submitItem.icon} ${submitItem.title}`} onClose={() => setSubmitItem(null)} size="md">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
              <input
                className={inputCls(submitErrors.title)}
                placeholder="Brief summary of your issue or request"
                value={submitForm.title}
                onChange={e => setSubmitForm(f => ({ ...f, title: e.target.value }))}
              />
              {submitErrors.title && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{submitErrors.title}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description *</label>
              <textarea
                className={`${inputCls(submitErrors.description)} resize-none`}
                rows={4}
                placeholder="Describe the issue in detail — what happened, when, and any steps to reproduce…"
                value={submitForm.description}
                onChange={e => setSubmitForm(f => ({ ...f, description: e.target.value }))}
              />
              {submitErrors.description && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{submitErrors.description}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Priority</label>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSubmitForm(f => ({ ...f, priority: p }))}
                    className={`flex-1 text-xs py-2 rounded-lg border font-medium transition-colors ${submitForm.priority === p ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300 bg-white'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">
              Submitting as <strong>{myName}</strong>
            </div>
            <button
              onClick={handleSubmitTicket}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Submit Request
            </button>
          </div>
        </Modal>
      )}

      {/* Catalog request modal */}
      {catalogItem && (
        <Modal title={`Request: ${catalogItem.name}`} onClose={() => setCatalogItem(null)} size="sm">
          <div className="space-y-4">
            <div className="p-3 bg-indigo-50 rounded-lg text-sm text-indigo-700">
              <strong>Estimated fulfillment:</strong> {catalogItem.estimatedTime}
              {catalogItem.requiresApproval && <div className="mt-1 text-amber-600">⚠️ Manager approval required</div>}
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">
              Submitting as <strong>{myName}</strong>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Additional Notes</label>
              <textarea
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Any specific requirements or additional context…"
                rows={3}
                value={catalogNotes}
                onChange={e => setCatalogNotes(e.target.value)}
              />
            </div>
            <button
              onClick={handleCatalogRequest}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Submit Request
            </button>
          </div>
        </Modal>
      )}

      {/* KB article modal */}
      {selectedKbArticle && (
        <Modal title={selectedKbArticle.title} onClose={() => setKbArticle(null)} size="lg">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[selectedKbArticle.status]}`}>{selectedKbArticle.status}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{selectedKbArticle.category}</span>
              <span className="text-xs text-gray-400 flex items-center gap-1"><Eye size={11} />{selectedKbArticle.views} views</span>
              <span className="text-xs text-gray-400">Written {formatRelative(selectedKbArticle.createdAt)}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedKbArticle.tags.map(tag => (
                <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">{tag}</span>
              ))}
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-mono">
              {selectedKbArticle.content}
            </div>
            <div className="border-t border-gray-100 pt-4">
              {votedIds[selectedKbArticle.id] ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Thanks for your feedback!</span>
                  <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium"><ThumbsUp size={15} />{selectedKbArticle.helpful}</span>
                  <span className="flex items-center gap-1.5 text-sm text-red-400"><ThumbsDown size={15} />{selectedKbArticle.notHelpful}</span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 font-medium">Was this article helpful?</span>
                  <button
                    onClick={() => handleVote(selectedKbArticle.id, 'helpful')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    <ThumbsUp size={15} /> Yes <span className="text-green-500">({selectedKbArticle.helpful})</span>
                  </button>
                  <button
                    onClick={() => handleVote(selectedKbArticle.id, 'notHelpful')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <ThumbsDown size={15} /> No <span className="text-red-400">({selectedKbArticle.notHelpful})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
