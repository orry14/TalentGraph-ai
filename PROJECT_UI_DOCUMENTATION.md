# PROJECT_UI_DOCUMENTATION.md

# Project Overview

- **Project Name**: TalentGraph
- **Purpose**: TalentGraph is an advanced Workforce Intelligence Operating System and digital twin designed to manage organizational skill taxonomies, optimize project staffing compositions, analyze external hiring pipelines, predict attrition and skill decay risks, and simulate succession pathways.
- **Tech Stack**:
  - **Frontend**: React (v18.3.1), TypeScript, Vite, Tailwind CSS, Lucide React (Icons), Recharts (Data Visualization), React Flow (Org Hierarchy & Traversal), Framer Motion (Animations), Socket.io-client (Real-time updates).
  - **Backend**: Express, Multer (Resume uploading), Supabase (PostgreSQL Client), Neo4j (Graph Database client), Groq SDK (AI evaluations), Anthropic SDK (Inference), Node-cron, PDF-lib, PDF-parse.
- **Folder Structure**:
  - `client/`
    - `src/`
      - `assets/` - Logo assets and images.
      - `components/` - Reusable UI widgets and layout containers.
      - `context/` - Auth and Role switcher context systems.
      - `pages/` - Core workspace tabs.
      - `utils/` - Global API client bindings and static mock datastores.
  - `server/`
    - `src/`
      - `db/` - DB client setups (Supabase client, Neo4j driver).
      - `middleware/` - Express role-based RBAC checks.
      - `services/` - Core logic engines (AI, Analytics, Prediction, Risk, Sim engines).
      - `utils/` - Audit logger, PDF generator, GitHub API helper metrics.
- **Routing System**: Client-side tab routing implemented in `client/src/App.tsx`. The active viewport is controlled by a state parameter (`activeTab`) which maps directly to the main sidebar workspace switches.
- **Global Layout**: Implemented in `client/src/components/Layout.tsx`. It features a fixed left-aligned sidebar with platform navigation, a profile metadata badge, and a role switcher. The top navbar displays the current page title and the Org Capability Index indicator.
- **Authentication Flow**: Setup in `client/src/context/AuthContext.tsx`. Currently, the platform implements a bypass authentication flow, defaulting to an administrator role session for `guest@talentgraph.ai`.
- **Theme System**: Implemented in Tailwind CSS. It follows a dark "mission control" slate design system, styled with border opacity utilities, bright gradient accents, and neon glassmorphism borders.
- **State Management**: Uses React standard context providers (`AuthContext` and `RoleContext`) for global auth states and mock authorization level settings. Page-level interactions are driven by standard react `useState` and `useMemo` hooks.
- **API Architecture**: Centralized in `client/src/utils/api.ts`. It provides an `api` helper object wrapping standard fetch operations targeting the `/api/*` endpoints, utilizing local mock JSON arrays as fallback modes if the server is offline.

---

# Complete Sitemap

```
Workspace
├── Command Center (Real-Time Telemetry Dashboard)
├── Dashboard (Executive Analytics Cockpit)
├── Employee Workspace (Talent Registry & Insights)
├── Recruitment (Hiring Drives & Pipeline)
├── Projects (Portfolio Management)
├── Project Staffing Engine (Constraint Optimizer)
├── Skill Gap Analysis (Core Gaps & Training)
├── Talent Network (Neo4j Graph Visualization)
├── Audit Logs (Administrative Access Control Logs)
└── Settings (Automation & Cron Schedules)
```

---

# Navigation

- **Sidebar Items**:
  - **Command Center**: (Default Landing) Live telemetry feed, headcount gauges, and real-time alerts.
  - **Dashboard**: High-level KPIs, attrition trends, portfolio health dials, and executive AI warnings.
  - **Employee Workspace**: Searchable employee database, resume parser, skill ratings, roadmaps, and career simulator.
  - **Recruitment**: Active campaigns list, CV uploader, match scores, and interview kits.
  - **Projects**: Portfolio tracker, project detail workspace (Overview, Health, Budget, Skills, Risks).
  - **Project Staffing Engine**: Constraint-based staffing solver with slider adjustments.
  - **Skill Gap Analysis**: Core skill variances against targets, hiring, and internal training lists.
  - **Talent Network**: interactive force-directed Neo4j canvas, SPOFs list, path to coverage tools.
  - **Audit Logs**: Filterable administrative security tracking table (Admin-Only).
  - **Settings**: Automated report scheduler panels.
- **Top Navigation**: Displays active view label, org capability index widget, and platform connectivity status indicator.
- **Dropdowns**: Department select filter in Employee workspace and Staffing pages, status toggles on candidate cards.
- **User Menu**: Located at the bottom of the sidebar. Displays initials, name, mock role status, and the mock role selector.
- **Mobile Navigation**: Hidden/Not natively responsive; standard desktop layout scaling.
- **Breadcrumbs**: None.
- **Hidden Routes**: `Audit Logs` is gated to the `admin` role.

---

# Page Documentation

## Command Center Page
- **Route**: `/command-center`
- **Purpose**: Displays a real-time animated view of organizational telemetry, flight risks, and database shifts via Socket.io.
- **Current Layout**:
  - Header with live telemetry active pulse badge and simulation injector.
  - Left panel containing: Utilization semi-circle gauge, Headcount stat card, Bench Cost stat card, live scrolling alerts feed.
  - Right panel containing: Interactive force graph showing node links.
