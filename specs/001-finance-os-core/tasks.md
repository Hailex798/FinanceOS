# Tasks: Finance OS

**Input**: Design documents from `/specs/main/`
**Prerequisites**: plan.md (loaded), spec.md (loaded), DESIGN.md (loaded), constitution.md (loaded)
**Tests**: Included per constitution requirements (Section 9)
**Organization**: Tasks grouped by user story from spec.md (US-AUTH, US-DASH, US-BOARD, US-ANALYTICS, US-INVEST, US-AI, US-NOTIF, US-SETTINGS)

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story group (US-AUTH, US-BOARD, etc.)
- Exact file paths included per plan.md folder structure

---

## Phase 1: Setup (Project Scaffold)

**Purpose**: Fully configured project shell with dev environment ready

- [ ] T001 Initialize Next.js 14 project: `npx create-next-app@14 . --typescript --tailwind --app --src-dir --import-alias "@/*"`
- [ ] T002 Create complete folder structure per plan.md Phase 0 in `src/`
- [ ] T003 [P] Install production dependencies with exact pinned versions from plan.md dependency manifest into `package.json`
- [ ] T004 [P] Install dev dependencies with exact pinned versions from plan.md dependency manifest into `package.json`
- [ ] T005 [P] Configure TypeScript strict mode in `tsconfig.json` (strict: true, no any)
- [ ] T006 [P] Configure ESLint with `eslint-config-next` + `@typescript-eslint` rules in `eslint.config.js`
- [ ] T007 [P] Configure Prettier with `prettier-plugin-tailwindcss` in `.prettierrc`
- [ ] T008 Create `docker-compose.yml` for local PostgreSQL + Redis services
- [ ] T009 Create `.env.example` with all required environment variables per plan.md deployment section
- [ ] T010 Create `.env.local` skeleton (gitignored) for local development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Design System Foundation

- [ ] T011 Extract Stitch design tokens from `specs/main/DESIGN.md` into `tailwind.config.ts` (colors, typography, spacing, border-radius, shadows, glassmorphism utilities)
- [ ] T012 [P] Configure Inter font from Google Fonts with `tabular-nums` variant in `src/app/layout.tsx`
- [ ] T013 [P] Create global CSS with design system variables and glassmorphism utility classes in `src/app/globals.css`
- [ ] T014 Initialize shadcn/ui: `npx shadcn-ui@latest init` and install all components listed in plan.md
- [ ] T015 [P] Create custom Tailwind plugins for ghost-border, glass-card, and ambient-shadow effects per DESIGN.md rules

### Database & ORM

- [ ] T016 Create Prisma schema with all models per plan.md database schema section in `prisma/schema.prisma`
- [ ] T017 Run initial Prisma migration: `npx prisma migrate dev --name init`
- [ ] T018 [P] Create Prisma client singleton in `src/server/db.ts`
- [ ] T019 [P] Create seed script with default categories in `prisma/seed.ts`

### tRPC Infrastructure

- [ ] T020 Create tRPC initialization (context, router factory, procedures) in `src/server/trpc/index.ts`
- [ ] T021 [P] Create appRouter shell merging all sub-routers in `src/server/trpc/router.ts`
- [ ] T022 [P] Create tRPC HTTP handler for App Router in `src/app/api/trpc/[trpc]/route.ts`
- [ ] T023 [P] Create tRPC React client setup in `src/trpc/client.ts`
- [ ] T024 [P] Create tRPC server caller for RSC in `src/trpc/server.ts`
- [ ] T025 Create TRPCProvider + QueryClientProvider wrapper in `src/trpc/provider.tsx`

### Redis & BullMQ

- [ ] T026 Create Upstash Redis client singleton in `src/server/cache/redis.ts`
- [ ] T027 [P] Create cache key builders in `src/server/cache/keys.ts`
- [ ] T028 [P] Create cache invalidation helpers in `src/server/cache/invalidation.ts`
- [ ] T029 Create BullMQ queue definitions (analytics, insights, notifications) in `src/server/jobs/queue.ts`
- [ ] T030 [P] Create worker entry point scaffold in `workers/index.ts`
- [ ] T031 [P] Create worker Dockerfile in `workers/Dockerfile`

