# Finance OS — Project Constitution

> **Status:** ACTIVE | **Version:** 1.0.0 | **Authority Level:** SUPREME
>
> This document is the non-negotiable law of the Finance OS codebase. Every contributor — human or AI — must comply with every rule defined here. No deviation is permitted without a formal amendment approved by the project architect and recorded in version control.
>
> If any other document, pattern, convention, or prior knowledge conflicts with this constitution, **this constitution wins**.

---

## Table of Contents

1. [Project Identity](#1-project-identity)
2. [Tech Stack (Non-Negotiable)](#2-tech-stack-non-negotiable)
3. [Coding Standards](#3-coding-standards)
4. [File and Directory Structure](#4-file-and-directory-structure)
5. [Testing Requirements](#5-testing-requirements)
6. [Security Principles](#6-security-principles)
7. [Performance Constraints](#7-performance-constraints)
8. [AI Usage Rules](#8-ai-usage-rules)
9. [Architectural Non-Negotiables](#9-architectural-non-negotiables)
10. [Commit Strategy](#10-commit-strategy)
11. [Dependency Governance](#11-dependency-governance)
12. [Error Handling and Observability](#12-error-handling-and-observability)
13. [Data Integrity and Financial Precision](#13-data-integrity-and-financial-precision)
14. [Deployment and Environment Rules](#14-deployment-and-environment-rules)
15. [Amendment Process](#15-amendment-process)

---

## 1. Project Identity

- **Name:** Finance OS
- **Description:** A personal finance management web application that helps users track income, expenses, budgets, investments, and financial goals with AI-powered insights and categorisation.
- **Classification:** Production-grade, security-sensitive, financial data handling application.
- **Target Users:** Individual consumers managing personal finances.
- **Data Sensitivity:** HIGH. This application handles financial data, personally identifiable information (PII), and connected account credentials. Treat all user data as confidential.

---

## 2. Tech Stack (Non-Negotiable)

The following technology choices are final. No substitutions, alternatives, or "temporary replacements" are permitted.

### 2.1 Frontend

| Concern | Technology | Version Constraint |
|---|---|---|
| Framework | **Next.js 14** with **App Router** | >= 14.0.0 |
| Language | **TypeScript** (strict mode ON) | >= 5.0.0 |
| Styling | **Tailwind CSS** + **shadcn/ui** component library | Tailwind >= 3.4, shadcn/ui latest |
| Animations | **Framer Motion** | >= 10.0.0 |
| Client State | **Zustand** | >= 4.0.0 |
| Server State | **TanStack React Query** (v5) | >= 5.0.0 |
| Forms | **React Hook Form** + **Zod** | RHF >= 7.0, Zod >= 3.0 |
| Charts | A single charting library chosen at project start (e.g., Recharts or Tremor) | Locked after selection |

**Absolute prohibitions on the frontend:**

- **NO Pages Router.** The App Router is the only permitted routing paradigm. Any file under `pages/` (other than `pages/api/` if required for NextAuth compatibility) is a violation.
- **NO CSS Modules, Styled Components, Emotion, or any CSS-in-JS library.** Tailwind CSS utility classes are the sole styling mechanism.
- **NO inline styles.** Not on JSX elements, not via `style` props, not via dynamic style objects. The only exception is when a third-party library (such as Framer Motion's `animate` prop) requires it as part of its API contract.
- **NO Redux, MobX, Jotai, Recoil, or Valtio.** Zustand is the sole client state manager. TanStack React Query is the sole server state manager.
- **NO `fetch` calls outside of tRPC client utilities or React Query query functions.** All server communication goes through tRPC.
- **NO untyped component props.** Every component must have an explicit TypeScript interface or type for its props.

### 2.2 Backend

| Concern | Technology | Version Constraint |
|---|---|---|
| Runtime | **Node.js** | >= 20.0.0 (LTS) |
| API Layer | **tRPC** | >= 11.0.0 |
| Database | **PostgreSQL** via **Neon Serverless** or **Supabase** | PostgreSQL >= 15 |
| ORM | **Prisma** | >= 5.0.0 |
| Cache | **Redis** via **Upstash** | Serverless Redis |
| Background Jobs | **BullMQ** on Redis | >= 5.0.0 |
| Auth | **NextAuth.js v5** (Auth.js) | >= 5.0.0-beta |
| Auth Providers | **Google Provider** + **Credentials Provider** | As bundled with NextAuth v5 |
| Validation | **Zod** (shared between frontend and backend) | >= 3.0.0 |

**Absolute prohibitions on the backend:**

- **NO REST endpoints** unless absolutely necessary for third-party webhook receivers or OAuth callback compatibility. Every such exception must be documented with a justification comment at the top of the route file.
- **NO raw SQL queries.** All database access goes through Prisma. If Prisma cannot express a query, use `prisma.$queryRaw` with parameterised queries only — never string interpolation.
- **NO alternative ORMs.** No Drizzle, TypeORM, Knex, Sequelize, or Kysely.
- **NO Express, Fastify, Hono, or standalone HTTP server frameworks.** tRPC runs within the Next.js server context.
- **NO Firebase, MongoDB, DynamoDB, or any non-PostgreSQL data store** as a primary or secondary database.

### 2.3 AI

| Concern | Technology | Model |
|---|---|---|
| AI Provider | **Anthropic Claude API** | `claude-sonnet-4-20250514` |

- No OpenAI, Gemini, Mistral, Llama, or any other AI provider.
- The model identifier `claude-sonnet-4-20250514` is the only permitted model. Model changes require a constitution amendment.
- All AI integration must go through a single abstraction layer (a dedicated service module), never called directly from route handlers or components.

### 2.4 Infrastructure

| Concern | Technology |
|---|---|
| Frontend Hosting | **Vercel** |
| Backend Services | **Railway** or **AWS** (for BullMQ workers and long-running processes) |
| Monitoring | **Sentry** for error tracking |
| Logging | **Winston** for structured logging |
| CI/CD | GitHub Actions (or equivalent pipeline on the hosting platform) |

### 2.5 Testing

| Concern | Technology |
|---|---|
| Unit Tests | **Vitest** |
| E2E Tests | **Playwright** |
| API Tests | **Vitest** with tRPC test client or supertest-equivalent |

- **NO Jest.** Vitest is the sole test runner.
- **NO Cypress, TestCafe, or Puppeteer.** Playwright is the sole E2E framework.

---

## 3. Coding Standards

### 3.1 TypeScript Discipline

- **Strict mode is mandatory.** The `tsconfig.json` must include `"strict": true`. This enables `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitAny`, `noImplicitThis`, and `alwaysStrict`.
- **No `any` type.** Ever. Not in function parameters, not in return types, not in generics, not in type assertions, not in `catch` blocks. Use `unknown` and narrow with type guards.
- **No `@ts-ignore` or `@ts-expect-error`** unless accompanied by a comment explaining why it is unavoidable and a linked issue for its removal.
- **No non-null assertions (`!`)** unless the assertion is immediately preceded by a guard or check that makes the assertion provably safe, with a comment explaining the proof.
- **No type assertions (`as`)** for widening types. Type assertions for narrowing are permitted only when TypeScript's type inference is genuinely insufficient and a type guard would be impractical.
- **All functions must have explicit return types** in module boundaries (exported functions, tRPC procedures, API handlers). Internal helper functions may rely on inference if the return type is obvious.
- **Prefer `interface` over `type`** for object shapes that may be extended. Use `type` for unions, intersections, and utility types.
- **Enums:** Prefer `as const` objects over TypeScript enums. If enums are used, they must be `const enum` or string enums — never numeric enums.

### 3.2 React and Component Standards

- **Functional components only.** No class components.
- **Named exports only.** No `export default` on components. Every component file exports a named function.
- **One component per file.** Small, tightly coupled sub-components (e.g., a list item used only inside its parent) may coexist in the same file, but must be explicitly justified.
- **Props interface required.** Every component must declare a `Props` interface (or `ComponentNameProps` type) even if it accepts no props (use `Record<string, never>` or omit the generic).
- **No prop drilling beyond two levels.** If data must pass through more than two component layers, use Zustand, React Context (for truly local subtree state), or restructure the component tree.
- **Error boundaries required on every major section.** Each top-level page section (dashboard panels, transaction list, budget view, settings panels) must be wrapped in an error boundary that catches rendering errors and displays a fallback UI.
- **Suspense boundaries required** for all async data-fetching components. Use React Suspense with appropriate fallback skeletons.
- **All user-facing text must be render-ready for internationalisation.** Even if i18n is not implemented in v1, text must be extractable (no string concatenation for user-facing messages; use template literals or a formatting function).
- **Accessibility:** All interactive elements must be keyboard-navigable. All images must have `alt` text. Form inputs must have associated labels. ARIA attributes must be used where native semantics are insufficient.

### 3.3 Styling Standards

- **Tailwind CSS utility classes are the sole styling mechanism.** No external CSS files, no CSS modules, no `<style>` tags, no inline styles.
- **shadcn/ui components are the base component library.** When a UI element exists in shadcn/ui, use it. Do not build custom replacements.
- **Responsive design is mandatory.** Every page and component must be usable at a minimum viewport width of 375px. Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) to adapt layouts.
- **Dark mode support is required.** All components must support both light and dark themes. Use Tailwind's `dark:` variant. Design tokens must be defined via CSS custom properties in the Tailwind config.
- **Consistent spacing and sizing.** Use Tailwind's default spacing scale. Do not use arbitrary values (`[]`) for spacing unless a design token demands a non-standard value.
- **No `!important`.** If specificity conflicts arise, restructure the component composition.

### 3.4 Animation Standards

- **Framer Motion is the sole animation library.** No CSS animations, no CSS transitions (except Tailwind's built-in `transition-*` utilities for trivial hover states), no GSAP, no anime.js, no Lottie.
- **Required animation points:**
  - Page transitions (route changes within the app shell)
  - Card mount animations (staggered fade-in on dashboard cards)
  - Chart reveals (data visualisations animate in on mount)
  - Modal/dialog enter and exit
  - List item additions and removals (AnimatePresence)
  - Skeleton-to-content transitions
- **Performance guardrails for animations:**
  - Animate only `transform` and `opacity` properties by default. Animating layout properties (`width`, `height`, `top`, `left`) requires justification.
  - Use `layout` prop for layout animations instead of animating positional properties.
  - Respect `prefers-reduced-motion` media query. All animations must be disabled or reduced when this preference is set.
  - No animation duration longer than 500ms unless it is a deliberate storytelling moment (e.g., onboarding walkthrough).

### 3.5 Code Organization

- **Keep code self-documenting.** Clear names, small focused functions, early returns.
- **Maximum function length: 50 lines.** If a function exceeds this, extract sub-functions.
- **Maximum file length: 300 lines.** If a file exceeds this, decompose into sub-modules.
- **No barrel files (`index.ts` re-exports) deeper than one level.** Feature modules may have a single `index.ts` that re-exports public API. No nested barrel chains.
- **Colocation principle:** Tests, types, and utilities that serve a single feature live alongside that feature's code, not in a top-level `utils/` or `types/` folder.
- **Shared code lives in explicitly designated shared directories** (e.g., `src/lib/`, `src/shared/`). Code must not be informally shared by importing across feature boundaries.

### 3.6 Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Files (components) | PascalCase | `TransactionCard.tsx` |
| Files (utilities, hooks, services) | camelCase | `useTransactions.ts`, `formatCurrency.ts` |
| Files (types) | camelCase | `transaction.types.ts` |
| Directories | kebab-case | `dashboard-widgets/` |
| React components | PascalCase | `TransactionCard` |
| Hooks | camelCase with `use` prefix | `useTransactions` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Zustand stores | camelCase with `use` prefix and `Store` suffix | `useAuthStore` |
| tRPC routers | camelCase | `transactionRouter` |
| Prisma models | PascalCase singular | `Transaction`, `BudgetCategory` |
| Database tables | snake_case plural (Prisma handles mapping) | Managed by Prisma |
| Environment variables | UPPER_SNAKE_CASE with app prefix | `FINANCE_OS_DATABASE_URL` |
| Zod schemas | camelCase with `Schema` suffix | `createTransactionSchema` |

---

## 4. File and Directory Structure

The following is the canonical directory structure. New files must conform to this layout.

```
finance-os/
  src/
    app/                          # Next.js App Router
      (auth)/                     # Auth route group (login, register)
        login/
          page.tsx
        register/
          page.tsx
        layout.tsx
      (dashboard)/                # Authenticated route group
        dashboard/
          page.tsx
        transactions/
          page.tsx
        budgets/
          page.tsx
        investments/
          page.tsx
        goals/
          page.tsx
        insights/
          page.tsx
        settings/
          page.tsx
        layout.tsx                # Authenticated layout with sidebar
      api/
        trpc/[trpc]/
          route.ts                # tRPC HTTP handler
        auth/[...nextauth]/
          route.ts                # NextAuth API route
      layout.tsx                  # Root layout
      page.tsx                    # Landing/marketing page
      globals.css                 # Tailwind base imports only
    components/
      ui/                         # shadcn/ui components (managed by CLI)
      shared/                     # App-wide shared components
      dashboard/                  # Dashboard-specific components
      transactions/               # Transaction-specific components
      budgets/                    # Budget-specific components
      investments/                # Investment-specific components
      goals/                      # Goal-specific components
      insights/                   # AI insights components
      charts/                     # Shared chart components
      layout/                     # Shell, sidebar, header, footer
    hooks/                        # Shared custom hooks
    lib/
      trpc/
        client.ts                 # tRPC client setup
        server.ts                 # tRPC server/router setup
        routers/                  # tRPC routers by domain
          transaction.ts
          budget.ts
          investment.ts
          goal.ts
          insight.ts
          user.ts
        middleware/                # tRPC middleware (auth, rate limiting)
      prisma/
        client.ts                 # Prisma client singleton
        schema.prisma             # Prisma schema
        migrations/               # Prisma migrations
        seed.ts                   # Database seed script
      redis/
        client.ts                 # Upstash Redis client
        cache.ts                  # Cache utility functions
      queue/
        client.ts                 # BullMQ connection
        workers/                  # BullMQ worker definitions
          ai-categorise.worker.ts
          dashboard-aggregate.worker.ts
          insight-generate.worker.ts
        jobs/                     # Job type definitions
      ai/
        client.ts                 # Anthropic Claude client
        prompts/                  # Prompt templates
        services/
          categorise.ts           # AI categorisation service
          insights.ts             # AI insights service
      auth/
        config.ts                 # NextAuth configuration
        providers.ts              # Auth provider setup
      validators/                 # Shared Zod schemas
      utils/                      # Pure utility functions
    stores/                       # Zustand stores
      auth.store.ts
      ui.store.ts
      transaction-filter.store.ts
    types/                        # Shared TypeScript types
      api.types.ts
      domain.types.ts
  tests/
    e2e/                          # Playwright E2E tests
      auth.spec.ts
      dashboard.spec.ts
      transactions.spec.ts
    integration/                  # Integration tests
    fixtures/                     # Test fixtures and factories
    helpers/                      # Test utilities
  public/
    fonts/
    images/
  prisma/                         # Alternative Prisma location if needed
  .env.example                    # Environment variable template
  .env.local                      # Local env (gitignored)
  tailwind.config.ts
  tsconfig.json
  vitest.config.ts
  playwright.config.ts
```

**Structural rules:**

- No file may be placed outside this structure without a constitution amendment.
- No new top-level directories under `src/` without architect approval.
- Components must live in the domain directory they belong to, not in a flat `components/` dump.
- Shared utilities must be genuinely shared (used by 2+ features) before being placed in `lib/utils/`.

---

## 5. Testing Requirements

### 5.1 Coverage Thresholds

| Metric | Minimum Threshold |
|---|---|
| Statement coverage | 80% |
| Branch coverage | 75% |
| Function coverage | 85% |
| Line coverage | 80% |

These thresholds are enforced in CI. A build that drops below any threshold is a failed build.

### 5.2 Unit Tests (Vitest)

- **Every utility function must have unit tests.** No exceptions.
- **Every Zustand store must have unit tests** covering all state transitions.
- **Every Zod schema must have unit tests** covering valid inputs, invalid inputs, and edge cases.
- **Every tRPC procedure must have unit tests** covering success paths, validation errors, auth errors, and business logic edge cases.
- **Monetary calculation functions must have exhaustive tests** covering rounding, overflow, negative values, zero, and multi-currency scenarios.
- **Test file naming:** `[module].test.ts` or `[module].spec.ts` colocated with the module.
- **No mocking of Prisma in unit tests of tRPC procedures.** Use a test database or Prisma's built-in test utilities.
- **All tests must be deterministic.** No reliance on system time (use `vi.useFakeTimers()`), random values (use seeded generators), or network calls (use MSW or tRPC test client).

### 5.3 Integration Tests

- **Every completed feature must have at least one integration test** that exercises the feature's full stack path: UI interaction -> tRPC call -> database mutation -> response rendering.
- Integration tests use Vitest with the tRPC test client and a test database.
- **Database state must be isolated per test.** Use transactions that roll back, or truncate tables between tests.

### 5.4 E2E Tests (Playwright)

- **Critical user flows must have E2E tests:**
  - User registration and login (both Google and Credentials)
  - Adding a transaction
  - Viewing the dashboard with populated data
  - Creating and editing a budget
  - Viewing AI-generated insights
  - Changing settings
- **E2E tests run against a seeded test environment.** The seed script must produce deterministic, representative data.
- **E2E tests must not depend on external services.** Mock Anthropic API, third-party auth, and any external integrations.
- **Visual regression is optional but encouraged** for dashboard layouts and chart renders.
- **E2E test naming:** `[feature].spec.ts` in `tests/e2e/`.

### 5.5 Test Quality Rules

- **No `test.skip` or `test.todo` in the main branch.** Skipped tests are only permitted on feature branches with an associated issue.
- **No snapshot tests for component output.** Snapshot tests are brittle and provide low signal. Test behavior, not markup.
- **Test names must describe the behavior, not the implementation.** Good: `"displays an error when the user submits an empty form"`. Bad: `"calls setError"`.
- **Arrange-Act-Assert pattern is mandatory.** Every test must have clearly separated setup, action, and verification phases.
- **No test may take longer than 10 seconds** (unit/integration) or 60 seconds (E2E). Tests exceeding these limits must be optimised or split.

---

## 6. Security Principles

### 6.1 Secrets Management

- **Never hardcode secrets or environment-specific values.** Not in source code, not in comments, not in test fixtures, not in documentation examples.
- **All secrets are accessed via environment variables.** The `.env.example` file documents every required variable with placeholder values.
- **`.env.local` and all `.env*.local` files are gitignored.** Committing any file containing real secrets is a critical violation.
- **Secrets in CI/CD are managed via the platform's secrets store** (Vercel environment variables, GitHub Actions secrets, Railway variables).

### 6.2 Authentication and Authorisation

- **NextAuth.js v5 is the sole authentication mechanism.** No custom auth implementations.
- **JWT-based sessions.** Session strategy must be `"jwt"`. Database sessions are prohibited unless a specific feature demands them (requires constitution amendment).
- **All authenticated routes must verify the session server-side.** Client-side auth checks are supplementary, never primary.
- **Protected routes:** Every route under `(dashboard)/` requires authentication. Unauthenticated requests must redirect to `/login`.
- **tRPC middleware must enforce auth** on all non-public procedures. The auth middleware must verify the JWT, extract the user, and attach it to the tRPC context.
- **Role-based access control (RBAC):** Even in a single-user context, design the auth layer to support roles for future multi-tenancy.
- **Session expiry:** JWT tokens must have a maximum lifetime of 24 hours. Refresh tokens (if used) must have a maximum lifetime of 30 days.

### 6.3 Input Validation

- **All API inputs are validated via Zod schemas.** tRPC's built-in `.input()` validation must be used on every procedure that accepts input.
- **Validation happens server-side, always.** Client-side validation (React Hook Form + Zod) is for UX; it is never a substitute for server-side validation.
- **No raw user input is ever interpolated into SQL, HTML, or shell commands.** Prisma's parameterised queries handle SQL. React's JSX escaping handles HTML. No shell commands are executed.
- **File uploads (if implemented) must validate:** file type (allowlist, not blocklist), file size (maximum 10MB), and file content (magic bytes, not just extension).

### 6.4 Data Protection

- **Never log sensitive data.** This includes: auth tokens, session tokens, passwords, password hashes, API keys, credit card numbers, bank account numbers, Social Security numbers, and any PII beyond what is necessary for debugging.
- **Structured logging via Winston** must use a sanitisation middleware that strips sensitive fields before writing to any log destination.
- **Database backups must be encrypted at rest.** This is an infrastructure concern enforced at the database provider level (Neon/Supabase).
- **HTTPS only.** All communication between client and server, and between server and external services, must use TLS. No HTTP fallbacks.

### 6.5 Application Security

- **CSRF protection** must be enabled. NextAuth v5 provides this by default; do not disable it.
- **Rate limiting on auth endpoints:** Login, registration, and password reset endpoints must enforce rate limits (maximum 10 attempts per IP per minute for login, 5 per IP per hour for registration).
- **Rate limiting on AI endpoints:** AI insight generation must be rate-limited per user (maximum 20 requests per hour) to control costs and prevent abuse.
- **Content Security Policy (CSP):** A strict CSP must be configured via Next.js headers. `unsafe-inline` and `unsafe-eval` are prohibited in production.
- **CORS:** Only the application's own origin is permitted. No wildcard origins.
- **HTTP security headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security` with `max-age` of at least one year.
- **Dependency vulnerability scanning** must run in CI. Any dependency with a known critical or high severity vulnerability must be updated or replaced before merge.

---

## 7. Performance Constraints

### 7.1 Caching Strategy

- **All dashboard aggregation data must be cached in Redis (Upstash) with a 5-minute TTL.** This includes: total balance, income/expense summaries, category breakdowns, budget progress, and goal progress.
- **Cache keys must follow a consistent naming convention:** `finance-os:{userId}:{domain}:{specifics}`. Example: `finance-os:user123:dashboard:monthly-summary:2024-01`.
- **Cache invalidation must occur on relevant mutations.** When a transaction is created, updated, or deleted, all dashboard caches for that user must be invalidated.
- **AI results must be cached in Redis** with a TTL appropriate to the insight type (e.g., daily insights cached for 24 hours, categorisation results cached indefinitely until the transaction is modified).
- **No cache stampede.** Use a locking mechanism or stale-while-revalidate pattern to prevent multiple simultaneous cache rebuilds.

### 7.2 Background Processing

- **AI calls must be async via BullMQ.** No AI API call may block an HTTP request-response cycle. The flow is: user triggers action -> tRPC returns immediately with a "processing" status -> BullMQ worker processes the AI call -> result is stored in database and cache -> client polls or receives a real-time update.
- **Dashboard aggregation recalculation must be a BullMQ job** triggered on data mutations, not computed inline on every dashboard load.
- **Job retry policy:** Failed jobs retry 3 times with exponential backoff (1s, 4s, 16s). After 3 failures, the job is moved to the dead letter queue and an alert is sent via Sentry.
- **Job concurrency:** AI categorisation workers must limit concurrency to avoid hitting Anthropic API rate limits. Maximum 5 concurrent AI calls per worker instance.

### 7.3 Frontend Performance

- **Optimistic updates on all frontend mutations.** When a user creates, edits, or deletes a transaction, the UI must update immediately via React Query's optimistic update mechanism, with rollback on server error.
- **Lazy loading for non-critical components.** Components not visible on initial viewport load (e.g., charts below the fold, settings panels, modals) must use `React.lazy()` with Suspense boundaries.
- **Code splitting:** Each route under `(dashboard)/` must be a separate code-split chunk. No single JS bundle may exceed 200KB gzipped (excluding shared framework code).
- **Image optimization:** All images must use the Next.js `Image` component with appropriate `width`, `height`, `sizes`, and `priority` props. No raw `<img>` tags.
- **Font optimization:** Use `next/font` for all font loading. No external font CDN links.
- **Core Web Vitals targets:**
  - Largest Contentful Paint (LCP): < 2.5s
  - First Input Delay (FID): < 100ms
  - Cumulative Layout Shift (CLS): < 0.1
  - Interaction to Next Paint (INP): < 200ms

### 7.4 Database Performance

- **Prisma queries must include only the fields needed.** Use `select` to limit returned columns on queries that do not need the full model.
- **Pagination is mandatory on all list endpoints.** No endpoint may return an unbounded list of records. Use cursor-based pagination for transaction lists and offset-based pagination for configuration lists.
- **Indexes:** Every column used in a `WHERE`, `ORDER BY`, or `JOIN` clause must have an appropriate database index defined in the Prisma schema.
- **N+1 query prevention:** Use Prisma's `include` for eager loading related data. Use Prisma's `relationLoadStrategy: "join"` where available. Monitor query counts in development.
- **Connection pooling:** Use Prisma's built-in connection pooling or PgBouncer for serverless environments. Maximum pool size must be configured appropriately for the deployment target.

---

## 8. AI Usage Rules

### 8.1 Provider and Model

- **Anthropic Claude API is the sole AI provider.** All AI functionality, including categorisation, insights, summaries, and suggestions, must use the Anthropic Claude API.
- **Model: `claude-sonnet-4-20250514`** is the only permitted model identifier. This is non-negotiable and cannot be changed without a constitution amendment.
- **The AI client must be instantiated in a single module** (`src/lib/ai/client.ts`) and imported from there. No direct instantiation of the Anthropic client in any other file.

### 8.2 AI Architecture

- **AI calls are always asynchronous via BullMQ.** No synchronous AI calls are permitted in any request-response cycle.
- **AI results are always cached in Redis.** Cache keys include the input hash so identical requests return cached results.
- **AI integration must follow the pattern:**
  1. User action triggers a tRPC mutation.
  2. tRPC procedure enqueues a BullMQ job and returns a job ID or "processing" status.
  3. BullMQ worker executes the AI call via the AI service module.
  4. Worker stores the result in the database (via Prisma) and cache (via Redis).
  5. Client polls for the result via a tRPC query, or receives a real-time update via WebSocket/SSE (if implemented).

### 8.3 AI Behaviour Constraints

- **AI never makes financial decisions.** AI provides suggestions, categorisations, summaries, and insights. It does not execute transactions, modify budgets, or take any action that changes the user's financial state.
- **All AI categorisations must be reviewable and overridable by the user.** The UI must present AI-assigned categories with a clear indicator that they are AI-generated and provide a mechanism to accept, reject, or reassign.
- **AI-generated insights must include a disclaimer** stating that they are AI-generated and should not be treated as financial advice.
- **AI prompts must not include personally identifiable information** beyond what is strictly necessary for the task. Transaction descriptions and amounts are acceptable; full names, addresses, and account numbers are not.
- **AI error handling:** If an AI call fails (API error, rate limit, timeout), the system must degrade gracefully. The feature must remain usable without AI — users can manually categorise, and dashboards must function without AI insights.
- **AI cost control:** All AI requests must be logged with their token usage. A monthly cost monitoring dashboard or alert must be in place. If token usage exceeds a configured threshold, new AI requests are throttled or queued.

### 8.4 Prompt Engineering

- **All prompts must be stored in `src/lib/ai/prompts/` as named template files or constants.** No inline prompt strings in service logic.
- **Prompts must be versioned.** When a prompt changes, the version identifier must change. Old prompt versions must be retained for audit purposes.
- **Prompts must include explicit output format specifications** (e.g., "Return a JSON object with the following structure:") to ensure parseable responses.
- **System prompts must include the instruction:** "You are a financial assistant. You provide analysis and suggestions only. You do not provide financial advice. Users should consult a qualified financial advisor for financial decisions."

---

## 9. Architectural Non-Negotiables

These rules govern the structural integrity of the application and may not be violated for convenience, speed, or personal preference.

### 9.1 API Layer

- **tRPC is the sole API communication mechanism** between the Next.js frontend and the backend logic. This applies to all data fetching, mutations, and subscriptions.
- **tRPC routers are organised by domain:** `transactionRouter`, `budgetRouter`, `investmentRouter`, `goalRouter`, `insightRouter`, `userRouter`. A single merged app router combines them.
- **Every tRPC procedure must have:**
  - Input validation via Zod (`.input()`)
  - Output typing (explicit or inferred from Prisma return types)
  - Auth middleware (for protected procedures)
  - Error handling that returns structured errors, never raw exceptions
- **No REST endpoints** are permitted except for: NextAuth API routes, webhook receivers from third-party services, and health check endpoints. Each REST exception must have a comment explaining why tRPC is not viable.

### 9.2 State Management

- **Zustand for client state.** Client state includes: UI state (sidebar open/closed, modal visibility, filter selections), user preferences that are not persisted, and transient form state that spans multiple components.
- **TanStack React Query for server state.** Server state includes: all data fetched from tRPC, cached API responses, and background-refreshed data.
- **These two concerns must not overlap.** Do not store server-fetched data in Zustand. Do not use React Query to manage UI state.
- **Zustand stores must be small and focused.** One store per concern (e.g., `useAuthStore`, `useUIStore`, `useTransactionFilterStore`). No monolithic global store.
- **React Query must be configured with sensible defaults:** `staleTime` of 5 minutes for dashboard data, `gcTime` (garbage collection time) of 30 minutes, `refetchOnWindowFocus` enabled.

### 9.3 Database and ORM

- **Prisma is the sole ORM.** All database reads and writes go through Prisma.
- **The Prisma schema is the single source of truth for the database structure.** No manual SQL migrations outside of Prisma's migration system.
- **Prisma migrations must be committed to version control.** The `prisma/migrations/` directory is a protected, append-only history.
- **Soft deletes are preferred** for financial records. Transactions and other financial data must use a `deletedAt` timestamp rather than `DELETE` operations.
- **Audit fields are mandatory on all models:** `createdAt`, `updatedAt`, and `deletedAt` (where soft delete applies).

### 9.4 Caching and Background Jobs

- **Redis (Upstash) is the sole caching backend.** No in-memory caches (beyond React Query on the client), no filesystem caches, no alternative cache providers.
- **BullMQ on Redis is the sole background job processor.** No custom polling loops, no setTimeout-based scheduling, no cron jobs outside of BullMQ's repeatable job mechanism.
- **All cached data must have an explicit TTL.** No indefinite caches. Maximum TTL for any cache entry is 24 hours for financial data and 7 days for static configuration data.

### 9.5 Animation

- **Framer Motion is the sole animation framework.** See Section 3.4 for detailed animation standards.
- **Required animation integration points:**
  - Page transitions between dashboard routes
  - Card mount animations (staggered fade-in with slight upward motion)
  - Chart data reveals (bars/lines animate from zero to their value)
  - Modal and sheet enter/exit animations
  - Toast notification enter/exit
  - List item additions and removals (AnimatePresence with exit animations)
  - Loading skeleton to real content transitions
- **Animation variants must be defined in shared constant files** (`src/lib/animations/variants.ts`) for consistency. Components reference shared variants rather than defining inline animation configs.

---

## 10. Commit Strategy

### 10.1 Commit Message Format

All commits must follow the **Conventional Commits** specification (https://www.conventionalcommits.org/).

**Format:**
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Permitted types:**
| Type | Usage |
|---|---|
| `feat` | A new feature visible to the user |
| `fix` | A bug fix |
| `chore` | Maintenance tasks that do not change production code (dependency updates, CI config) |
| `docs` | Documentation-only changes |
| `test` | Adding or modifying tests |
| `refactor` | Code restructuring that does not change external behaviour |
| `style` | Code formatting changes (whitespace, semicolons) that do not affect logic |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |
| `build` | Build system or external dependency changes |
| `revert` | Reverting a previous commit |

**Scope** is optional but encouraged. Use the domain name: `transactions`, `budgets`, `investments`, `goals`, `insights`, `auth`, `dashboard`, `ui`, `db`, `cache`, `ai`, `infra`.

**Examples:**
```
feat(transactions): add bulk import from CSV
fix(dashboard): correct monthly total calculation for leap years
chore(deps): update prisma to 5.12.0
test(budgets): add integration tests for budget creation flow
refactor(ai): extract prompt templates into dedicated module
perf(cache): add Redis caching for category breakdown query
```

### 10.2 Commit Discipline

- **Atomic commits.** Each commit represents exactly one logical change. Do not combine unrelated changes in a single commit.
- **No commits with failing tests.** CI must pass before a commit is merged to the main branch. On feature branches, broken commits during development are tolerated but must be fixed or squashed before merge.
- **No commits containing secrets, credentials, or API keys.** This is enforced via pre-commit hooks (e.g., `git-secrets` or `gitleaks`).
- **No merge commits on feature branches.** Use rebase to keep a linear history. Merge commits are only created when merging a feature branch into the main branch via pull request.
- **Commit messages must be written in the imperative mood.** "Add transaction filter" not "Added transaction filter" or "Adding transaction filter".
- **Maximum commit subject line length: 72 characters.** Use the body for additional detail.

### 10.3 Branch Strategy

- **Main branch (`main`):** Always deployable. Protected. No direct pushes.
- **Feature branches:** Named `feat/<short-description>` or `feat/<issue-number>-<short-description>`.
- **Fix branches:** Named `fix/<short-description>` or `fix/<issue-number>-<short-description>`.
- **All branches must originate from and merge back into `main`** via pull request with at least one approval.

---

## 11. Dependency Governance

### 11.1 Approved Dependencies

The following dependencies are pre-approved. Any dependency not on this list requires architect approval before installation.

**Core (pre-approved):**
- `next`, `react`, `react-dom`
- `typescript`
- `tailwindcss`, `postcss`, `autoprefixer`
- `@shadcn/ui` (components installed via CLI)
- `framer-motion`
- `zustand`
- `@tanstack/react-query`
- `@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@trpc/next`
- `@prisma/client`, `prisma` (dev)
- `@upstash/redis`
- `bullmq`, `ioredis` (for BullMQ worker connections)
- `next-auth` / `@auth/core`
- `@anthropic-ai/sdk`
- `zod`
- `react-hook-form`, `@hookform/resolvers`
- `winston`
- `@sentry/nextjs`

**Dev (pre-approved):**
- `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- `playwright`, `@playwright/test`
- `eslint`, `prettier`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`
- `husky`, `lint-staged`
- `msw` (Mock Service Worker for test mocking)

### 11.2 Dependency Rules

- **No duplicate functionality.** If an approved dependency already provides capability X, do not install another package for X.
- **No packages with fewer than 1,000 weekly npm downloads** unless they are maintained by a known, trusted organisation.
- **No packages with known critical vulnerabilities.** `npm audit` must report zero critical vulnerabilities.
- **Lock file (`package-lock.json` or `pnpm-lock.yaml`) must be committed.** Any PR that modifies `package.json` without updating the lock file is invalid.
- **Dependency updates are a standing chore.** Security patches are applied immediately. Minor and major updates are batched monthly.

---

## 12. Error Handling and Observability

### 12.1 Error Handling

- **tRPC procedures must use tRPC's error system** (`TRPCError`) with appropriate HTTP-equivalent codes: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `INTERNAL_SERVER_ERROR`, etc.
- **No raw `throw new Error()` in tRPC procedures.** Always throw `TRPCError` with a code and a user-friendly message.
- **Client-side error handling must distinguish between:**
  - Validation errors (show inline field errors)
  - Auth errors (redirect to login)
  - Server errors (show generic error message with retry option)
  - Network errors (show offline/connectivity message)
- **React Error Boundaries must wrap:** every page-level component, every independent dashboard widget, and the root application layout.
- **Error boundaries must log to Sentry** and display a user-friendly fallback with a "Try Again" action.

### 12.2 Logging

- **Winston is the sole logging library.** No `console.log`, `console.error`, or `console.warn` in production code. These are permitted only in development-only debug code guarded by `process.env.NODE_ENV === 'development'`.
- **Log levels:**
  - `error`: System failures, unhandled exceptions, external service failures
  - `warn`: Degraded functionality, approaching rate limits, fallback behaviour activated
  - `info`: Significant business events (user login, transaction created, AI job completed)
  - `debug`: Detailed operational data (cache hit/miss, query timing, job queue state)
- **Structured logging format:** All log entries must be JSON objects with at minimum: `timestamp`, `level`, `message`, `service`, and `correlationId` (for request tracing).
- **Sensitive data must never appear in logs.** See Section 6.4.

### 12.3 Monitoring

- **Sentry is configured for:** all unhandled exceptions, all tRPC errors with status >= 500, all BullMQ job failures, and all AI service failures.
- **Sentry must include:** user ID (anonymised if required), request path, tRPC procedure name, and relevant context (but never sensitive data).
- **Performance monitoring via Sentry** is enabled for transaction tracing on all tRPC procedures and all page navigations.
- **Uptime monitoring:** A health check endpoint (`/api/health`) must return 200 with a JSON payload confirming database connectivity, Redis connectivity, and application version.

---

## 13. Data Integrity and Financial Precision

### 13.1 Monetary Values

- **All monetary values are stored as integers representing the smallest currency unit** (cents for USD, paise for INR, etc.). A transaction of $19.99 is stored as `1999`.
- **Never use floating-point numbers for monetary values.** Not in the database, not in application logic, not in API payloads. The only place floats are acceptable is in the UI display layer, where the integer is divided for presentation.
- **Currency must be stored alongside every monetary value.** The database schema must include a `currency` column (ISO 4217 code, e.g., `USD`, `INR`, `EUR`) on every table that contains monetary amounts.
- **Multi-currency arithmetic is prohibited in application code.** If the application needs to aggregate values across currencies, it must use exchange rates from a trusted source and clearly label converted values as estimates.
- **Rounding rules:** When converting between display values and stored integers, use banker's rounding (round half to even) to minimise systematic bias.

### 13.2 Data Consistency

- **Financial mutations must be transactional.** When a transaction is created, any related updates (budget consumption, goal progress, account balance) must occur in the same database transaction via `prisma.$transaction()`.
- **Idempotency:** All mutation endpoints that create financial records must be idempotent. The client must send an idempotency key, and the server must deduplicate based on this key.
- **Optimistic locking:** For concurrent edit scenarios (e.g., two tabs editing the same budget), use a `version` field on the record and reject updates that reference a stale version.
- **Audit trail:** All financial mutations (create, update, delete) must be logged in an `AuditLog` table with: `userId`, `action`, `entityType`, `entityId`, `previousValue` (JSON), `newValue` (JSON), and `timestamp`.

---

## 14. Deployment and Environment Rules

### 14.1 Environments

| Environment | Purpose | Database | AI Calls |
|---|---|---|---|
| `development` | Local development | Local PostgreSQL or Neon dev branch | Mocked or dev API key with low limits |
| `staging` | Pre-production testing | Neon staging branch | Real API, low rate limits |
| `production` | Live application | Neon production | Real API, production rate limits |

### 14.2 Environment Variables

- **All environment variables must be documented in `.env.example`** with descriptions and placeholder values.
- **No environment variable may have a hardcoded default in application code.** If a variable is missing, the application must throw a clear error at startup, not silently use a fallback.
- **Environment variable validation:** At application startup, all required environment variables must be validated via a Zod schema. Missing or invalid variables must crash the application with a clear error message.
- **Required variables (minimum):**
  ```
  DATABASE_URL
  REDIS_URL
  NEXTAUTH_URL
  NEXTAUTH_SECRET
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  ANTHROPIC_API_KEY
  SENTRY_DSN
  ```

### 14.3 Deployment Rules

- **Production deployments happen only via CI/CD.** No manual deployments. No `vercel --prod` from a local machine.
- **Every deployment must be tagged** with the git commit SHA and a semantic version if applicable.
- **Database migrations run automatically before deployment.** If a migration fails, the deployment is aborted and rolled back.
- **Zero-downtime deployments required.** Database migrations must be backwards-compatible (no column renames or drops without a multi-step migration strategy).
- **Feature flags** (if used) must be managed via environment variables or a dedicated feature flag service, never hardcoded.

---

## 15. Amendment Process

This constitution may be amended under the following conditions:

1. **Proposal:** Any team member or AI agent may propose an amendment by creating a pull request that modifies this file.
2. **Justification:** The PR must include a clear rationale for the change, the impact on existing code, and any migration steps required.
3. **Approval:** The project architect must approve the amendment. For changes to Section 2 (Tech Stack), Section 6 (Security), or Section 13 (Data Integrity), two approvals are required.
4. **Versioning:** The version number at the top of this document must be incremented on every amendment. Use semantic versioning: MAJOR for changes that affect architectural foundations, MINOR for new rules, PATCH for clarifications.
5. **Notification:** All active contributors must be notified of constitutional amendments via the project's communication channel.

---

**This document is the law. Build accordingly.**