- **Components Used**: `LiveGauge`, `AlertsFeed`, `LiveGraph`, `SimulatePanel`.
- **Tables**: None.
- **Forms**: None.
- **Buttons**: `Simulate Demo Event` (Admin-Only).
- **Icons**: `Activity`, `Users`, `DollarSign`, `AlertCircle`, `PlayCircle`.
- **Dialogs**: None.
- **APIs Used**: `GET /api/dashboard/stats`, `POST /api/simulate-event`.
- **State**: `socket` connection, `alerts` feed list, `stats` object.
- **Problems**: Graph is static-sized (not fully fluid wrapper width), alerts scroll box does not have drag scroll controls.
- **Improvement Ideas**: Add alert category filters, animate graph nodes with real-time ripples on alerts.

## Dashboard Page
- **Route**: `/dashboard`
- **Purpose**: High-level executive overview of headcount, capability index, attrition, and project health.
- **Current Layout**:
  - Executive search header with CSV/PDF export controls.
  - KPI Stat Grid (Headcount, Experience, Performance, Capability Score).
  - Financial insights panel: current monthly bench cost and 6-month forecast chart.
  - Risk Trends section: Attrition forecast, Skill decay projection, Bench utilization projection charts.
  - Project execution cockpit: Portfolio health dial, High-risk project alarms, Upcoming milestones.
  - Bottom layout: Org Twin mini map hierarchy and AI action alert log cards.
- **Components Used**: `GlassCard`, `CapabilityRiskWidget`, `Recharts AreaChart / BarChart`.
- **Tables**: None.
- **Forms**: Search text input ("Query department capabilities...").
- **Buttons**: `Export CSV`, `Export PDF`, `Skill Search` redirects, project diagnosis triggers.
- **Icons**: `BrainCircuit`, `Search`, `Users`, `Compass`, `Star`, `Activity`, `AlertTriangle`, `Calendar`, `Sparkles`.
- **Dialogs**: None.
- **APIs Used**: `GET /api/dashboard/stats`, `GET /api/predictive/workforce`, `POST /api/export`.
- **State**: `predictiveReport`, `loadingPredictive`, `searchVal`.
- **Problems**: Search bar does not automatically query/filter charts, the Twin Mini Map is mock-drawn nodes.
- **Improvement Ideas**: Make search dynamically highlight matching skills on the mini map.

## Employee Workspace Page
- **Route**: `/employees`
- **Purpose**: Manage workforce roster, upload CVs, view profiles, inspect AI-generated career paths and succession simulations.
- **Current Layout**:
  - Left Sidebar: CV uploader drop zone, department tabs filter, semantic AI search bar, employee directory list.
  - Right Workspace: Selected employee summary card (Name, Role, Dept, Github/Gitlab links, Exp, Perf, Bio), AI succession simulation drawer trigger, skills mapping grid, soft skills, active projects, upskilling roadmap, AI promotion readiness score gauge.
- **Components Used**: `SuccessionSimulator`, `SemanticSearch`, `GitConnectModal`, `SkeletonCard`.
- **Tables**: None.
- **Forms**: File input drag-drop, Semantic search query input.
- **Buttons**: Connect GitHub/GitLab, AI Career Simulator trigger, Regenerate learning roadmaps, Regenerate promotion readiness.
- **Icons**: `UploadCloud`, `Search`, `Briefcase`, `Compass`, `Star`, `Award`, `Sparkles`, `BookOpen`, `ChevronRight`, `RefreshCw`, `Github`, `Gitlab`, `BadgeCheck`.
- **Dialogs**: `GitConnectModal`, `SuccessionSimulator` drawer.
- **APIs Used**: `GET /api/employees`, `GET /api/employees/:id`, `POST /api/employees/upload-resume`, `POST /api/employees/:id/recommendations`, `POST /api/employees/:id/promotion`.
- **State**: `selectedId`, `selectedEmployee`, `searchQuery`, `selectedDept`, `isUploading`, `uploadStage`, `gitConnectPlatform`.
- **Problems**: No pagination on left directory (could load hundreds of elements), upskilling roadmap lacks clear step milestones.
- **Improvement Ideas**: Add search highlights on matches, enable direct manual editing of skills.

## Recruitment Page
- **Route**: `/recruitment`
- **Purpose**: Manage campus drive campaigns, parse applicant resumes in bulk, review AI match score breakdowns, and generate interview questions.
- **Current Layout**:
  - KPI banner cards (Drives open, applied, shortlisted, rejected, interview scheduled, offers).
  - Left layout: Active hiring drives select feed and campaign creation form.
  - Right layout: Bulk CV upload zone, Candidate Search & Status filter, Applicant results list, candidate evaluation panel.