### Shared Utilities & Components

- [ ] T032 [P] Create `formatCurrency()` utility (paise → display) in `src/lib/format-currency.ts`
- [ ] T033 [P] Create `cn()` helper and general utils in `src/lib/utils.ts`
- [ ] T034 [P] Create date utility helpers in `src/lib/date-utils.ts`
- [ ] T035 [P] Create shared TypeScript types and enums in `src/types/index.ts`
- [ ] T036 [P] Create constants file in `src/lib/constants.ts`
- [ ] T037 [P] Create ErrorBoundary component in `src/components/shared/error-boundary.tsx`
- [ ] T038 [P] Create PageTransition component with Framer Motion in `src/components/shared/page-transition.tsx`
- [ ] T039 [P] Create SkeletonCard component (dimensions matching Stitch card layouts) in `src/components/shared/skeleton-card.tsx`
- [ ] T040 [P] Create EmptyState component with illustration + CTA pattern in `src/components/shared/empty-state.tsx`
- [ ] T041 [P] Create ConfirmDialog component in `src/components/shared/confirm-dialog.tsx`
- [ ] T042 [P] Create CurrencyDisplay component in `src/components/shared/currency-display.tsx`
- [ ] T043 [P] Create ChartWrapper component with Framer Motion in `src/components/shared/chart-wrapper.tsx`

### Root Layout & Providers

- [ ] T044 Create root layout with providers (TRPCProvider, QueryClient, ThemeProvider, Framer Motion) in `src/app/layout.tsx`
- [ ] T045 [P] Create root loading.tsx in `src/app/loading.tsx`
- [ ] T046 [P] Create root error.tsx in `src/app/error.tsx`
- [ ] T047 [P] Create root not-found.tsx in `src/app/not-found.tsx`

### Monitoring & Logging

- [ ] T048 [P] Configure Sentry for Next.js in root config files
- [ ] T049 [P] Configure Winston structured JSON logging in `src/server/logger.ts`

### Testing Infrastructure

- [ ] T050 [P] Configure Vitest with React Testing Library in `vitest.config.ts`
- [ ] T051 [P] Configure Playwright in `playwright.config.ts`

**Checkpoint**: `npm run dev` starts cleanly. `npm run build` succeeds. Tests run (empty suite passes). Design tokens are in `tailwind.config.ts`.

---

## Phase 3: User Story Group — Authentication (Priority: P1) 🎯 MVP

**Goal**: Working signup, login, Google OAuth, route protection, and session management
**Spec References**: US-AUTH-01, US-AUTH-02, US-AUTH-03, US-AUTH-04
**Stitch Reference**: `Login.html`

**Independent Test**: User can sign up, log in (email + Google), access Dashboard, and be redirected when unauthenticated.

### Implementation

- [ ] T052 [US-AUTH] Configure NextAuth v5 with Prisma adapter in `src/server/auth.ts`
- [ ] T053 [US-AUTH] Implement Credentials provider (email + bcrypt password) in `src/server/auth.ts`
- [ ] T054 [US-AUTH] Implement Google OAuth provider in `src/server/auth.ts`
- [ ] T055 [US-AUTH] Create NextAuth API route handler in `src/app/api/auth/[...nextauth]/route.ts`
- [ ] T056 [US-AUTH] Create `auth.router.ts` (signup mutation, getSession, updateProfile) in `src/server/trpc/routers/auth.router.ts`
- [ ] T057 [P] [US-AUTH] Create Zod validation schemas for auth forms in `src/lib/validators/auth.schema.ts`
- [ ] T058 [US-AUTH] Create auth route group layout (no sidebar/header) in `src/app/(auth)/layout.tsx`
- [ ] T059 [US-AUTH] Build login page matching Stitch `Login.html` mockup in `src/app/(auth)/login/page.tsx`
- [ ] T060 [P] [US-AUTH] Build LoginForm component (React Hook Form + Zod) in `src/components/auth/login-form.tsx`
- [ ] T061 [P] [US-AUTH] Build SignupForm component (React Hook Form + Zod) in `src/components/auth/signup-form.tsx`
- [ ] T062 [P] [US-AUTH] Build GoogleButton component in `src/components/auth/google-button.tsx`
- [ ] T063 [US-AUTH] Build signup page matching Stitch `Login.html` mockup in `src/app/(auth)/signup/page.tsx`
- [ ] T064 [US-AUTH] Implement auth middleware protecting all `(dashboard)` routes in `src/middleware.ts`
- [ ] T065 [US-AUTH] Handle account linking (Google + existing email) in auth config
- [ ] T066 [US-AUTH] Implement rate limiting on auth endpoints (5/min/IP) in auth router
- [ ] T067 [US-AUTH] Implement logout flow with session clearing
- [ ] T068 [US-AUTH] Add Framer Motion form animations to auth pages
- [ ] T069 [US-AUTH] Seed default categories on first user creation via auth callback
- [ ] T070 [US-AUTH] Write integration tests for signup/login/OAuth flows in `tests/integration/auth.test.ts`

