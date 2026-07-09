# suitCASE

A fully-featured IT Service Management (ITSM) helpdesk single-page application combining capabilities from ServiceNow, Freshservice, Jira SM, and Zendesk — built with React and Vite.

## Features

- **Dashboard** — live metrics, SLA health, ticket volume charts, and recent activity
- **Ticket Management** — create, triage, assign, and resolve tickets with full audit trail
- **SLA Tracking** — automatic SLA status, breach warnings, and escalation indicators
- **Service Catalog** — request items from a browsable catalog with approval workflows
- **Change Management** — RFC lifecycle with CAB review and risk assessment
- **Problem Management** — root cause analysis and known error database
- **Knowledge Base** — searchable articles linked to tickets
- **CMDB / Assets** — configuration items with relationship mapping
- **Self-Service Portal** — end-user facing ticket submission and status tracking
- **Automation Rules** — trigger-condition-action rules engine (no-code)
- **Reports** — charts and exports for ticket trends, SLA compliance, and agent performance
- **Agents & Teams** — manage support agents, teams, and on-call schedules
- **Settings** — branding, SLA policies, categories, and notification preferences

All application data is stored in a SQLite database running in the browser via WebAssembly (sql.js). Data persists across page refreshes in `localStorage` and is automatically seeded with demo data on first load.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later (bundled with Node.js)

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd suitCASE

# Install dependencies
npm install
```

## Usage

### Development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The app hot-reloads on file changes.

### Production build

```bash
npm run build
```

Output is written to `dist/`. Serve it with any static file host.

### Preview the production build locally

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project structure

```
suitCASE/
├── public/
│   └── sql-wasm.wasm       # SQLite WebAssembly binary
├── src/
│   ├── components/
│   │   └── views/          # One file per top-level view
│   │       ├── Dashboard.jsx
│   │       ├── TicketList.jsx
│   │       ├── TicketPanel.jsx
│   │       ├── CreateTicket.jsx
│   │       ├── ServiceCatalog.jsx
│   │       ├── ChangeManagement.jsx
│   │       ├── ProblemManagement.jsx
│   │       ├── KnowledgeBase.jsx
│   │       ├── Assets.jsx
│   │       ├── SelfServicePortal.jsx
│   │       ├── Automation.jsx
│   │       ├── Reports.jsx
│   │       ├── AgentsTeams.jsx
│   │       └── Settings.jsx
│   ├── context/
│   │   └── AppContext.jsx   # Global state via useReducer + SQLite persistence
│   ├── data/
│   │   └── sampleData.js    # Pre-seeded demo data (used for initial DB seed only)
│   ├── db/
│   │   └── database.js      # SQLite schema, seed, load, and save logic
│   └── utils/
│       └── dateUtils.js     # SLA helpers, ID generation, date formatting
├── index.html
├── vite.config.js
└── package.json
```

## Tech stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool and dev server |
| Tailwind CSS v4 | 4 | Utility-first styling |
| Recharts | 3 | Charts and data visualisation |
| lucide-react | 1 | Icon library |
| sql.js | 1 | SQLite compiled to WebAssembly |
| oxlint | 1 | Fast linter |

## Database

The app uses **SQLite via sql.js** — a WebAssembly build of SQLite that runs entirely in the browser. No backend server is required.

### How it works

1. On first load, a SQLite database is created in memory, the schema is applied, and demo data is seeded.
2. The database is serialized and stored in `localStorage` under the key `suitcase-db-v1`.
3. On subsequent loads, the database is restored from `localStorage`.
4. After every data-changing action, the updated state is written back to the SQLite database and re-serialized to `localStorage`.

### Schema

| Table | Description |
|---|---|
| `tickets` | Incidents, service requests, change requests, and problems |
| `assets` | CMDB configuration items |
| `kb_articles` | Knowledge base articles |
| `notifications` | In-app notifications |
| `agents` | Support agent accounts |
| `teams` | Agent team groupings |
| `user_groups` | Permission groups with member lists |
| `catalog_items` | Service catalog entries |
| `automation_rules` | Trigger-action automation definitions |
| `case_statuses` | Configurable ticket status labels |
| `settings` | Key-value application settings |

### Reset the database

To reset all data back to the demo seed, clear the entry in your browser's localStorage:

```js
// In the browser console:
localStorage.removeItem('suitcase-db-v1');
location.reload();
```

## Sample data

The app ships with pre-seeded demo data so you can explore all features immediately:

- 25 tickets across multiple priorities, statuses, and categories
- 15 CMDB assets
- 10 knowledge base articles
- 5 support agents
- 8 service catalog items
- 5 automation rules
- 10 notifications

Data is seeded into SQLite on first load. All changes made in the app persist across page refreshes.

## License

MIT
