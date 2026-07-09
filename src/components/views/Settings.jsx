import { useState } from 'react';
import { Settings as SettingsIcon, Clock, Bell, Palette, AlertCircle, ShieldCheck, Plus, Trash2, UserPlus, X, Tag } from 'lucide-react';
import { useApp, getUserPermissions } from '../../context/AppContext';
import { NAV_SECTIONS, STATUS_COLOR_OPTIONS } from '../../data/sampleData';
import { Avatar } from '../ui/Badge';

const SLA_DEFAULTS = [
  { priority: 'Critical', hours: 1,  color: 'text-red-600' },
  { priority: 'High',     hours: 4,  color: 'text-orange-600' },
  { priority: 'Medium',   hours: 8,  color: 'text-yellow-600' },
  { priority: 'Low',      hours: 24, color: 'text-blue-600' },
];

// ── Case Statuses sub-component ───────────────────────────────────────────────

function CaseStatuses() {
  const { state, actions } = useApp();
  const { caseStatuses } = state;
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('blue');
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState('blue');

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    actions.addCaseStatus({
      id: `cs${Date.now()}`,
      label: newLabel.trim(),
      color: newColor,
      protected: false,
    });
    setNewLabel('');
    setNewColor('blue');
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditLabel(s.label);
    setEditColor(s.color);
  };

  const saveEdit = () => {
    if (editLabel.trim()) {
      actions.updateCaseStatus(editingId, { label: editLabel.trim(), color: editColor });
    }
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Case Statuses</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Define the statuses available on tickets. Changes apply immediately.
          <br />
          <span className="text-xs text-amber-600">Resolved and Closed are system-protected — their labels and colours can be edited but they cannot be deleted.</span>
        </p>
      </div>

      {/* Status list */}
      <div className="divide-y divide-gray-50">
        {caseStatuses.map((s, i) => {
          const colorOpt = STATUS_COLOR_OPTIONS.find(c => c.key === s.color) || STATUS_COLOR_OPTIONS[0];
          const isEditing = editingId === s.id;

          return (
            <div key={s.id} className="flex items-center gap-3 px-6 py-3">
              {/* Drag handle placeholder (visual) */}
              <span className="text-gray-300 select-none cursor-grab text-sm">⠿</span>

              {isEditing ? (
                <>
                  <input
                    autoFocus
                    className="flex-1 text-sm border border-indigo-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                  />
                  <ColorPicker value={editColor} onChange={setEditColor} />
                  <button onClick={saveEdit} className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50">Cancel</button>
                </>
              ) : (
                <>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium flex-shrink-0 ${colorOpt.cls}`}>
                    {s.label}
                  </span>
                  {s.protected && (
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-medium">protected</span>
                  )}
                  <span className="flex-1" />
                  <button
                    onClick={() => startEdit(s)}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    disabled={s.protected}
                    onClick={() => actions.deleteCaseStatus(s.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={s.protected ? 'System status — cannot be deleted' : 'Delete status'}
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Add new status */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
        <input
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
          placeholder="New status name…"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <ColorPicker value={newColor} onChange={setNewColor} />
        <button
          onClick={handleAdd}
          disabled={!newLabel.trim()}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40"
        >
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex gap-1 flex-wrap max-w-48">
      {STATUS_COLOR_OPTIONS.map(opt => (
        <button
          key={opt.key}
          type="button"
          title={opt.label}
          onClick={() => onChange(opt.key)}
          className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${value === opt.key ? 'border-gray-800 scale-110' : 'border-transparent'}`}
          style={{ background: getSwatchBg(opt.key) }}
        />
      ))}
    </div>
  );
}

function getSwatchBg(key) {
  const map = {
    blue: '#93c5fd', indigo: '#a5b4fc', purple: '#c4b5fd', pink: '#f9a8d4',
    red: '#fca5a5', orange: '#fdba74', yellow: '#fde047', green: '#86efac',
    teal: '#5eead4', gray: '#d1d5db', dark: '#374151',
  };
  return map[key] || '#d1d5db';
}

// ── Access Control sub-component ──────────────────────────────────────────────

function AccessControl() {
  const { state, actions } = useApp();
  const { groups, agents } = state;
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || null);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  // Agents not in the selected group
  const unassignedAgents = selectedGroup
    ? agents.filter(a => !selectedGroup.memberIds.includes(a.id))
    : [];

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const id = `g${Date.now()}`;
    actions.createGroup({
      id,
      name: newGroupName.trim(),
      memberIds: [],
      permissions: {
        dashboard: false, tickets: true, create: true, catalog: true,
        changes: false, problems: false, knowledge: true, assets: false,
        portal: true, automation: false, reports: false, agents: false, settings: false,
      },
    });
    setNewGroupName('');
    setSelectedGroupId(id);
  };

  const handleDeleteGroup = (id) => {
    const next = groups.find(g => g.id !== id);
    actions.deleteGroup(id);
    setSelectedGroupId(next?.id || null);
  };

  const handleRenameSubmit = () => {
    if (draftName.trim() && selectedGroup) {
      actions.updateGroup(selectedGroupId, { name: draftName.trim() });
    }
    setEditingName(false);
  };

  return (
    <div className="flex gap-4 h-full min-h-96">
      {/* Left: group list */}
      <div className="w-52 flex-shrink-0 flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Groups</div>
        <div className="flex-1 space-y-1">
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => { setSelectedGroupId(group.id); setEditingName(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between gap-2 ${
                selectedGroupId === group.id
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-white border border-gray-100 text-gray-700 hover:border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              <span className="truncate">{group.name}</span>
              <span className={`text-xs flex-shrink-0 px-1.5 py-0.5 rounded-full font-medium ${
                selectedGroupId === group.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {group.memberIds.length}
              </span>
            </button>
          ))}
        </div>

        {/* Create group */}
        <div className="flex gap-1 mt-2">
          <input
            className="flex-1 min-w-0 text-xs border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="New group name…"
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateGroup()}
          />
          <button
            onClick={handleCreateGroup}
            disabled={!newGroupName.trim()}
            className="px-2 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Right: group details */}
      {selectedGroup ? (
        <div className="flex-1 min-w-0 space-y-5">
          {/* Group header */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              {editingName ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    autoFocus
                    className="flex-1 text-sm font-semibold border border-indigo-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={draftName}
                    onChange={e => setDraftName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') setEditingName(false); }}
                  />
                  <button onClick={handleRenameSubmit} className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
                  <button onClick={() => setEditingName(false)} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">Cancel</button>
                </div>
              ) : (
                <button
                  className="text-base font-bold text-gray-900 hover:text-indigo-600 transition-colors text-left"
                  onClick={() => { setDraftName(selectedGroup.name); setEditingName(true); }}
                  title="Click to rename"
                >
                  {selectedGroup.name}
                </button>
              )}
              <button
                onClick={() => handleDeleteGroup(selectedGroupId)}
                className="text-xs flex items-center gap-1 text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 px-2 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>

          {/* Members */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Members</div>
            <div className="space-y-2 mb-3">
              {selectedGroup.memberIds.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No members in this group.</p>
              ) : (
                selectedGroup.memberIds.map(uid => {
                  const agent = agents.find(a => a.id === uid);
                  if (!agent) return null;
                  return (
                    <div key={uid} className="flex items-center gap-2.5 py-1">
                      <Avatar name={agent.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800">{agent.name}</div>
                        <div className="text-xs text-gray-400">{agent.role} · {agent.email}</div>
                      </div>
                      <button
                        onClick={() => actions.removeMemberFromGroup(selectedGroupId, uid)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add member */}
            {unassignedAgents.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1"><UserPlus size={11} />Add member</div>
                <div className="flex flex-wrap gap-1.5">
                  {unassignedAgents.map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => actions.addMemberToGroup(selectedGroupId, agent.id)}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      <Avatar name={agent.name} size="sm" />
                      {agent.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Section Access</div>
              <p className="text-xs text-gray-400 mt-0.5">Tick the sections members of <strong>{selectedGroup.name}</strong> can see.</p>
            </div>
            <div className="divide-y divide-gray-50">
              {NAV_SECTIONS.map(section => {
                const checked = selectedGroup.permissions[section.id] !== false;
                return (
                  <label
                    key={section.id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <span className="text-sm text-gray-700">{section.label}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => actions.setGroupPermission(selectedGroupId, section.id, e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Select a group or create a new one.
        </div>
      )}
    </div>
  );
}

// ── Main Settings component ───────────────────────────────────────────────────

export function Settings() {
  const { state, actions } = useApp();
  const [retentionDays, setRetentionDays] = useState(state.resolvedRetentionDays);
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    actions.setResolvedRetention(Number(retentionDays));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs = [
    { id: 'general',       label: 'General',        icon: SettingsIcon },
    { id: 'statuses',      label: 'Case Statuses',  icon: Tag },
    { id: 'access',        label: 'Access Control',  icon: ShieldCheck },
    { id: 'sla',           label: 'SLA Policies',    icon: Clock },
    { id: 'notifications', label: 'Notifications',   icon: Bell },
    { id: 'appearance',    label: 'Appearance',      icon: Palette },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Configure suitCASE to match your team's workflows</p>
      </div>

      <div className="flex gap-6">
        {/* Tab nav */}
        <div className="w-44 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={15} />{label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-3xl">

          {activeTab === 'general' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-5">
              <h2 className="text-base font-semibold text-gray-900">General Settings</h2>
              <Setting label="Organisation Name" description="Displayed in suitCASE headers and emails">
                <input defaultValue="Acme Corporation" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
              </Setting>
              <Setting label="Helpdesk Email" description="Where ticket notifications are sent from">
                <input defaultValue="helpdesk@acme.com" type="email" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
              </Setting>
              <Setting label="Timezone" description="Used for SLA calculations and timestamps">
                <select defaultValue="Europe/London" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                  <option>Europe/London (UTC+0)</option>
                  <option>America/New_York (UTC-5)</option>
                  <option>America/Los_Angeles (UTC-8)</option>
                  <option>Asia/Singapore (UTC+8)</option>
                </select>
              </Setting>
              <Setting label="Resolved case retention" description="How many days a Resolved ticket stays visible in the queue before it is automatically closed and locked.">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={retentionDays}
                    onChange={e => setRetentionDays(e.target.value)}
                    className="w-24 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <span className="text-sm text-gray-500">days</span>
                  <span className="text-xs text-gray-400">(currently {state.resolvedRetentionDays}d — save to apply)</span>
                </div>
              </Setting>
            </div>
          )}

          {activeTab === 'statuses' && <CaseStatuses />}

          {activeTab === 'access' && <AccessControl />}

          {activeTab === 'sla' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-5">
              <h2 className="text-base font-semibold text-gray-900">SLA Policies</h2>
              <p className="text-sm text-gray-500">Define response time targets by priority. SLA timers pause in "Pending" state.</p>
              <div className="space-y-3">
                {SLA_DEFAULTS.map(({ priority, hours, color }) => (
                  <div key={priority} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className={`w-24 font-semibold text-sm ${color}`}>{priority}</div>
                    <div className="flex items-center gap-2 flex-1">
                      <input type="number" defaultValue={hours} min={1} max={168} className="w-20 text-sm border border-gray-200 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                      <span className="text-sm text-gray-500">hours</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {hours >= 24 ? `${hours / 24}d` : `${hours}h`} target
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700">
                <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                Changes apply to new tickets only.
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Notification Preferences</h2>
              {[
                { label: 'Ticket assigned to me',           defaultOn: true  },
                { label: 'SLA at risk (< 20% remaining)',   defaultOn: true  },
                { label: 'SLA breached',                    defaultOn: true  },
                { label: 'New comment on my ticket',        defaultOn: true  },
                { label: 'Approval required',               defaultOn: true  },
                { label: 'Ticket resolved',                 defaultOn: false },
                { label: 'Daily digest email',              defaultOn: false },
              ].map(({ label, defaultOn }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-700">{label}</span>
                  <input type="checkbox" defaultChecked={defaultOn} className="w-4 h-4 accent-indigo-600 cursor-pointer" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Appearance</h2>
              <Setting label="Theme" description="Light or dark mode">
                <div className="flex gap-3">
                  <button onClick={() => state.darkMode && actions.toggleDarkMode()} className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${!state.darkMode ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>☀️ Light</button>
                  <button onClick={() => !state.darkMode && actions.toggleDarkMode()} className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${state.darkMode ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>🌙 Dark</button>
                </div>
              </Setting>
              <Setting label="Sidebar density">
                <select defaultValue="comfortable" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                  <option>Compact</option><option>Comfortable</option><option>Spacious</option>
                </select>
              </Setting>
            </div>
          )}

          {activeTab !== 'access' && activeTab !== 'statuses' && (
            <>
              {saved && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  ✅ suitCASE: Settings saved successfully.
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button onClick={handleSave} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Setting({ label, description, children }) {
  return (
    <div>
      <div className="text-sm font-semibold text-gray-700 mb-0.5">{label}</div>
      {description && <div className="text-xs text-gray-400 mb-2">{description}</div>}
      {children}
    </div>
  );
}
