import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_TICKETS, INITIAL_ASSETS, INITIAL_KB_ARTICLES,
  CATALOG_ITEMS, AUTOMATION_RULES, INITIAL_NOTIFICATIONS,
  AGENTS, TEAMS, INITIAL_GROUPS, INITIAL_CASE_STATUSES,
} from '../src/data/sampleData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'suitcase.db');

let db;

// ── Schema ────────────────────────────────────────────────────────────────────

function createSchema() {
  db.exec(`
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

function toIso(d) {
  if (!d) return null;
  return typeof d === 'string' ? d : d.toISOString();
}

const seedAll = (dbRef) => dbRef.transaction(() => {
  const t = dbRef.prepare(`INSERT INTO tickets VALUES (
    @id,@type,@title,@description,@category,@priority,@status,@assignee,@requester,
    @created_at,@sla_due,@sla_paused,@resolved_at,@approval_status,@affected_asset,
    @change_type,@risk_level,@implementation_plan,@rollback_plan,@scheduled_start,
    @scheduled_end,@change_status,@root_cause,@workaround,@is_known_error,@problem_status,
    @tags,@comments,@linked_problems,@linked_changes,@linked_incidents
  )`);
  for (const x of INITIAL_TICKETS) {
    t.run({
      id: x.id, type: x.type, title: x.title, description: x.description,
      category: x.category, priority: x.priority, status: x.status,
      assignee: x.assignee ?? null, requester: x.requester,
      created_at: toIso(x.createdAt), sla_due: toIso(x.slaDue),
      sla_paused: x.slaPaused ? 1 : 0, resolved_at: toIso(x.resolvedAt) ?? null,
      approval_status: x.approvalStatus ?? null, affected_asset: x.affectedAsset ?? null,
      change_type: x.changeType ?? null, risk_level: x.riskLevel ?? null,
      implementation_plan: x.implementationPlan ?? null, rollback_plan: x.rollbackPlan ?? null,
      scheduled_start: toIso(x.scheduledStart) ?? null, scheduled_end: toIso(x.scheduledEnd) ?? null,
      change_status: x.changeStatus ?? null, root_cause: x.rootCause ?? null,
      workaround: x.workaround ?? null, is_known_error: x.isKnownError ? 1 : 0,
      problem_status: x.problemStatus ?? null,
      tags: JSON.stringify(x.tags ?? []),
      comments: JSON.stringify((x.comments ?? []).map(c => ({ ...c, createdAt: toIso(c.createdAt) }))),
      linked_problems: JSON.stringify(x.linkedProblems ?? []),
      linked_changes: JSON.stringify(x.linkedChanges ?? []),
      linked_incidents: JSON.stringify(x.linkedIncidents ?? []),
    });
  }

  const a = dbRef.prepare(`INSERT INTO assets VALUES (@id,@name,@type,@status,@assigned_to,@location,@serial,@purchase_date)`);
  for (const x of INITIAL_ASSETS) {
    a.run({ id: x.id, name: x.name, type: x.type, status: x.status, assigned_to: x.assignedTo ?? null, location: x.location, serial: x.serial, purchase_date: x.purchaseDate });
  }

  const k = dbRef.prepare(`INSERT INTO kb_articles VALUES (@id,@title,@category,@content,@tags,@author,@views,@helpful,@not_helpful,@status,@created_at)`);
  for (const x of INITIAL_KB_ARTICLES) {
    k.run({ id: x.id, title: x.title, category: x.category, content: x.content, tags: JSON.stringify(x.tags), author: x.author, views: x.views, helpful: x.helpful, not_helpful: x.notHelpful, status: x.status, created_at: toIso(x.createdAt) });
  }

  const n = dbRef.prepare(`INSERT INTO notifications VALUES (@id,@type,@message,@read,@created_at,@ticket_id)`);
  for (const x of INITIAL_NOTIFICATIONS) {
    n.run({ id: x.id, type: x.type, message: x.message, read: x.read ? 1 : 0, created_at: toIso(x.createdAt), ticket_id: x.ticketId });
  }

  const ag = dbRef.prepare(`INSERT INTO agents VALUES (@id,@name,@role,@team,@email,@password,@active_tickets)`);
  for (const x of AGENTS) {
    ag.run({ id: x.id, name: x.name, role: x.role, team: x.team ?? null, email: x.email, password: x.password, active_tickets: x.activeTickets });
  }

  const tm = dbRef.prepare(`INSERT INTO teams VALUES (@id,@name,@agents)`);
  for (const x of TEAMS) {
    tm.run({ id: x.id, name: x.name, agents: JSON.stringify(x.agents) });
  }

  const g = dbRef.prepare(`INSERT INTO user_groups VALUES (@id,@name,@member_ids,@permissions)`);
  for (const x of INITIAL_GROUPS) {
    g.run({ id: x.id, name: x.name, member_ids: JSON.stringify(x.memberIds), permissions: JSON.stringify(x.permissions) });
  }

  const c = dbRef.prepare(`INSERT INTO catalog_items VALUES (@id,@name,@category,@description,@estimated_time,@requires_approval,@icon)`);
  for (const x of CATALOG_ITEMS) {
    c.run({ id: x.id, name: x.name, category: x.category, description: x.description, estimated_time: x.estimatedTime, requires_approval: x.requiresApproval ? 1 : 0, icon: x.icon });
  }

  const r = dbRef.prepare(`INSERT INTO automation_rules VALUES (@id,@name,@trigger_cond,@action_desc,@enabled)`);
  for (const x of AUTOMATION_RULES) {
    r.run({ id: x.id, name: x.name, trigger_cond: x.trigger, action_desc: x.action, enabled: x.enabled ? 1 : 0 });
  }

  const s = dbRef.prepare(`INSERT INTO case_statuses VALUES (@id,@label,@color,@is_protected)`);
  for (const x of INITIAL_CASE_STATUSES) {
    s.run({ id: x.id, label: x.label, color: x.color, is_protected: x.protected ? 1 : 0 });
  }

  dbRef.prepare(`INSERT INTO settings VALUES ('resolvedRetentionDays','3')`).run();
});

// ── Public API ────────────────────────────────────────────────────────────────

export function openDatabase() {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  createSchema();
  const empty = db.prepare('SELECT COUNT(*) as n FROM agents').get().n === 0;
  if (empty) seedAll(db)();
  console.log(`SQLite database: ${DB_PATH}`);
  return db;
}

export function loadState() {
  const rows = (sql) => db.prepare(sql).all();

  const tickets = rows('SELECT * FROM tickets ORDER BY created_at DESC').map(r => ({
    id: r.id, type: r.type, title: r.title, description: r.description,
    category: r.category, priority: r.priority, status: r.status,
    assignee: r.assignee, requester: r.requester,
    createdAt: r.created_at, slaDue: r.sla_due,
    slaPaused: !!r.sla_paused, resolvedAt: r.resolved_at,
    approvalStatus: r.approval_status, affectedAsset: r.affected_asset,
    changeType: r.change_type, riskLevel: r.risk_level,
    implementationPlan: r.implementation_plan, rollbackPlan: r.rollback_plan,
    scheduledStart: r.scheduled_start, scheduledEnd: r.scheduled_end,
    changeStatus: r.change_status, rootCause: r.root_cause,
    workaround: r.workaround, isKnownError: !!r.is_known_error, problemStatus: r.problem_status,
    tags: JSON.parse(r.tags || '[]'),
    comments: JSON.parse(r.comments || '[]'),
    linkedProblems: JSON.parse(r.linked_problems || '[]'),
    linkedChanges: JSON.parse(r.linked_changes || '[]'),
    linkedIncidents: JSON.parse(r.linked_incidents || '[]'),
  }));

  const assets = rows('SELECT * FROM assets').map(r => ({
    id: r.id, name: r.name, type: r.type, status: r.status,
    assignedTo: r.assigned_to, location: r.location, serial: r.serial, purchaseDate: r.purchase_date,
  }));

  const kbArticles = rows('SELECT * FROM kb_articles ORDER BY created_at DESC').map(r => ({
    id: r.id, title: r.title, category: r.category, content: r.content,
    tags: JSON.parse(r.tags || '[]'), author: r.author,
    views: r.views, helpful: r.helpful, notHelpful: r.not_helpful,
    status: r.status, createdAt: r.created_at,
  }));

  const notifications = rows('SELECT * FROM notifications ORDER BY created_at DESC').map(r => ({
    id: r.id, type: r.type, message: r.message, read: !!r.read,
    createdAt: r.created_at, ticketId: r.ticket_id,
  }));

  const agents = rows('SELECT * FROM agents').map(r => ({
    id: r.id, name: r.name, role: r.role, team: r.team,
    email: r.email, password: r.password, activeTickets: r.active_tickets,
  }));

  const teams = rows('SELECT * FROM teams').map(r => ({
    id: r.id, name: r.name, agents: JSON.parse(r.agents || '[]'),
  }));

  const groups = rows('SELECT * FROM user_groups').map(r => ({
    id: r.id, name: r.name,
    memberIds: JSON.parse(r.member_ids || '[]'),
    permissions: JSON.parse(r.permissions || '{}'),
  }));

  const catalogItems = rows('SELECT * FROM catalog_items').map(r => ({
    id: r.id, name: r.name, category: r.category, description: r.description,
    estimatedTime: r.estimated_time, requiresApproval: !!r.requires_approval, icon: r.icon,
  }));

  const automationRules = rows('SELECT * FROM automation_rules').map(r => ({
    id: r.id, name: r.name, trigger: r.trigger_cond, action: r.action_desc, enabled: !!r.enabled,
  }));

  const caseStatuses = rows('SELECT * FROM case_statuses').map(r => ({
    id: r.id, label: r.label, color: r.color, protected: !!r.is_protected,
  }));

  const settings = Object.fromEntries(rows('SELECT key, value FROM settings').map(r => [r.key, r.value]));

  return {
    tickets, assets, kbArticles, notifications, agents, teams,
    groups, catalogItems, automationRules, caseStatuses,
    resolvedRetentionDays: settings.resolvedRetentionDays ? parseInt(settings.resolvedRetentionDays, 10) : 3,
  };
}

export function saveState(state) {
  db.transaction((s) => {
    db.prepare('DELETE FROM tickets').run();
    const tStmt = db.prepare(`INSERT INTO tickets VALUES (
      @id,@type,@title,@description,@category,@priority,@status,@assignee,@requester,
      @created_at,@sla_due,@sla_paused,@resolved_at,@approval_status,@affected_asset,
      @change_type,@risk_level,@implementation_plan,@rollback_plan,@scheduled_start,
      @scheduled_end,@change_status,@root_cause,@workaround,@is_known_error,@problem_status,
      @tags,@comments,@linked_problems,@linked_changes,@linked_incidents
    )`);
    for (const t of (s.tickets || [])) {
      tStmt.run({
        id: t.id, type: t.type, title: t.title, description: t.description,
        category: t.category, priority: t.priority, status: t.status,
        assignee: t.assignee ?? null, requester: t.requester,
        created_at: t.createdAt ?? null, sla_due: t.slaDue ?? null,
        sla_paused: t.slaPaused ? 1 : 0, resolved_at: t.resolvedAt ?? null,
        approval_status: t.approvalStatus ?? null, affected_asset: t.affectedAsset ?? null,
        change_type: t.changeType ?? null, risk_level: t.riskLevel ?? null,
        implementation_plan: t.implementationPlan ?? null, rollback_plan: t.rollbackPlan ?? null,
        scheduled_start: t.scheduledStart ?? null, scheduled_end: t.scheduledEnd ?? null,
        change_status: t.changeStatus ?? null, root_cause: t.rootCause ?? null,
        workaround: t.workaround ?? null, is_known_error: t.isKnownError ? 1 : 0,
        problem_status: t.problemStatus ?? null,
        tags: JSON.stringify(t.tags ?? []),
        comments: JSON.stringify(t.comments ?? []),
        linked_problems: JSON.stringify(t.linkedProblems ?? []),
        linked_changes: JSON.stringify(t.linkedChanges ?? []),
        linked_incidents: JSON.stringify(t.linkedIncidents ?? []),
      });
    }

    db.prepare('DELETE FROM assets').run();
    const aStmt = db.prepare(`INSERT INTO assets VALUES (@id,@name,@type,@status,@assigned_to,@location,@serial,@purchase_date)`);
    for (const a of (s.assets || [])) {
      aStmt.run({ id: a.id, name: a.name, type: a.type, status: a.status, assigned_to: a.assignedTo ?? null, location: a.location, serial: a.serial, purchase_date: a.purchaseDate });
    }

    db.prepare('DELETE FROM kb_articles').run();
    const kStmt = db.prepare(`INSERT INTO kb_articles VALUES (@id,@title,@category,@content,@tags,@author,@views,@helpful,@not_helpful,@status,@created_at)`);
    for (const a of (s.kbArticles || [])) {
      kStmt.run({ id: a.id, title: a.title, category: a.category, content: a.content, tags: JSON.stringify(a.tags), author: a.author, views: a.views, helpful: a.helpful, not_helpful: a.notHelpful, status: a.status, created_at: a.createdAt ?? null });
    }

    db.prepare('DELETE FROM notifications').run();
    const nStmt = db.prepare(`INSERT INTO notifications VALUES (@id,@type,@message,@read,@created_at,@ticket_id)`);
    for (const n of (s.notifications || [])) {
      nStmt.run({ id: n.id, type: n.type, message: n.message, read: n.read ? 1 : 0, created_at: n.createdAt ?? null, ticket_id: n.ticketId });
    }

    db.prepare('DELETE FROM agents').run();
    const agStmt = db.prepare(`INSERT INTO agents VALUES (@id,@name,@role,@team,@email,@password,@active_tickets)`);
    for (const a of (s.agents || [])) {
      agStmt.run({ id: a.id, name: a.name, role: a.role, team: a.team ?? null, email: a.email, password: a.password, active_tickets: a.activeTickets });
    }

    db.prepare('DELETE FROM teams').run();
    const tmStmt = db.prepare(`INSERT INTO teams VALUES (@id,@name,@agents)`);
    for (const t of (s.teams || [])) {
      tmStmt.run({ id: t.id, name: t.name, agents: JSON.stringify(t.agents) });
    }

    db.prepare('DELETE FROM user_groups').run();
    const gStmt = db.prepare(`INSERT INTO user_groups VALUES (@id,@name,@member_ids,@permissions)`);
    for (const g of (s.groups || [])) {
      gStmt.run({ id: g.id, name: g.name, member_ids: JSON.stringify(g.memberIds), permissions: JSON.stringify(g.permissions) });
    }

    db.prepare('DELETE FROM catalog_items').run();
    const cStmt = db.prepare(`INSERT INTO catalog_items VALUES (@id,@name,@category,@description,@estimated_time,@requires_approval,@icon)`);
    for (const c of (s.catalogItems || [])) {
      cStmt.run({ id: c.id, name: c.name, category: c.category, description: c.description, estimated_time: c.estimatedTime, requires_approval: c.requiresApproval ? 1 : 0, icon: c.icon });
    }

    db.prepare('DELETE FROM automation_rules').run();
    const rStmt = db.prepare(`INSERT INTO automation_rules VALUES (@id,@name,@trigger_cond,@action_desc,@enabled)`);
    for (const r of (s.automationRules || [])) {
      rStmt.run({ id: r.id, name: r.name, trigger_cond: r.trigger, action_desc: r.action, enabled: r.enabled ? 1 : 0 });
    }

    db.prepare('DELETE FROM case_statuses').run();
    const csStmt = db.prepare(`INSERT INTO case_statuses VALUES (@id,@label,@color,@is_protected)`);
    for (const cs of (s.caseStatuses || [])) {
      csStmt.run({ id: cs.id, label: cs.label, color: cs.color, is_protected: cs.protected ? 1 : 0 });
    }

    db.prepare(`INSERT OR REPLACE INTO settings VALUES ('resolvedRetentionDays',@v)`).run({ v: String(s.resolvedRetentionDays ?? 3) });
  })(state);
}
