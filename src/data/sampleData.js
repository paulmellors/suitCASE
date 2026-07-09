import { addHours, subHours, subDays, subMinutes } from '../utils/dateUtils';

const NOW = new Date();

// Nav sections that can be permission-controlled
export const NAV_SECTIONS = [
  { id: 'dashboard',  label: 'Dashboard' },
  { id: 'tickets',    label: 'Tickets' },
  { id: 'create',     label: 'Create Ticket' },
  { id: 'catalog',    label: 'Service Catalog' },
  { id: 'changes',    label: 'Change Management' },
  { id: 'problems',   label: 'Problem Management' },
  { id: 'knowledge',  label: 'Knowledge Base' },
  { id: 'assets',     label: 'Assets / CMDB' },
  { id: 'portal',     label: 'Self-Service Portal' },
  { id: 'automation', label: 'Automation' },
  { id: 'reports',    label: 'Reports' },
  { id: 'agents',     label: 'Agents & Teams' },
  { id: 'settings',   label: 'Settings' },
];

// Preset colour swatches for case statuses — all class strings written explicitly so Tailwind doesn't purge them
export const STATUS_COLOR_OPTIONS = [
  { key: 'blue',   label: 'Blue',   cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
  { key: 'indigo', label: 'Indigo', cls: 'bg-indigo-100 text-indigo-700 border border-indigo-200' },
  { key: 'purple', label: 'Purple', cls: 'bg-purple-100 text-purple-700 border border-purple-200' },
  { key: 'pink',   label: 'Pink',   cls: 'bg-pink-100 text-pink-700 border border-pink-200' },
  { key: 'red',    label: 'Red',    cls: 'bg-red-100 text-red-700 border border-red-200' },
  { key: 'orange', label: 'Orange', cls: 'bg-orange-100 text-orange-700 border border-orange-200' },
  { key: 'yellow', label: 'Yellow', cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  { key: 'green',  label: 'Green',  cls: 'bg-green-100 text-green-700 border border-green-200' },
  { key: 'teal',   label: 'Teal',   cls: 'bg-teal-100 text-teal-700 border border-teal-200' },
  { key: 'gray',   label: 'Gray',   cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
  { key: 'dark',   label: 'Dark',   cls: 'bg-gray-700 text-gray-100' },
];

export const INITIAL_CASE_STATUSES = [
  { id: 'cs1', label: 'Open',        color: 'blue',   protected: false },
  { id: 'cs2', label: 'In Progress', color: 'purple', protected: false },
  { id: 'cs3', label: 'Pending',     color: 'gray',   protected: false },
  { id: 'cs4', label: 'Resolved',    color: 'green',  protected: true  },
  { id: 'cs5', label: 'Closed',      color: 'dark',   protected: true  },
];

const ALL_ON  = { dashboard: true,  tickets: true, create: true, catalog: true, changes: true, problems: true, knowledge: true, assets: true, portal: true, automation: true,  reports: true,  agents: true,  settings: true  };
const MGR_ON  = { dashboard: true,  tickets: true, create: true, catalog: true, changes: true, problems: true, knowledge: true, assets: true, portal: true, automation: true,  reports: true,  agents: true,  settings: false };
const AGT_ON  = { dashboard: false, tickets: true, create: true, catalog: true, changes: true, problems: true, knowledge: true, assets: true, portal: true, automation: false, reports: false, agents: false, settings: false };

export const INITIAL_GROUPS = [
  { id: 'g1', name: 'Administrators',  memberIds: ['a1'],           permissions: { ...ALL_ON } },
  { id: 'g2', name: 'Management',      memberIds: ['a2'],           permissions: { ...MGR_ON } },
  { id: 'g3', name: 'Support Agents',  memberIds: ['a3', 'a4', 'a5'], permissions: { ...AGT_ON } },
];

export const AGENTS = [
  { id: 'a1', name: 'Alice Nguyen', role: 'Admin', team: 'Change Advisory Board', email: 'alice@suitcase.io', password: 'alice123', activeTickets: 4 },
  { id: 'a2', name: 'Bob Patel', role: 'Manager', team: 'Tier 2 Infrastructure', email: 'bob@suitcase.io', password: 'bob123', activeTickets: 6 },
  { id: 'a3', name: 'Claire Smith', role: 'Agent', team: 'Tier 1 Support', email: 'claire@suitcase.io', password: 'claire123', activeTickets: 8 },
  { id: 'a4', name: 'David Kim', role: 'Agent', team: 'Tier 1 Support', email: 'david@suitcase.io', password: 'david123', activeTickets: 5 },
  { id: 'a5', name: 'Emma Brown', role: 'Agent', team: 'Tier 2 Infrastructure', email: 'emma@suitcase.io', password: 'emma123', activeTickets: 3 },
];

export const TEAMS = [
  { id: 't1', name: 'Tier 1 Support', agents: ['a3', 'a4'] },
  { id: 't2', name: 'Tier 2 Infrastructure', agents: ['a2', 'a5'] },
  { id: 't3', name: 'Change Advisory Board', agents: ['a1', 'a2'] },
];

const SLA_HOURS = { Critical: 1, High: 4, Medium: 8, Low: 24 };

function makeSLADue(createdAt, priority) {
  return addHours(createdAt, SLA_HOURS[priority]);
}

export const INITIAL_TICKETS = [
  {
    id: 'INC-0001', type: 'Incident', title: 'Email server down – unable to send or receive', description: 'The primary mail server MX01 is unresponsive. All incoming and outgoing email has stopped since 08:00 UTC.', category: 'Incident', priority: 'Critical', status: 'In Progress', assignee: 'a2', requester: 'John Walsh', createdAt: subHours(NOW, 3), slaDue: makeSLADue(subHours(NOW, 3), 'Critical'), tags: ['email', 'server', 'outage'], affectedAsset: 'AST-007', linkedProblems: ['PRB-0001'], linkedChanges: [], slaPaused: false,
    comments: [
      { id: 'c1', author: 'a3', type: 'public', body: 'Investigating the issue now. MX01 shows 100% CPU utilisation.', createdAt: subHours(NOW, 2.5) },
      { id: 'c2', author: 'a2', type: 'internal', body: 'Escalating to infra team. Possible disk fill.', createdAt: subHours(NOW, 2) },
    ]
  },
  {
    id: 'INC-0002', type: 'Incident', title: 'VPN connectivity issues for remote employees', description: 'Multiple remote employees are unable to connect via VPN. Error: authentication failure.', category: 'Incident', priority: 'High', status: 'Open', assignee: 'a5', requester: 'Priya Sharma', createdAt: subHours(NOW, 5), slaDue: makeSLADue(subHours(NOW, 5), 'High'), tags: ['vpn', 'remote', 'auth'], affectedAsset: null, linkedProblems: [], linkedChanges: [], slaPaused: false,
    comments: []
  },
  {
    id: 'INC-0003', type: 'Incident', title: 'Laptop keyboard not responding – Finance dept', description: 'Sarah in Finance reports her ThinkPad T14s keyboard has stopped working.', category: 'Incident', priority: 'Medium', status: 'Pending', assignee: 'a3', requester: 'Sarah Connor', createdAt: subHours(NOW, 12), slaDue: makeSLADue(subHours(NOW, 12), 'Medium'), tags: ['hardware', 'laptop'], affectedAsset: 'AST-003', linkedProblems: [], linkedChanges: [], slaPaused: true,
    comments: [
      { id: 'c3', author: 'a3', type: 'public', body: 'Replacement keyboard ordered. Awaiting delivery.', createdAt: subHours(NOW, 8) }
    ]
  },
  {
    id: 'INC-0004', type: 'Incident', title: 'Printer offline – 3rd floor', description: 'The HP LaserJet on the 3rd floor is showing offline status. Error lights blinking.', category: 'Incident', priority: 'Low', status: 'Resolved', assignee: 'a4', requester: 'Tom Baker', createdAt: subDays(NOW, 2), slaDue: makeSLADue(subDays(NOW, 2), 'Low'), tags: ['printer', 'hardware'], affectedAsset: null, linkedProblems: [], linkedChanges: [], slaPaused: false, resolvedAt: subDays(NOW, 1),
    comments: [
      { id: 'c4', author: 'a4', type: 'public', body: 'Printer restarted and reconnected to network. All clear.', createdAt: subDays(NOW, 1) }
    ]
  },
  {
    id: 'INC-0005', type: 'Incident', title: 'SharePoint file permissions error – Marketing', description: 'Marketing team cannot access the shared Q4 Campaign folder. Permission denied errors on all files.', category: 'Incident', priority: 'High', status: 'Open', assignee: null, requester: 'Lisa Park', createdAt: subHours(NOW, 10), slaDue: makeSLADue(subHours(NOW, 10), 'High'), tags: ['sharepoint', 'permissions'], affectedAsset: null, linkedProblems: [], linkedChanges: [], slaPaused: false,
    comments: []
  },
  {
    id: 'REQ-0001', type: 'Service Request', title: 'New laptop for onboarding engineer', description: 'Please provision a MacBook Pro 14" M3 for new hire James Okafor starting 2026-07-15.', category: 'Service Request', priority: 'Medium', status: 'Open', assignee: 'a3', requester: 'HR Department', createdAt: subDays(NOW, 1), slaDue: makeSLADue(subDays(NOW, 1), 'Medium'), tags: ['onboarding', 'hardware'], affectedAsset: null, linkedProblems: [], linkedChanges: [], slaPaused: false, approvalStatus: 'Awaiting Approval',
    comments: []
  },
  {
    id: 'REQ-0002', type: 'Service Request', title: 'Adobe Creative Cloud license request', description: 'Designer Maya Chen requires Adobe CC license for video editing work.', category: 'Service Request', priority: 'Low', status: 'Approved', assignee: 'a4', requester: 'Maya Chen', createdAt: subDays(NOW, 3), slaDue: makeSLADue(subDays(NOW, 3), 'Low'), tags: ['software', 'license'], affectedAsset: null, linkedProblems: [], linkedChanges: [], slaPaused: false, approvalStatus: 'Approved',
    comments: [
      { id: 'c5', author: 'a2', type: 'internal', body: 'Approved. License budget available.', createdAt: subDays(NOW, 2) }
    ]
  },
  {
    id: 'REQ-0003', type: 'Service Request', title: 'Access request – Salesforce CRM', description: 'New sales rep Daniel White needs read/write access to Salesforce CRM.', category: 'Service Request', priority: 'Medium', status: 'In Progress', assignee: 'a3', requester: 'Sales Manager', createdAt: subDays(NOW, 1), slaDue: makeSLADue(subDays(NOW, 1), 'Medium'), tags: ['access', 'crm', 'salesforce'], affectedAsset: null, linkedProblems: [], linkedChanges: [], slaPaused: false, approvalStatus: 'Approved',
    comments: []
  },
  {
    id: 'CHG-0001', type: 'Change Request', title: 'Upgrade network switches – Building A', description: 'Scheduled replacement of Cisco Catalyst 2960 series with 9300 series across Building A. Full topology diagram attached in docs.', category: 'Change Request', priority: 'High', status: 'Scheduled', assignee: 'a5', requester: 'a2', createdAt: subDays(NOW, 5), slaDue: null, tags: ['network', 'infrastructure', 'upgrade'], changeType: 'Normal', riskLevel: 'Medium', implementationPlan: 'Switch during weekend maintenance window. Replace one switch at a time. Test connectivity after each swap.', rollbackPlan: 'Keep old switches in rack for 48 hours post-change. Re-connect if issues arise.', scheduledStart: addHours(NOW, 48), scheduledEnd: addHours(NOW, 56), changeStatus: 'Scheduled', linkedProblems: [], linkedChanges: [], slaPaused: false,
    comments: [
      { id: 'c6', author: 'a1', type: 'internal', body: 'CAB reviewed. Approved for weekend window.', createdAt: subDays(NOW, 2) }
    ]
  },
  {
    id: 'CHG-0002', type: 'Change Request', title: 'Emergency patch – CVE-2026-3841 on web servers', description: 'Critical zero-day patch must be applied to all web servers within 24 hours per security advisory.', category: 'Change Request', priority: 'Critical', status: 'Implemented', assignee: 'a2', requester: 'a1', createdAt: subDays(NOW, 1), slaDue: null, tags: ['security', 'patch', 'emergency'], changeType: 'Emergency', riskLevel: 'High', implementationPlan: 'Apply patch to staging, verify, then roll out to prod servers in sequence.', rollbackPlan: 'Rollback packages to previous version if service disruption occurs.', scheduledStart: subHours(NOW, 6), scheduledEnd: subHours(NOW, 4), changeStatus: 'Implemented', linkedProblems: [], linkedChanges: [], slaPaused: false,
    comments: [
      { id: 'c7', author: 'a2', type: 'public', body: 'Patch applied successfully to all 8 web servers. Services nominal.', createdAt: subHours(NOW, 4) }
    ]
  },
  {
    id: 'CHG-0003', type: 'Change Request', title: 'Migrate JIRA from Server to Cloud', description: 'Migrate JIRA Software from self-hosted server to Atlassian Cloud. Affects 200 users.', category: 'Change Request', priority: 'Medium', status: 'Under Review', assignee: 'a1', requester: 'CTO Office', createdAt: subDays(NOW, 7), slaDue: null, tags: ['jira', 'cloud', 'migration'], changeType: 'Normal', riskLevel: 'High', implementationPlan: 'Phase 1: Export data. Phase 2: Cloud setup. Phase 3: Migration. Phase 4: DNS cutover.', rollbackPlan: 'Keep server instance live for 2 weeks post-migration as fallback.', scheduledStart: addHours(NOW, 240), scheduledEnd: addHours(NOW, 264), changeStatus: 'Under Review', linkedProblems: [], linkedChanges: [], slaPaused: false,
    comments: []
  },
  {
    id: 'PRB-0001', type: 'Problem', title: 'Recurring email server outages during peak hours', description: 'Email server MX01 has crashed 3 times in 2 weeks, always between 08:00–09:30 UTC.', category: 'Problem', priority: 'High', status: 'Root Cause Analysis', assignee: 'a2', requester: 'a1', createdAt: subDays(NOW, 10), slaDue: null, tags: ['email', 'server', 'recurring'], rootCause: 'Insufficient memory allocated to mail spool process under high message volume.', workaround: 'Restart the mail spool service manually. Monitor memory utilisation hourly.', isKnownError: true, problemStatus: 'Workaround Available', linkedIncidents: ['INC-0001'], linkedChanges: [], slaPaused: false,
    comments: [
      { id: 'c8', author: 'a2', type: 'internal', body: 'Root cause identified. Memory upgrade request submitted to procurement.', createdAt: subDays(NOW, 3) }
    ]
  },
  {
    id: 'PRB-0002', type: 'Problem', title: 'VPN authentication failures for remote users', description: 'Intermittent VPN auth failures affecting 10–20 users per day since firmware update.', category: 'Problem', priority: 'Medium', status: 'Root Cause Analysis', assignee: 'a5', requester: 'a2', createdAt: subDays(NOW, 4), slaDue: null, tags: ['vpn', 'authentication', 'firmware'], rootCause: '', workaround: 'Users can reconnect manually after 2–3 retries.', isKnownError: false, problemStatus: 'Identified', linkedIncidents: ['INC-0002'], linkedChanges: [], slaPaused: false,
    comments: []
  },
  {
    id: 'INC-0006', type: 'Incident', title: 'Slack notifications not working on iOS', description: 'Multiple employees on iPhone 15 Pro report no push notifications from Slack.', category: 'Incident', priority: 'Medium', status: 'Open', assignee: 'a4', requester: 'Various', createdAt: subHours(NOW, 6), slaDue: makeSLADue(subHours(NOW, 6), 'Medium'), tags: ['slack', 'mobile', 'notifications'], affectedAsset: null, linkedProblems: [], linkedChanges: [], slaPaused: false,
    comments: []
  },
  {
    id: 'INC-0007', type: 'Incident', title: 'Monitor flickering – Design team MacBook', description: 'External 4K monitor connected via USB-C hub flickers every 30 seconds on designer workstations.', category: 'Incident', priority: 'Low', status: 'Closed', assignee: 'a3', requester: 'Design Team', createdAt: subDays(NOW, 5), slaDue: makeSLADue(subDays(NOW, 5), 'Low'), tags: ['hardware', 'monitor', 'mac'], affectedAsset: 'AST-005', linkedProblems: [], linkedChanges: [], slaPaused: false,
    comments: [
      { id: 'c9', author: 'a3', type: 'public', body: 'Replaced USB-C hub with certified Apple adapter. Issue resolved.', createdAt: subDays(NOW, 4) }
    ]
  },
  {
    id: 'INC-0008', type: 'Incident', title: 'Database slow queries – ERP system', description: 'SAP ERP reporting extremely slow query responses >30 sec for reports module.', category: 'Incident', priority: 'High', status: 'In Progress', assignee: 'a2', requester: 'Finance Dept', createdAt: subHours(NOW, 8), slaDue: makeSLADue(subHours(NOW, 8), 'High'), tags: ['database', 'erp', 'performance'], affectedAsset: 'AST-009', linkedProblems: [], linkedChanges: [], slaPaused: false,
    comments: [
      { id: 'c10', author: 'a2', type: 'internal', body: 'Index rebuild scheduled for 22:00 tonight.', createdAt: subHours(NOW, 2) }
    ]
  },
  {
    id: 'INC-0009', type: 'Incident', title: 'Wi-Fi dead zone – Conference Room B', description: 'No Wi-Fi signal detected in Conference Room B. Access point WAP-12 appears offline.', category: 'Incident', priority: 'Medium', status: 'Open', assignee: null, requester: 'Facilities', createdAt: subHours(NOW, 4), slaDue: makeSLADue(subHours(NOW, 4), 'Medium'), tags: ['wifi', 'network', 'ap'], affectedAsset: null, linkedProblems: [], linkedChanges: [], slaPaused: false,
    comments: []
  },
  {
    id: 'INC-0010', type: 'Incident', title: 'Zoom audio quality issues during all-hands', description: 'Echo and background noise reported during company all-hands Zoom. Affects 150+ attendees.', category: 'Incident', priority: 'High', status: 'Resolved', assignee: 'a4', requester: 'Executive PA', createdAt: subDays(NOW, 1), slaDue: makeSLADue(subDays(NOW, 1), 'High'), tags: ['zoom', 'audio', 'conference'], affectedAsset: null, linkedProblems: [], linkedChanges: [], slaPaused: false, resolvedAt: subHours(NOW, 20),
    comments: [
      { id: 'c11', author: 'a4', type: 'public', body: 'Disabled echo cancellation on presenter microphone. Audio now clear.', createdAt: subDays(NOW, 1) }
    ]
  },
  {
    id: 'REQ-0004', type: 'Service Request', title: 'Standing desk ergonomic assessment', description: 'Employee Alex Turner requesting ergonomic assessment and standing desk approval.', category: 'Service Request', priority: 'Low', status: 'Open', assignee: null, requester: 'Alex Turner', createdAt: subDays(NOW, 2), slaDue: makeSLADue(subDays(NOW, 2), 'Low'), tags: ['ergonomics', 'facilities'], affectedAsset: null, linkedProblems: [], linkedChanges: [], slaPaused: false, approvalStatus: 'Awaiting Approval',
    comments: []
  },
  {
    id: 'REQ-0005', type: 'Service Request', title: 'Password reset – Active Directory', description: 'User locked out after 5 failed attempts. Requires AD password reset.', category: 'Service Request', priority: 'Medium', status: 'Resolved', assignee: 'a3', requester: 'Mike Johnson', createdAt: subHours(NOW, 1), slaDue: makeSLADue(subHours(NOW, 1), 'Medium'), tags: ['password', 'AD', 'access'], affectedAsset: null, linkedProblems: [], linkedChanges: [], slaPaused: false, approvalStatus: 'Not Required', resolvedAt: subMinutes(NOW, 30),
    comments: [
      { id: 'c12', author: 'a3', type: 'public', body: 'Password reset complete. User verified identity via security questions.', createdAt: subMinutes(NOW, 30) }
    ]
  },
  {
    id: 'INC-0011', type: 'Incident', title: 'Azure subscription over budget alert', description: 'Azure cost management alert: subscription exceeded monthly budget by 23%.', category: 'Incident', priority: 'High', status: 'Open', assignee: 'a1', requester: 'FinOps Team', createdAt: subHours(NOW, 2), slaDue: makeSLADue(subHours(NOW, 2), 'High'), tags: ['azure', 'cloud', 'cost'], affectedAsset: null, linkedProblems: [], linkedChanges: [], slaPaused: false,
    comments: []
  },
  {
    id: 'INC-0012', type: 'Incident', title: 'SSL certificate expiry – customer portal', description: 'SSL certificate for portal.company.com expires in 3 days. Renewal process must start immediately.', category: 'Incident', priority: 'Critical', status: 'In Progress', assignee: 'a5', requester: 'Security Team', createdAt: subHours(NOW, 1), slaDue: makeSLADue(subHours(NOW, 1), 'Critical'), tags: ['ssl', 'certificate', 'security'], affectedAsset: null, linkedProblems: [], linkedChanges: ['CHG-0002'], slaPaused: false,
    comments: []
  },
  {
    id: 'INC-0013', type: 'Incident', title: 'MFA enrollment failure for new employees', description: '5 new starters unable to complete Microsoft Authenticator MFA enrollment.', category: 'Incident', priority: 'Medium', status: 'Open', assignee: 'a4', requester: 'HR IT', createdAt: subHours(NOW, 7), slaDue: makeSLADue(subHours(NOW, 7), 'Medium'), tags: ['mfa', 'security', 'onboarding'], affectedAsset: null, linkedProblems: [], linkedChanges: [], slaPaused: false,
    comments: []
  },
  {
    id: 'INC-0014', type: 'Incident', title: 'CRM data not syncing to BI dashboard', description: 'Salesforce data pipeline to Tableau Cloud has been broken since 2026-07-06. Sales figures stale.', category: 'Incident', priority: 'High', status: 'In Progress', assignee: 'a2', requester: 'Sales Ops', createdAt: subDays(NOW, 3), slaDue: makeSLADue(subDays(NOW, 3), 'High'), tags: ['crm', 'bi', 'pipeline', 'salesforce'], affectedAsset: null, linkedProblems: [], linkedChanges: [], slaPaused: false,
    comments: []
  },
  {
    id: 'INC-0015', type: 'Incident', title: 'Backup job failed – File server FS01', description: 'Nightly Veeam backup job for FS01 failed with error: "storage quota exceeded".', category: 'Incident', priority: 'High', status: 'Open', assignee: 'a5', requester: 'System Auto-Alert', createdAt: subHours(NOW, 14), slaDue: makeSLADue(subHours(NOW, 14), 'High'), tags: ['backup', 'storage', 'veeam'], affectedAsset: 'AST-007', linkedProblems: [], linkedChanges: [], slaPaused: false,
    comments: []
  },
];

export const INITIAL_ASSETS = [
  { id: 'AST-001', name: 'MacBook Pro 14" M3', type: 'Laptop', status: 'In Use', assignedTo: 'Alice Nguyen', location: 'HQ – Floor 2', serial: 'C02XY1234M1', purchaseDate: '2024-03-15' },
  { id: 'AST-002', name: 'Dell XPS 15', type: 'Laptop', status: 'In Use', assignedTo: 'Bob Patel', location: 'HQ – Floor 3', serial: 'DXPS5L99882', purchaseDate: '2023-11-20' },
  { id: 'AST-003', name: 'ThinkPad T14s', type: 'Laptop', status: 'In Use', assignedTo: 'Sarah Connor', location: 'Finance – Floor 1', serial: 'TP14S20241122', purchaseDate: '2024-01-10' },
  { id: 'AST-004', name: 'HP LaserJet Pro M404n', type: 'Network Device', status: 'In Use', assignedTo: null, location: 'Floor 3 Print Room', serial: 'HPLJ404N2024', purchaseDate: '2022-06-01' },
  { id: 'AST-005', name: 'LG 4K UltraFine 27"', type: 'Laptop', status: 'In Use', assignedTo: 'Design Team', location: 'Design Studio', serial: 'LG27UK850B', purchaseDate: '2023-08-22' },
  { id: 'AST-006', name: 'Cisco Catalyst 9300', type: 'Network Device', status: 'Available', assignedTo: null, location: 'Comms Room A', serial: 'FDO2312G1BC', purchaseDate: '2023-05-10' },
  { id: 'AST-007', name: 'Dell PowerEdge R750 (MX01)', type: 'Server', status: 'In Use', assignedTo: null, location: 'Data Centre Rack 4', serial: 'DPE750R24X01', purchaseDate: '2022-01-15' },
  { id: 'AST-008', name: 'Microsoft 365 E3 License Pool', type: 'Software License', status: 'In Use', assignedTo: 'All Staff', location: 'Cloud', serial: 'M365E3-POOL-250', purchaseDate: '2024-01-01' },
  { id: 'AST-009', name: 'SAP S/4HANA Server', type: 'Server', status: 'In Use', assignedTo: null, location: 'Data Centre Rack 7', serial: 'SAPS4H2024ERP', purchaseDate: '2021-09-30' },
  { id: 'AST-010', name: 'iPhone 15 Pro (IT Spare)', type: 'Mobile', status: 'Available', assignedTo: null, location: 'IT Stores', serial: 'IPHX15P2024S1', purchaseDate: '2024-09-20' },
  { id: 'AST-011', name: 'iPad Pro 12.9" (Executive)', type: 'Mobile', status: 'In Use', assignedTo: 'CEO Office', location: 'Executive Floor', serial: 'IPADPRO12924', purchaseDate: '2024-06-01' },
  { id: 'AST-012', name: 'Fortinet FortiGate 200F', type: 'Network Device', status: 'In Use', assignedTo: null, location: 'Data Centre DMZ', serial: 'FGT200F2024A1', purchaseDate: '2023-02-28' },
  { id: 'AST-013', name: 'Adobe Creative Cloud (Shared)', type: 'Software License', status: 'In Use', assignedTo: 'Design Team', location: 'Cloud', serial: 'ADCC-TEAM-2024', purchaseDate: '2024-04-01' },
  { id: 'AST-014', name: 'Surface Pro 9', type: 'Laptop', status: 'Retired', assignedTo: null, location: 'IT Disposal', serial: 'MSFSP9TMP2022', purchaseDate: '2022-03-10' },
  { id: 'AST-015', name: 'Synology NAS DS923+', type: 'Server', status: 'In Use', assignedTo: null, location: 'Floor 2 Comms Room', serial: 'SYN923P24001', purchaseDate: '2023-12-05' },
];

export const INITIAL_KB_ARTICLES = [
  { id: 'KB-001', title: 'How to reset your Active Directory password', category: 'Access & Identity', content: '## Password Reset Guide\n\n1. Press Ctrl+Alt+Delete\n2. Click "Change a password"\n3. Enter your current password\n4. Enter and confirm your new password\n5. Password must be 12+ characters with uppercase, lowercase, number, and symbol.\n\nIf you are locked out, contact the IT helpdesk via suitCASE.', tags: ['password', 'AD', 'account'], author: 'a3', views: 342, helpful: 89, notHelpful: 4, status: 'Published', createdAt: subDays(NOW, 30) },
  { id: 'KB-002', title: 'VPN setup guide for remote employees (Windows & Mac)', category: 'Network & VPN', content: '## VPN Setup\n\n### Windows\n1. Download the GlobalProtect client from the IT portal.\n2. Install and launch GlobalProtect.\n3. Enter gateway: vpn.company.com\n4. Use your AD credentials to log in.\n\n### macOS\n1. Download GlobalProtect for Mac.\n2. Install and open System Preferences → Security.\n3. Allow the VPN extension.\n4. Follow the same gateway steps.', tags: ['vpn', 'remote', 'network', 'globalprotect'], author: 'a4', views: 512, helpful: 143, notHelpful: 12, status: 'Published', createdAt: subDays(NOW, 45) },
  { id: 'KB-003', title: 'Setting up Microsoft Authenticator for MFA', category: 'Security', content: '## Microsoft Authenticator MFA Setup\n\n1. Download Microsoft Authenticator from the App Store or Google Play.\n2. Open a browser and go to aka.ms/mfasetup\n3. Sign in with your company email.\n4. Follow the wizard to scan the QR code.\n5. Approve the test notification.\n\n**Note:** If setup fails, ensure the app has notification permissions.', tags: ['mfa', 'authenticator', 'security', '2fa'], author: 'a1', views: 278, helpful: 67, notHelpful: 8, status: 'Published', createdAt: subDays(NOW, 20) },
  { id: 'KB-004', title: 'How to request software or hardware via the Service Catalog', category: 'Service Requests', content: '## Using the Service Catalog\n\n1. Log into suitCASE at helpdesk.company.com\n2. Click "Service Catalog" in the left sidebar.\n3. Browse by category or use the search bar.\n4. Click the service you need and fill in the request form.\n5. Submit — your request will be reviewed within 1 business day.\n\nAll hardware requests above £500 require manager approval.', tags: ['catalog', 'request', 'software', 'hardware'], author: 'a3', views: 198, helpful: 54, notHelpful: 3, status: 'Published', createdAt: subDays(NOW, 15) },
  { id: 'KB-005', title: 'Troubleshooting Zoom audio and video issues', category: 'Collaboration Tools', content: '## Zoom Troubleshooting\n\n### No Audio\n- Check Speaker/Microphone in Zoom Audio settings\n- Ensure the correct device is selected\n- Test audio in Settings → Audio → Test Speaker\n\n### Poor Video Quality\n- Ensure adequate lighting (face a window)\n- Close bandwidth-intensive apps\n- Lower video resolution to 720p\n\n### Echo\n- Use headphones to prevent microphone pickup of speakers', tags: ['zoom', 'audio', 'video', 'conference'], author: 'a4', views: 423, helpful: 112, notHelpful: 9, status: 'Published', createdAt: subDays(NOW, 25) },
  { id: 'KB-006', title: 'SharePoint folder permissions – how to request and manage access', category: 'Collaboration Tools', content: '## SharePoint Access Guide\n\nManagers can grant folder access via:\n1. Right-click folder → Manage Access → Add people\n\nFor inherited permissions:\n1. Site Settings → Site Permissions → Permission Levels\n\nIf you need access to a protected folder, raise a Service Request through suitCASE and your manager will be notified for approval.', tags: ['sharepoint', 'permissions', 'access', 'microsoft365'], author: 'a2', views: 310, helpful: 78, notHelpful: 15, status: 'Published', createdAt: subDays(NOW, 60) },
  { id: 'KB-007', title: 'Email not working? Follow these steps first', category: 'Email & Calendar', content: '## Email Troubleshooting Checklist\n\n1. **Check Outlook status** – Open Outlook, look for "Connected" or "Disconnected" in the status bar.\n2. **Restart Outlook** – Close completely and reopen.\n3. **Check VPN** – Ensure you are connected to VPN if working remotely.\n4. **Run Email Repair** – Control Panel → Programs → Microsoft 365 → Repair\n5. **Still not working?** – Raise an incident via suitCASE immediately.', tags: ['email', 'outlook', 'troubleshoot'], author: 'a3', views: 567, helpful: 201, notHelpful: 18, status: 'Published', createdAt: subDays(NOW, 90) },
  { id: 'KB-008', title: 'How to back up your data to OneDrive', category: 'Data & Storage', content: '## OneDrive Backup Guide\n\n### Enable Known Folder Move\n1. Open OneDrive settings (system tray icon → Settings)\n2. Click "Backup" tab\n3. Click "Manage backup"\n4. Select Desktop, Documents, and Pictures\n5. Click "Start backup"\n\nThis ensures your files are automatically backed up and accessible from any device.', tags: ['onedrive', 'backup', 'microsoft365', 'storage'], author: 'a4', views: 189, helpful: 61, notHelpful: 5, status: 'Published', createdAt: subDays(NOW, 40) },
  { id: 'KB-009', title: 'Getting started with company IT – new employee checklist', category: 'Onboarding', content: '## New Employee IT Checklist\n\n- [ ] Collect laptop from IT on Day 1\n- [ ] Set up Windows Hello PIN\n- [ ] Enrol in MFA (see KB-003)\n- [ ] Connect to VPN (see KB-002)\n- [ ] Access Microsoft 365 apps\n- [ ] Set up email signature\n- [ ] Join your team Slack workspace\n- [ ] Complete mandatory cybersecurity training\n\nFor any issues, contact the IT helpdesk via suitCASE.', tags: ['onboarding', 'new employee', 'checklist', 'setup'], author: 'a1', views: 892, helpful: 267, notHelpful: 14, status: 'Published', createdAt: subDays(NOW, 120) },
  { id: 'KB-010', title: 'Understanding SLA priorities and response times', category: 'Service Requests', content: '## SLA Priority Guide\n\n| Priority | Response Time | Examples |\n|----------|--------------|----------|\n| Critical | 1 hour | Total outages, security breaches |\n| High | 4 hours | Widespread issues, key system failures |\n| Medium | 8 hours | Single-user issues, software problems |\n| Low | 24 hours | General requests, non-urgent queries |\n\nSLA timers pause when tickets are in "Pending" status awaiting user input.', tags: ['sla', 'priority', 'response time'], author: 'a2', views: 445, helpful: 134, notHelpful: 7, status: 'Published', createdAt: subDays(NOW, 35) },
];

export const CATALOG_ITEMS = [
  { id: 'cat-001', name: 'New Laptop Provisioning', category: 'Hardware', description: 'Request a new laptop for yourself or a new team member. Includes OS setup, software, and security configuration.', estimatedTime: '3-5 business days', requiresApproval: true, icon: 'Laptop' },
  { id: 'cat-002', name: 'Software License Request', category: 'Software', description: 'Request a new software license or additional seats for existing tools (e.g., Adobe, Figma, Zoom Pro).', estimatedTime: '1-2 business days', requiresApproval: true, icon: 'Package' },
  { id: 'cat-003', name: 'Password Reset', category: 'Access', description: 'Reset your Active Directory or application password. For locked accounts, identity verification is required.', estimatedTime: '30 minutes', requiresApproval: false, icon: 'KeyRound' },
  { id: 'cat-004', name: 'VPN Access Request', category: 'Network', description: 'Request VPN access for remote working. Includes setup guide and credential provisioning.', estimatedTime: '2 hours', requiresApproval: false, icon: 'Shield' },
  { id: 'cat-005', name: 'New Employee IT Onboarding', category: 'HR IT', description: 'Full IT setup for a new employee: laptop, email, M365, VPN, Slack, badge access. Coordinate with HR.', estimatedTime: '1 business day', requiresApproval: true, icon: 'UserPlus' },
  { id: 'cat-006', name: 'Mobile Device Provision', category: 'Hardware', description: 'Request a company iPhone or Android device for business use. Includes MDM enrolment.', estimatedTime: '2-3 business days', requiresApproval: true, icon: 'Smartphone' },
  { id: 'cat-007', name: 'Conference Room AV Setup', category: 'Facilities', description: 'Request AV and video conferencing setup for conference rooms or events.', estimatedTime: '4 hours', requiresApproval: false, icon: 'Monitor' },
  { id: 'cat-008', name: 'Cloud Storage Increase', category: 'Network', description: 'Request an increase to your OneDrive or SharePoint storage quota above the default 1TB.', estimatedTime: '1 business day', requiresApproval: false, icon: 'Cloud' },
];

export const AUTOMATION_RULES = [
  { id: 'auto-001', name: 'Critical unassigned escalation', trigger: 'Priority = Critical AND unassigned for > 30 min', action: 'Notify Manager + Assign to Tier 2', enabled: true },
  { id: 'auto-002', name: 'Auto-close resolved tickets', trigger: 'Status = Resolved for 48 hours', action: 'Auto-close ticket and notify requester', enabled: true },
  { id: 'auto-003', name: 'Password reset auto-assign', trigger: 'Category = Service Request AND title contains "password"', action: 'Assign to Tier 1 team', enabled: true },
  { id: 'auto-004', name: 'SLA breach notification', trigger: 'SLA status = Breached', action: 'Notify Assignee + Manager via email', enabled: true },
  { id: 'auto-005', name: 'Stale ticket reminder', trigger: 'Status = Open AND no update for 72 hours', action: 'Send reminder to Assignee', enabled: false },
];

export const INITIAL_NOTIFICATIONS = [
  { id: 'n1', type: 'assignment', message: 'suitCASE: INC-0001 has been assigned to you', read: false, createdAt: subHours(NOW, 3), ticketId: 'INC-0001' },
  { id: 'n2', type: 'sla_risk', message: 'suitCASE: SLA at risk – INC-0005 is approaching breach', read: false, createdAt: subHours(NOW, 2), ticketId: 'INC-0005' },
  { id: 'n3', type: 'comment', message: 'suitCASE: New comment on INC-0001 from Bob Patel', read: false, createdAt: subHours(NOW, 2), ticketId: 'INC-0001' },
  { id: 'n4', type: 'approval', message: 'suitCASE: REQ-0001 awaiting your approval', read: false, createdAt: subDays(NOW, 1), ticketId: 'REQ-0001' },
  { id: 'n5', type: 'sla_breach', message: 'suitCASE: SLA BREACHED – INC-0014 is overdue', read: false, createdAt: subDays(NOW, 1), ticketId: 'INC-0014' },
  { id: 'n6', type: 'resolved', message: 'suitCASE: INC-0004 has been resolved by David Kim', read: true, createdAt: subDays(NOW, 1), ticketId: 'INC-0004' },
  { id: 'n7', type: 'assignment', message: 'suitCASE: CHG-0001 has been assigned to you for implementation', read: true, createdAt: subDays(NOW, 2), ticketId: 'CHG-0001' },
  { id: 'n8', type: 'comment', message: 'suitCASE: New internal note on CHG-0002 from Alice Nguyen', read: true, createdAt: subDays(NOW, 1), ticketId: 'CHG-0002' },
  { id: 'n9', type: 'resolved', message: 'suitCASE: REQ-0005 has been resolved – password reset complete', read: true, createdAt: subMinutes(NOW, 30), ticketId: 'REQ-0005' },
  { id: 'n10', type: 'sla_risk', message: 'suitCASE: SLA at risk – INC-0012 requires immediate attention', read: false, createdAt: subMinutes(NOW, 45), ticketId: 'INC-0012' },
];
