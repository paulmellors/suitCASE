import { useState } from 'react';
import { Plus, Search, Database } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';

const TYPES = ['All', 'Laptop', 'Server', 'Network Device', 'Software License', 'Mobile'];
const STATUSES = ['All', 'In Use', 'Available', 'Retired'];

const STATUS_COLORS = {
  'In Use': 'bg-green-100 text-green-700',
  Available: 'bg-blue-100 text-blue-700',
  Retired: 'bg-gray-100 text-gray-500',
};

export function Assets() {
  const { state, actions } = useApp();
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', type: 'Laptop', status: 'Available', assignedTo: '', location: '', serial: '', purchaseDate: '' });

  const filtered = state.assets.filter(a => {
    if (typeFilter !== 'All' && a.type !== typeFilter) return false;
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.id.toLowerCase().includes(search.toLowerCase()) && !(a.serial || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    total: state.assets.length,
    inUse: state.assets.filter(a => a.status === 'In Use').length,
    available: state.assets.filter(a => a.status === 'Available').length,
    retired: state.assets.filter(a => a.status === 'Retired').length,
  };

  const handleCreateAsset = () => {
    if (!newAsset.name.trim()) return;
    actions.createAsset({
      ...newAsset,
      id: `AST-${String(state.assets.length + 1).padStart(3, '0')}`,
    });
    setShowCreate(false);
    setNewAsset({ name: '', type: 'Laptop', status: 'Available', assignedTo: '', location: '', serial: '', purchaseDate: '' });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Assets / CMDB</h1>
          <p className="text-sm text-gray-500">{state.assets.length} assets registered in suitCASE</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={14} /> Add Asset
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Assets', value: counts.total, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'In Use', value: counts.inUse, color: 'text-green-600 bg-green-50' },
          { label: 'Available', value: counts.available, color: 'text-blue-600 bg-blue-50' },
          { label: 'Retired', value: counts.retired, color: 'text-gray-500 bg-gray-50' },
        ].map(m => (
          <div key={m.label} className={`rounded-xl p-4 ${m.color} border border-current/10`}>
            <div className="text-2xl font-bold">{m.value}</div>
            <div className="text-xs font-medium mt-0.5 opacity-80">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full pl-8 pr-4 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Search by name, ID, serial…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Asset table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Database size={36} className="mx-auto mb-3 text-gray-300" />
            <p>No assets found in suitCASE matching your search.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Asset ID', 'Name', 'Type', 'Status', 'Assigned To', 'Location', 'Serial', 'Purchase Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset, i) => (
                <tr key={asset.id} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-semibold">{asset.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{asset.name}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{asset.type}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[asset.status] || 'bg-gray-100 text-gray-500'}`}>{asset.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{asset.assignedTo || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{asset.location}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{asset.serial}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{asset.purchaseDate || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create asset modal */}
      {showCreate && (
        <Modal title="Register New Asset" onClose={() => setShowCreate(false)} size="md">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Asset Name *', key: 'name', placeholder: 'e.g., MacBook Pro 14"' },
              { label: 'Serial Number', key: 'serial', placeholder: 'e.g., C02XY1234M1' },
              { label: 'Assigned To', key: 'assignedTo', placeholder: 'Full name or department' },
              { label: 'Location', key: 'location', placeholder: 'e.g., HQ Floor 2' },
              { label: 'Purchase Date', key: 'purchaseDate', placeholder: '', type: 'date' },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key} className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                <input type={type || 'text'} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder={placeholder} value={newAsset[key]} onChange={e => setNewAsset(a => ({ ...a, [key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type</label>
              <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" value={newAsset.type} onChange={e => setNewAsset(a => ({ ...a, type: e.target.value }))}>
                {TYPES.filter(t => t !== 'All').map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
              <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" value={newAsset.status} onChange={e => setNewAsset(a => ({ ...a, status: e.target.value }))}>
                {STATUSES.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button onClick={handleCreateAsset} disabled={!newAsset.name.trim()} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40">
              Register Asset
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