**Checkpoint**: User can sign up, log in, and access Dashboard. Unauthenticated users are redirected. Google OAuth creates/links accounts.

---

## Phase 4: User Story Group — Boards & Expenses (Priority: P1) 🎯 MVP

**Goal**: Full Kanban board experience with expense CRUD, drag-and-drop, filters, and board analytics
**Spec References**: US-BOARD-01 through US-BOARD-07, US-BOARD-02 (Bank Accounts)
**Stitch Reference**: `KanBanBoards.html`

**Independent Test**: User can create boards, add/edit/delete expenses, drag between columns, filter, and see per-board analytics.

### Zustand Stores

- [ ] T071 [P] [US-BOARD] Create UI store (sidebar state, modals) in `src/stores/ui.store.ts`
- [ ] T072 [P] [US-BOARD] Create board store (active board, drag state) in `src/stores/board.store.ts`
- [ ] T073 [P] [US-BOARD] Create filter store (active filters) in `src/stores/filter.store.ts`

### Zod Validators

- [ ] T074 [P] [US-BOARD] Create expense validation schema in `src/lib/validators/expense.schema.ts`
- [ ] T075 [P] [US-BOARD] Create board validation schema in `src/lib/validators/board.schema.ts`
- [ ] T076 [P] [US-BOARD] Create account validation schema in `src/lib/validators/account.schema.ts`
- [ ] T077 [P] [US-BOARD] Create category validation schema in `src/lib/validators/category.schema.ts`

### tRPC Routers

- [ ] T078 [US-BOARD] Implement `account.router.ts` (CRUD for bank accounts) in `src/server/trpc/routers/account.router.ts`
- [ ] T079 [US-BOARD] Implement `board.router.ts` (CRUD for boards) in `src/server/trpc/routers/board.router.ts`
- [ ] T080 [US-BOARD] Implement `expense.router.ts` (CRUD + status + reorder + suggestCategory) in `src/server/trpc/routers/expense.router.ts`
- [ ] T081 [US-BOARD] Implement `category.router.ts` (CRUD + reassignment) in `src/server/trpc/routers/category.router.ts`

### Hooks

- [ ] T082 [P] [US-BOARD] Create `useExpenses` hook in `src/hooks/use-expenses.ts`
- [ ] T083 [P] [US-BOARD] Create `useBoards` hook in `src/hooks/use-boards.ts`

### Dashboard Layout

- [ ] T084 [US-BOARD] Create authenticated dashboard layout with sidebar + header + auth guard in `src/app/(dashboard)/layout.tsx`
- [ ] T085 [P] [US-BOARD] Build Sidebar component (64px icon-only, Stitch DESIGN.md rules) in `src/components/layout/sidebar.tsx`
- [ ] T086 [P] [US-BOARD] Build Header component with notification bell in `src/components/layout/header.tsx`
- [ ] T087 [P] [US-BOARD] Build MobileNav component (bottom navigation) in `src/components/layout/mobile-nav.tsx`

### Board UI Components