- **Components Used**: `GlassCard`, `Search`, `UploadCloud`.
- **Tables**: Candidates ranking result panel.
- **Forms**: Create Hiring Campaign Form (18 inputs/fields).
- **Buttons**: Create Hiring Drive submit, CSV export, candidate status switchers (Interview, Offer, Reject).
- **Icons**: `UploadCloud`, `Briefcase`, `Users`, `CheckCircle`, `XCircle`, `Calendar`, `Award`, `Search`, `Download`, `Sparkles`, `Brain`, `MessageSquare`.
- **Dialogs**: None.
- **APIs Used**: `GET /api/recruitment/dashboard`, `GET /api/recruitment/drives`, `POST /api/recruitment/drives`, `GET /api/recruitment/candidates`, `POST /api/recruitment/upload-resumes`, `POST /api/recruitment/search`, `POST /api/recruitment/candidates/:id/status`.
- **State**: `dashboard`, `drives`, `selectedDriveId`, `candidates`, `selectedCandidate`, `form`, `query`, `statusFilter`, `isUploading`, `uploadStage`.
- **Problems**: Large drive creation form is cluttered, candidate details pane requires vertical scrolling for core charts.
- **Improvement Ideas**: Group drive form inputs into accordion steps (Job details, Criteria, Workflow).

## Projects Page
- **Route**: `/projects`
- **Purpose**: Roster of company projects, budget allocations, team construction, risk mitigation planning, and delivery index forecasting.
- **Current Layout**:
  - Left panel: Search registry, status and health filters, sorted list of projects with health scores.
  - Right panel: Selected project cockpit with tab selectors (Overview, Health, Team, Timeline, Budget, Skills, Risks).
    - Overview: Code, BU, Industry, managers, summary details.
    - Health: Dial graphs for delivery confidence, on-time probabilities, budget overrun projections.
    - Team: Active staff member grid, allocation switches, allocation percentage indicator.
    - Timeline: Task checklists and milestone target registers.
    - Skills: Radar chart mapping team skills against project specifications.
    - Risks: SPOF/under-allocation risk warning logs.
- **Components Used**: `GlassCard`, `SkeletonTable`, `RadarChart`, `AreaChart`.
- **Tables**: Milestones registry table, Task roster table, Documents table.
- **Forms**: Add Project member form, Add project milestone form, Add task form.
- **Buttons**: Create Project button, Edit Project button, Delete Project, Add member, Add task, Add milestone.
- **Icons**: `FolderGit`, `Plus`, `Search`, `Filter`, `ArrowUpDown`, `Edit2`, `Trash2`, `Archive`, `TrendingUp`, `Users`, `Calendar`, `DollarSign`, `Activity`, `Sparkles`, `Check`.
- **Dialogs**: Create / Edit Project Modal dialogs.
- **APIs Used**: `GET /api/projects`, `GET /api/projects/:id`, `POST /api/projects`, `PUT /api/projects/:id`, `DELETE /api/projects/:id`, `POST /api/projects/:id/members`, `DELETE /api/projects/:id/members/:memberId`.
- **State**: `projectsList`, `employees`, `selectedProject`, `searchQuery`, `statusFilter`, `activeTab`.
- **Problems**: Skills radar chart requires a specific minimum team size to render, or else breaks styling.
- **Improvement Ideas**: Render warning state in Radar charts when team size is zero.

## Project Staffing Engine Page
- **Route**: `/staffing`
- **Purpose**: Algorithmic resource staffing recommendation system based on cost, skills, and bench utilization metrics.
- **Current Layout**:
  - Left Panel: Target project picker dropdown, cross-project conflict resolution dashboard link, constraint weight sliders.
  - Right Panel: Solved team recommendations block, overall matching margin indicator, nominees card list, alternative backups.
- **Components Used**: `ConflictResolverModal`.
- **Tables**: None.
- **Forms**: Sliders weight configuration, Project select.
- **Buttons**: `Solve Staffing Constraints`, CSV/PDF exports, cross-project conflicts trigger.
- **Icons**: `Briefcase`, `Layers`, `ChevronRight`, `TrendingUp`, `AlertTriangle`, `ArrowRight`, `Sparkles`, `Users`, `Settings2`.
- **Dialogs**: `ConflictResolverModal`.
- **APIs Used**: `GET /api/projects`, `POST /api/staffing/optimize`, `POST /api/export`.
- **State**: `projectsList`, `selectedProjectId`, `weights`, `isLoading`, `recommendation`, `showConflicts`.
- **Problems**: Weight sliders do not auto-sum to 100% (requires cognitive load to configure manually).
- **Improvement Ideas**: Implement normalizer so adjusting one slider automatically adjusts the others proportionally to maintain 100% total.

## Skill Gap Analysis Page
- **Route**: `/gap-analysis`
- **Purpose**: Inspect variances between existing employee capabilities and future roadmap competencies.
- **Current Layout**:
  - Top core warnings panel showing overall critical skill count.
  - Main comparison list: progress tracking lines showing current organizational proficiency averages vs industry targets.
  - Right sidebar: AI-suggested external hiring roles and internal classroom upskilling suggestions.
- **Components Used**: `GlassCard`.
- **Tables**: Competency comparison table.
- **Forms**: None.
- **Buttons**: CSV Export, PDF Export.
- **Icons**: `TrendingUp`, `AlertOctagon`, `UserPlus`, `BookOpen`, `ArrowRight`.
- **Dialogs**: None.
- **APIs Used**: `GET /api/gap-analysis`, `POST /api/export`.
- **State**: None (driven by parent properties).
- **Problems**: Comparison progress bars do not display numerical tooltips on slide tracks.
- **Improvement Ideas**: Add hover tooltips on variance scores.

