# Finance OS — Constitution

> **This document is project law.** No feature, refactor, or shortcut may violate these rules.
> Any exception requires explicit, documented approval in a decision record.

---

## 1. Technology Stack (Non-Negotiable)

| Layer                  | Technology                                        | Version Constraint                                |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------- |
| **Frontend framework** | Next.js 14 with **App Router**                    | ≥ 14.0 — **Pages Router is banned**               |
| **Language**           | TypeScript — `strict: true` everywhere            | ≥ 5.3                                             |
| **Styling**            | Tailwind CSS + shadcn/ui                          | Latest stable                                     |
| **Animations**         | Framer Motion                                     | ≥ 10.0                                            |
| **Global state**       | Zustand                                           | ≥ 4.4                                             |
| **Server state**       | TanStack React Query                              | ≥ 5.0                                             |
| **API layer**          | tRPC (type-safe RPC)                              | ≥ 11.0 — no REST unless strictly necessary        |
| **Database**           | PostgreSQL (Neon serverless or Supabase)          | ≥ 15                                              |
| **ORM**                | Prisma                                            | ≥ 5.7                                             |
| **Cache**              | Redis via Upstash                                 | —                                                 |
| **Background jobs**    | BullMQ on Redis                                   | ≥ 5.0                                             |
| **Auth**               | NextAuth.js v5 (Auth.js)                          | v5 beta+ — Google Provider + Credentials Provider |
| **AI**                 | Anthropic Claude API (`claude-sonnet-4-20250514`) | —                                                 |
| **Hosting (frontend)** | Vercel                                            | —                                                 |
| **Hosting (backend)**  | Railway or AWS                                    | —                                                 |
| **Error tracking**     | Sentry                                            | Latest SDK                                        |
| **Logging**            | Winston (structured JSON logs)                    | ≥ 3.11                                            |
| **Unit testing**       | Vitest                                            | ≥ 1.0                                             |
| **E2E testing**        | Playwright                                        | ≥ 1.40                                            |

### Stack Prohibitions

- ❌ No Pages Router — all routes use `app/` directory conventions.
- ❌ No REST endpoints unless a third-party integration requires it (must be documented).
- ❌ No CSS-in-JS libraries (styled-components, Emotion, etc.).
- ❌ No inline styles — only Tailwind utility classes.
- ❌ No Redux, MobX, or Recoil.
- ❌ No Express.js — tRPC handles all API concerns.
- ❌ No MongoDB or any non-relational primary datastore.

---

## 2. Design System & Stitch Governance

- **Single Source of Truth**: `/stitch-exports/*.html` and `specs/main/DESIGN.md` are the ONLY approved visual references. All UI must match these pixel-perfectly in layout, spacing, and hierarchy.
- **STRICTLY FORBIDDEN**: Copying any HTML, CSS, or inline styles from Stitch exports. All code must use Tailwind utility classes + shadcn/ui components.
- **MANDATORY WORKFLOW**: Before building any page, analyze the corresponding HTML export to understand structure, then map each element to shadcn/ui or custom Tailwind components.
- **MCP INTEGRATION**: Agents MUST query Stitch MCP (`stitch://`) to validate component props, spacing values, and design tokens. Do not guess.
- **Design Token Enforcement**: All colors, typography, spacing, border-radius, and shadows must come from `DESIGN.md`. No hardcoded values.
- **Animation Rule**: Framer Motion must replicate the micro-interactions implied in the Stitch designs (card hover, page transitions, chart reveals).
- **Responsive Requirement**: Mockups are desktop-first, but ALL implementations must be mobile-responsive (min 375px) while preserving the Stitch visual language.
- **Component Precedence**: When a shadcn/ui component can achieve the Stitch design, it MUST be used. Custom components are only permitted when no shadcn/ui equivalent exists.
- **Skeleton Loaders**: All dashboard data must use skeleton loaders that match the Stitch card layouts. Never show blank states — always show a structured skeleton that mirrors the final component dimensions.

---

## 3. Coding Standards

### TypeScript

- `strict: true` in every `tsconfig.json` — no exceptions.
- **No `any` type** anywhere in the codebase. Use `unknown` + type narrowing when the type is genuinely unknown.
- All function parameters and return types must be explicitly typed or inferable.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- All tRPC procedures must have fully typed input (Zod) and output schemas.

### Naming Conventions

