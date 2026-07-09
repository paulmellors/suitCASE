import { useState, useRef, useEffect } from 'react';
import { Bell, Sun, Moon, Search, X, Check, ChevronDown, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Badge';
import { formatRelative } from '../../utils/dateUtils';

const ROLE_COLORS = { Admin: 'text-purple-600', Manager: 'text-blue-600', Agent: 'text-green-600' };

export function TopBar() {
  const { state, actions } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const userMenuRef = useRef(null);

  const currentUser = state.agents.find(a => a.id === state.currentUserId) || state.agents[0];
  const unread = state.notifications.filter(n => !n.read).length;

  const notifIcons = {
    assignment: '👤',
    sla_risk: '⚠️',
    sla_breach: '🔴',
    comment: '💬',
    approval: '✅',
    resolved: '🎉',
  };

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      actions.setFilters({ search: globalSearch.trim() });
      actions.setView('tickets');
      setGlobalSearch('');
    }
  };

  return (
    <header className="h-14 flex items-center gap-4 px-6 bg-white border-b border-gray-100 flex-shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
          placeholder="Search tickets, assets, KB… (Enter)"
          value={globalSearch}
          onChange={e => setGlobalSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        {globalSearch && (
          <button onClick={() => setGlobalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={12} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Dark mode toggle */}
        <button
          onClick={actions.toggleDarkMode}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          title={state.darkMode ? 'Light mode' : 'Dark mode'}
        >
          {state.darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(s => !s); setShowUserMenu(false); }}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors relative"
          >
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="font-semibold text-gray-900 text-sm">Notifications</span>
                <div className="flex gap-2">
                  <button onClick={actions.markAllNotificationsRead} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                    <Check size={12} /> Mark all read
                  </button>
                  <button onClick={() => { actions.clearNotifications(); setShowNotifs(false); }} className="text-xs text-gray-400 hover:underline">
                    Clear all
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {state.notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">No notifications</div>
                ) : (
                  state.notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => {
                        actions.markNotificationRead(n.id);
                        if (n.ticketId) { actions.selectTicket(n.ticketId); actions.setView('tickets'); }
                        setShowNotifs(false);
                      }}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-indigo-50' : ''}`}
                    >
                      <div className="flex gap-3 items-start">
                        <span className="text-base mt-0.5">{notifIcons[n.type] || '📢'}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-snug ${!n.read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                            {n.message}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{formatRelative(n.createdAt)}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative pl-2 border-l border-gray-200" ref={userMenuRef}>
          <button
            onClick={() => { setShowUserMenu(s => !s); setShowNotifs(false); }}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
          >
            <Avatar name={currentUser.name} size="sm" />
            <div className="leading-tight text-left">
              <div className="text-xs font-medium text-gray-800">{currentUser.name}</div>
              <div className={`text-[10px] font-medium ${ROLE_COLORS[currentUser.role] || 'text-gray-400'}`}>{currentUser.role}</div>
            </div>
            <ChevronDown size={13} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              {/* Profile */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-2">Signed in as</div>
                <div className="flex items-center gap-2.5">
                  <Avatar name={currentUser.name} size="md" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{currentUser.name}</div>
                    <div className="text-xs text-gray-400">{currentUser.email}</div>
                    <div className={`text-xs font-medium ${ROLE_COLORS[currentUser.role]}`}>{currentUser.role} · {currentUser.team}</div>
                  </div>
                </div>
              </div>

              {/* Sign out */}
              <div className="p-2">
                <button
                  onClick={() => { setShowUserMenu(false); actions.logout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut size={14} className="text-gray-400" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