## Talent Network Page
- **Route**: `/talent-network`
- **Purpose**: Render Neo4j knowledge graph mapping reports, skillsets, and departments. Detect single points of failure.
- **Current Layout**:
  - Header with manual DB resync triggers.
  - Subtab options pill (Talent Network graph, SPOF table, Path to Coverage).
  - Graph area: Canvas force-directed rendering, filters, node detail cards, and legends.
  - SPOF Tab: tabular reports of critical/medium/low skills with expert counts and projects dependent on them.
  - Path tab: Search input to map shared employee trajectories.
- **Components Used**: `ForceGraph` (HTML5 Canvas wrapper), `GlassCard`.
- **Tables**: SPOF Table, Path to Coverage step maps.
- **Forms**: Path to coverage search bar, SPOF threshold dropdown, graph filters.
- **Buttons**: `Sync Graph`, `Apply` filters, `Find Path`.
- **Icons**: `Network`, `AlertTriangle`, `Search`, `GitBranch`, `ChevronRight`, `Database`, `RefreshCw`.
- **Dialogs**: None.
- **APIs Used**: `GET /api/search/knowledge-graph`, `GET /api/graph/spofs`, `GET /api/graph/path`, `POST /api/graph/sync`.
- **State**: `activeTab`, `graphData`, `spofData`, `pathResult`, `selectedNode`, `deptFilter`.
- **Problems**: HTML5 Canvas rendering does not scale easily to mobile views. Force simulation might freeze UI on huge node counts.
- **Improvement Ideas**: Implement WebGL fallback for node rendering and introduce pagination for large trees.

## Audit Logs Page
- **Route**: `/audit-logs`
- **Purpose**: Regulatory auditing for admin actions (user management, promotion evaluations, CSV/PDF reports exports).
- **Current Layout**:
  - Left panel: Search filter options (Actor, Target ID, Action, Date).
  - Right panel: Paginated, clean data table.
- **Components Used**: `GlassCard`.
- **Tables**: Audit Log Table (columns: Timestamp, Actor, Role, Action, Target, Metadata).
- **Forms**: Filter inputs (Text searches, Date pickers).
- **Buttons**: Reset filter settings, Pagination arrow switches.
- **Icons**: `ShieldAlert`, `Search`, `Filter`, `Calendar`.
- **Dialogs**: None.
- **APIs Used**: `GET /api/audit-logs`.
- **State**: `logs`, `loading`, `page`, `filters`.
- **Problems**: Metadata payload shows raw JSON text which overflows table width.
- **Improvement Ideas**: Add collapsible accordion row for raw JSON metadata strings.

## Settings Page
- **Route**: `/settings`
- **Purpose**: Configure cron scheduler criteria, report templates, and automated email dispatches.
- **Current Layout**:
  - Left form card: Automation report config (Type selection, frequency slider, recipient inputs).
  - Right panel: Roster of current scheduled cron tables.
- **Components Used**: `GlassCard`.
- **Tables**: Active Automation Schedules (columns: Report, Frequency, Recipients, Next Run, Cancel action).
- **Forms**: Add Schedule Form.
- **Buttons**: `Add Schedule` trigger, Cancel schedule trash button.
- **Icons**: `Calendar`, `Trash2`, `Plus`, `Check`.
- **Dialogs**: Confirm cancellation alert.
- **APIs Used**: `GET /api/settings/schedules`, `POST /api/settings/schedules`, `DELETE /api/settings/schedules/:id`.
- **State**: `reports`, `loading`, `reportType`, `frequency`, `recipients`, `saving`, `success`.
- **Problems**: No validation check to verify if comma-separated emails are syntax-correct.
- **Improvement Ideas**: Create chip-input element for emails with regex validation.

## Skill Graph Page
- **Route**: `/skill-graph`
- **Purpose**: Digital twin simulation sandbox where admins can test structural variations (layoffs, department merges, transfers).
- **Current Layout**: Renders the `OrgTwinWorkspace` component.
- **Components Used**: `OrgTwinWorkspace`.
- **Tables / Forms / Buttons / Icons / Dialogs / APIs Used / State / Problems / Improvement Ideas**: (See `OrgTwinWorkspace` Component documentation below).

---

# Component Documentation

