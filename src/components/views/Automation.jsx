import { useState } from 'react';
import { Zap, ToggleLeft, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';

export function Automation() {
  const { state, actions } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', trigger: '', action: '' });

  const handleCreate = () => {
    if (!newRule.name.trim() || !newRule.trigger.trim() || !newRule.action.trim()) return;
    actions.createAutomationRule(newRule);
    setShowCreate(false);
    setNewRule({ name: '', trigger: '', action: '' });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Automation Rules</h1>
          <p className="text-sm text-gray-500">{state.automationRules.filter(r => r.enabled).length} active rules</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={14} /> Create Rule
        </button>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 text-sm text-indigo-700">
        <div className="flex items-center gap-2 font-semibold mb-1"><Zap size={15} /> Automation Engine</div>
        Automation rules run continuously in suitCASE to enforce SLA compliance and routing policies. Toggle rules on/off without deleting them.
      </div>

      <div className="space-y-3">
        {state.automationRules.map(rule => (
          <div key={rule.id} className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${rule.enabled ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${rule.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <h3 className="font-semibold text-gray-900 text-sm">{rule.name}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-1">Trigger</div>
                    <p className="text-xs text-amber-800 font-mono">{rule.trigger}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="text-[10px] font-semibold text-green-600 uppercase tracking-wide mb-1">Action</div>
                    <p className="text-xs text-green-800 font-mono">{rule.action}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => actions.toggleAutomation(rule.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  rule.enabled
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {rule.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <Modal title="Create Automation Rule" onClose={() => setShowCreate(false)} size="sm">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Rule Name *</label>
              <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="e.g., VIP ticket escalation" value={newRule.name} onChange={e => setNewRule(r => ({ ...r, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Trigger Condition *</label>
              <textarea className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 font-mono" rows={2} placeholder="e.g., Priority = Critical AND unassigned for > 15 min" value={newRule.trigger} onChange={e => setNewRule(r => ({ ...r, trigger: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Action *</label>
              <textarea className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 font-mono" rows={2} placeholder="e.g., Assign to Tier 2 + Send email to manager" value={newRule.action} onChange={e => setNewRule(r => ({ ...r, action: e.target.value }))} />
            </div>
            <button onClick={handleCreate} disabled={!newRule.name.trim() || !newRule.trigger.trim() || !newRule.action.trim()} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40">
              Create Rule
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