- [ ] T088 [US-BOARD] Build board list page (grid layout) matching Stitch `KanBanBoards.html` in `src/app/(dashboard)/boards/page.tsx`
- [ ] T089 [P] [US-BOARD] Build BoardList component in `src/components/boards/board-list.tsx`
- [ ] T090 [P] [US-BOARD] Build BoardCard component in `src/components/boards/board-card.tsx`
- [ ] T091 [US-BOARD] Build single board Kanban view page in `src/app/(dashboard)/boards/[boardId]/page.tsx`
- [ ] T092 [US-BOARD] Build KanbanBoard component (3 columns: Planned, Spent, Recurring) in `src/components/boards/kanban-board.tsx`
- [ ] T093 [P] [US-BOARD] Build KanbanColumn component with total display in `src/components/boards/kanban-column.tsx`
- [ ] T094 [P] [US-BOARD] Build ExpenseCard component with all fields in `src/components/boards/expense-card.tsx`
- [ ] T095 [US-BOARD] Build ExpenseForm modal (React Hook Form + Zod, tax calc) in `src/components/boards/expense-form.tsx`

### Drag and Drop

- [ ] T096 [US-BOARD] Integrate @dnd-kit for drag-and-drop between columns in `src/components/boards/kanban-board.tsx`
- [ ] T097 [US-BOARD] Implement optimistic updates for drag-and-drop status changes

### Filters & Board Analytics

- [ ] T098 [US-BOARD] Build BoardFilters component (category, date, tax, amount) in `src/components/boards/board-filters.tsx`
- [ ] T099 [US-BOARD] Build BoardAnalytics panel (pie chart, trend, tax total) in `src/components/boards/board-analytics.tsx`

### Bank Account Management

- [ ] T100 [US-BOARD] Build settings accounts page in `src/app/(dashboard)/settings/accounts/page.tsx`

### Async Jobs Connection

- [ ] T101 [US-BOARD] Connect expense mutations → BullMQ analytics queue dispatch

### Animations & Responsive

- [ ] T102 [US-BOARD] Add Framer Motion animations (card mount, column transitions, drag ghost)
- [ ] T103 [US-BOARD] Implement mobile responsive layout (stacked columns / tabs on <768px)

### Tests

- [ ] T104 [US-BOARD] Write unit tests for tax calculation logic in `tests/unit/tax-calc.test.ts`
- [ ] T105 [US-BOARD] Write integration tests for expense CRUD in `tests/integration/expense.test.ts`
- [ ] T106 [US-BOARD] Write E2E test: create board → add expense → drag to Spent in `tests/e2e/board-flow.spec.ts`

**Checkpoint**: Full Kanban board experience working. Expenses CRUD, drag-drop, filters, board analytics, bank accounts all functional.

---

## Phase 5: User Story Group — Analytics (Priority: P2)

**Goal**: Full analytics dashboard with charts, tax summary, anomaly detection, and export
**Spec References**: US-ANALYTICS-01 through US-ANALYTICS-05
**Stitch Reference**: `DetailedAnalytics.html`

**Independent Test**: Analytics tab shows monthly comparison, category breakdown, tax summary, anomalies, and export works.

### Service Layer

- [ ] T107 [US-ANALYTICS] Implement `analytics.service.ts` (all aggregation queries) in `src/server/services/analytics.service.ts`
- [ ] T108 [US-ANALYTICS] Implement `analytics.router.ts` (all query procedures with Redis caching) in `src/server/trpc/routers/analytics.router.ts`

### Hook

- [ ] T109 [P] [US-ANALYTICS] Create `useAnalytics` hook in `src/hooks/use-analytics.ts`

### UI Components

- [ ] T110 [US-ANALYTICS] Build analytics page matching Stitch `DetailedAnalytics.html` in `src/app/(dashboard)/analytics/page.tsx`
- [ ] T111 [P] [US-ANALYTICS] Build MonthlyComparison bar chart (Recharts) in `src/components/analytics/monthly-comparison.tsx`
- [ ] T112 [P] [US-ANALYTICS] Build CategoryBreakdown donut chart (Recharts) in `src/components/analytics/category-breakdown.tsx`
- [ ] T113 [P] [US-ANALYTICS] Build TaxSummary cards + expense table in `src/components/analytics/tax-summary.tsx`
- [ ] T114 [P] [US-ANALYTICS] Build AnomalyList component with warning badges in `src/components/analytics/anomaly-list.tsx`
- [ ] T115 [US-ANALYTICS] Build ExportDialog with scope selection in `src/components/analytics/export-dialog.tsx`

