import { createContext, useContext, useReducer, useCallback, useEffect, useState, useRef } from 'react';
import { initDatabase, saveStateToDatabase } from '../db/database';
import { generateId, addHours } from '../utils/dateUtils';

// Derive a user's permissions from the groups they belong to
export function getUserPermissions(userId, groups) {
  const group = groups.find(g => g.memberIds.includes(userId));
  return group ? group.permissions : {};
}

const SLA_HOURS = { Critical: 1, High: 4, Medium: 8, Low: 24 };
const TYPE_PREFIX = {
  'Incident': 'INC', 'Service Request': 'REQ',
  'Change Request': 'CHG', 'Problem': 'PRB'
};

const emptyState = {
  tickets: [], assets: [], kbArticles: [], catalogItems: [],
  automationRules: [], notifications: [], agents: [], teams: [],
  groups: [], caseStatuses: [], resolvedRetentionDays: 3,
  isAuthenticated: false, currentUserId: null, darkMode: false,
  view: 'dashboard', selectedTicketId: null,
  ticketListFilters: { status: '', priority: '', category: '', assignee: '', search: '' },
  ticketListPage: 1,
};

function reducer(state, action) {
  switch (action.type) {

    case 'HYDRATE':
      return { ...state, ...action.payload };

    case 'LOGIN': {
      const perms = getUserPermissions(action.payload, state.groups);
      const defaultView =
        perms.dashboard !== false ? 'dashboard' :
        perms.tickets   !== false ? 'tickets'   : 'portal';
      return {
        ...state,
        isAuthenticated: true,
        currentUserId: action.payload,
        view: defaultView,
        selectedTicketId: null,
      };
    }

    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        currentUserId: null,
        view: 'dashboard',
        selectedTicketId: null,
      };

    case 'SET_VIEW':
      return { ...state, view: action.payload, selectedTicketId: null };

    case 'SELECT_TICKET':
      return { ...state, selectedTicketId: action.payload };

    case 'CLOSE_TICKET_PANEL':
      return { ...state, selectedTicketId: null };

    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };

    case 'SET_FILTERS':
      return { ...state, ticketListFilters: { ...state.ticketListFilters, ...action.payload }, ticketListPage: 1 };

    case 'SET_PAGE':
      return { ...state, ticketListPage: action.payload };

    case 'SET_RESOLVED_RETENTION':
      return { ...state, resolvedRetentionDays: action.payload };

    case 'ADD_CASE_STATUS':
      return { ...state, caseStatuses: [...state.caseStatuses, action.payload] };

    case 'UPDATE_CASE_STATUS':
      return {
        ...state,
        caseStatuses: state.caseStatuses.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        ),
      };

    case 'DELETE_CASE_STATUS':
      return {
        ...state,
        caseStatuses: state.caseStatuses.filter(s => s.id !== action.payload),
      };

    // ── Group management ──────────────────────────────────────────────────────

    case 'CREATE_GROUP':
      return { ...state, groups: [...state.groups, action.payload] };

    case 'UPDATE_GROUP': {
      const { id, updates } = action.payload;
      return {
        ...state,
        groups: state.groups.map(g => g.id === id ? { ...g, ...updates } : g),
      };
    }

    case 'DELETE_GROUP':
      return { ...state, groups: state.groups.filter(g => g.id !== action.payload) };

    case 'SET_GROUP_PERMISSION': {
      const { groupId, section, value } = action.payload;
      return {
        ...state,
        groups: state.groups.map(g =>
          g.id === groupId
            ? { ...g, permissions: { ...g.permissions, [section]: value } }
            : g
        ),
      };
    }

    case 'ADD_MEMBER_TO_GROUP': {
      const { groupId, userId } = action.payload;
      const groupsWithoutUser = state.groups.map(g => ({
        ...g,
        memberIds: g.memberIds.filter(id => id !== userId),
      }));
      return {
        ...state,
        groups: groupsWithoutUser.map(g =>
          g.id === groupId ? { ...g, memberIds: [...g.memberIds, userId] } : g
        ),
      };
    }

    case 'REMOVE_MEMBER_FROM_GROUP': {
      const { groupId, userId } = action.payload;
      return {
        ...state,
        groups: state.groups.map(g =>
          g.id === groupId
            ? { ...g, memberIds: g.memberIds.filter(id => id !== userId) }
            : g
        ),
      };
    }

    // ── Tickets ───────────────────────────────────────────────────────────────

    case 'CREATE_TICKET': {
      const { ticket } = action.payload;
      const prefix = TYPE_PREFIX[ticket.type] || 'INC';
      const existingIds = state.tickets.map(t => t.id);
      const id = generateId(prefix, existingIds);
      const now = new Date();
      const slaDue = addHours(now, SLA_HOURS[ticket.priority] || 8);
      const newTicket = {
        ...ticket,
        id,
        createdAt: now,
        slaDue: ticket.type === 'Change Request' || ticket.type === 'Problem' ? null : slaDue,
        comments: [],
        slaPaused: false,
        linkedProblems: [],
        linkedChanges: [],
        affectedAsset: null,
      };
      const notification = {
        id: `n${Date.now()}`,
        type: 'assignment',
        message: `suitCASE: ${id} has been created and assigned to you`,
        read: false,
        createdAt: now,
        ticketId: id,
      };
      return {
        ...state,
        tickets: [newTicket, ...state.tickets],
        notifications: [notification, ...state.notifications],
        selectedTicketId: id,
        view: 'tickets',
      };
    }

    case 'UPDATE_TICKET': {
      const { id, updates } = action.payload;
      return {
        ...state,
        tickets: state.tickets.map(t => {
          if (t.id !== id) return t;
          const resolvedAt =
            updates.status === 'Resolved' && t.status !== 'Resolved'
              ? new Date()
              : updates.status && updates.status !== 'Resolved'
                ? null
                : t.resolvedAt;
          return { ...t, ...updates, resolvedAt };
        }),
      };
    }

    case 'ADD_COMMENT': {
      const { ticketId, comment } = action.payload;
      const notification = {
        id: `n${Date.now()}`,
        type: 'comment',
        message: `suitCASE: New ${comment.type === 'internal' ? 'internal note' : 'comment'} on ${ticketId}`,
        read: false,
        createdAt: new Date(),
        ticketId,
      };
      return {
        ...state,
        tickets: state.tickets.map(t =>
          t.id === ticketId
            ? { ...t, comments: [...(t.comments || []), { ...comment, id: `c${Date.now()}`, createdAt: new Date() }] }
            : t
        ),
        notifications: [notification, ...state.notifications],
      };
    }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    case 'TOGGLE_AUTOMATION':
      return {
        ...state,
        automationRules: state.automationRules.map(r =>
          r.id === action.payload ? { ...r, enabled: !r.enabled } : r
        ),
      };

    case 'CREATE_AUTOMATION_RULE':
      return {
        ...state,
        automationRules: [...state.automationRules, { ...action.payload, id: `auto-${Date.now()}`, enabled: true }],
      };

    case 'KB_VOTE': {
      const { articleId, vote } = action.payload;
      return {
        ...state,
        kbArticles: state.kbArticles.map(a =>
          a.id === articleId
            ? { ...a, [vote === 'helpful' ? 'helpful' : 'notHelpful']: a[vote === 'helpful' ? 'helpful' : 'notHelpful'] + 1, views: a.views + 1 }
            : a
        ),
      };
    }

    case 'KB_VIEW':
      return {
        ...state,
        kbArticles: state.kbArticles.map(a =>
          a.id === action.payload ? { ...a, views: a.views + 1 } : a
        ),
      };

    case 'CREATE_KB_ARTICLE':
      return { ...state, kbArticles: [action.payload, ...state.kbArticles] };

    case 'CREATE_ASSET':
      return { ...state, assets: [...state.assets, action.payload] };

    case 'UPDATE_ASSET': {
      const { id, updates } = action.payload;
      return {
        ...state,
        assets: state.assets.map(a => a.id === id ? { ...a, ...updates } : a),
      };
    }

    case 'APPROVE_TICKET': {
      const notification = {
        id: `n${Date.now()}`,
        type: 'resolved',
        message: `suitCASE: ${action.payload} has been approved`,
        read: false,
        createdAt: new Date(),
        ticketId: action.payload,
      };
      return {
        ...state,
        tickets: state.tickets.map(t =>
          t.id === action.payload ? { ...t, approvalStatus: 'Approved', status: 'In Progress' } : t
        ),
        notifications: [notification, ...state.notifications],
      };
    }

    case 'REJECT_TICKET':
      return {
        ...state,
        tickets: state.tickets.map(t =>
          t.id === action.payload ? { ...t, approvalStatus: 'Rejected', status: 'Closed' } : t
        ),
      };

    default:
      return state;
  }
}

