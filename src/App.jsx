import { useApp, getUserPermissions } from './context/AppContext';
import { Login } from './components/views/Login';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Dashboard } from './components/views/Dashboard';
import { TicketList } from './components/views/TicketList';
import { CreateTicket } from './components/views/CreateTicket';
import { ServiceCatalog } from './components/views/ServiceCatalog';
import { ChangeManagement } from './components/views/ChangeManagement';
import { ProblemManagement } from './components/views/ProblemManagement';
import { KnowledgeBase } from './components/views/KnowledgeBase';
import { Assets } from './components/views/Assets';
import { SelfServicePortal } from './components/views/SelfServicePortal';
import { Automation } from './components/views/Automation';
import { Reports } from './components/views/Reports';
import { AgentsTeams } from './components/views/AgentsTeams';
import { Settings } from './components/views/Settings';

const VIEWS = {
  dashboard: Dashboard,
  tickets: TicketList,
  create: CreateTicket,
  catalog: ServiceCatalog,
  changes: ChangeManagement,
  problems: ProblemManagement,
  knowledge: KnowledgeBase,
  assets: Assets,
  portal: SelfServicePortal,
  automation: Automation,
  reports: Reports,
  agents: AgentsTeams,
  settings: Settings,
};

const VIEW_LABELS = {
  dashboard: 'Dashboard', tickets: 'All Tickets', create: 'New Ticket',
  catalog: 'Service Catalog', changes: 'Change Management',
  problems: 'Problem Management', knowledge: 'Knowledge Base',
  assets: 'Assets / CMDB', portal: 'Self-Service Portal',
  automation: 'Automation', reports: 'Reports',
  agents: 'Agents & Teams', settings: 'Settings',
};

function Breadcrumb({ view }) {
  return (
    <div className="px-6 py-2 border-b border-gray-100 bg-white flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
      <span className="text-indigo-500 font-semibold">suitCASE</span>
      <span>/</span>
      <span className="text-gray-600 font-medium">{VIEW_LABELS[view] || view}</span>
    </div>
  );
}

function AccessDenied() {
  const { actions } = useApp();
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-12">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
      <p className="text-gray-500 mb-6 max-w-sm">You don't have permission to view this section in suitCASE. Contact your administrator.</p>
      <button onClick={() => actions.setView('dashboard')} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
        Back to Dashboard
      </button>
    </div>
  );
}

export default function App() {
  const { state } = useApp();

  if (!state.isAuthenticated) {
    return <Login />;
  }

  const perms = getUserPermissions(state.currentUserId, state.groups);
  const hasAccess = perms[state.view] !== false;

  const View = hasAccess ? (VIEWS[state.view] || Dashboard) : AccessDenied;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <Breadcrumb view={state.view} />
        <main className="flex-1 overflow-y-auto min-h-0">
          <View />
        </main>
      </div>
    </div>
  );
}
