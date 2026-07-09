import initSqlJs from 'sql.js';
import {
  INITIAL_TICKETS, INITIAL_ASSETS, INITIAL_KB_ARTICLES,
  CATALOG_ITEMS, AUTOMATION_RULES, INITIAL_NOTIFICATIONS,
  AGENTS, TEAMS, INITIAL_GROUPS, INITIAL_CASE_STATUSES,
} from '../data/sampleData';

const DB_KEY = 'suitcase-db-v2';
let db = null;

// ── Helpers ──────────────────────────────────────────────────────────────────

function toIso(d) {
  if (!d) return null;
  return typeof d === 'string' ? d : d.toISOString();
}

function fromIso(s) {
  return s ? new Date(s) : null;
}

function serializeComments(comments = []) {
  return JSON.stringify(comments.map(c => ({ ...c, createdAt: toIso(c.createdAt) })));
}

function deserializeComments(raw) {
  return JSON.parse(raw || '[]').map(c => ({ ...c, createdAt: fromIso(c.createdAt) }));
}

function queryRows(sql, params = []) {
  const result = db.exec(sql, params);
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

// ── Schema ───────────────────────────────────────────────────────────────────

function createSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      type TEXT, title TEXT, description TEXT, category TEXT,
      priority TEXT, status TEXT, assignee TEXT, requester TEXT,
      created_at TEXT, sla_due TEXT, sla_paused INTEGER DEFAULT 0,
      resolved_at TEXT, approval_status TEXT, affected_asset TEXT,
      change_type TEXT, risk_level TEXT, implementation_plan TEXT,
      rollback_plan TEXT, scheduled_start TEXT, scheduled_end TEXT,
      change_status TEXT, root_cause TEXT, workaround TEXT,
      is_known_error INTEGER DEFAULT 0, problem_status TEXT,
      tags TEXT DEFAULT '[]', comments TEXT DEFAULT '[]',
      linked_problems TEXT DEFAULT '[]', linked_changes TEXT DEFAULT '[]',
      linked_incidents TEXT DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      name TEXT, type TEXT, status TEXT, assigned_to TEXT,
      location TEXT, serial TEXT, purchase_date TEXT
    );
    CREATE TABLE IF NOT EXISTS kb_articles (
      id TEXT PRIMARY KEY,
      title TEXT, category TEXT, content TEXT, tags TEXT DEFAULT '[]',
      author TEXT, views INTEGER DEFAULT 0, helpful INTEGER DEFAULT 0,
      not_helpful INTEGER DEFAULT 0, status TEXT, created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT, message TEXT, read INTEGER DEFAULT 0,
      created_at TEXT, ticket_id TEXT
    );
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT, role TEXT, team TEXT, email TEXT,
      password TEXT, active_tickets INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY, name TEXT, agents TEXT DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS user_groups (
      id TEXT PRIMARY KEY,
      name TEXT, member_ids TEXT DEFAULT '[]', permissions TEXT DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS catalog_items (
      id TEXT PRIMARY KEY,
      name TEXT, category TEXT, description TEXT,
      estimated_time TEXT, requires_approval INTEGER DEFAULT 0, icon TEXT
    );
    CREATE TABLE IF NOT EXISTS automation_rules (
      id TEXT PRIMARY KEY,
      name TEXT, trigger_cond TEXT, action_desc TEXT, enabled INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS case_statuses (
      id TEXT PRIMARY KEY,
      label TEXT, color TEXT, is_protected INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY, value TEXT
    );
  `);
}

// ── Seed ─────────────────────────────────────────────────────────────────────

function seedDatabase() {
  db.run('BEGIN TRANSACTION');

  // tickets
  const tStmt = db.prepare(`INSERT INTO tickets VALUES (
    ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
  )`);
  for (const t of INITIAL_TICKETS) {
    tStmt.run([
      t.id, t.type, t.title, t.description, t.category,
      t.priority, t.status, t.assignee ?? null, t.requester,
      toIso(t.createdAt), toIso(t.slaDue), t.slaPaused ? 1 : 0,
      toIso(t.resolvedAt) ?? null, t.approvalStatus ?? null, t.affectedAsset ?? null,
      t.changeType ?? null, t.riskLevel ?? null, t.implementationPlan ?? null,
      t.rollbackPlan ?? null, toIso(t.scheduledStart) ?? null,
      toIso(t.scheduledEnd) ?? null, t.changeStatus ?? null,
      t.rootCause ?? null, t.workaround ?? null, t.isKnownError ? 1 : 0,
      t.problemStatus ?? null,
      JSON.stringify(t.tags ?? []),
      serializeComments(t.comments),
      JSON.stringify(t.linkedProblems ?? []),
      JSON.stringify(t.linkedChanges ?? []),
      JSON.stringify(t.linkedIncidents ?? []),
    ]);
  }
  tStmt.free();

  // assets
  const aStmt = db.prepare(`INSERT INTO assets VALUES (?,?,?,?,?,?,?,?)`);
  for (const a of INITIAL_ASSETS) {
    aStmt.run([a.id, a.name, a.type, a.status, a.assignedTo ?? null, a.location, a.serial, a.purchaseDate]);
  }
  aStmt.free();

  // kb_articles
  const kStmt = db.prepare(`INSERT INTO kb_articles VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  for (const a of INITIAL_KB_ARTICLES) {
    kStmt.run([a.id, a.title, a.category, a.content, JSON.stringify(a.tags),
      a.author, a.views, a.helpful, a.notHelpful, a.status, toIso(a.createdAt)]);
  }
  kStmt.free();

  // notifications
  const nStmt = db.prepare(`INSERT INTO notifications VALUES (?,?,?,?,?,?)`);
  for (const n of INITIAL_NOTIFICATIONS) {
    nStmt.run([n.id, n.type, n.message, n.read ? 1 : 0, toIso(n.createdAt), n.ticketId]);
  }
  nStmt.free();

  // agents
  const agStmt = db.prepare(`INSERT INTO agents VALUES (?,?,?,?,?,?,?)`);
  for (const a of AGENTS) {
    agStmt.run([a.id, a.name, a.role, a.team, a.email, a.password, a.activeTickets]);
  }
  agStmt.free();

  // teams
  const tmStmt = db.prepare(`INSERT INTO teams VALUES (?,?,?)`);
  for (const t of TEAMS) {
    tmStmt.run([t.id, t.name, JSON.stringify(t.agents)]);
  }
  tmStmt.free();

  // user_groups
  const gStmt = db.prepare(`INSERT INTO user_groups VALUES (?,?,?,?)`);
  for (const g of INITIAL_GROUPS) {
    gStmt.run([g.id, g.name, JSON.stringify(g.memberIds), JSON.stringify(g.permissions)]);
  }
  gStmt.free();

  // catalog_items
  const cStmt = db.prepare(`INSERT INTO catalog_items VALUES (?,?,?,?,?,?,?)`);
  for (const c of CATALOG_ITEMS) {
    cStmt.run([c.id, c.name, c.category, c.description, c.estimatedTime, c.requiresApproval ? 1 : 0, c.icon]);
  }
  cStmt.free();

  // automation_rules
  const rStmt = db.prepare(`INSERT INTO automation_rules VALUES (?,?,?,?,?)`);
  for (const r of AUTOMATION_RULES) {
    rStmt.run([r.id, r.name, r.trigger, r.action, r.enabled ? 1 : 0]);
  }
  rStmt.free();

  // case_statuses
  const sStmt = db.prepare(`INSERT INTO case_statuses VALUES (?,?,?,?)`);
  for (const s of INITIAL_CASE_STATUSES) {
    sStmt.run([s.id, s.label, s.color, s.protected ? 1 : 0]);
  }
  sStmt.free();

  // settings
  db.run(`INSERT INTO settings VALUES ('resolvedRetentionDays', '3')`);

  db.run('COMMIT');
  persistDatabase();
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function initDatabase() {
  const SQL = await initSqlJs({ locateFile: file => `/${file}` });

  const saved = localStorage.getItem(DB_KEY);
  if (saved) {
    try {
      const binary = atob(saved);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      db = new SQL.Database(bytes);
    } catch {
      db = new SQL.Database();
      createSchema();
      seedDatabase();
    }
  } else {
    db = new SQL.Database();
    createSchema();
    seedDatabase();
  }
}

export function persistDatabase() {
  const uint8 = db.export();
  let binary = '';
  for (let i = 0; i < uint8.length; i += 8192) {
    binary += String.fromCharCode(...uint8.subarray(i, Math.min(i + 8192, uint8.length)));
  }
  localStorage.setItem(DB_KEY, btoa(binary));
}

// ── Load state from DB ────────────────────────────────────────────────────────

export function loadStateFromDatabase() {
  const tickets = queryRows('SELECT * FROM tickets ORDER BY created_at DESC').map(r => ({
    id: r.id, type: r.type, title: r.title, description: r.description,
    category: r.category, priority: r.priority, status: r.status,
    assignee: r.assignee, requester: r.requester,
    createdAt: fromIso(r.created_at), slaDue: fromIso(r.sla_due),
    slaPaused: !!r.sla_paused, resolvedAt: fromIso(r.resolved_at),
    approvalStatus: r.approval_status, affectedAsset: r.affected_asset,
    changeType: r.change_type, riskLevel: r.risk_level,
    implementationPlan: r.implementation_plan, rollbackPlan: r.rollback_plan,
    scheduledStart: fromIso(r.scheduled_start), scheduledEnd: fromIso(r.scheduled_end),
    changeStatus: r.change_status, rootCause: r.root_cause, workaround: r.workaround,
    isKnownError: !!r.is_known_error, problemStatus: r.problem_status,
    tags: JSON.parse(r.tags || '[]'),
    comments: deserializeComments(r.comments),
    linkedProblems: JSON.parse(r.linked_problems || '[]'),
    linkedChanges: JSON.parse(r.linked_changes || '[]'),
    linkedIncidents: JSON.parse(r.linked_incidents || '[]'),
  }));

  const assets = queryRows('SELECT * FROM assets').map(r => ({
    id: r.id, name: r.name, type: r.type, status: r.status,
    assignedTo: r.assigned_to, location: r.location, serial: r.serial,
    purchaseDate: r.purchase_date,
  }));

  const kbArticles = queryRows('SELECT * FROM kb_articles ORDER BY created_at DESC').map(r => ({
    id: r.id, title: r.title, category: r.category, content: r.content,
    tags: JSON.parse(r.tags || '[]'), author: r.author,
    views: r.views, helpful: r.helpful, notHelpful: r.not_helpful,
    status: r.status, createdAt: fromIso(r.created_at),
  }));

  const notifications = queryRows('SELECT * FROM notifications ORDER BY created_at DESC').map(r => ({
    id: r.id, type: r.type, message: r.message, read: !!r.read,
    createdAt: fromIso(r.created_at), ticketId: r.ticket_id,
  }));

  const agents = queryRows('SELECT * FROM agents').map(r => ({
    id: r.id, name: r.name, role: r.role, team: r.team,
    email: r.email, password: r.password, activeTickets: r.active_tickets,
  }));

  const teams = queryRows('SELECT * FROM teams').map(r => ({
    id: r.id, name: r.name, agents: JSON.parse(r.agents || '[]'),
  }));

  const groups = queryRows('SELECT * FROM user_groups').map(r => ({
    id: r.id, name: r.name,
    memberIds: JSON.parse(r.member_ids || '[]'),
    permissions: JSON.parse(r.permissions || '{}'),
  }));

  const catalogItems = queryRows('SELECT * FROM catalog_items').map(r => ({
    id: r.id, name: r.name, category: r.category, description: r.description,
    estimatedTime: r.estimated_time, requiresApproval: !!r.requires_approval, icon: r.icon,
  }));

  const automationRules = queryRows('SELECT * FROM automation_rules').map(r => ({
    id: r.id, name: r.name, trigger: r.trigger_cond, action: r.action_desc, enabled: !!r.enabled,
  }));

  const caseStatuses = queryRows('SELECT * FROM case_statuses').map(r => ({
    id: r.id, label: r.label, color: r.color, protected: !!r.is_protected,
  }));

  const settingRows = queryRows('SELECT key, value FROM settings');
  const settings = Object.fromEntries(settingRows.map(r => [r.key, r.value]));

  return {
    tickets, assets, kbArticles, notifications, agents, teams,
    groups, catalogItems, automationRules, caseStatuses,
    resolvedRetentionDays: settings.resolvedRetentionDays
      ? parseInt(settings.resolvedRetentionDays, 10) : 3,
  };
}

// ── Save state to DB ──────────────────────────────────────────────────────────

export function saveStateToDatabase(state) {
  db.run('BEGIN TRANSACTION');

  db.run('DELETE FROM tickets');
  const tStmt = db.prepare(`INSERT INTO tickets VALUES (
    ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
  )`);
  for (const t of state.tickets) {
    tStmt.run([
      t.id, t.type, t.title, t.description, t.category,
      t.priority, t.status, t.assignee ?? null, t.requester,
      toIso(t.createdAt), toIso(t.slaDue), t.slaPaused ? 1 : 0,
      toIso(t.resolvedAt) ?? null, t.approvalStatus ?? null, t.affectedAsset ?? null,
      t.changeType ?? null, t.riskLevel ?? null, t.implementationPlan ?? null,
      t.rollbackPlan ?? null, toIso(t.scheduledStart) ?? null,
      toIso(t.scheduledEnd) ?? null, t.changeStatus ?? null,
      t.rootCause ?? null, t.workaround ?? null, t.isKnownError ? 1 : 0,
      t.problemStatus ?? null,
      JSON.stringify(t.tags ?? []),
      serializeComments(t.comments),
      JSON.stringify(t.linkedProblems ?? []),
      JSON.stringify(t.linkedChanges ?? []),
      JSON.stringify(t.linkedIncidents ?? []),
    ]);
  }
  tStmt.free();

  db.run('DELETE FROM assets');
  const aStmt = db.prepare(`INSERT INTO assets VALUES (?,?,?,?,?,?,?,?)`);
  for (const a of state.assets) {
    aStmt.run([a.id, a.name, a.type, a.status, a.assignedTo ?? null, a.location, a.serial, a.purchaseDate]);
  }
  aStmt.free();

  db.run('DELETE FROM kb_articles');
  const kStmt = db.prepare(`INSERT INTO kb_articles VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  for (const a of state.kbArticles) {
    kStmt.run([a.id, a.title, a.category, a.content, JSON.stringify(a.tags),
      a.author, a.views, a.helpful, a.notHelpful, a.status, toIso(a.createdAt)]);
  }
  kStmt.free();

  db.run('DELETE FROM notifications');
  const nStmt = db.prepare(`INSERT INTO notifications VALUES (?,?,?,?,?,?)`);
  for (const n of state.notifications) {
    nStmt.run([n.id, n.type, n.message, n.read ? 1 : 0, toIso(n.createdAt), n.ticketId]);
  }
  nStmt.free();

  db.run('DELETE FROM agents');
  const agStmt = db.prepare(`INSERT INTO agents VALUES (?,?,?,?,?,?,?)`);
  for (const a of state.agents) {
    agStmt.run([a.id, a.name, a.role, a.team, a.email, a.password, a.activeTickets]);
  }
  agStmt.free();

  db.run('DELETE FROM teams');
  const tmStmt = db.prepare(`INSERT INTO teams VALUES (?,?,?)`);
  for (const t of state.teams) {
    tmStmt.run([t.id, t.name, JSON.stringify(t.agents)]);
  }
  tmStmt.free();

  db.run('DELETE FROM user_groups');
  const gStmt = db.prepare(`INSERT INTO user_groups VALUES (?,?,?,?)`);
  for (const g of state.groups) {
    gStmt.run([g.id, g.name, JSON.stringify(g.memberIds), JSON.stringify(g.permissions)]);
  }
  gStmt.free();

  db.run('DELETE FROM catalog_items');
  const cStmt = db.prepare(`INSERT INTO catalog_items VALUES (?,?,?,?,?,?,?)`);
  for (const c of state.catalogItems) {
    cStmt.run([c.id, c.name, c.category, c.description, c.estimatedTime, c.requiresApproval ? 1 : 0, c.icon]);
  }
  cStmt.free();

  db.run('DELETE FROM automation_rules');
  const rStmt = db.prepare(`INSERT INTO automation_rules VALUES (?,?,?,?,?)`);
  for (const r of state.automationRules) {
    rStmt.run([r.id, r.name, r.trigger, r.action, r.enabled ? 1 : 0]);
  }
  rStmt.free();

  db.run('DELETE FROM case_statuses');
  const sStmt = db.prepare(`INSERT INTO case_statuses VALUES (?,?,?,?)`);
  for (const s of state.caseStatuses) {
    sStmt.run([s.id, s.label, s.color, s.protected ? 1 : 0]);
  }
  sStmt.free();

  db.run(`INSERT OR REPLACE INTO settings VALUES ('resolvedRetentionDays', ?)`,
    [String(state.resolvedRetentionDays)]);

  db.run('COMMIT');
  persistDatabase();
}