| Component | Purpose | Key Props | Used In | Visual Style | Current Problems | Suggested Improvements |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GlassCard** | Backdrop layout container | `className`, `glow`, `hoverGlow`, `children` | All Pages | Slate grey translucent fill, thin border with gradient drop-shadows | Glowing effects occasionally overflow bounds of grid parent elements | Apply `contain: layout` style to prevent shadow bleeding |
| **CapabilityRiskWidget** | SPOF and Flight Risk panel | None | Dashboard | Left-bordered warning logs in red, orange, yellow with git indicators | Detailed modal takes up the entire card area, hiding alternative list | Redesign details panel as a sliding drawer |
| **SuccessionSimulator** | Simulates succession planning | `employee`, `onClose` | Employees | Absolute bottom overlay sheet with dark blur, ready/upskill list indicators | Large layout stretches off the screen on small laptop viewports | Add scroll containers for alternative lists |
| **ChatBot** | Floating AI assistant | `setActiveTab` | Global Layout | Bottom-right circular button with neon blue hover border, chat message thread | Long answers stretch the container bubble excessively | Enforce fixed max-height scroll limit |
| **ConflictResolverModal** | Staffing overlaps resolution | `onClose` | Staffing | Center dark backdrop popup with tab tables for options | Action buttons on resolve methods are tiny | Enforce clear outline button style for options |
| **GitConnectModal** | Connect GitHub/GitLab usernames | `platform`, `onConnect`, `onClose` | Employees | Dark overlay modal with input fields | Lacks real-time verification status validation spinner | Add API credentials checks before saving |
| **SemanticSearch** | AI-driven search query bar | `onSelectEmployee` | Employees | Text input with blue icon indicator | Does not support enter-key submission to trigger search | Add explicit search icon action button |
| **RequireRole** | Gate elements based on user permissions | `roles`, `children` | Layout, CommandCenter, AuditLogs | Wraps DOM elements, conditional render | Hidden sections leave dead space if sidebar is empty | Gracefully slide remaining items to fill empty spaces |
| **AlertsFeed** | Scrolling telemetry feed | `alerts` | CommandCenter | Dark bordered cards with animated entries | Fast events can cause feed to jump | Enforce framer-motion layout transitions for smooth layout changes |
| **LiveGauge** | Animated radial gauge | `value` | CommandCenter | SVG semi-circle with animated green/blue/red stroke | Text label font size does not scale nicely | Make font size proportional to SVG viewport |
| **LiveGraph** | Visualizes team reporting networks | `updateTrigger` | CommandCenter | canvas 2D force-directed node diagram | Lacks user control buttons (Zoom in, Zoom out, reset) | Add standard canvas control overlay buttons |
| **SimulatePanel** | Triggers mock websocket signals | None | CommandCenter | Indigo accent button | Trigger confirms via standard browser `confirm()` | Build custom styled confirm alert modal |

---

# Forms

## 1. Create Hiring Campaign Form
- **Fields**:
  - `hiringName` (text, default: Software Engineer Trainee)
  - `company` (text, default: TalentGraph)
  - `department` (text, default: Engineering)
  - `role` (text, default: Software Engineer Trainee)
  - `source` (text, default: Campus Placement)
  - `location` (text, default: Hybrid)
  - `salary` (text)
  - `experience` (text, default: 0-1 years)
  - `hiringDeadline` (date picker)
  - `maximumCandidates` (number)
  - `description` (textarea)
  - `requiredSkills` (comma-separated text)
  - `preferredSkills` (comma-separated text)
  - `branches` (comma-separated text)
  - `preferredColleges` (comma-separated text)
  - `requiredCertifications` (comma-separated text)
  - `projectKeywords` (comma-separated text)
  - `languages` (comma-separated text)
  - `interviewRounds` (comma-separated text)
  - `portfolioRequired` (checkbox)
  - `githubRequired` (checkbox)
- **Validation**: Default browser form validation (no complex custom criteria validation).
- **Buttons**: `Create Hiring Drive` (submit).
- **Submission Flow**: Submits JSON payload with array splits on comma inputs to `POST /api/recruitment/drives`. On success, reload drives roster list.
- **Error States**: Renders validation error bar in red at the top of the recruitment panel on network failure.
- **Loading State**: Disables button, text updates to "Creating...".

## 2. Schedule Automated Report Form
- **Fields**:
  - `reportType` (dropdown: executive dashboard, employee directory, skill gap analysis)
  - `frequency` (dropdown: weekly, monthly)
  - `recipients` (text, comma-separated emails)
- **Validation**: `required` attribute.
- **Buttons**: `Add Schedule` (submit).
- **Submission Flow**: Submits JSON details to `POST /api/settings/schedules`. Updates scheduled table list.
- **Error States**: Triggers standard window alert popups on API error.
- **Loading State**: Disables save button, displays "Scheduling...".

## 3. Project Creation Form
- **Fields**:
  - `id` (text, project code)
  - `name` (text, project name)
  - `description` (textarea)
  - `requiredSkills` (comma-separated text)
  - `teamSize` (number)
  - `durationMonths` (number)
  - `budget` (number)
  - `priority` (dropdown: High, Medium, Low)
  - `client` (text)
  - `industry` (text)
  - `businessUnit` (text)
  - `projectManager` (text)
- **Validation**: Check if ID and Name are entered.
- **Buttons**: `Save Project` (submit), `Cancel`.
- **Submission Flow**: Submits details to `POST /api/projects`. Reloads project list.
- **Error States**: Logs error to console.
- **Loading State**: None.

---

# Tables

## 1. Project Directory Table
- **Columns**: Name, Code, Health, Priority, Budget, Manager, Status, Actions.
- **Sorting**: Supported on all keys (name, client, manager, priority) via column header toggles.
- **Filtering**: Filters on Status, Priority, Industry, Client, Manager, Health.
- **Pagination**: Client-side pagination (8 rows per page).
- **Bulk Actions**: None.
- **Export Options**: None on the main table.
- **Current UX Problems**: Long project description truncates awkwardly on row layouts.

