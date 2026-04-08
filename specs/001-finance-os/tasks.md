# Tasks: Finance OS

**Input**: Design documents from `/specs/001-finance-os/`
**Prerequisites**: plan.md, spec.md

**Tests**: Included because testing is explicitly required in `plan.md` implementation phases.
**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story phase label (`[US1]` ... `[US7]`)
- Every task includes an exact file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and core tooling scaffold.

- [X] T001 Initialize dependency manifest and scripts in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/package.json
- [X] T002 Create environment template and runtime variable docs in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/.env.example
- [X] T003 [P] Configure TypeScript strict compiler options in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tsconfig.json
- [X] T004 [P] Configure Next.js build/runtime flags in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/next.config.js
- [X] T005 [P] Configure Tailwind tokens from design system in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tailwind.config.ts
- [X] T006 [P] Configure ESLint rules in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/.eslintrc.cjs
- [X] T007 [P] Configure Prettier formatting profile in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/.prettierrc
- [X] T008 [P] Configure Vitest test runner in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/vitest.config.ts
- [X] T009 [P] Configure Playwright e2e runner in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/playwright.config.ts
- [X] T010 Add local infra services for Postgres and Redis in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/docker-compose.yml
- [X] T011 Create global app providers and base root layout in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/app/layout.tsx
- [X] T012 Create shared app styles and token mapping notes in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/app/globals.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core architecture that must be complete before user-story implementation.

**⚠️ CRITICAL**: No user-story phase should start before this phase is complete.

- [X] T013 Create Prisma schema for core finance entities in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/prisma/schema.prisma
- [X] T014 Create initial migration and baseline constraints in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/prisma/migrations/0001_init/migration.sql
- [X] T015 Seed default categories and starter metadata in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/prisma/seed.ts
- [X] T016 [P] Configure Prisma client singleton in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/db.ts
- [X] T017 [P] Configure NextAuth base options and session strategy in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/auth.ts
- [X] T018 [P] Initialize tRPC context/router primitives in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/trpc/index.ts
- [X] T019 [P] Register root application router in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/trpc/router.ts
- [X] T020 [P] Configure Redis client and cache key helpers in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/cache/redis.ts
- [X] T021 [P] Configure BullMQ queues and worker bootstrap in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/jobs/queue.ts
- [X] T022 Create tRPC HTTP handler route in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/app/api/trpc/[trpc]/route.ts

**Checkpoint**: Foundation ready for feature-story implementation.

---

## Phase 3: User Story 1 - Authentication (Priority: P1) 🎯 MVP

**Goal**: Deliver secure signup/login, Google OAuth, and protected routes for all authenticated pages.

**Independent Test**: New user can sign up and log in, Google user can log in/link account, unauthenticated dashboard access redirects to `/login`.

### Tests for User Story 1

- [X] T023 [P] [US1] Add auth unit tests for password/rate-limit validators in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/unit/auth.validators.test.ts
- [X] T024 [P] [US1] Add integration tests for signup/login/google flows in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/integration/auth-flows.test.ts
- [X] T025 [P] [US1] Add e2e auth journey test in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/e2e/auth.spec.ts

### Implementation for User Story 1

- [X] T026 [US1] Implement auth router procedures for signup/login/linking in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/trpc/routers/auth.router.ts
- [X] T027 [US1] Wire NextAuth API route handlers in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/app/api/auth/[...nextauth]/route.ts
- [X] T028 [US1] Build signup form with Zod + RHF validation in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/auth/signup-form.tsx
- [X] T029 [US1] Build login form with lockout handling in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/auth/login-form.tsx
- [X] T030 [P] [US1] Build shared Google sign-in button component in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/auth/google-button.tsx
- [X] T031 [US1] Enforce protected-route middleware and redirect-back behavior in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/middleware.ts

**Checkpoint**: Authentication features are independently functional and testable.

---

## Phase 4: User Story 2 - Boards & Expense Management (Priority: P1)

**Goal**: Deliver account-backed boards, Kanban columns, expense CRUD, drag-and-drop, and board filtering/analytics.

**Independent Test**: User can create account + board, create/edit/delete expenses, drag cards across status columns, and apply filters with persisted updates.

### Tests for User Story 2

- [X] T032 [P] [US2] Add unit tests for tax and expense normalization logic in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/unit/expense-calculations.test.ts
- [X] T033 [P] [US2] Add integration tests for account/board/expense routers in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/integration/board-expense-routers.test.ts
- [X] T034 [P] [US2] Add e2e board workflow test (create board to drag expense) in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/e2e/boards.spec.ts

### Implementation for User Story 2

