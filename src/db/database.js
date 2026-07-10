// All persistence is handled by the Express API (server/index.js).
// This module is a thin client that fetches and saves state over HTTP.

const API = '/api';

function toIso(d) {
  if (!d) return null;
  return typeof d === 'string' ? d : d.toISOString();
}

function fromIso(s) {
  return s ? new Date(s) : null;
}

// Serialize Date objects before sending over JSON
function serializeState(state) {
  return {
    ...state,
    tickets: (state.tickets || []).map(t => ({
      ...t,
      createdAt: toIso(t.createdAt),
      slaDue: toIso(t.slaDue),
      resolvedAt: toIso(t.resolvedAt),
      scheduledStart: toIso(t.scheduledStart),
      scheduledEnd: toIso(t.scheduledEnd),
      comments: (t.comments || []).map(c => ({ ...c, createdAt: toIso(c.createdAt) })),
    })),
    kbArticles: (state.kbArticles || []).map(a => ({ ...a, createdAt: toIso(a.createdAt) })),
    notifications: (state.notifications || []).map(n => ({ ...n, createdAt: toIso(n.createdAt) })),
  };
}

// Deserialize ISO strings back to Date objects after receiving from API
function deserializeState(data) {
  return {
    ...data,
    tickets: (data.tickets || []).map(t => ({
      ...t,
      createdAt: fromIso(t.createdAt),
      slaDue: fromIso(t.slaDue),
      resolvedAt: fromIso(t.resolvedAt),
      scheduledStart: fromIso(t.scheduledStart),
      scheduledEnd: fromIso(t.scheduledEnd),
      comments: (t.comments || []).map(c => ({ ...c, createdAt: fromIso(c.createdAt) })),
    })),
    kbArticles: (data.kbArticles || []).map(a => ({ ...a, createdAt: fromIso(a.createdAt) })),
    notifications: (data.notifications || []).map(n => ({ ...n, createdAt: fromIso(n.createdAt) })),
  };
}

export async function initDatabase() {
  const res = await fetch(`${API}/state`);
  if (!res.ok) throw new Error(`Server responded ${res.status}`);
  return deserializeState(await res.json());
}

export function saveStateToDatabase(state) {
  fetch(`${API}/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serializeState(state)),
  }).catch(err => console.error('State sync failed:', err));
}