## 2. Active Automation Schedules Table
- **Columns**: Report, Frequency, Recipients, Next Scheduled Run, Actions (Cancel/Trash).
- **Sorting**: None.
- **Filtering**: None.
- **Pagination**: None.
- **Bulk Actions**: None.
- **Export Options**: None.
- **Current UX Problems**: Email string list stretches columns on narrow displays.

## 3. Audit Log Table
- **Columns**: Log ID, Timestamp, Actor, Role, Action, Target, Metadata.
- **Sorting**: Sort by timestamp.
- **Filtering**: Search filters on Actor, Action, Target. Date range filters.
- **Pagination**: Server-side pagination (50 items per page).
- **Bulk Actions**: None.
- **Export Options**: None.
- **Current UX Problems**: Metadata contains raw JSON text that wraps, causing rows to expand vertically.

---

# Dashboard Documentation

## Executive Dashboard
- **Cards**:
  - **Total Headcount**: Displays total workforce count.
  - **Avg Experience**: Shows average tenure years.
  - **Avg Performance**: Shows overall rating score out of 5.
  - **Workforce Capability**: Core capability score percentage with animation spinner.
- **Charts**:
  - Attrition Risk Forecast: Recharts Area Chart displaying forecast line over 6 months with 95% confidence intervals.
  - Skill Decay Risk Projection: Recharts Area Chart displaying decay timeline rate projections.
  - Bench & Utilization Forecast: Recharts Area Chart showing utilization forecast over active projects.
  - Bench Cost Trend: Recharts Area Chart showing monthly bench idle cost over time.
- **Metrics**: Portfolio Health Score, Skill Distribution averages, Departmental Headcount.
- **Widgets**: Capability Risks Widget, Org Twin Mini Map, Quick Analytics Actions panel.
- **Recent Activity**: Upcoming milestone timeline checklist.
- **Notifications**: Executive AI Alerts card listing critical warnings.
- **Quick Actions**: "Open Digital Twin Sandbox" and "Staffing Optimizer Studio" redirects.
- **Current Layout**: Multicolumn layout. Top 4 KPI blocks, followed by two-column financial charts, three-column predictive charts, three-column portfolio checkers, and two-column sandbox integrations.

---

# Settings Documentation

- **Sections**: Automation Rules, Cron Report Scheduler.
- **Forms**: Create automation schedule form (Report, frequency, emails list).
- **Permissions**: Schedule actions are limited to `admin` / manager roles.
- **Preferences**: Reports types can be configured for dashboard, employee directory, and skill gap reports.
- **Theme**: Inherited global dark dark-slate layout.
- **Profile**: None.
- **Security**: Gated via `requireRole` middleware checks.
- **Notifications**: Automatic report delivery setups.

---

# Authentication

- **Login**: Mock interface in context (`AuthContext.tsx`). Form fields for Email and Password. Hardcoded credential check: `admin123` defaults to Manager, `demo` defaults to Viewer.
- **Signup**: None.
- **Forgot Password**: None.
- **Reset Password**: None.
- **OTP**: None.
- **Role Selection**: Dropdown on layout sidebar allowing active role swaps among Admin, Manager, and Employee.
- **Protected Routes**: Handled via `RequireRole` client component wrapper.
- **Session Handling**: Saved locally inside `localStorage` under keys `tg_user`, `tg_token`, `mockRole`, `mockUserId`.

---

# Modals

## 1. Conflict Resolver Modal
- **Purpose**: Displays resource allocation details when an employee is staffed on multiple active projects.
- **Fields**: Roster list of conflicting assignments.
- **Buttons**: `Close`.
- **Triggers**: Staffing studio warning indicator button.
- **Closing Actions**: click close icon or modal backdrop.

## 2. Git Connect Modal
- **Purpose**: Link GitHub/GitLab usernames to import commit history for skill verification.
- **Fields**: Username text input.
- **Buttons**: `Connect`, `Cancel`.
- **Triggers**: Connect GitHub / Connect GitLab buttons in Employee Profile.
- **Closing Actions**: Click cancel or close icon.

---

# Charts

- **1. Attrition Risk Forecast**:
  - **Chart Type**: Area Chart (Recharts).
  - **Data Source**: `api.getPredictiveReport()`.
  - **Purpose**: Displays organizational churn risks.
  - **Interaction**: Hover tooltip displaying numerical scores and confidence limits.
- **2. Bench Cost Trend**:
  - **Chart Type**: Area Chart (Recharts).
  - **Data Source**: `api.getPredictiveReport()`.
  - **Purpose**: Displays monthly cost forecast of bench talent.
  - **Interaction**: Hover tooltip showing projected cost in currency.
- **3. Skill Distribution Radar**:
  - **Chart Type**: Radar Chart (Recharts).
  - **Data Source**: `api.getProjectDetails(id)`.
  - **Purpose**: Compares current team capabilities against project requirements.
  - **Interaction**: Radar shape overlays displaying skill variances.

---

# Theme

