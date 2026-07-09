import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Badge';
import { Users, Ticket } from 'lucide-react';

const ROLE_COLORS = { Admin: 'bg-purple-100 text-purple-700', Manager: 'bg-blue-100 text-blue-700', Agent: 'bg-green-100 text-green-700' };

export function AgentsTeams() {
  const { state } = useApp();
  const { agents, teams, tickets } = state;

  const agentStats = agents.map(agent => ({
    ...agent,
    open: tickets.filter(t => t.assignee === agent.id && !['Resolved', 'Closed'].includes(t.status)).length,
    resolved: tickets.filter(t => t.assignee === agent.id && ['Resolved', 'Closed'].includes(t.status)).length,
    total: tickets.filter(t => t.assignee === agent.id).length,
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Agents & Teams</h1>
        <p className="text-sm text-gray-500">{agents.length} agents across {teams.length} teams</p>
      </div>

      {/* Agent cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Users size={15} />All Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agentStats.map(agent => (
            <div key={agent.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <Avatar name={agent.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm">{agent.name}</div>
                  <div className="text-xs text-gray-400">{agent.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[agent.role]}`}>{agent.role}</span>
                    <span className="text-xs text-gray-400">{agent.team}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-indigo-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-indigo-700">{agent.open}</div>
                  <div className="text-[10px] text-indigo-500">Open</div>
                </div>
                <div className="bg-green-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-green-700">{agent.resolved}</div>
                  <div className="text-[10px] text-green-500">Resolved</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-gray-700">{agent.total}</div>
                  <div className="text-[10px] text-gray-500">Total</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workload view */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Ticket size={15} />Workload Distribution</h2>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="space-y-3">
            {agentStats.map(agent => {
              const pct = agent.total > 0 ? (agent.open / Math.max(...agentStats.map(a => a.open), 1)) * 100 : 0;
              return (
                <div key={agent.id} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-44 flex-shrink-0">
                    <Avatar name={agent.name} size="sm" />
                    <span className="text-sm text-gray-700 truncate">{agent.name.split(' ')[0]}</span>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-8 text-right">{agent.open}</span>
                  <span className="text-xs text-gray-400 w-16">open tickets</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Teams */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Users size={15} />Teams</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teams.map(team => {
            const teamAgents = team.agents.map(id => agents.find(a => a.id === id)).filter(Boolean);
            return (
              <div key={team.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">{team.name}</h3>
                <div className="space-y-2">
                  {teamAgents.map(agent => (
                    <div key={agent.id} className="flex items-center gap-2">
                      <Avatar name={agent.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-700 truncate">{agent.name}</div>
                        <div className="text-[10px] text-gray-400">{agent.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