### Export Logic

- [ ] T116 [US-ANALYTICS] Implement CSV export logic (PapaParse) in analytics.router export mutation
- [ ] T117 [US-ANALYTICS] Implement PDF export logic (jsPDF + autotable) in analytics.router export mutation

### Anomaly Detection

- [ ] T118 [US-ANALYTICS] Implement anomaly detection logic (≥ 2× category average) in analytics service

### BullMQ Worker

- [ ] T119 [US-ANALYTICS] Implement recalculate-analytics processor in `src/server/jobs/processors/recalculate-analytics.ts`

### Animations

- [ ] T120 [US-ANALYTICS] Add Framer Motion chart reveal animations via ChartWrapper

### Tests

- [ ] T121 [US-ANALYTICS] Write unit tests for analytics service calculations in `tests/unit/analytics.test.ts`
- [ ] T122 [US-ANALYTICS] Write integration tests for analytics endpoints (cached/uncached) in `tests/integration/analytics.test.ts`

**Checkpoint**: Analytics tab fully functional with all charts, export, and anomaly detection.

---

## Phase 6: User Story Group — Investments & Net Worth (Priority: P2)

**Goal**: Investment portfolio tracking and net worth timeline
**Spec References**: US-INVEST-01 through US-INVEST-04
**Stitch Reference**: `InvestmentNetWorth.html`

**Independent Test**: User can manage investments, see portfolio allocation, and view net worth trend.

### Validation & Hooks

- [ ] T123 [P] [US-INVEST] Create investment validation schema in `src/lib/validators/investment.schema.ts`
- [ ] T124 [P] [US-INVEST] Create `useInvestments` hook in `src/hooks/use-investments.ts`

### Service & Router

- [ ] T125 [US-INVEST] Implement `investment.service.ts` and `net-worth.service.ts` in `src/server/services/`
- [ ] T126 [US-INVEST] Implement `investment.router.ts` (CRUD + portfolio + netWorth + bulkUpdate) in `src/server/trpc/routers/investment.router.ts`

### UI Components

- [ ] T127 [US-INVEST] Build investments page matching Stitch `InvestmentNetWorth.html` in `src/app/(dashboard)/investments/page.tsx`
- [ ] T128 [P] [US-INVEST] Build InvestmentForm modal in `src/components/investments/investment-form.tsx`
- [ ] T129 [P] [US-INVEST] Build PortfolioOverview (summary cards + allocation donut) in `src/components/investments/portfolio-overview.tsx`
- [ ] T130 [P] [US-INVEST] Build AllocationChart donut (Recharts) in `src/components/investments/allocation-chart.tsx`
- [ ] T131 [P] [US-INVEST] Build InvestmentList with sortable columns + inline edit in `src/components/investments/investment-list.tsx`
- [ ] T132 [US-INVEST] Build NetWorthChart line chart (Recharts) in `src/components/investments/net-worth-chart.tsx`

### Cron Jobs

- [ ] T133 [US-INVEST] Implement net worth snapshot cron job processor in `src/server/jobs/processors/net-worth-snapshot.ts`
- [ ] T134 [US-INVEST] Add Redis caching for portfolio + net worth queries in investment router

### Animations & Tests

- [ ] T135 [US-INVEST] Add Framer Motion animations for charts and cards
- [ ] T136 [US-INVEST] Write integration tests for investment CRUD in `tests/integration/investment.test.ts`
- [ ] T137 [US-INVEST] Write E2E test: add investment → view portfolio → update value in `tests/e2e/investment-flow.spec.ts`

**Checkpoint**: Investment portfolio fully functional with allocation chart, net worth trend, and cron snapshots.

---

## Phase 7: User Story Group — AI Layer (Priority: P3)

**Goal**: AI-powered insights, suggestions, and auto-categorization
**Spec References**: US-AI-01 through US-AI-05
**Stitch Reference**: `AllInsightsDashboard.html`