- **Colors**:
  - Backgrounds: Dark slate black (`bg-slate-950`), cards background (`bg-slate-900/40`), input fields (`bg-slate-900`).
  - Text: Gray labels (`text-slate-500`), main text (`text-slate-100`), titles (`text-white`).
  - Highlights: Indigo (`text-indigo-400`), Blue (`text-blue-400`), Emerald (`text-emerald-400`), Amber (`text-amber-400`), Red (`text-red-400`).
- **Typography**: Inter / Outfit fonts. Headers use extra-bold weights (`font-black`, `font-extrabold`).
- **Spacing**: Tailwind grids and gaps (`gap-6`, `gap-8`), paddings (`p-4`, `p-6`).
- **Border Radius**: Large corners (`rounded-xl`, `rounded-2xl`, `rounded-3xl`).
- **Icons**: Lucide React icon suite.
- **Animations**: Standard Tailwind spin-slow, Framer-motion page scale transitions, and pulsing indicator rings.
- **Dark Mode**: Always active (no light mode fallback).
- **Glass Effects**: Thin borders (`border-slate-800`), backing blurs (`backdrop-blur-md`), backdrop overlays (`bg-slate-950/80`).
- **Gradients**: Blue-indigo button fades, emerald-teal metrics borders, and dark translucent grid masks.

---

# Design System

- **Current Design Language**: Dark mission-control theme utilizing grid layout modules, glassmorphism overlays, and bright accent colors.
- **Current Component Consistency**: Medium-high. Most components share `GlassCard` layout styles. However, form fields are styled inconsistently across recruitment and project creation panels.
- **Current Problems**:
  - **Accessibility Issues**: Contrast ratios on gray text (`text-slate-500`) against dark card backgrounds fail WCAG guidelines. Form inputs lack descriptive `<label>` tags.
  - **Responsive Issues**: Layouts break on screens narrower than 1024px. The sidebar is fixed-width and lacks a collapsible toggle.
  - **Typography Issues**: Very small fonts are used (`text-[9px]`, `text-[8px]`), which are hard to read on standard displays.
  - **Spacing Issues**: Inconsistent margin spacings, causing cards to clash on compact layouts.
  - **Color Issues**: The warning state uses two different yellow colors (`text-yellow-500` and `text-amber-400`), causing slight visual inconsistency.

---

# UI Audit

| Page | Route | Visual Design /10 | UX /10 | Accessibility /10 | Consistency /10 | Responsiveness /10 | Modernity /10 | Overall /10 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Command Center** | `/command-center` | 9 | 8 | 5 | 9 | 4 | 9 | 7.3 |
| **Dashboard** | `/dashboard` | 8 | 8 | 5 | 8 | 6 | 8 | 7.1 |
| **Employees** | `/employees` | 8 | 7 | 4 | 8 | 5 | 8 | 6.7 |
| **Recruitment** | `/recruitment` | 7 | 6 | 4 | 7 | 4 | 7 | 5.8 |
| **Projects** | `/projects` | 8 | 7 | 4 | 8 | 5 | 8 | 6.7 |
| **Staffing** | `/staffing` | 8 | 7 | 4 | 8 | 5 | 8 | 6.7 |
| **Gap Analysis** | `/gap-analysis` | 8 | 8 | 5 | 8 | 7 | 8 | 7.3 |
| **Talent Network** | `/talent-network` | 9 | 7 | 4 | 9 | 4 | 9 | 7.0 |
| **Audit Logs** | `/audit-logs` | 6 | 7 | 5 | 7 | 6 | 6 | 6.1 |
| **Settings** | `/settings` | 7 | 7 | 5 | 7 | 6 | 7 | 6.5 |

- **Audit Rationale**:
  - The visual design is highly polished with glassmorphism cards and clean typography.
  - However, accessibility is poor due to low-contrast text and small font sizes.
  - Responsiveness is also a weak point; the fixed-width sidebar restricts mobile and tablet usability.

---

# UI Redesign Recommendations

## Command Center Page
- **Current Issues**: Graph lacks interactive zoom controls, and alerts scroll box lacks clear separators.
- **Suggested Layout**: Expand graph viewport area, and place alerts in a structured side drawer.
- **Suggested Components**: HTML5 Canvas zoom controls overlays.
- **Better Information Hierarchy**: Place the utilization index at the top-left of the telemetry grid.
- **Spacing Improvements**: Increase card padding to 24px.
- **Color Improvements**: Use high-contrast blue shadows for active nodes.
- **Typography/Animations/Micro-interactions**: Add pulsing entrance transitions to alert cards.

## Dashboard Page
- **Current Issues**: The mini map is static and lacks data filtering options.
- **Suggested Layout**: Place filter criteria tools directly above KPI panels.
- **Suggested Components**: Filter autocomplete chips input.
- **Better Information Hierarchy**: Prioritize Attrition Warnings at the top of the dashboard feed.
- **Spacing Improvements**: Enforce 32px gaps between grid columns.
- **Color Improvements**: Use bright red indicators for warning logs.

(Follow similar visual updates across all pages: grouping large forms, standardizing fonts above 11px, using normalizers on sliders, adding labels to inputs, and creating accordion tables for raw JSON strings).

---

# Global Improvements (100 UI/UX Improvements)