- [X] T035 [US2] Implement bank account CRUD procedures in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/trpc/routers/account.router.ts
- [X] T036 [US2] Implement board CRUD/list procedures in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/trpc/routers/board.router.ts
- [X] T037 [US2] Implement expense CRUD/status/reorder procedures in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/trpc/routers/expense.router.ts
- [X] T038 [US2] Implement expense business rules and queue trigger integration in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/services/expense.service.ts
- [X] T039 [P] [US2] Build board list and board card UI in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/boards/board-list.tsx
- [X] T040 [P] [US2] Build Kanban board/column/card components with dnd-kit in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/boards/kanban-board.tsx
- [X] T041 [P] [US2] Build expense form modal and validation schema in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/boards/expense-form.tsx
- [X] T042 [P] [US2] Build board filters and board analytics panel UI in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/boards/board-filters.tsx
- [X] T043 [US2] Wire board routes and views for list/detail pages in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/app/(dashboard)/boards/[boardId]/page.tsx

**Checkpoint**: Boards and expenses are independently functional and testable.

---

## Phase 5: User Story 3 - Analytics & Export (Priority: P2)

**Goal**: Deliver monthly/category/tax analytics, anomaly detection, and CSV/PDF exports.

**Independent Test**: User can open Analytics tab, view all computed charts/cards, see anomaly list, and export data to CSV/PDF.

### Tests for User Story 3

- [ ] T044 [P] [US3] Add unit tests for analytics aggregation/anomaly thresholds in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/unit/analytics.service.test.ts
- [ ] T045 [P] [US3] Add integration tests for analytics endpoints with cache paths in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/integration/analytics.router.test.ts
- [ ] T046 [P] [US3] Add e2e analytics export test in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/e2e/analytics.spec.ts

### Implementation for User Story 3

- [ ] T047 [US3] Implement analytics aggregation and anomaly methods in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/services/analytics.service.ts
- [ ] T048 [US3] Implement analytics query router and export procedures in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/trpc/routers/analytics.router.ts
- [ ] T049 [US3] Implement analytics cache invalidation helpers in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/cache/invalidation.ts
- [ ] T050 [P] [US3] Build monthly comparison and category breakdown charts in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/analytics/monthly-comparison.tsx
- [ ] T051 [P] [US3] Build tax summary and anomaly list components in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/analytics/tax-summary.tsx
- [ ] T052 [P] [US3] Build export dialog and client trigger actions in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/analytics/export-dialog.tsx
- [ ] T053 [US3] Wire analytics dashboard route and data hooks in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/app/(dashboard)/analytics/page.tsx

**Checkpoint**: Analytics is independently functional and testable.

---

## Phase 6: User Story 4 - Investments & Net Worth (Priority: P2)

**Goal**: Deliver investment CRUD, portfolio overview/allocation, and net worth timeline tracking.

**Independent Test**: User can add/edit investments, view portfolio summaries and allocation, and inspect net worth trend updates.

### Tests for User Story 4

- [ ] T054 [P] [US4] Add unit tests for investment return and net-worth calculations in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/unit/investment-metrics.test.ts
- [ ] T055 [P] [US4] Add integration tests for investment router and snapshots in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/integration/investment.router.test.ts
- [ ] T056 [P] [US4] Add e2e investment portfolio workflow test in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/e2e/investments.spec.ts

### Implementation for User Story 4

- [ ] T057 [US4] Implement investment CRUD/portfolio/net-worth procedures in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/trpc/routers/investment.router.ts
- [ ] T058 [US4] Implement investment and net-worth services in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/services/investment.service.ts
- [ ] T059 [US4] Implement net-worth snapshot processor and scheduler wiring in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/jobs/processors/recalculate-analytics.ts
- [ ] T060 [P] [US4] Build investment entry/edit form component in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/investments/investment-form.tsx
- [ ] T061 [P] [US4] Build portfolio overview, allocation, and list components in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/investments/portfolio-overview.tsx
- [ ] T062 [US4] Wire investments route and chart integration in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/app/(dashboard)/investments/page.tsx

**Checkpoint**: Investments and net worth are independently functional and testable.

---

## Phase 7: User Story 5 - AI Insights (Priority: P2)

**Goal**: Deliver monthly AI summaries, savings suggestions, investment guidance, anomaly explanations, and auto-categorization.

**Independent Test**: User can generate and view AI insight modules; system gracefully handles AI outages without blocking core app use.

### Tests for User Story 5

- [ ] T063 [P] [US5] Add unit tests for prompt builders and schema validators in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/unit/ai.prompts-and-schemas.test.ts
- [ ] T064 [P] [US5] Add integration tests for insight generation pipeline in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/integration/insight.pipeline.test.ts
- [ ] T065 [P] [US5] Add e2e AI insights page behavior test in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/e2e/insights.spec.ts