**Independent Test**: AI insights generate, display correctly, and degrade gracefully when Claude unavailable.

### AI Infrastructure

- [ ] T138 [US-AI] Set up Anthropic Claude client in `src/server/ai/client.ts`
- [ ] T139 [P] [US-AI] Build prompt template: monthly-summary in `src/server/ai/prompts/monthly-summary.ts`
- [ ] T140 [P] [US-AI] Build prompt template: cost-reduction in `src/server/ai/prompts/cost-reduction.ts`
- [ ] T141 [P] [US-AI] Build prompt template: investment-suggestion in `src/server/ai/prompts/investment-suggestion.ts`
- [ ] T142 [P] [US-AI] Build prompt template: categorize-expense in `src/server/ai/prompts/categorize-expense.ts`
- [ ] T143 [P] [US-AI] Build prompt template: anomaly-explanation in `src/server/ai/prompts/anomaly-explanation.ts`
- [ ] T144 [P] [US-AI] Build Zod schemas for AI response validation in `src/server/ai/schemas/insight-response.ts`
- [ ] T145 [P] [US-AI] Build Zod schema for categorization response in `src/server/ai/schemas/categorization-response.ts`

### Router & Worker

- [ ] T146 [US-AI] Implement `insight.router.ts` in `src/server/trpc/routers/insight.router.ts`
- [ ] T147 [US-AI] Implement insight generation BullMQ worker in `src/server/jobs/workers/insight.worker.ts`
- [ ] T148 [US-AI] Implement generate-insight processor in `src/server/jobs/processors/generate-insight.ts`

### Hook

- [ ] T149 [P] [US-AI] Create `useInsights` hook in `src/hooks/use-insights.ts`

### UI Components

- [ ] T150 [US-AI] Build insights page matching Stitch `AllInsightsDashboard.html` in `src/app/(dashboard)/insights/page.tsx`
- [ ] T151 [P] [US-AI] Build HealthSummary card in `src/components/insights/health-summary.tsx`
- [ ] T152 [P] [US-AI] Build CostSuggestions list (with dismiss) in `src/components/insights/cost-suggestions.tsx`
- [ ] T153 [P] [US-AI] Build InvestmentSuggestions section (with disclaimer) in `src/components/insights/investment-suggestions.tsx`
- [ ] T154 [P] [US-AI] Build AnomalyAlerts with NL explanations in `src/components/insights/anomaly-alerts.tsx`

### Auto-Categorization & Caching

- [ ] T155 [US-AI] Implement auto-categorization on expense title input (via suggestCategory query)
- [ ] T156 [US-AI] Implement "Regenerate" with rate limiting (1/hour) in insight router
- [ ] T157 [US-AI] Implement graceful AI fallback (app works without AI)
- [ ] T158 [US-AI] Add AI result caching (Redis, 1-hour TTL) in insight router
- [ ] T159 [US-AI] Add AI token usage logging

### Tests

- [ ] T160 [US-AI] Write unit tests for prompt builders and response validators in `tests/unit/ai.test.ts`
- [ ] T161 [US-AI] Write integration tests for insight generation pipeline in `tests/integration/insight.test.ts`

**Checkpoint**: AI insights generate, display in UI, degrade gracefully. Auto-categorization suggests categories.

---

## Phase 8: User Story Group — Notifications & Dashboard (Priority: P3)

**Goal**: Notification system and polished Dashboard
**Spec References**: US-NOTIF-01 through US-NOTIF-04, US-DASH-01 through US-DASH-04
**Stitch Reference**: `Dashboard.html`

**Independent Test**: Dashboard shows real-time data. Notifications fire for overspend/reminders/summaries.

### Notification Router & Components

- [ ] T162 [US-NOTIF] Implement `notification.router.ts` in `src/server/trpc/routers/notification.router.ts`
- [ ] T163 [P] [US-NOTIF] Create `useNotifications` hook in `src/hooks/use-notifications.ts`
- [ ] T164 [P] [US-NOTIF] Build NotificationBell with unread badge in `src/components/notifications/notification-bell.tsx`
- [ ] T165 [P] [US-NOTIF] Build NotificationList dropdown/panel in `src/components/notifications/notification-list.tsx`
- [ ] T166 [P] [US-NOTIF] Build NotificationItem with click-to-navigate in `src/components/notifications/notification-item.tsx`