const AppContext = createContext(null);

// Tracks which state slices need DB persistence (excludes pure UI state)
const DB_DEPS = s => [
  s.tickets, s.assets, s.kbArticles, s.notifications,
  s.agents, s.teams, s.groups, s.catalogItems,
  s.automationRules, s.caseStatuses, s.resolvedRetentionDays,
];

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, emptyState);
  const [dbReady, setDbReady] = useState(false);
  const [serverError, setServerError] = useState(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    initDatabase()
      .then(initialState => {
        dispatch({ type: 'HYDRATE', payload: initialState });
        setDbReady(true);
      })
      .catch(err => {
        console.error('Server connection failed:', err);
        setServerError('Cannot reach the suitCASE API. Is the server running?');
        setDbReady(true);
      });
  }, []);

  useEffect(() => {
    if (!dbReady || serverError) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveStateToDatabase(state), 500);
  }, [dbReady, serverError, ...DB_DEPS(state)]); // eslint-disable-line react-hooks/exhaustive-deps

  // All hooks must be declared before any conditional return
  const actions = {
    login:  useCallback((id) => dispatch({ type: 'LOGIN',  payload: id }), []),
    logout: useCallback(()   => dispatch({ type: 'LOGOUT' }),              []),

    setView:          useCallback((v)    => dispatch({ type: 'SET_VIEW',          payload: v }),    []),
    selectTicket:     useCallback((id)   => dispatch({ type: 'SELECT_TICKET',     payload: id }),   []),
    closeTicketPanel: useCallback(()     => dispatch({ type: 'CLOSE_TICKET_PANEL' }),               []),
    setFilters:       useCallback((f)    => dispatch({ type: 'SET_FILTERS',       payload: f }),    []),
    setPage:                 useCallback((p) => dispatch({ type: 'SET_PAGE',              payload: p }), []),
    setResolvedRetention:  useCallback((n)         => dispatch({ type: 'SET_RESOLVED_RETENTION', payload: n }),                  []),
    addCaseStatus:         useCallback((s)         => dispatch({ type: 'ADD_CASE_STATUS',         payload: s }),                  []),
    updateCaseStatus:      useCallback((id, updates) => dispatch({ type: 'UPDATE_CASE_STATUS',    payload: { id, updates } }),     []),
    deleteCaseStatus:      useCallback((id)         => dispatch({ type: 'DELETE_CASE_STATUS',      payload: id }),                 []),

    // Groups
    createGroup:           useCallback((group)              => dispatch({ type: 'CREATE_GROUP',           payload: group }),                            []),
    updateGroup:           useCallback((id, updates)        => dispatch({ type: 'UPDATE_GROUP',           payload: { id, updates } }),                  []),
    deleteGroup:           useCallback((id)                 => dispatch({ type: 'DELETE_GROUP',           payload: id }),                               []),
    setGroupPermission:    useCallback((groupId, section, value) => dispatch({ type: 'SET_GROUP_PERMISSION', payload: { groupId, section, value } }),   []),
    addMemberToGroup:      useCallback((groupId, userId)    => dispatch({ type: 'ADD_MEMBER_TO_GROUP',    payload: { groupId, userId } }),              []),
    removeMemberFromGroup: useCallback((groupId, userId)    => dispatch({ type: 'REMOVE_MEMBER_FROM_GROUP', payload: { groupId, userId } }),            []),

    // Tickets
    createTicket:  useCallback((ticket)          => dispatch({ type: 'CREATE_TICKET',  payload: { ticket } }),          []),
    updateTicket:  useCallback((id, updates)     => dispatch({ type: 'UPDATE_TICKET',  payload: { id, updates } }),     []),
    addComment:    useCallback((ticketId, comment) => dispatch({ type: 'ADD_COMMENT',  payload: { ticketId, comment } }), []),
    approveTicket: useCallback((id)              => dispatch({ type: 'APPROVE_TICKET', payload: id }),                  []),
    rejectTicket:  useCallback((id)              => dispatch({ type: 'REJECT_TICKET',  payload: id }),                  []),

    // Notifications
    markNotificationRead:     useCallback((id) => dispatch({ type: 'MARK_NOTIFICATION_READ',     payload: id }), []),
    markAllNotificationsRead: useCallback(()   => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' }),              []),
    clearNotifications:       useCallback(()   => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),                      []),

    // Automation
    toggleAutomation:    useCallback((id)   => dispatch({ type: 'TOGGLE_AUTOMATION',    payload: id }),     []),
    createAutomationRule: useCallback((rule) => dispatch({ type: 'CREATE_AUTOMATION_RULE', payload: rule }), []),

    // KB
    kbVote:           useCallback((articleId, vote) => dispatch({ type: 'KB_VOTE',           payload: { articleId, vote } }), []),
    kbView:           useCallback((articleId)       => dispatch({ type: 'KB_VIEW',           payload: articleId }),           []),
    createKbArticle:  useCallback((article)         => dispatch({ type: 'CREATE_KB_ARTICLE', payload: article }),             []),

    // Assets
    createAsset: useCallback((asset)          => dispatch({ type: 'CREATE_ASSET', payload: asset }),             []),
    updateAsset: useCallback((id, updates)    => dispatch({ type: 'UPDATE_ASSET', payload: { id, updates } }),   []),

    toggleDarkMode: useCallback(() => dispatch({ type: 'TOGGLE_DARK_MODE' }), []),
  };

  if (!dbReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Connecting to server…</p>
        </div>
      </div>
    );
  }

  if (serverError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Server unavailable</h2>
          <p className="text-sm text-gray-500 mb-4">{serverError}</p>
          <p className="text-xs text-gray-400 font-mono">npm run dev</p>
        </div>
      </div>
    );
  }

  return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
