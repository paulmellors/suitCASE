import { Briefcase, LayoutDashboard, Ticket, Plus, BookOpen, Layers, AlertTriangle, Database, User, Zap, BarChart2, Settings, Globe } from 'lucide-react';
import { useApp, getUserPermissions } from '../../context/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',          icon: LayoutDashboard },
  { id: 'tickets',    label: 'All Tickets',         icon: Ticket },
  { id: 'create',     label: 'New Ticket',          icon: Plus },
  { id: 'catalog',    label: 'Service Catalog',     icon: Layers },
  { id: 'changes',    label: 'Change Management',   icon: BarChart2 },
  { id: 'problems',   label: 'Problem Management',  icon: AlertTriangle },
  { id: 'knowledge',  label: 'Knowledge Base',      icon: BookOpen },
  { id: 'assets',     label: 'Assets / CMDB',       icon: Database },
  { id: 'portal',     label: 'Self-Service Portal', icon: Globe },
  { id: 'automation', label: 'Automation',          icon: Zap },
  { id: 'reports',    label: 'Reports',             icon: BarChart2 },
  { id: 'agents',     label: 'Agents & Teams',      icon: User },
  { id: 'settings',   label: 'Settings',            icon: Settings },
];

export function Sidebar() {
  const { state, actions } = useApp();
  const perms = getUserPermissions(state.currentUserId, state.groups);
  const visibleItems = NAV_ITEMS.filter(item => perms[item.id] !== false);

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-indigo-700 text-white h-full">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5 border-b border-indigo-600">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          <Briefcase size={18} className="text-indigo-600" />
        </div>
        <div className="leading-tight">
          <div className="text-lg font-bold tracking-tight">
            <span className="font-light text-indigo-200">suit</span>
            <span className="text-white font-extrabold">CASE</span>
          </div>
          <div className="text-indigo-300 text-[10px] leading-tight">Every case. Suited.</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {visibleItems.map(({ id, label, icon: Icon }) => {
          const active = state.view === id;
          return (
            <button
              key={id}
              onClick={() => actions.setView(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                active
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span>{label}</span>
              {id === 'create' && (
                <span className="ml-auto bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">+</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-indigo-600 text-indigo-300 text-[10px]">
        © 2026 suitCASE — ITSM Helpdesk
      </div>
    </aside>
  );
}