### Notification Workers

- [ ] T167 [US-NOTIF] Implement send-notification processor in `src/server/jobs/processors/send-notification.ts`
- [ ] T168 [US-NOTIF] Implement notification worker in `src/server/jobs/workers/notification.worker.ts`
- [ ] T169 [US-NOTIF] Add overspend check (80%/100%) in analytics worker → notification dispatch
- [ ] T170 [US-NOTIF] Implement bill reminder cron job (daily 09:00 UTC) in notification processor
- [ ] T171 [US-NOTIF] Implement monthly summary notification cron (1st of month)
- [ ] T172 [US-NOTIF] Implement 30-day auto-archive for old notifications

### Dashboard Page

- [ ] T173 [US-DASH] Build Dashboard page matching Stitch `Dashboard.html` in `src/app/(dashboard)/page.tsx`
- [ ] T174 [P] [US-DASH] Build SummaryCards (total balance, monthly spend, savings rate) in `src/components/dashboard/summary-cards.tsx`
- [ ] T175 [P] [US-DASH] Build SparklineChart (Recharts, last 7 days) in `src/components/dashboard/sparkline-chart.tsx`
- [ ] T176 [P] [US-DASH] Build AIInsightCard (linked to insights tab) in `src/components/dashboard/ai-insight-card.tsx`
- [ ] T177 [P] [US-DASH] Build QuickActions (Add Expense / Add Investment modals) in `src/components/dashboard/quick-actions.tsx`

### Settings Notifications

- [ ] T178 [US-NOTIF] Add notification preferences (opt-in/out) in `src/app/(dashboard)/settings/page.tsx`

### Tests

- [ ] T179 [US-NOTIF] Write integration tests for notification triggers in `tests/integration/notification.test.ts`
- [ ] T180 [US-DASH] Write E2E test: exceed budget → receive overspend notification in `tests/e2e/notification-flow.spec.ts`

**Checkpoint**: Dashboard shows real-time data. Notifications fire correctly. Bell badge updates.

---

## Phase 9: User Story Group — Settings (Priority: P3)

**Goal**: Profile management, category management, currency settings
**Spec References**: US-SETTINGS-01 through US-SETTINGS-03

- [ ] T181 [US-SETTINGS] Build settings page layout in `src/app/(dashboard)/settings/page.tsx`
- [ ] T182 [P] [US-SETTINGS] Build profile management (name, picture, password change)
- [ ] T183 [US-SETTINGS] Build category management page in `src/app/(dashboard)/settings/categories/page.tsx`
- [ ] T184 [US-SETTINGS] Implement category CRUD UI with budget limit, color, icon pickers
- [ ] T185 [US-SETTINGS] Implement category delete with expense reassignment flow
- [ ] T186 [US-SETTINGS] Implement currency & locale selection (INR, USD, EUR, GBP)

**Checkpoint**: All settings functional. Categories manageable. Currency selection works globally.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Production-ready polish, performance, accessibility, deployment

### Navigation & UX

- [ ] T187 Implement sidebar navigation (collapsible desktop, bottom mobile) refinements
- [ ] T188 Build CommandPalette (Ctrl+K) in `src/components/layout/command-palette.tsx`
- [ ] T189 [P] Implement all keyboard shortcuts (Ctrl+N, Ctrl+Shift+N, Escape) in `src/hooks/use-keyboard-shortcut.ts`
- [ ] T190 Add page transitions (Framer Motion AnimatePresence) across all routes

### State Audits

- [ ] T191 Audit and fix all loading states (skeleton components must match Stitch dimensions)
- [ ] T192 [P] Audit and fix all empty states (illustrations + CTAs per spec Section 4.2)
- [ ] T193 [P] Audit and fix all error states (error boundaries per spec Section 4.3)
- [ ] T194 Add sonner toast notifications for all mutations per spec Section 4.5

### Quality & Performance