1. Enforce minimum font size of 12px for body copy.
2. Standardize custom scrollbar styles across all browsers.
3. Make the main layout sidebar collapsible.
4. Implement proportional normalization for sliders.
5. Add `<label>` elements to all form fields.
6. Replace basic select dropdowns with styled popover select cards.
7. Include email syntax validation in report inputs.
8. Add tooltips to variance charts.
9. Enforce `contain: layout` style on GlassCard glowing elements.
10. Render placeholder warnings in empty radar chart areas.
11. Add Zoom in/out action buttons to the Talent Network graph.
12. Render raw JSON logs inside collapsible accordion rows in Audit Logs.
13. Implement client-side virtual scrolling for employee roster cards.
14. Group Recruitment form fields into step tabs.
15. Add copy-to-clipboard buttons for long email logs.
16. Ensure dark text meets WCAG AA contrast ratios against slates.
17. Make the mini map nodes clickable to filter cards.
18. Support keyboard navigation inside list items.
19. Standardize error message formats at the top of pages.
20. Add skeletons during async data regenerations.
21. Animate force graph nodes on alert signals.
22. Align close icons consistently at the top right of modal cards.
23. Add pagination controls to employee lookup cards.
24. Place target variance line legends in gap charts.
25. Standardize on-hover card transitions.
26. Render warning text when uploading invalid zip file formats.
27. Ensure date inputs are accessible on mobile.
28. Add search highlight tags.
29. Replace standard popups with custom confirm dialog overlays.
30. Make department filters sticky during scrolling.
31. Build empty-state guides for new projects.
32. Add download progress indicators on CSV/PDF exports.
33. Standardize yellow colors across alerts.
34. Avoid truncating long project names.
35. Render success check alerts on connect buttons.
36. Allow search by skill name in the main dashboard.
37. Standardize primary buttons as solid blue.
38. Add tooltips explaining how the Org Capability Index is calculated.
39. Align table columns consistently (numbers right, text left).
40. Use standard CSS units (rem) instead of fixed pixels.
41. Handle offline API connectivity failures gracefully.
42. Add reset buttons to sitemap forms.
43. Animate metrics loading transitions.
44. Keep detail panels visible on wide displays.
45. Implement search history options.
46. Standardize card layout borders.
47. Use clear color coding for priority states.
48. Limit task descriptions to 3 lines.
49. Animate status transition checkmarks.
50. Set default focus on search inputs.
51. Support custom currency settings.
52. Standardize focus rings on keyboard navigation.
53. Display total count next to department headers.
54. Support drag-reordering of milestones.
55. Set clear max-widths on raw JSON outputs.
56. Group audit logs by date.
57. Animate graph panel collapses.
58. Include description tags in settings dropdowns.
59. Include "Connect GitHub" links on employee cards.
60. Show average experience indicators in candidate summaries.
61. Use clear error icons inside input panels.
62. Validate CSV file types before processing resume batches.
63. Make search text clearable.
64. Animate hover state scale changes.
65. Make radar shapes translucent to improve grid lines visibility.
66. Avoid mixing icon styles.
67. Animate modal load transitions.
68. Use simple CSS classes instead of inline style rules.
69. Standardize date formats (e.g. DD-MM-YYYY).
70. Render info cards for SPOF details.
71. Add scrollable wrappers to all tables.
72. Place close buttons at the bottom of forms.
73. Highlight critical steps in career simulation paths.
74. Standardize font weight variables.
75. Highlight matched skills in employee details cards.
76. Optimize asset loaders.
77. Render visual warnings on high-risk projects.
78. Standardize line heights for labels.
79. Wrap long candidate names.
80. Animate search result entries.
81. Use clear icons for project roles.
82. Match card layout dimensions to prevent layout shifts.
83. Show date picker templates.
84. Animate stats cards on value changes.
85. Standardize table header heights.
86. Show connection strength percentages in graph edges.
87. Highlight active links in navigation menus.
88. Enforce consistent margin gaps.
89. Render progress bars on large file uploads.
90. Standardize button hover styles.
91. Limit candidate detail charts height.
92. Animate timeline paths.
93. Wrap tooltips inside viewport container bounds.
94. Match border styles across components.
95. Use clear tags for departments in table columns.
96. Animate KPI progress dials on mount.
97. Group similar menu settings.
98. Center table loader skeletons.
99. Build responsive grid layouts.
100. Enforce accessibility standards (e.g., WCAG compliance) globally.

---

# Final UI Redesign Roadmap

## Phase 1: Critical Fixes
- Fix low contrast text ratios.
- Add `<label>` elements to inputs.
- Prevent layout shifts in graph cards.

## Phase 2: Visual Improvements
- Standardize spacing metrics.
- Enforce consistent yellow/amber shades.
- Add tooltips to variance charts.

## Phase 3: UX Improvements
- Implement proportional normalization for sliders.
- Add client-side virtual scrolling.
- Build accordion rows for raw JSON table logs.

## Phase 4: Animations
- Animate telemetry feed entries.
- Add pulsing node transitions.
- Smooth modal entrances.

## Phase 5: Accessibility
- Implement full keyboard accessibility.
- Support screen reader landmarks.

## Phase 6: Performance
- Implement virtual DOM lists.
- Pre-cache visualization assets.

## Phase 7: Polish
- Style custom scrollbars.
- Add success indicator micro-animations.
- Refine layout borders.