### Implementation for User Story 5

- [ ] T066 [US5] Implement Claude client and retry/fallback behavior in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/ai/client.ts
- [ ] T067 [P] [US5] Implement monthly/cost/investment prompt templates in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/ai/prompts/monthly-summary.ts
- [ ] T068 [P] [US5] Implement AI response validation schemas in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/ai/schemas/insight-response.ts
- [ ] T069 [US5] Implement insight router with rate limits and caching in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/trpc/routers/insight.router.ts
- [ ] T070 [US5] Implement insight generation processor and queue job plumbing in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/jobs/processors/generate-insight.ts
- [ ] T071 [P] [US5] Build AI insights UI cards and suggestion lists in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/insights/health-summary.tsx
- [ ] T072 [P] [US5] Build dashboard AI summary card and refresh action in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/dashboard/ai-insight-card.tsx
- [ ] T073 [US5] Wire AI insights route and mutation/query handlers in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/app/(dashboard)/insights/page.tsx

**Checkpoint**: AI insights are independently functional and testable.

---

## Phase 8: User Story 6 - Notifications & Dashboard Experience (Priority: P3)

**Goal**: Deliver notification center, overspend/reminder/monthly notifications, and complete dashboard widgets.

**Independent Test**: Triggering overspend or reminder conditions creates notifications, bell unread count updates, and dashboard cards/sparkline/quick actions render live data.

### Tests for User Story 6

- [ ] T074 [P] [US6] Add unit tests for notification trigger rules in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/unit/notification-rules.test.ts
- [ ] T075 [P] [US6] Add integration tests for notification router and worker processing in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/integration/notification.router.test.ts
- [ ] T076 [P] [US6] Add e2e dashboard-notification flow test in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/e2e/notifications-dashboard.spec.ts

### Implementation for User Story 6

- [ ] T077 [US6] Implement notification router CRUD/read-state procedures in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/trpc/routers/notification.router.ts
- [ ] T078 [US6] Implement notification dispatch processor and archive policy in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/jobs/processors/send-notification.ts
- [ ] T079 [P] [US6] Build notification bell/list/item components in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/notifications/notification-bell.tsx
- [ ] T080 [P] [US6] Build dashboard summary cards and sparkline components in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/dashboard/summary-cards.tsx
- [ ] T081 [P] [US6] Build dashboard quick-actions component with modal triggers in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/dashboard/quick-actions.tsx
- [ ] T082 [US6] Wire dashboard home data and loading states in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/app/(dashboard)/page.tsx
- [ ] T083 [US6] Wire notification preferences and view model hooks in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/hooks/use-notifications.ts
- [ ] T084 [US6] Add worker process entry for analytics/insight/notification workers in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/workers/index.ts

**Checkpoint**: Notifications and dashboard features are independently functional and testable.

---

## Phase 9: User Story 7 - Settings Management (Priority: P3)

**Goal**: Deliver profile editing, category management, and currency/locale preferences.

**Independent Test**: User can update profile info, manage categories, change currency/locale, and see formatting updates reflected in dashboard/analytics.

### Tests for User Story 7

- [ ] T085 [P] [US7] Add integration tests for settings/profile/category flows in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/integration/settings-flows.test.ts
- [ ] T086 [P] [US7] Add e2e settings management test in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/tests/e2e/settings.spec.ts

### Implementation for User Story 7

- [ ] T087 [US7] Implement category management procedures in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/trpc/routers/category.router.ts
- [ ] T088 [US7] Implement profile and locale preference procedures in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/trpc/routers/auth.router.ts
- [ ] T089 [P] [US7] Build settings page sections for profile/currency/locale in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/app/(dashboard)/settings/page.tsx
- [ ] T090 [P] [US7] Build settings category management UI in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/app/(dashboard)/settings/categories/page.tsx

**Checkpoint**: Settings management is independently functional and testable.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Stabilization, performance, accessibility, and release readiness across stories.

- [ ] T091 [P] Implement shared loading/empty/error states across pages in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/shared/error-boundary.tsx
- [ ] T092 [P] Implement sidebar/mobile navigation and command palette in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/layout/sidebar.tsx
- [ ] T093 [P] Implement keyboard shortcuts and bindings in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/hooks/use-keyboard-shortcut.ts
- [ ] T094 [P] Implement global page transitions and motion wrappers in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/components/shared/page-transition.tsx
- [ ] T095 Configure Sentry/Winston production logging in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/src/server/jobs/workers/analytics.worker.ts
- [ ] T096 Add CI workflow for lint/typecheck/test/build gates in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/.github/workflows/ci.yml
- [ ] T097 Finalize deployment/runtime docs for Vercel and Railway in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/README.md
- [ ] T098 Run full regression checklist and capture release notes in /Users/kshitij.bishtintelera.tech/Documents/Personal/CODE - P/SPEC-KIT/finance-os/specs/001-finance-os/tasks.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all story phases.
- **Phase 3-9 (User Stories)**: Depend on Phase 2 completion.
- **Phase 10 (Polish)**: Depends on all targeted story phases being complete.

