import { useState } from 'react';
import { Laptop, Package, KeyRound, Shield, UserPlus, Smartphone, Monitor, Cloud, Search, Clock, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';

const ICON_MAP = { Laptop, Package, KeyRound, Shield, UserPlus, Smartphone, Monitor, Cloud };
const CATEGORIES = ['All', 'Hardware', 'Software', 'Access', 'Network', 'HR IT', 'Facilities'];

const CAT_COLORS = {
  Hardware: 'bg-blue-100 text-blue-700',
  Software: 'bg-purple-100 text-purple-700',
  Access: 'bg-green-100 text-green-700',
  Network: 'bg-amber-100 text-amber-700',
  'HR IT': 'bg-pink-100 text-pink-700',
  Facilities: 'bg-teal-100 text-teal-700',
};

export function ServiceCatalog() {
  const { state, actions } = useApp();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [requester, setRequester] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(null);

  const items = state.catalogItems.filter(item => {
    if (category !== 'All' && item.category !== category) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSubmitRequest = () => {
    if (!requester.trim() || !selectedItem) return;
    actions.createTicket({
      type: 'Service Request',
      title: selectedItem.name,
      description: `${selectedItem.description}${notes ? '\n\nAdditional notes: ' + notes : ''}`,
      category: 'Service Request',
      priority: 'Medium',
      requester,
      assignee: '',
      tags: [selectedItem.category.toLowerCase()],
      approvalStatus: selectedItem.requiresApproval ? 'Awaiting Approval' : 'Not Required',
    });
    setSuccess(selectedItem.name);
    setSelectedItem(null);
    setRequester('');
    setNotes('');
    setTimeout(() => setSuccess(null), 4000);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Service Catalog</h1>
        <p className="text-sm text-gray-500">Browse and request IT services from suitCASE</p>
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <CheckCircle size={16} />
          suitCASE: Service request for <strong>{success}</strong> submitted successfully!
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="pl-8 pr-4 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Search catalog…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${category === c ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(item => {
          const Icon = ICON_MAP[item.icon] || Package;
          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm">{item.name}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${CAT_COLORS[item.category] || 'bg-gray-100 text-gray-600'}`}>
                    {item.category}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed flex-1">{item.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={11} />{item.estimatedTime}
                </div>
                <div className="flex items-center gap-3">
                  {item.requiresApproval && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Approval needed</span>
                  )}
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Request
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p>No catalog items found in suitCASE matching your search.</p>
        </div>
      )}

      {/* Request modal */}
      {selectedItem && (
        <Modal title={`Request: ${selectedItem.name}`} onClose={() => setSelectedItem(null)} size="sm">
          <div className="space-y-4">
            <div className="p-3 bg-indigo-50 rounded-lg text-sm text-indigo-700">
              <strong>Estimated fulfillment:</strong> {selectedItem.estimatedTime}
              {selectedItem.requiresApproval && <div className="mt-1 text-amber-600">⚠️ Manager approval required</div>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Your Name *</label>
              <input
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter your full name"
                value={requester}
                onChange={e => setRequester(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Additional Notes</label>
              <textarea
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Any specific requirements or additional context…"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
            <button
              onClick={handleSubmitRequest}
              disabled={!requester.trim()}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40"
            >
              Submit Request
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
