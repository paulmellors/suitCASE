import { useState } from 'react';
import { Search, ThumbsUp, ThumbsDown, Eye, Plus, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRelative } from '../../utils/dateUtils';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Badge';

const CATEGORIES = ['All', 'Access & Identity', 'Network & VPN', 'Security', 'Service Requests', 'Collaboration Tools', 'Email & Calendar', 'Data & Storage', 'Onboarding'];
const STATUSES = ['All', 'Published', 'Draft', 'Archived'];
const STATUS_COLORS = { Published: 'bg-green-100 text-green-700', Draft: 'bg-amber-100 text-amber-700', Archived: 'bg-gray-100 text-gray-500' };

export function KnowledgeBase() {
  const { state, actions } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Published');
  // Store ID only so the modal always reads live data from state
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [votedIds, setVotedIds] = useState({});          // track per-session votes to prevent double-voting
  const [newArticle, setNewArticle] = useState({ title: '', category: 'Access & Identity', content: '', tags: '', status: 'Published' });

  const agentMap = Object.fromEntries(state.agents.map(a => [a.id, a]));

  // Live lookup — always fresh from state
  const selectedArticle = selectedArticleId
    ? state.kbArticles.find(a => a.id === selectedArticleId)
    : null;

  const filtered = state.kbArticles
    .filter(a => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (category !== 'All' && a.category !== category) return false;
      if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.tags.some(t => t.includes(search.toLowerCase()))) return false;
      return true;
    })
    // Sort by most helpful votes descending
    .sort((a, b) => b.helpful - a.helpful);

  const handleOpen = (article) => {
    actions.kbView(article.id);
    setSelectedArticleId(article.id);
  };

  const handleVote = (id, vote) => {
    if (votedIds[id]) return;               // already voted on this article this session
    actions.kbVote(id, vote);
    setVotedIds(prev => ({ ...prev, [id]: vote }));
  };

  const handleCreateArticle = () => {
    if (!newArticle.title.trim()) return;
    actions.createKbArticle({
      id: `KB-${String(state.kbArticles.length + 1).padStart(3, '0')}`,
      ...newArticle,
      tags: newArticle.tags ? newArticle.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      author: state.currentUserId || 'a1',
      views: 0,
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date(),
    });
    setShowCreate(false);
    setNewArticle({ title: '', category: 'Access & Identity', content: '', tags: '', status: 'Published' });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-sm text-gray-500">{filtered.length} articles · sorted by most helpful</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={14} /> New Article
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-8 pr-4 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Search articles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white" value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Articles grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
          <p>No articles found in suitCASE matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((article, idx) => {
            const author = agentMap[article.author];
            const total = article.helpful + article.notHelpful;
            const pct = total > 0 ? Math.round((article.helpful / total) * 100) : null;
            return (
              <button
                key={article.id}
                onClick={() => handleOpen(article)}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Popularity rank */}
                    <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      idx === 0 ? 'bg-yellow-400 text-white' :
                      idx === 1 ? 'bg-gray-300 text-gray-700' :
                      idx === 2 ? 'bg-orange-300 text-white' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug">{article.title}</h3>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[article.status]}`}>
                    {article.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {article.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">{tag}</span>
                  ))}
                </div>
                {/* Helpfulness bar */}
                {pct !== null && (
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span className="text-green-600 font-medium">{pct}% helpful</span>
                      <span>{total} vote{total !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {author && (
                    <div className="flex items-center gap-1.5">
                      <Avatar name={author.name} size="sm" />
                      <span>{author.name.split(' ')[0]}</span>
                    </div>
                  )}
                  <span className="flex items-center gap-1"><Eye size={11} />{article.views}</span>
                  <span className="flex items-center gap-1 text-green-600 font-medium"><ThumbsUp size={11} />{article.helpful}</span>
                  <span className="flex items-center gap-1 text-red-400"><ThumbsDown size={11} />{article.notHelpful}</span>
                  <span className="ml-auto text-gray-300">{article.category}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Article viewer modal — reads live from state via selectedArticle */}
      {selectedArticle && (
        <Modal title={selectedArticle.title} onClose={() => setSelectedArticleId(null)} size="lg">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[selectedArticle.status]}`}>{selectedArticle.status}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{selectedArticle.category}</span>
              <span className="text-xs text-gray-400 flex items-center gap-1"><Eye size={11} />{selectedArticle.views} views</span>
              <span className="text-xs text-gray-400">Written {formatRelative(selectedArticle.createdAt)}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedArticle.tags.map(tag => (
                <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">{tag}</span>
              ))}
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-mono">
              {selectedArticle.content}
            </div>

            {/* Voting */}
            <div className="border-t border-gray-100 pt-4">
              {votedIds[selectedArticle.id] ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Thanks for your feedback!</span>
                  <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium"><ThumbsUp size={15} />{selectedArticle.helpful}</span>
                  <span className="flex items-center gap-1.5 text-sm text-red-400"><ThumbsDown size={15} />{selectedArticle.notHelpful}</span>
                  {(() => {
                    const total = selectedArticle.helpful + selectedArticle.notHelpful;
                    const pct = total > 0 ? Math.round((selectedArticle.helpful / total) * 100) : 0;
                    return (
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{pct}% helpful</span>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 font-medium">Was this article helpful?</span>
                  <button
                    onClick={() => handleVote(selectedArticle.id, 'helpful')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    <ThumbsUp size={15} /> Yes &nbsp;<span className="text-green-500">({selectedArticle.helpful})</span>
                  </button>
                  <button
                    onClick={() => handleVote(selectedArticle.id, 'notHelpful')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <ThumbsDown size={15} /> No &nbsp;<span className="text-red-400">({selectedArticle.notHelpful})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Create article modal */}
      {showCreate && (
        <Modal title="New Knowledge Base Article" onClose={() => setShowCreate(false)} size="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
              <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Article title" value={newArticle.title} onChange={e => setNewArticle(a => ({ ...a, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" value={newArticle.category} onChange={e => setNewArticle(a => ({ ...a, category: e.target.value }))}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" value={newArticle.status} onChange={e => setNewArticle(a => ({ ...a, status: e.target.value }))}>
                  <option>Draft</option><option>Published</option><option>Archived</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Content</label>
              <textarea className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 font-mono" rows={10} placeholder="Write your article content here…" value={newArticle.content} onChange={e => setNewArticle(a => ({ ...a, content: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tags</label>
              <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="vpn, password, access (comma-separated)" value={newArticle.tags} onChange={e => setNewArticle(a => ({ ...a, tags: e.target.value }))} />
            </div>
            <button onClick={handleCreateArticle} disabled={!newArticle.title.trim()} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40">
              Publish Article
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