### User Story Dependencies

- **US1 (Authentication)**: Starts first after foundation and is required by all authenticated features.
- **US2 (Boards & Expenses)**: Depends on US1 only for authenticated context.
- **US3 (Analytics)**: Depends on US2 data availability.
- **US4 (Investments)**: Depends on US1; independent from US2/US3 data model except shared user/account context.
- **US5 (AI Insights)**: Depends on US2 and US3 aggregations for strongest insight quality.
- **US6 (Notifications & Dashboard)**: Depends on US2, US3, and US5 signals.
- **US7 (Settings)**: Depends on US1 and can run in parallel with US6 once auth is complete.

### Parallel Opportunities

- Setup tasks marked `[P]` can be split across tooling and config owners.
- Foundational `[P]` tasks for auth/tRPC/cache/jobs can run concurrently.
- Within each story, test tasks marked `[P]` can run together.
- Component-level `[P]` tasks in a story can be implemented in parallel by different developers.
- US4 and US3 can proceed in parallel after US2 baseline if interface contracts stay stable.

---

## Parallel Example: User Story 1

```bash
Task: "T023 [US1] auth unit tests in tests/unit/auth.validators.test.ts"
Task: "T024 [US1] auth integration tests in tests/integration/auth-flows.test.ts"
Task: "T030 [US1] google button component in src/components/auth/google-button.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T039 [US2] board list UI in src/components/boards/board-list.tsx"
Task: "T040 [US2] kanban board component in src/components/boards/kanban-board.tsx"
Task: "T041 [US2] expense form modal in src/components/boards/expense-form.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "T044 [US3] analytics unit tests in tests/unit/analytics.service.test.ts"
Task: "T050 [US3] monthly/category charts in src/components/analytics/monthly-comparison.tsx"
Task: "T052 [US3] export dialog in src/components/analytics/export-dialog.tsx"
```

## Parallel Example: User Story 4

```bash
Task: "T054 [US4] investment metric unit tests in tests/unit/investment-metrics.test.ts"
Task: "T060 [US4] investment form in src/components/investments/investment-form.tsx"
Task: "T061 [US4] portfolio overview in src/components/investments/portfolio-overview.tsx"
```

## Parallel Example: User Story 5

```bash
Task: "T067 [US5] prompt templates in src/server/ai/prompts/monthly-summary.ts"
Task: "T068 [US5] response schemas in src/server/ai/schemas/insight-response.ts"
Task: "T071 [US5] insights UI in src/components/insights/health-summary.tsx"
```

## Parallel Example: User Story 6

```bash
Task: "T079 [US6] notification UI in src/components/notifications/notification-bell.tsx"
Task: "T080 [US6] summary cards in src/components/dashboard/summary-cards.tsx"
Task: "T081 [US6] quick actions in src/components/dashboard/quick-actions.tsx"
```

## Parallel Example: User Story 7

```bash
Task: "T085 [US7] settings integration tests in tests/integration/settings-flows.test.ts"
Task: "T089 [US7] settings page in src/app/(dashboard)/settings/page.tsx"
Task: "T090 [US7] categories page in src/app/(dashboard)/settings/categories/page.tsx"
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1.
2. Complete Phase 2.
3. Complete Phase 3 (US1 Authentication).
4. Validate signup/login/OAuth/protected-route behavior in isolation.

### Incremental Delivery

1. Build `US1 -> US2` for first usable product loop (secure login + expense tracking).
2. Add `US3` and `US4` for visibility into spending and assets.
3. Add `US5` and `US6` for intelligent guidance and proactive alerts.
4. Add `US7` and Phase 10 polish for launch quality.

### Team Parallelization

1. One stream owns platform/foundation through Phase 2.
2. After Phase 2: split into domain streams (`US2/US3`, `US4`, `US5`, `US6/US7`).
3. Re-converge on Phase 10 for quality gates and release.

---

## Notes

- Task IDs are sequential and execution-oriented.
- `[Story]` labels are only used in user-story phases.
- All tasks include concrete file paths and are ready for LLM execution.
- Optional docs (`research.md`, `data-model.md`, `contracts/`, `quickstart.md`) were not present in prerequisites output, so tasks were derived from `spec.md` + `plan.md`.
