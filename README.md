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

All state is held in-memory — no backend or database required.

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
│   │   └── AppContext.jsx   # Global state via useReducer
│   ├── data/
│   │   └── sampleData.js    # Pre-seeded demo data
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
| oxlint | 1 | Fast linter |

## Sample data

The app ships with pre-seeded demo data so you can explore all features immediately:

- 25 tickets across multiple priorities, statuses, and categories
- 15 CMDB assets
- 10 knowledge base articles
- 5 support agents
- 8 service catalog items
- 5 automation rules
- 10 notifications

Data resets to this baseline on every page refresh (no persistence layer).

## License

MIT