| Construct          | Convention                    | Example               |
| ------------------ | ----------------------------- | --------------------- |
| Files (components) | `kebab-case.tsx`              | `expense-card.tsx`    |
| Files (utilities)  | `kebab-case.ts`               | `format-currency.ts`  |
| React components   | `PascalCase`                  | `ExpenseCard`         |
| Hooks              | `camelCase` with `use` prefix | `useExpenses`         |
| Constants          | `UPPER_SNAKE_CASE`            | `MAX_BOARD_COUNT`     |
| Database models    | `PascalCase` (Prisma)         | `Expense`, `Board`    |
| tRPC routers       | `camelCase`                   | `expenseRouter`       |
| Zustand stores     | `use<Name>Store`              | `useBoardStore`       |
| Zod schemas        | `camelCase` + `Schema` suffix | `createExpenseSchema` |

### Code Quality

- Keep files under 300 lines. Extract when approaching this limit.
- One component per file. Co-locate styles and types only.
- All forms must use **React Hook Form + Zod** validation. No hand-rolled validation.
- Prefer early returns over nested conditionals.
- No barrel files (`index.ts` re-exports) beyond the top level of a feature folder.
- No circular imports — enforce via ESLint rule.

### Comments

- Code should be self-documenting. Prefer clear names over comments.
- Comments explain **why**, never **what**.
- No TODO without a linked issue/ticket reference.
- No commented-out code in committed files.

---

## 4. Monetary Value Rules

- **All monetary values are stored as integers in paise (₹) or cents ($).** Never use floats for money.
- Display formatting happens exclusively in the presentation layer via a shared `formatCurrency()` utility.
- All arithmetic on monetary values uses integer math. No `parseFloat` on money.
- Currency code is stored alongside every monetary value in the database.

---

## 5. Architecture Principles

### API Layer

- Every API endpoint is a tRPC procedure — typed end-to-end.
- All tRPC routers live under `server/routers/` and are merged into a single `appRouter`.
- Input validation uses Zod schemas — never trust client data.
- All mutations return the created/updated entity (not just a success boolean).

### Caching

- All dashboard aggregation queries are cached in Redis with a **5-minute TTL**.
- Cache keys follow the pattern: `finance-os:{userId}:{resource}:{identifier}`.
- Cache invalidation is explicit — every mutation that changes data must invalidate relevant cache keys.
- AI insight results are cached with a **1-hour TTL** per user per month.

### Async Processing

- AI calls (Claude API) **must** be dispatched via BullMQ — never block the request thread.
- Analytics recalculation runs as a BullMQ job after expense mutations.
- Background jobs must be idempotent and retryable (max 3 retries, exponential backoff).
- Job status is trackable — failed jobs generate Sentry alerts.

### State Management

- **Zustand** for UI-only global state (sidebar open, active board, theme).
- **TanStack React Query** for all server-derived state (expenses, analytics, investments).
- Optimistic updates required for all user-facing mutations (add expense, move card, etc.).
- No prop drilling beyond 2 levels — use context or Zustand.

### Forms

- All forms use React Hook Form with Zod resolver.
- Validation schemas are shared between client and tRPC input validators.
- Error messages are user-friendly and specific (not generic "Invalid input").

---

## 6. UI / UX Principles

### Animations (Framer Motion — Required)

Framer Motion must be used for:

- Page/tab transitions (`AnimatePresence` + `motion.div`)
- Card mount/unmount animations (fade + slide)
- Chart data reveals (staggered entrance)
- Drag-and-drop interactions on Kanban boards
- Modal open/close transitions
- Skeleton → content transitions
- Micro-interactions on buttons and interactive elements

### Responsiveness

- Mobile-first design. Minimum supported viewport: **375px** width.
- All layouts must be responsive — no horizontal scroll on any screen.
- Kanban boards stack vertically on mobile.
- Charts resize gracefully.

### Error & Empty States

- Every data-fetching component must handle: **loading**, **empty**, **error** states.
- Error boundaries are required on every major page section.
- Empty states must include a call-to-action (e.g., "No expenses yet — add one").
- Loading states use skeleton components, not spinners (unless contextually appropriate).

### Accessibility

- All interactive elements must be keyboard navigable.
- ARIA labels on icon-only buttons.
- Color is not the sole indicator of state — use icons/text alongside.
- Minimum contrast ratio: 4.5:1 (WCAG AA).

---

## 7. Security

