# Finance OS — Technical Implementation Plan

> **Document type:** Technical implementation plan.
> **Audience:** Engineers and AI agents building the system.
> **Dependencies:** Implements [spec.md](./spec.md) under the constraints of [constitution.md](../../.specify/memory/constitution.md).

---

## Table of Contents

1. [Project Setup & Folder Structure](#phase-0-project-setup--folder-structure)
2. [Dependency Manifest](#dependency-manifest)
3. [Database Schema (Prisma)](#database-schema-prisma)
4. [tRPC Router Architecture](#trpc-router-architecture)
5. [Redis Caching Strategy](#redis-caching-strategy)
6. [BullMQ Job Definitions](#bullmq-job-definitions)
7. [Implementation Phases](#implementation-phases)
8. [Deployment Plan](#deployment-plan)

---

## Phase 0: Project Setup & Folder Structure

### Initialize Project

```bash
npx create-next-app@14 finance-os --typescript --tailwind --app --src-dir --import-alias "@/*"
```

### Folder Structure

```
finance-os/
├── .specify/
│   └── memory/
│       └── constitution.md
├── specs/
│   └── main/
│       ├── DESIGN.md                     # Stitch design tokens, color system, typography, layout rules
│       ├── spec.md
│       └── plan.md
├── stitch-exports/                       # HTML visual mockups (REFERENCE ONLY — never copy HTML/CSS)
│   ├── Login.html
│   ├── Dashboard.html
│   ├── KanBanBoards.html
│   ├── DetailedAnalytics.html
│   ├── InvestmentNetWorth.html
│   └── AllInsightsDashboard.html
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group (no layout chrome)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/              # Authenticated route group
│   │   │   ├── layout.tsx            # Sidebar + header + auth guard
│   │   │   ├── page.tsx              # Dashboard (home)
│   │   │   ├── boards/
│   │   │   │   ├── page.tsx          # Board list
│   │   │   │   └── [boardId]/
│   │   │   │       └── page.tsx      # Single board Kanban view
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── investments/
│   │   │   │   └── page.tsx
│   │   │   ├── insights/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── categories/
│   │   │       │   └── page.tsx
│   │   │       └── accounts/
│   │   │           └── page.tsx
│   │   ├── api/
│   │   │   ├── trpc/
│   │   │   │   └── [trpc]/
│   │   │   │       └── route.ts      # tRPC HTTP handler
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts      # NextAuth handler
│   │   ├── layout.tsx                # Root layout (providers)
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── globals.css
│   ├── server/                       # Server-side code
│   │   ├── db.ts                     # Prisma client singleton
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── trpc/
│   │   │   ├── index.ts              # tRPC init (context, router, procedure)
│   │   │   ├── router.ts             # appRouter (merges all sub-routers)
│   │   │   └── routers/
│   │   │       ├── auth.router.ts
│   │   │       ├── board.router.ts
│   │   │       ├── expense.router.ts
│   │   │       ├── account.router.ts
│   │   │       ├── category.router.ts
│   │   │       ├── analytics.router.ts
│   │   │       ├── investment.router.ts
│   │   │       ├── insight.router.ts
│   │   │       └── notification.router.ts
│   │   ├── services/                 # Business logic layer
│   │   │   ├── analytics.service.ts
│   │   │   ├── expense.service.ts
│   │   │   ├── investment.service.ts
│   │   │   └── net-worth.service.ts
│   │   ├── cache/
│   │   │   ├── redis.ts              # Upstash Redis client
│   │   │   ├── keys.ts              # Cache key builders
│   │   │   └── invalidation.ts      # Cache invalidation helpers
│   │   ├── jobs/
│   │   │   ├── queue.ts             # BullMQ queue definitions
│   │   │   ├── workers/
│   │   │   │   ├── analytics.worker.ts
│   │   │   │   ├── insight.worker.ts
│   │   │   │   └── notification.worker.ts
│   │   │   └── processors/
│   │   │       ├── recalculate-analytics.ts
│   │   │       ├── generate-insight.ts
│   │   │       └── send-notification.ts
│   │   └── ai/
│   │       ├── client.ts             # Claude API client
│   │       ├── prompts/
│   │       │   ├── monthly-summary.ts
│   │       │   ├── cost-reduction.ts
│   │       │   ├── investment-suggestion.ts
│   │       │   ├── categorize-expense.ts
│   │       │   └── anomaly-explanation.ts
│   │       └── schemas/
│   │           ├── insight-response.ts   # Zod schemas for AI output validation
│   │           └── categorization-response.ts
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components (auto-generated)
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── command-palette.tsx
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── signup-form.tsx
│   │   │   └── google-button.tsx
│   │   ├── dashboard/
│   │   │   ├── summary-cards.tsx
│   │   │   ├── sparkline-chart.tsx
│   │   │   ├── ai-insight-card.tsx
│   │   │   └── quick-actions.tsx
│   │   ├── boards/
│   │   │   ├── board-list.tsx
│   │   │   ├── board-card.tsx
│   │   │   ├── kanban-board.tsx
│   │   │   ├── kanban-column.tsx
│   │   │   ├── expense-card.tsx
│   │   │   ├── expense-form.tsx
│   │   │   ├── board-filters.tsx
│   │   │   └── board-analytics.tsx
│   │   ├── analytics/
│   │   │   ├── monthly-comparison.tsx
│   │   │   ├── category-breakdown.tsx
│   │   │   ├── tax-summary.tsx
│   │   │   ├── anomaly-list.tsx
│   │   │   └── export-dialog.tsx
│   │   ├── investments/
│   │   │   ├── investment-form.tsx
│   │   │   ├── portfolio-overview.tsx
│   │   │   ├── allocation-chart.tsx
│   │   │   ├── investment-list.tsx
│   │   │   └── net-worth-chart.tsx
│   │   ├── insights/
│   │   │   ├── health-summary.tsx
│   │   │   ├── cost-suggestions.tsx
│   │   │   ├── investment-suggestions.tsx
│   │   │   └── anomaly-alerts.tsx
│   │   ├── notifications/
│   │   │   ├── notification-bell.tsx
│   │   │   ├── notification-list.tsx
│   │   │   └── notification-item.tsx
│   │   └── shared/
│   │       ├── error-boundary.tsx
│   │       ├── page-transition.tsx
│   │       ├── skeleton-card.tsx
│   │       ├── empty-state.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── currency-display.tsx
│   │       └── chart-wrapper.tsx
│   ├── hooks/
│   │   ├── use-expenses.ts
│   │   ├── use-boards.ts
│   │   ├── use-investments.ts
│   │   ├── use-analytics.ts
│   │   ├── use-insights.ts
│   │   ├── use-notifications.ts
│   │   └── use-keyboard-shortcut.ts
│   ├── stores/
│   │   ├── ui.store.ts               # Sidebar state, active tab, modals
│   │   ├── board.store.ts            # Active board, drag state
│   │   └── filter.store.ts           # Active filters on boards
│   ├── lib/
│   │   ├── utils.ts                  # cn() helper, general utils
│   │   ├── format-currency.ts
│   │   ├── date-utils.ts
│   │   ├── validators/
│   │   │   ├── expense.schema.ts
│   │   │   ├── investment.schema.ts
│   │   │   ├── board.schema.ts
│   │   │   ├── account.schema.ts
│   │   │   └── category.schema.ts
│   │   └── constants.ts
│   ├── types/
│   │   └── index.ts                  # Shared TypeScript types/enums
│   └── trpc/
│       ├── client.ts                 # tRPC React client setup
│       ├── server.ts                 # tRPC server caller (RSC)
│       └── provider.tsx              # TRPCProvider + QueryClientProvider
├── workers/                          # Standalone BullMQ worker process
│   ├── index.ts                      # Worker entry point
│   └── Dockerfile
├── public/
│   ├── illustrations/                # Empty state illustrations
│   └── icons/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── docker-compose.yml                # Local dev: Postgres + Redis
├── package.json
└── README.md
```

---

### UI Implementation Strategy (Stitch-Driven)

All page implementations are driven by the Stitch HTML exports. The workflow for every page is:

1. **Analyze** the corresponding HTML export to understand structure, spacing, color, and hierarchy
2. **Map** each HTML element to the appropriate shadcn/ui component or custom Tailwind component
3. **Apply** design tokens from `specs/main/DESIGN.md` via `tailwind.config.ts`
4. **Animate** using Framer Motion to replicate micro-interactions from the Stitch designs
5. **Validate** via Stitch MCP (`stitch://`) queries to confirm props, spacing, and token accuracy

| Stitch Export               | Next.js Route  | Primary Components            | Notes                                    |
| --------------------------- | -------------- | ----------------------------- | ---------------------------------------- |
| `Login.html`                | `/login`       | Card, Input, Button (shadcn)  | Match exact spacing from mockup          |
| `Dashboard.html`            | `/dashboard`   | Card, Chart, Badge            | Sparkline must match Stitch design       |
| `KanBanBoards.html`         | `/boards`      | DragDropContext, Card, Dialog | Kanban columns = Planned/Spent/Recurring |
| `DetailedAnalytics.html`    | `/analytics`   | DonutChart, BarChart, Tabs    | Use Framer Motion for chart reveals      |
| `InvestmentNetWorth.html`   | `/investments` | Table, DonutChart, Form       | Allocation chart matches Stitch          |
| `AllInsightsDashboard.html` | `/insights`    | Card, Alert, Skeleton         | AI summary card styling critical         |

> **Skeleton Loaders:** All dashboard data must use skeleton loaders that match the Stitch card layouts. Never show blank states — always show a structured skeleton that mirrors the final component dimensions.

---

## Dependency Manifest

### Production Dependencies

```json
{
  "next": "14.2.15",
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "typescript": "5.4.5",

  "@trpc/server": "11.0.0-rc.532",
  "@trpc/client": "11.0.0-rc.532",
  "@trpc/react-query": "11.0.0-rc.532",
  "@trpc/next": "11.0.0-rc.532",
  "@tanstack/react-query": "5.56.2",
  "superjson": "2.2.1",
  "zod": "3.23.8",

  "@prisma/client": "5.20.0",
  "prisma": "5.20.0",

  "next-auth": "5.0.0-beta.22",
  "@auth/prisma-adapter": "2.7.2",

  "@upstash/redis": "1.34.0",
  "bullmq": "5.12.12",
  "ioredis": "5.4.1",

  "@anthropic-ai/sdk": "0.30.1",

  "zustand": "4.5.5",
  "react-hook-form": "7.53.0",
  "@hookform/resolvers": "3.9.0",

  "framer-motion": "11.5.6",
  "@dnd-kit/core": "6.1.0",
  "@dnd-kit/sortable": "8.0.0",
  "@dnd-kit/utilities": "3.2.2",

  "recharts": "2.12.7",
  "date-fns": "3.6.0",
  "bcryptjs": "2.4.3",
  "jspdf": "2.5.2",
  "jspdf-autotable": "3.8.3",
  "papaparse": "5.4.1",
  "sonner": "1.5.0",
  "lucide-react": "0.441.0",
  "clsx": "2.1.1",
  "tailwind-merge": "2.5.2",
  "class-variance-authority": "0.7.0",

  "@sentry/nextjs": "8.30.0",
  "winston": "3.14.2",

  "tailwindcss": "3.4.12",
  "postcss": "8.4.47",
  "autoprefixer": "10.4.20"
}
```

### Dev Dependencies

```json
{
  "@types/react": "18.3.8",
  "@types/react-dom": "18.3.0",
  "@types/node": "22.7.3",
  "@types/bcryptjs": "2.4.6",

  "vitest": "2.1.1",
  "@testing-library/react": "16.0.1",
  "@testing-library/jest-dom": "6.5.0",
  "@testing-library/user-event": "14.5.2",

  "@playwright/test": "1.47.2",

  "eslint": "9.11.1",
  "eslint-config-next": "14.2.15",
  "@typescript-eslint/eslint-plugin": "8.7.0",
  "@typescript-eslint/parser": "8.7.0",

  "prettier": "3.3.3",
  "prettier-plugin-tailwindcss": "0.6.6",

  "@next/bundle-analyzer": "14.2.15",
  "tsx": "4.19.1"
}
```

### shadcn/ui Components to Install

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog dropdown-menu form input label select separator sheet skeleton tabs toast tooltip avatar badge calendar command popover scroll-area switch textarea
```

---

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── AUTH (NextAuth) ───────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  passwordHash  String?   // null for OAuth-only users
  currency      String    @default("INR")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // NextAuth relations
  authAccounts  AuthAccount[]
  sessions      Session[]

  // App relations
  bankAccounts  BankAccount[]
  boards        Board[]
  categories    Category[]
  investments   Investment[]
  aiInsights    AIInsight[]
  notifications Notification[]
  netWorthSnapshots NetWorthSnapshot[]

  @@map("users")
}

model AuthAccount {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("auth_accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ─── BANK ACCOUNTS ─────────────────────────────────────────

enum AccountType {
  SAVINGS
  CURRENT
  CREDIT_CARD
  WALLET
}

model BankAccount {
  id          String      @id @default(cuid())
  userId      String
  name        String      // e.g., "My HDFC Savings"
  bankName    String      // e.g., "HDFC Bank"
  accountType AccountType
  color       String      @default("#6366f1") // hex color for UI
  icon        String      @default("bank")    // lucide icon name
  balance     Int         @default(0)         // in paise/cents
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  boards Board[]

  @@index([userId])
  @@map("bank_accounts")
}

// ─── BOARDS ────────────────────────────────────────────────

model Board {
  id        String   @id @default(cuid())
  userId    String
  accountId String
  name      String   // e.g., "HDFC Savings - March 2026"
  month     Int      // 1-12
  year      Int      // e.g., 2026
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user     User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  account  BankAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  expenses Expense[]

  @@unique([userId, accountId, month, year])
  @@index([userId])
  @@index([accountId])
  @@map("boards")
}

// ─── EXPENSES ──────────────────────────────────────────────

enum ExpenseStatus {
  PLANNED
  SPENT
  RECURRING
}

enum TaxType {
  NONE
  GST
  TDS
  CUSTOM
}

model Expense {
  id             String        @id @default(cuid())
  boardId        String
  categoryId     String
  title          String
  amount         Int           // in paise/cents — NEVER floats
  status         ExpenseStatus @default(PLANNED)
  date           DateTime      @default(now())
  notes          String?       @db.Text
  taxType        TaxType       @default(NONE)
  taxRate        Float         @default(0)    // percentage, e.g., 18 for 18%
  taxAmount      Int           @default(0)    // calculated: amount * taxRate / 100, in paise
  customTaxLabel String?                       // required when taxType = CUSTOM
  sortOrder      Int           @default(0)    // for drag-and-drop ordering within column
  dueDate        DateTime?                     // for recurring expenses — bill reminder
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  board    Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id])

  @@index([boardId])
  @@index([boardId, status])
  @@index([categoryId])
  @@index([date])
  @@map("expenses")
}

// ─── CATEGORIES ────────────────────────────────────────────

model Category {
  id          String   @id @default(cuid())
  userId      String
  name        String
  color       String   @default("#6366f1")
  icon        String   @default("tag")
  budgetLimit Int?     // monthly budget in paise/cents, null = no limit
  isDefault   Boolean  @default(false) // pre-seeded categories
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expenses Expense[]

  @@unique([userId, name])
  @@index([userId])
  @@map("categories")
}

// ─── INVESTMENTS ───────────────────────────────────────────

enum InvestmentType {
  STOCKS
  MUTUAL_FUNDS
  CRYPTO
  FD
  PPF
  GOLD
  REAL_ESTATE
}

model Investment {
  id             String         @id @default(cuid())
  userId         String
  type           InvestmentType
  assetName      String
  investedAmount Int            // in paise/cents
  currentValue   Int            // in paise/cents
  date           DateTime       // date of investment
  notes          String?        @db.Text
  lastUpdated    DateTime       @default(now()) // when currentValue was last updated
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, type])
  @@map("investments")
}

// ─── AI INSIGHTS ───────────────────────────────────────────

model AIInsight {
  id          String   @id @default(cuid())
  userId      String
  month       Int
  year        Int
  summary     String   @db.Text   // Main health summary
  suggestions Json     // Array of { description, estimatedSavings, difficulty }
  investmentSuggestions Json?     // Array of investment suggestions
  anomalies   Json?    // Array of anomaly explanations
  generatedAt DateTime @default(now())
  expiresAt   DateTime // cache TTL marker

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, month, year])
  @@index([userId])
  @@map("ai_insights")
}

// ─── NOTIFICATIONS ─────────────────────────────────────────

enum NotificationType {
  OVERSPEND_WARNING    // 80% of budget
  OVERSPEND_ALERT      // 100%+ of budget
  BILL_REMINDER        // upcoming recurring expense
  MONTHLY_SUMMARY      // monthly digest
  ANOMALY_ALERT        // spending anomaly detected
  AI_INSIGHT_READY     // new AI insight generated
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String           @db.Text
  isRead    Boolean          @default(false)
  metadata  Json?            // contextual data: boardId, categoryId, etc.
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@map("notifications")
}

// ─── NET WORTH SNAPSHOTS ───────────────────────────────────

model NetWorthSnapshot {
  id               String   @id @default(cuid())
  userId           String
  month            Int
  year             Int
  totalAccounts    Int      // sum of bank account balances in paise
  totalInvestments Int      // sum of investment current values in paise
  netWorth         Int      // totalAccounts + totalInvestments
  snapshotDate     DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, month, year])
  @@index([userId])
  @@map("net_worth_snapshots")
}
```

### Seed Data

```typescript
// prisma/seed.ts
// Seeds default categories for a new user

const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", color: "#f97316", icon: "utensils", budgetLimit: 800000 },
  { name: "Transport", color: "#3b82f6", icon: "car", budgetLimit: 300000 },
  { name: "Subscriptions", color: "#8b5cf6", icon: "smartphone", budgetLimit: 200000 },
  { name: "EMI", color: "#1e40af", icon: "landmark", budgetLimit: 1500000 },
  { name: "Shopping", color: "#ec4899", icon: "shopping-bag", budgetLimit: 500000 },
  { name: "Bills & Utilities", color: "#eab308", icon: "zap", budgetLimit: 400000 },
  { name: "Health", color: "#ef4444", icon: "heart-pulse", budgetLimit: 200000 },
  { name: "Entertainment", color: "#14b8a6", icon: "clapperboard", budgetLimit: 300000 },
  { name: "Education", color: "#22c55e", icon: "book-open", budgetLimit: 200000 },
  { name: "Rent", color: "#92400e", icon: "home", budgetLimit: 2000000 },
  { name: "Salary / Income", color: "#ca8a04", icon: "wallet", budgetLimit: null },
  { name: "Other", color: "#6b7280", icon: "package", budgetLimit: 500000 },
];
// budgetLimit values are in paise (e.g., 800000 paise = ₹8,000)
```

---

## tRPC Router Architecture

### Router Tree

```
appRouter
├── auth
│   ├── signup          (mutation)  — email + password registration
│   ├── getSession      (query)     — current session info
│   └── updateProfile   (mutation)  — update name, image
├── account
│   ├── list            (query)     — all bank accounts for user
│   ├── getById         (query)     — single account
│   ├── create          (mutation)  — add bank account
│   ├── update          (mutation)  — edit bank account
│   └── delete          (mutation)  — remove bank account
├── board
│   ├── list            (query)     — all boards (with expense counts)
│   ├── getById         (query)     — single board with expenses
│   ├── create          (mutation)  — create board
│   ├── update          (mutation)  — edit board
│   └── delete          (mutation)  — delete board + cascade expenses
├── expense
│   ├── listByBoard     (query)     — expenses grouped by status
│   ├── getById         (query)     — single expense detail
│   ├── create          (mutation)  — add expense → triggers analytics job
│   ├── update          (mutation)  — edit expense → triggers analytics job
│   ├── updateStatus    (mutation)  — drag-and-drop status change
│   ├── reorder         (mutation)  — update sortOrder within column
│   ├── delete          (mutation)  — remove expense → triggers analytics job
│   └── suggestCategory (query)     — AI category suggestion for title
├── category
│   ├── list            (query)     — all categories for user
│   ├── create          (mutation)  — add custom category
│   ├── update          (mutation)  — edit category (including budget limit)
│   └── delete          (mutation)  — delete + reassign expenses
├── analytics
│   ├── dashboard       (query)     — total balance, monthly spend, savings rate (CACHED)
│   ├── sparkline       (query)     — last 7 days daily spend (CACHED)
│   ├── monthlyComparison (query)   — current vs last 3 months (CACHED)
│   ├── categoryBreakdown (query)   — spend per category this month (CACHED)
│   ├── taxSummary      (query)     — GST/TDS/custom totals (CACHED)
│   ├── anomalies       (query)     — flagged expenses (CACHED)
│   ├── boardAnalytics  (query)     — per-board stats (CACHED)
│   └── export          (mutation)  — generate CSV/PDF download
├── investment
│   ├── list            (query)     — all investments
│   ├── getById         (query)     — single investment
│   ├── create          (mutation)  — add investment
│   ├── update          (mutation)  — edit investment (including currentValue)
│   ├── bulkUpdateValue (mutation)  — update currentValue for multiple
│   ├── delete          (mutation)  — remove investment
│   ├── portfolio       (query)     — allocation, totals (CACHED)
│   └── netWorthHistory (query)     — monthly net worth (CACHED)
├── insight
│   ├── getMonthlySummary (query)   — AI health summary (CACHED per month)
│   ├── regenerate      (mutation)  — force regenerate insight (rate-limited)
│   ├── getCostSuggestions (query)  — AI cost reduction suggestions
│   ├── getInvestmentSuggestions (query) — AI investment suggestions
│   └── dismissSuggestion (mutation) — mark suggestion as dismissed
└── notification
    ├── list            (query)     — user's notifications (paginated)
    ├── unreadCount     (query)     — badge count
    ├── markRead        (mutation)  — mark single as read
    ├── markAllRead     (mutation)  — mark all as read
    └── updatePreferences (mutation) — opt in/out of notification types
```

### tRPC Initialization

```typescript
// src/server/trpc/index.ts

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { db } from "@/server/db";

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCContext = async () => {
  const session = await getServerSession(authOptions);
  return { db, session };
};

export const createRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: ctx.session.user.id,
    },
  });
});
```

### Example Router: Expense

```typescript
// src/server/trpc/routers/expense.router.ts

import { z } from "zod";
import { createRouter, protectedProcedure } from "../index";
import { TaxType, ExpenseStatus } from "@prisma/client";
import { analyticsQueue } from "@/server/jobs/queue";
import { invalidateExpenseCache } from "@/server/cache/invalidation";

const createExpenseSchema = z.object({
  boardId: z.string().cuid(),
  title: z.string().min(1).max(100),
  amount: z.number().int().positive(), // in paise
  categoryId: z.string().cuid(),
  date: z.date(),
  notes: z.string().max(500).optional(),
  status: z.nativeEnum(ExpenseStatus).default("PLANNED"),
  taxType: z.nativeEnum(TaxType).default("NONE"),
  taxRate: z.number().min(0).max(100).default(0),
  customTaxLabel: z.string().max(50).optional(),
  dueDate: z.date().optional(),
});

export const expenseRouter = createRouter({
  create: protectedProcedure.input(createExpenseSchema).mutation(async ({ ctx, input }) => {
    // Calculate tax amount
    const taxAmount = Math.round((input.amount * input.taxRate) / 100);

    // Verify board belongs to user
    const board = await ctx.db.board.findFirst({
      where: { id: input.boardId, userId: ctx.userId },
    });
    if (!board) throw new TRPCError({ code: "NOT_FOUND" });

    const expense = await ctx.db.expense.create({
      data: {
        ...input,
        taxAmount,
      },
      include: { category: true },
    });

    // Dispatch async jobs
    await analyticsQueue.add("recalculate", {
      userId: ctx.userId,
      boardId: input.boardId,
    });

    // Invalidate caches
    await invalidateExpenseCache(ctx.userId, input.boardId);

    return expense;
  }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        status: z.nativeEnum(ExpenseStatus),
        sortOrder: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const expense = await ctx.db.expense.findFirst({
        where: { id: input.id, board: { userId: ctx.userId } },
      });
      if (!expense) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.expense.update({
        where: { id: input.id },
        data: {
          status: input.status,
          sortOrder: input.sortOrder ?? 0,
        },
      });
    }),
  // ... other procedures
});
```

---

## Redis Caching Strategy

### Cache Key Schema

```typescript
// src/server/cache/keys.ts

export const cacheKeys = {
  dashboard: (userId: string) => `finance-os:${userId}:dashboard`,

  sparkline: (userId: string) => `finance-os:${userId}:sparkline`,

  monthlyComparison: (userId: string, year: number, month: number) => `finance-os:${userId}:monthly-comparison:${year}-${month}`,

  categoryBreakdown: (userId: string, year: number, month: number) => `finance-os:${userId}:category-breakdown:${year}-${month}`,

  taxSummary: (userId: string, year: number, month: number) => `finance-os:${userId}:tax-summary:${year}-${month}`,

  anomalies: (userId: string, year: number, month: number) => `finance-os:${userId}:anomalies:${year}-${month}`,

  boardAnalytics: (boardId: string) => `finance-os:board:${boardId}:analytics`,

  portfolio: (userId: string) => `finance-os:${userId}:portfolio`,

  netWorthHistory: (userId: string) => `finance-os:${userId}:net-worth-history`,

  aiInsight: (userId: string, year: number, month: number) => `finance-os:${userId}:ai-insight:${year}-${month}`,
} as const;
```

### TTL Configuration

| Cache Key Pattern    | TTL       | Invalidation Trigger            |
| -------------------- | --------- | ------------------------------- |
| `dashboard`          | 5 minutes | Any expense/account mutation    |
| `sparkline`          | 5 minutes | Any expense mutation            |
| `monthly-comparison` | 5 minutes | Any expense mutation            |
| `category-breakdown` | 5 minutes | Any expense mutation            |
| `tax-summary`        | 5 minutes | Any expense mutation            |
| `anomalies`          | 5 minutes | Any expense mutation            |
| `board:*:analytics`  | 5 minutes | Expense mutation on that board  |
| `portfolio`          | 5 minutes | Any investment mutation         |
| `net-worth-history`  | 5 minutes | Any investment/account mutation |
| `ai-insight`         | 1 hour    | Manual regeneration only        |

### Cache Invalidation Helper

```typescript
// src/server/cache/invalidation.ts

import { redis } from "./redis";
import { cacheKeys } from "./keys";

export async function invalidateExpenseCache(userId: string, boardId: string): Promise<void> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  await Promise.all([redis.del(cacheKeys.dashboard(userId)), redis.del(cacheKeys.sparkline(userId)), redis.del(cacheKeys.monthlyComparison(userId, year, month)), redis.del(cacheKeys.categoryBreakdown(userId, year, month)), redis.del(cacheKeys.taxSummary(userId, year, month)), redis.del(cacheKeys.anomalies(userId, year, month)), redis.del(cacheKeys.boardAnalytics(boardId))]);
}

export async function invalidateInvestmentCache(userId: string): Promise<void> {
  await Promise.all([redis.del(cacheKeys.portfolio(userId)), redis.del(cacheKeys.netWorthHistory(userId)), redis.del(cacheKeys.dashboard(userId))]);
}
```

### Cache-Aside Pattern (Query Example)

```typescript
// Used in analytics.router.ts

dashboard: protectedProcedure.query(async ({ ctx }) => {
  const cached = await redis.get(cacheKeys.dashboard(ctx.userId));
  if (cached) return JSON.parse(cached);

  const data = await analyticsService.calculateDashboard(ctx.userId);

  await redis.set(
    cacheKeys.dashboard(ctx.userId),
    JSON.stringify(data),
    { ex: 300 } // 5 minutes
  );

  return data;
}),
```

---

## BullMQ Job Definitions

### Queue Setup

```typescript
// src/server/jobs/queue.ts

import { Queue } from "bullmq";
import { Redis } from "ioredis";

const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const analyticsQueue = new Queue("analytics", { connection });
export const insightQueue = new Queue("insights", { connection });
export const notificationQueue = new Queue("notifications", { connection });
```

### Job Definitions

#### 1. Analytics Recalculation

```typescript
// Job name: "recalculate"
// Queue: analyticsQueue
// Trigger: After any expense create/update/delete mutation

interface RecalculateJobData {
  userId: string;
  boardId: string;
}

// Processor: src/server/jobs/processors/recalculate-analytics.ts
// Actions:
// 1. Recalculate board-level stats (total per column, category breakdown)
// 2. Recalculate dashboard aggregations (total balance, monthly spend, savings rate)
// 3. Check for budget overspend → dispatch notification job if threshold hit
// 4. Check for anomalies → flag expenses ≥ 2× category average
// 5. Invalidate relevant Redis caches

// Config:
// - Retries: 3 (exponential backoff: 1s, 4s, 16s)
// - Timeout: 30 seconds
// - Concurrency: 5 per worker
```

#### 2. AI Insight Generation

```typescript
// Job name: "generate-insight"
// Queue: insightQueue
// Trigger: Monthly (cron), or user clicks "Regenerate"

interface GenerateInsightJobData {
  userId: string;
  month: number;
  year: number;
  type: "monthly-summary" | "cost-reduction" | "investment-suggestion" | "anomaly-explanation";
}

// Processor: src/server/jobs/processors/generate-insight.ts
// Actions:
// 1. Aggregate user's financial data for the month
// 2. Build prompt from template (src/server/ai/prompts/)
// 3. Call Claude API (claude-sonnet-4-20250514)
// 4. Validate response against Zod schema
// 5. Store result in AIInsight table
// 6. Cache result in Redis (1-hour TTL)
// 7. Dispatch notification: "New AI insight available"

// Config:
// - Retries: 2 (exponential backoff: 5s, 25s)
// - Timeout: 60 seconds (AI calls can be slow)
// - Concurrency: 2 per worker (rate limit protection)
// - Rate limit: 1 per user per hour (for regeneration)
```

#### 3. Notification Dispatch

```typescript
// Job name: "send-notification"
// Queue: notificationQueue
// Trigger: From analytics worker (overspend), cron (bill reminders), insight worker

interface SendNotificationJobData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

// Processor: src/server/jobs/processors/send-notification.ts
// Actions:
// 1. Create Notification record in database
// 2. (Future) Send email if user has opted in
// 3. (Future) Send push notification

// Config:
// - Retries: 3
// - Timeout: 10 seconds
// - Concurrency: 10 per worker
```

#### 4. Net Worth Snapshot (Cron)

```typescript
// Job name: "net-worth-snapshot"
// Queue: analyticsQueue
// Trigger: Cron — 1st of every month at 00:01 UTC

// Processor:
// 1. For each active user:
//    a. Sum all BankAccount.balance values
//    b. Sum all Investment.currentValue values
//    c. Create NetWorthSnapshot record
// 2. Dispatch monthly-summary notification

// Config:
// - Cron: "1 0 1 * *"
// - Retries: 3
// - Timeout: 5 minutes (batch job)
```

#### 5. Bill Reminder Check (Cron)

```typescript
// Job name: "check-bill-reminders"
// Queue: notificationQueue
// Trigger: Cron — daily at 09:00 UTC

// Processor:
// 1. Query all RECURRING expenses with dueDate within next 3 days
// 2. For each, check if a reminder was already sent
// 3. Dispatch notification job for unsent reminders

// Config:
// - Cron: "0 9 * * *"
// - Retries: 3
// - Timeout: 2 minutes
```

### Worker Entry Point

```typescript
// workers/index.ts

import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { recalculateAnalytics } from "@/server/jobs/processors/recalculate-analytics";
import { generateInsight } from "@/server/jobs/processors/generate-insight";
import { sendNotification } from "@/server/jobs/processors/send-notification";

const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

const analyticsWorker = new Worker("analytics", recalculateAnalytics, {
  connection,
  concurrency: 5,
});

const insightWorker = new Worker("insights", generateInsight, {
  connection,
  concurrency: 2,
});

const notificationWorker = new Worker("notifications", sendNotification, {
  connection,
  concurrency: 10,
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await analyticsWorker.close();
  await insightWorker.close();
  await notificationWorker.close();
  process.exit(0);
});
```

---

## Implementation Phases

### Phase 0: Project Scaffold (Days 1–2)

**Goal:** Fully configured project shell with CI pipeline.

| Task | Details                                                                                                                                                                                                                                                    |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1  | **Stitch Design Integration**: Audit all files in `/stitch-exports/`, extract design tokens from `specs/main/DESIGN.md` into `tailwind.config.ts`, create component mapping (HTML element → shadcn/ui component), set up Stitch MCP queries for validation |
| 0.2  | Initialize Next.js 14 project with App Router, TypeScript strict, Tailwind                                                                                                                                                                                 |
| 0.3  | Install and configure all dependencies (exact versions from manifest)                                                                                                                                                                                      |
| 0.4  | Set up Prisma with PostgreSQL (Neon); run initial migration                                                                                                                                                                                                |
| 0.5  | Configure shadcn/ui; install all required components                                                                                                                                                                                                       |
| 0.6  | Set up tRPC boilerplate (init, context, appRouter, HTTP handler)                                                                                                                                                                                           |
| 0.7  | Configure Upstash Redis client                                                                                                                                                                                                                             |
| 0.8  | Configure BullMQ queues and worker scaffold                                                                                                                                                                                                                |
| 0.9  | Set up Sentry + Winston logging                                                                                                                                                                                                                            |
| 0.10 | Configure Vitest + Playwright                                                                                                                                                                                                                              |
| 0.11 | Create `docker-compose.yml` for local Postgres + Redis                                                                                                                                                                                                     |
| 0.12 | Create `.env.example` with all required variables                                                                                                                                                                                                          |
| 0.13 | Set up ESLint + Prettier with project rules                                                                                                                                                                                                                |
| 0.14 | Create root layout with providers (TRPCProvider, QueryClient, ThemeProvider)                                                                                                                                                                               |
| 0.15 | Create shared components: ErrorBoundary, PageTransition, EmptyState, SkeletonCard (skeleton dimensions must match Stitch card layouts)                                                                                                                     |

**Acceptance:** `npm run dev` starts cleanly. `npm run build` succeeds. Tests run (empty suite passes). Stitch design tokens are extracted into `tailwind.config.ts` and component mapping document is complete.

---

### Phase 1: Authentication (Days 3–5)

**Goal:** Working signup, login, Google OAuth, and route protection.

| Task | Details                                                                              |
| ---- | ------------------------------------------------------------------------------------ |
| 1.1  | Configure NextAuth v5 with Prisma adapter                                            |
| 1.2  | Implement Credentials provider (email + bcrypt password)                             |
| 1.3  | Implement Google OAuth provider                                                      |
| 1.4  | Create signup page + form (React Hook Form + Zod) — match `Login.html` Stitch mockup |
| 1.5  | Create login page + form — match `Login.html` Stitch mockup                          |
| 1.6  | Add "Sign in with Google" button component                                           |
| 1.7  | Implement auth middleware (protect all `(dashboard)` routes)                         |
| 1.8  | Handle account linking (Google + existing email)                                     |
| 1.9  | Add rate limiting on auth endpoints (5/min/IP)                                       |
| 1.10 | Implement logout flow                                                                |
| 1.11 | Add form animations with Framer Motion                                               |
| 1.12 | Seed default categories on first user creation                                       |
| 1.13 | Write integration tests for signup/login/OAuth flows                                 |

**Acceptance:** User can sign up, log in, and access Dashboard. Unauthenticated users are redirected. Google OAuth creates/links accounts correctly.

---

### Phase 2: Boards & Expenses (Days 6–12)

**Goal:** Full Kanban board experience with expense CRUD and drag-and-drop.

| Task | Details                                                                                        |
| ---- | ---------------------------------------------------------------------------------------------- |
| 2.1  | Implement `account.router` (CRUD for bank accounts)                                            |
| 2.2  | Build bank account management UI (settings page)                                               |
| 2.3  | Implement `board.router` (CRUD for boards)                                                     |
| 2.4  | Build board list page with board cards (grid layout) — match `KanBanBoards.html` Stitch mockup |
| 2.5  | Build Kanban board view with three columns — match `KanBanBoards.html` Stitch mockup           |
| 2.6  | Implement `expense.router` (CRUD + status update + reorder)                                    |
| 2.7  | Build expense card component with all fields                                                   |
| 2.8  | Build expense form modal (React Hook Form + Zod)                                               |
| 2.9  | Implement tax calculation (auto-calculate taxAmount from rate)                                 |
| 2.10 | Integrate @dnd-kit for drag-and-drop between columns                                           |
| 2.11 | Implement optimistic updates for drag-and-drop                                                 |
| 2.12 | Build board filter bar (category, date, tax, amount)                                           |
| 2.13 | Build board-level analytics panel (pie chart, trend, tax total)                                |
| 2.14 | Add Framer Motion animations (card mount, column transitions)                                  |
| 2.15 | Implement mobile responsive layout (stacked columns / tabs)                                    |
| 2.16 | Connect expense mutations → BullMQ analytics queue                                             |
| 2.17 | Write unit tests for tax calculation logic                                                     |
| 2.18 | Write integration tests for expense CRUD                                                       |
| 2.19 | Write E2E test: create board → add expense → drag to Spent                                     |

**Acceptance:** User can create boards linked to accounts, add/edit/delete expenses, drag between columns, filter, and see board analytics. All changes persist and trigger async jobs.

---

### Phase 3: Analytics (Days 13–16)

**Goal:** Full analytics dashboard with charts, tax summary, and export.

| Task | Details                                                                                        |
| ---- | ---------------------------------------------------------------------------------------------- |
| 3.1  | Implement `analytics.router` (all query procedures)                                            |
| 3.2  | Implement `analytics.service` (aggregation queries with Prisma)                                |
| 3.3  | Add Redis caching to all analytics queries (5-min TTL)                                         |
| 3.4  | Build monthly comparison bar chart (Recharts) — match `DetailedAnalytics.html` Stitch mockup   |
| 3.5  | Build category breakdown donut chart (Recharts) — match `DetailedAnalytics.html` Stitch mockup |
| 3.6  | Build tax aggregation summary cards + expense table                                            |
| 3.7  | Implement anomaly detection logic (≥ 2× category average)                                      |
| 3.8  | Build anomaly list component with warning badges                                               |
| 3.9  | Implement CSV export (PapaParse)                                                               |
| 3.10 | Implement PDF export (jsPDF + autotable)                                                       |
| 3.11 | Build export dialog with scope selection                                                       |
| 3.12 | Add chart animations (Framer Motion wrapper)                                                   |
| 3.13 | Write unit tests for analytics service calculations                                            |
| 3.14 | Write integration tests for analytics endpoints (with cached/uncached paths)                   |

**Acceptance:** Analytics tab shows all four sections with real data. Charts animate in. Export generates correct CSV/PDF files. Cache invalidation works correctly.

---

### Phase 4: Investments & Net Worth (Days 17–20)

**Goal:** Investment portfolio tracking and net worth timeline.

| Task | Details                                                                                                     |
| ---- | ----------------------------------------------------------------------------------------------------------- |
| 4.1  | Implement `investment.router` (CRUD + portfolio + netWorth)                                                 |
| 4.2  | Build investment form modal                                                                                 |
| 4.3  | Build portfolio overview (summary cards + allocation donut) — match `InvestmentNetWorth.html` Stitch mockup |
| 4.4  | Build investment list with sortable columns                                                                 |
| 4.5  | Implement inline current value editing                                                                      |
| 4.6  | Implement bulk value update by asset type                                                                   |
| 4.7  | Build net worth over time line chart                                                                        |
| 4.8  | Implement net worth snapshot cron job (BullMQ)                                                              |
| 4.9  | Add Redis caching for portfolio + net worth queries                                                         |
| 4.10 | Add Framer Motion animations for charts and cards                                                           |
| 4.11 | Write integration tests for investment CRUD                                                                 |
| 4.12 | Write E2E test: add investment → view portfolio → update value                                              |

**Acceptance:** User can manage investments, see portfolio allocation, track gain/loss, and view net worth trend over time.

---

### Phase 5: AI Layer (Days 21–26)

**Goal:** AI-powered insights, suggestions, and auto-categorization.

| Task | Details                                                                                       |
| ---- | --------------------------------------------------------------------------------------------- |
| 5.1  | Set up Anthropic Claude client (`src/server/ai/client.ts`)                                    |
| 5.2  | Build prompt templates for all 5 AI features                                                  |
| 5.3  | Build Zod schemas for AI response validation                                                  |
| 5.4  | Implement `insight.router`                                                                    |
| 5.5  | Implement insight generation BullMQ worker                                                    |
| 5.6  | Build AI Insights tab: monthly summary card — match `AllInsightsDashboard.html` Stitch mockup |
| 5.7  | Build cost reduction suggestions list (with dismiss)                                          |
| 5.8  | Build investment suggestions section (with disclaimer)                                        |
| 5.9  | Build anomaly alerts with natural language explanations                                       |
| 5.10 | Implement auto-categorization (suggestions on expense title input)                            |
| 5.11 | Build Dashboard AI insight summary card                                                       |
| 5.12 | Add "Regenerate" with rate limiting (1/hour)                                                  |
| 5.13 | Implement graceful AI fallback (app works without AI)                                         |
| 5.14 | Add AI result caching (Redis, 1-hour TTL)                                                     |
| 5.15 | Add AI token usage logging                                                                    |
| 5.16 | Write unit tests for prompt builders and response validators                                  |
| 5.17 | Write integration tests for insight generation pipeline                                       |

**Acceptance:** AI insights generate correctly, display in the UI, and degrade gracefully when Claude is unavailable. Auto-categorization suggests relevant categories.

---

### Phase 6: Notifications & Dashboard (Days 27–30)

**Goal:** Notification system and polished Dashboard.

| Task | Details                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------ |
| 6.1  | Implement `notification.router`                                                                  |
| 6.2  | Build notification bell icon with unread badge                                                   |
| 6.3  | Build notification dropdown/panel                                                                |
| 6.4  | Build notification item component (with click-to-navigate)                                       |
| 6.5  | Implement overspend check in analytics worker                                                    |
| 6.6  | Implement bill reminder cron job                                                                 |
| 6.7  | Implement monthly summary notification cron                                                      |
| 6.8  | Build Dashboard: summary cards with comparison indicators — match `Dashboard.html` Stitch mockup |
| 6.9  | Build Dashboard: sparkline chart (Recharts) — match `Dashboard.html` Stitch mockup               |
| 6.10 | Build Dashboard: AI insight card (linked to insights tab)                                        |
| 6.11 | Build Dashboard: quick action buttons + modals                                                   |
| 6.12 | Add notification preferences (opt-in/out) in settings                                            |
| 6.13 | Implement 30-day auto-archive for old notifications                                              |
| 6.14 | Write integration tests for notification triggers                                                |
| 6.15 | Write E2E test: exceed budget → receive overspend notification                                   |

**Acceptance:** Dashboard shows real-time aggregated data. Notifications fire correctly for overspend, reminders, and monthly summaries. Bell badge updates in real-time.

---

### Phase 7: Polish & Launch (Days 31–35)

**Goal:** Production-ready polish, performance, accessibility, and deployment.

| Task | Details                                                                                             |
| ---- | --------------------------------------------------------------------------------------------------- |
| 7.1  | Implement sidebar navigation (collapsible desktop, bottom mobile)                                   |
| 7.2  | Implement command palette (Ctrl+K)                                                                  |
| 7.3  | Implement all keyboard shortcuts                                                                    |
| 7.4  | Add page transitions (Framer Motion AnimatePresence)                                                |
| 7.5  | Audit and fix all loading states (skeleton components must match Stitch card dimensions)            |
| 7.6  | Audit and fix all empty states (illustrations + CTAs)                                               |
| 7.7  | Audit and fix all error states (error boundaries)                                                   |
| 7.8  | Add toast notifications (sonner) for all mutations                                                  |
| 7.9  | Responsive design audit (375px–1440px) — ensure Stitch visual language preserved across breakpoints |
| 7.10 | Accessibility audit (keyboard nav, ARIA, contrast)                                                  |
| 7.11 | Performance audit (LCP, FID, CLS targets)                                                           |
| 7.12 | Bundle size analysis (`@next/bundle-analyzer`)                                                      |
| 7.13 | Configure Sentry for production (source maps, breadcrumbs)                                          |
| 7.14 | Write remaining E2E tests for critical flows                                                        |
| 7.15 | Set up Vercel deployment (frontend)                                                                 |
| 7.16 | Set up Railway deployment (workers)                                                                 |
| 7.17 | Configure production environment variables                                                          |
| 7.18 | Run full test suite — all tests must pass                                                           |
| 7.19 | Create production deployment checklist                                                              |
| 7.20 | Deploy to production                                                                                |

**Acceptance:** All Core Web Vitals meet targets. All E2E tests pass. Zero unhandled errors in Sentry. Production deployment is live and functional. All pages match Stitch mockups pixel-perfectly in layout, spacing, and hierarchy.

---

## Deployment Plan

### Infrastructure

```
┌─────────────────────────────────────────────────────────┐
│                       Vercel                             │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Next.js 14 App (Frontend + tRPC API routes)    │    │
│  └──────────────────────┬──────────────────────────┘    │
│                         │                                │
└─────────────────────────┼────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
   ┌──────────┐    ┌──────────┐    ┌──────────────┐
   │  Neon    │    │ Upstash  │    │   Railway    │
   │ Postgres │    │  Redis   │    │  (Workers)   │
   └──────────┘    └──────────┘    └──────────────┘
                                         │
                                         ▼
                                   ┌──────────┐
                                   │ Anthropic │
                                   │ Claude API│
                                   └──────────┘
```

### Environment Variables

```env
# .env.example

# ─── Database ───
DATABASE_URL="postgresql://user:pass@host:5432/finance_os?sslmode=require"

# ─── Auth ───
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"

# ─── Redis ───
REDIS_URL="rediss://default:xxx@xxx.upstash.io:6379"
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# ─── AI ───
ANTHROPIC_API_KEY="sk-ant-xxx"

# ─── Monitoring ───
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
SENTRY_AUTH_TOKEN="sntrys_xxx"

# ─── App ───
NODE_ENV="development"
```

### CI/CD Pipeline

```yaml
# Runs on every PR and push to main

name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [lint-and-type-check, unit-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

  deploy:
    needs: [e2e-tests]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: --prod
```

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npx prisma generate && next build",
  "framework": "nextjs",
  "regions": ["bom1"],
  "crons": []
}
```

### Worker Deployment (Railway)

```dockerfile
# workers/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npx prisma generate

CMD ["node", "workers/index.js"]
```

### Database Migration Strategy

```bash
# Development
npx prisma migrate dev --name <migration-name>

# Staging/Production (applied in CI before deployment)
npx prisma migrate deploy
```

### Scaling Considerations (Post-Launch)

| Concern              | Strategy                                                                   |
| -------------------- | -------------------------------------------------------------------------- |
| Database connections | Use Neon serverless driver with connection pooling (PgBouncer)             |
| Redis throughput     | Upstash auto-scales; monitor via Upstash dashboard                         |
| Worker scaling       | Railway supports horizontal scaling; add replicas if job queue depth > 100 |
| AI rate limiting     | Implement token bucket in Redis; monitor Claude usage dashboard            |
| Bundle size          | Code-split heavy chart libraries; lazy-load analytics/investments tabs     |
| Image optimization   | Use `next/image` for all user uploads (future)                             |

---

## Data Flow Diagrams

### Expense Creation Flow

```
User fills expense form
        │
        ▼
[Frontend] tRPC mutation: expense.create
        │
        ▼
[tRPC Handler] Validate input (Zod) → Calculate taxAmount
        │
        ▼
[Prisma] INSERT INTO expenses → Return created expense
        │
        ├──────────────────────────┐
        ▼                          ▼
[Frontend]                  [BullMQ] analyticsQueue.add("recalculate")
Optimistic cache update            │
via React Query                    ▼
        │                   [Worker] Recalculate board + dashboard stats
        ▼                          │
User sees updated                  ├─→ Check budget limits → notification job
Kanban board immediately           │
                                   ├─→ Check anomalies → flag if ≥ 2× avg
                                   │
                                   └─→ Invalidate Redis caches
```

### AI Insight Generation Flow

```
User visits AI Insights tab (or clicks "Regenerate")
        │
        ▼
[Frontend] tRPC query: insight.getMonthlySummary
        │
        ▼
[tRPC Handler] Check Redis cache
        │
        ├─ Cache HIT → Return cached insight
        │
        └─ Cache MISS → Check DB for existing insight
                │
                ├─ DB HIT + not expired → Cache in Redis → Return
                │
                └─ DB MISS or expired →
                        │
                        ▼
                [BullMQ] insightQueue.add("generate-insight")
                        │
                        ▼
                [Worker] Aggregate user financial data
                        │
                        ▼
                [Worker] Build prompt → Call Claude API
                        │
                        ▼
                [Worker] Validate response (Zod) → Store in DB
                        │
                        ▼
                [Worker] Cache in Redis (1-hour TTL)
                        │
                        ▼
                [Worker] Dispatch notification: "AI insight ready"
                        │
                        ▼
                [Frontend] React Query detects new data → Re-render
```

---

## AI Prompt Architecture

### Prompt Template Example: Monthly Summary

```typescript
// src/server/ai/prompts/monthly-summary.ts

export function buildMonthlySummaryPrompt(data: {
  month: string;
  year: number;
  totalSpent: number; // in rupees (converted from paise)
  totalIncome: number;
  savingsRate: number; // percentage
  topCategories: Array<{ name: string; amount: number; change: number }>;
  investmentGainLoss: number;
  totalTaxPaid: number;
  anomalyCount: number;
}): string {
  return `You are a personal finance advisor analyzing a user's monthly financial data.

Generate a concise, friendly, actionable financial health summary for ${data.month} ${data.year}.

DATA:
- Total spent: ₹${data.totalSpent.toLocaleString()}
- Total income: ₹${data.totalIncome.toLocaleString()}
- Savings rate: ${data.savingsRate}%
- Top spending categories:
${data.topCategories.map((c) => `  - ${c.name}: ₹${c.amount.toLocaleString()} (${c.change > 0 ? "+" : ""}${c.change}% vs last month)`).join("\n")}
- Investment gain/loss: ₹${data.investmentGainLoss.toLocaleString()}
- Total tax paid: ₹${data.totalTaxPaid.toLocaleString()}
- Spending anomalies detected: ${data.anomalyCount}

RULES:
- Write 3-5 short paragraphs in plain English
- Be specific with numbers — reference the actual data
- Include one concrete, actionable recommendation
- Tone: supportive and encouraging, not judgmental
- If savings rate > 30%, acknowledge it positively
- If anomalies > 0, mention them briefly
- Do NOT give specific investment advice or stock picks
- Format: plain text with no markdown headers`;
}
```

### AI Response Validation Schema

```typescript
// src/server/ai/schemas/insight-response.ts

import { z } from "zod";

export const monthlySummaryResponseSchema = z.object({
  summary: z.string().min(100).max(3000),
});

export const costReductionResponseSchema = z.object({
  suggestions: z
    .array(
      z.object({
        description: z.string().min(10).max(500),
        estimatedMonthlySavings: z.number().positive(),
        difficulty: z.enum(["Easy", "Medium", "Hard"]),
        category: z.string().optional(),
      }),
    )
    .min(1)
    .max(10),
});

export const categorizationResponseSchema = z.object({
  suggestedCategory: z.string(),
  confidence: z.number().min(0).max(1),
});
```

---

## Key Implementation Notes

### Monetary Values

```typescript
// ALWAYS store in paise/cents
const amountInPaise = Math.round(userInputInRupees * 100);

// ALWAYS display via utility
import { formatCurrency } from "@/lib/format-currency";

export function formatCurrency(amountInPaise: number, currency: string = "INR"): string {
  const amount = amountInPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
```

### Error Boundary Pattern

```typescript
// src/components/shared/error-boundary.tsx
"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  section: string; // for Sentry context
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // Report to Sentry with section context
    Sentry.captureException(error, {
      tags: { section: this.props.section },
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-muted-foreground">
            Something went wrong in {this.props.section}.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 text-sm underline"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

_Last updated: 2026-03-30_
_Version: 1.1.0 — Added Stitch design integration, UI implementation strategy, and mockup-driven task references_