- [ ] T195 Responsive design audit (375px–1440px, Stitch visual language preserved)
- [ ] T196 Accessibility audit (keyboard nav, ARIA, contrast ≥ 4.5:1)
- [ ] T197 Performance audit (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] T198 Bundle size analysis (`@next/bundle-analyzer`, no chunk > 200KB gzipped)
- [ ] T199 Configure Sentry for production (source maps, breadcrumbs)

### Deployment

- [ ] T200 Write remaining E2E tests for critical flows in `tests/e2e/`
- [ ] T201 Set up Vercel deployment (frontend) with `vercel.json`
- [ ] T202 Set up Railway deployment (workers)
- [ ] T203 Configure production environment variables
- [ ] T204 Create CI/CD pipeline (`.github/workflows/ci.yml`) per plan.md
- [ ] T205 Run full test suite — all tests must pass
- [ ] T206 Create production deployment checklist
- [ ] T207 Deploy to production

**Checkpoint**: All Core Web Vitals meet targets. All E2E tests pass. Zero unhandled Sentry errors. Production live.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phases 3-4 (Auth + Boards)**: Depend on Phase 2 — P1 priority, MVP scope
- **Phases 5-6 (Analytics + Investments)**: Depend on Phase 2 — P2, can parallel with each other
- **Phases 7-8 (AI + Notifications/Dashboard)**: Depend on Phases 3-6 — P3, depends on data being present
- **Phase 9 (Settings)**: Can parallel with Phases 5-8
- **Phase 10 (Polish)**: Depends on all feature phases complete

### User Story Independence

| Story Group | Dependencies | Can Parallel With |
|-------------|-------------|-------------------|
| US-AUTH (P3) | Phase 2 only | — (must be first) |
| US-BOARD (P4) | Phase 2 + US-AUTH | — (must follow AUTH) |
| US-ANALYTICS (P5) | Phase 2 + US-BOARD (needs expense data) | US-INVEST |
| US-INVEST (P6) | Phase 2 + US-AUTH | US-ANALYTICS |
| US-AI (P7) | Phase 2 + US-ANALYTICS + US-INVEST | US-NOTIF |
| US-NOTIF (P8) | Phase 2 + US-BOARD | US-AI, US-SETTINGS |
| US-DASH (P8) | Phase 2 + most features | US-NOTIF |
| US-SETTINGS (P9) | Phase 2 + US-AUTH | Most phases |

### Parallel Opportunities per Phase

**Phase 2 (Foundational)**: T012-T015, T018-T019, T021-T025, T027-T028, T030-T031, T032-T043, T045-T051 can all run in parallel batches
**Phase 3 (Auth)**: T057, T060-T062 can parallel
**Phase 4 (Boards)**: T071-T077, T082-T083, T085-T087, T089-T090, T093-T094 can parallel

---

## Implementation Strategy

### MVP First (Phases 1-4)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: Authentication
4. Complete Phase 4: Boards & Expenses
5. **STOP and VALIDATE**: Test auth + board flow independently
6. Deploy preview if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Auth → Login/signup working (MVP increment 1)
3. Boards + Expenses → Core experience (MVP increment 2)
4. Analytics → Data insights (increment 3)
5. Investments → Portfolio tracking (increment 4)
6. AI + Notifications + Dashboard → Intelligence layer (increment 5)
7. Polish → Production ready (increment 6)

---

## Metrics Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 207 |
| **Phase 1 (Setup)** | 10 |
| **Phase 2 (Foundational)** | 41 |
| **Phase 3 (Auth)** | 19 |
| **Phase 4 (Boards)** | 36 |
| **Phase 5 (Analytics)** | 16 |
| **Phase 6 (Investments)** | 15 |
| **Phase 7 (AI)** | 24 |
| **Phase 8 (Notif+Dash)** | 19 |
| **Phase 9 (Settings)** | 6 |
| **Phase 10 (Polish)** | 21 |
| **Parallel tasks [P]** | ~80 |
| **MVP tasks (Phases 1-4)** | 106 |

---

_Generated: 2026-03-30_
_Based on: spec.md v1.1.0, plan.md v1.1.0, constitution.md v1.1.0_