- All routes except `/login` and `/signup` require authentication.
- JWT tokens are stored in HTTP-only cookies — never in localStorage.
- All user-scoped queries filter by `userId` at the database level (no client-side filtering).
- Rate limiting on auth endpoints: 5 attempts per minute per IP.
- CSRF protection enabled on all mutation endpoints.
- Input sanitization on all free-text fields before storage.
- No secrets or environment-specific values hardcoded — all via `process.env`.
- No sensitive data (tokens, passwords, financial details) in logs.
- Passwords hashed with bcrypt (cost factor ≥ 12).

---

## 8. Performance Constraints

- **Largest Contentful Paint (LCP):** < 2.5s on 4G connection.
- **First Input Delay (FID):** < 100ms.
- **Cumulative Layout Shift (CLS):** < 0.1.
- Dashboard initial load: < 3s (cached), < 5s (uncached).
- tRPC mutation response: < 500ms p95.
- AI insight generation: < 30s (async, user sees loading state).
- Bundle size: monitor with `@next/bundle-analyzer` — no single chunk > 200KB gzipped.

---

## 9. Testing Requirements

### Unit Tests (Vitest)

- Every utility function must have unit tests.
- Every Zod schema must have validation tests (valid + invalid inputs).
- Every Zustand store must have state transition tests.
- Minimum coverage target: **80% lines** on business logic.

### Integration Tests (Vitest + Testing Library)

- Every tRPC router must have integration tests against a test database.
- Every form component must have submission + validation tests.
- Every completed feature must have at least one integration test.

### E2E Tests (Playwright)

- Critical user flows must have E2E coverage:
  - Sign up → Login → Add board → Add expense → View analytics
  - Google OAuth flow (mocked provider)
  - Investment CRUD flow
  - AI insight generation flow
- E2E tests run in CI before merge to main.

### Test Principles

- Tests are first-class code — same quality standards as production code.
- No `test.skip` without a linked issue.
- Test data uses factories/fixtures — no hardcoded test data scattered across files.
- Tests must be deterministic — no reliance on external services or timing.

---

## 10. AI Usage Rules

- All AI calls go through a centralized `ai/` service module — no direct Claude API calls from components or routes.
- AI responses are validated against a Zod schema before use.
- AI failures are graceful — the app must function fully without AI features.
- AI-generated content is always labeled as AI-generated in the UI.
- User data sent to Claude is minimized — only aggregated/anonymized financial summaries, never raw transaction IDs or account numbers.
- AI results are cached (1-hour TTL) to avoid redundant API calls.
- AI token usage is logged for cost monitoring.

---

## 11. Git & Commit Strategy

### Commit Format

All commits follow **Conventional Commits**:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:** `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `ci`, `build`

**Scopes:** `auth`, `boards`, `analytics`, `investments`, `ai`, `dashboard`, `db`, `cache`, `ui`, `config`

### Branch Strategy

- `main` — production-ready, protected
- `develop` — integration branch
- `feat/<scope>/<description>` — feature branches
- `fix/<scope>/<description>` — bug fix branches

### PR Requirements

- All PRs require at least one approval.
- CI must pass (lint + type-check + tests) before merge.
- Squash merge to `develop`, rebase merge to `main`.
- PR description must reference the relevant spec section.

---

## 12. Environment & Configuration

- All environment variables documented in `.env.example`.
- Runtime config validated at startup with Zod — app crashes fast on misconfiguration.
- Three environments: `development`, `staging`, `production`.
- Feature flags for incomplete features — never ship half-built UI.
- Database migrations run automatically in CI/CD pipeline.

---

## 13. Logging & Monitoring

- Structured JSON logs via Winston.
- Log levels: `error`, `warn`, `info`, `debug` (debug only in development).
- Every tRPC procedure logs: `userId`, `procedure`, `duration`, `status`.
- Sentry captures all unhandled exceptions + selected breadcrumbs.
- Performance monitoring enabled in Sentry for critical transactions.
- Alert on: error rate > 1%, p95 latency > 2s, job failure rate > 5%.

---

## 14. Dependency Management

- Pin exact versions in `package.json` (no `^` or `~`).
- Run `npm audit` weekly — no high/critical vulnerabilities in production deps.
- New dependencies require justification — prefer existing solutions.
- No dependencies with fewer than 1,000 weekly downloads unless self-audited.

---

## Amendment Process

This constitution can only be amended by:

1. Creating a decision record (`docs/decisions/ADR-NNN.md`)
2. Documenting the rationale for the change
3. Updating this file with the amendment and a changelog entry

---

_Last updated: 2026-03-30_
_Version: 1.1.0 — Added Stitch Design System & Antigravity MCP governance (Section 2)_
