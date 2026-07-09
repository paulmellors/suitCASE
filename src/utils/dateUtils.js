export function addHours(date, hours) {
  return new Date(date.getTime() + hours * 3600000);
}

export function subHours(date, hours) {
  return new Date(date.getTime() - hours * 3600000);
}

export function subDays(date, days) {
  return new Date(date.getTime() - days * 86400000);
}

export function subMinutes(date, minutes) {
  return new Date(date.getTime() - minutes * 60000);
}

export function formatRelative(date) {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const abs = Math.abs(diff);
  const future = diff < 0;

  if (abs < 60000) return future ? 'in a few seconds' : 'just now';
  if (abs < 3600000) {
    const m = Math.round(abs / 60000);
    return future ? `in ${m}m` : `${m}m ago`;
  }
  if (abs < 86400000) {
    const h = Math.round(abs / 3600000);
    return future ? `in ${h}h` : `${h}h ago`;
  }
  const day = Math.round(abs / 86400000);
  return future ? `in ${day}d` : `${day}d ago`;
}

export function formatFull(date) {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function getSLAStatus(ticket) {
  if (!ticket.slaDue) return null;
  if (ticket.status === 'Resolved' || ticket.status === 'Closed') return 'resolved';

  const now = Date.now();
  const due = new Date(ticket.slaDue).getTime();
  const created = new Date(ticket.createdAt).getTime();
  const total = due - created;
  const elapsed = now - created;

  if (now > due) return 'breached';
  const pctRemaining = (due - now) / total;
  if (pctRemaining < 0.2) return 'at_risk';
  return 'on_track';
}

export function generateId(prefix, existingIds) {
  const nums = existingIds
    .filter(id => id.startsWith(prefix))
    .map(id => parseInt(id.replace(prefix + '-', ''), 10))
    .filter(n => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `${prefix}-${String(max + 1).padStart(4, '0')}`;
}
