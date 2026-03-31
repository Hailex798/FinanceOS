# Finance OS — Feature Specification

> **Document type:** Product specification (what the user experiences).
> **Audience:** Engineers, designers, QA, AI agents implementing the system.
> **Rule:** This document describes features and acceptance criteria only. It does NOT prescribe technology choices — see `constitution.md` for tech stack and `plan.md` for implementation details.

---

## Design References

This spec must be implemented to match the Stitch mockups exactly:

| Page                    | Stitch Export                              | Route          |
| ----------------------- | ------------------------------------------ | -------------- |
| Login Page              | `stitch-exports/Login.html`                | `/login`       |
| Dashboard               | `stitch-exports/Dashboard.html`            | `/dashboard`   |
| Kanban Boards           | `stitch-exports/KanBanBoards.html`         | `/boards`      |
| Analytics               | `stitch-exports/DetailedAnalytics.html`    | `/analytics`   |
| Investments / Net Worth | `stitch-exports/InvestmentNetWorth.html`   | `/investments` |
| AI Insights             | `stitch-exports/AllInsightsDashboard.html` | `/insights`    |

**Design tokens and component guidelines:** `specs/main/DESIGN.md`

> **Implementation Rule:** Before building any page, analyze the corresponding HTML export to understand layout, spacing, color, and component hierarchy. Then rebuild using Next.js 14, Tailwind CSS, shadcn/ui, and Framer Motion — never copy HTML/CSS from exports.

---

## Table of Contents

1. [Product Summary](#1-product-summary)
2. [User Personas](#2-user-personas)
3. [Feature Specifications](#3-feature-specifications)
   - 3.1 [Authentication](#31-authentication)
   - 3.2 [Dashboard (Home Tab)](#32-dashboard-home-tab)
   - 3.3 [Boards Tab](#33-boards-tab)
   - 3.4 [Analytics Tab](#34-analytics-tab)
   - 3.5 [Investments / Net Worth Tab](#35-investments--net-worth-tab)
   - 3.6 [AI Insights](#36-ai-insights)
   - 3.7 [Notifications](#37-notifications)
   - 3.8 [Settings](#38-settings)
4. [Cross-Cutting Concerns](#4-cross-cutting-concerns)
5. [What We Are NOT Building](#5-what-we-are-not-building)

---

## 1. Product Summary

**Finance OS** is a personal financial operating system. It provides a single-user, login-protected web application where the user can:

- Track expenses across multiple bank accounts using Kanban-style boards
- Monitor investments and net worth over time
- Receive AI-powered financial insights and suggestions
- Analyze spending with rich charts and exportable reports
- Manage tax-aware expense records (GST, TDS, custom taxes)

The application is designed for **personal use** by a financially aware individual who wants granular control over their money. It is not a team/family finance tool.

---

## 2. User Personas

### Primary: "The Optimizer"

- **Who:** A 25–40-year-old professional managing multiple bank accounts, investments, and tax obligations.
- **Goal:** See all financial data in one place, understand spending patterns, reduce waste, and grow net worth.
- **Pain points:** Scattered data across bank apps, no unified view, manual spreadsheets, no AI help.

### Secondary: "The Beginner Tracker"

- **Who:** Someone starting their financial tracking journey.
- **Goal:** Simple expense logging with visual boards, without being overwhelmed.
- **Pain points:** Traditional finance apps are too complex or too simple.

---

## 3. Feature Specifications

---

### 3.1 Authentication

#### US-AUTH-01: Email + Password Signup

**As a** new user,
**I want to** create an account with my email and password,
**So that** I can access Finance OS.

**Acceptance Criteria:**

- [ ] Signup form collects: name, email, password, confirm password.
- [ ] Email must be valid format and unique.
- [ ] Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character.
- [ ] Password and confirm password must match.
- [ ] On success, user is redirected to the Dashboard.
- [ ] On duplicate email, show: "An account with this email already exists."
- [ ] Form shows inline validation errors as the user types (debounced).
- [ ] UI matches the Stitch mockup `Login.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

**Edge Cases:**

- Network failure during signup → show retry prompt, do not lose form data.
- Very long name/email → enforce max length (name: 100 chars, email: 255 chars).

---

#### US-AUTH-02: Email + Password Login

**As a** returning user,
**I want to** log in with my email and password,
**So that** I can access my financial data.

**Acceptance Criteria:**

- [ ] Login form collects: email, password.
- [ ] On success, redirect to Dashboard.
- [ ] On invalid credentials, show: "Invalid email or password." (do not reveal which is wrong).
- [ ] After 5 failed attempts, show: "Too many attempts. Try again in 1 minute."
- [ ] "Forgot password" link is visible (can be a placeholder/future feature).
- [ ] UI matches the Stitch mockup `Login.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-AUTH-03: Google OAuth Login

**As a** user,
**I want to** sign in with my Google account,
**So that** I can access Finance OS without creating a separate password.

**Acceptance Criteria:**

- [ ] "Sign in with Google" button on login and signup pages.
- [ ] First-time Google sign-in creates a new account automatically.
- [ ] Returning Google user is logged in and redirected to Dashboard.
- [ ] If a user signed up with email and later tries Google with the same email, accounts are linked.
- [ ] Google profile picture and name are imported on first sign-in.
- [ ] UI matches the Stitch mockup `Login.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-AUTH-04: Protected Routes

**As a** product owner,
**I want** all app routes (except login/signup) to require authentication,
**So that** financial data is never exposed to unauthenticated users.

**Acceptance Criteria:**

- [ ] Accessing any app URL while logged out redirects to `/login`.
- [ ] After login, user is redirected back to the originally requested URL.
- [ ] Session expiry (JWT expiration) redirects to login with message: "Session expired. Please log in again."
- [ ] Logout clears all session data and redirects to `/login`.
- [ ] UI matches the Stitch mockup `Login.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

### 3.2 Dashboard (Home Tab)

#### US-DASH-01: Financial Summary Cards

**As a** user,
**I want to** see my key financial metrics at a glance on the Dashboard,
**So that** I understand my financial position immediately.

**Acceptance Criteria:**

- [ ] **Total Balance** card: sum of all account balances (accounts added via Boards).
- [ ] **Monthly Spend** card: total spending in the current calendar month.
- [ ] **Savings Rate** card: `(Income - Spending) / Income × 100`. If no income is logged, show "Set up income to calculate savings rate."
- [ ] All monetary values formatted as currency with the appropriate symbol (₹, $, etc.).
- [ ] Cards animate in on page load (staggered fade + slide up).
- [ ] Each card shows a comparison indicator: ↑ or ↓ vs last month, with percentage.
- [ ] UI matches the Stitch mockup `Dashboard.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

**Edge Cases:**

- No accounts added → show "Add your first bank account to get started" with CTA button.
- No expenses this month → Monthly Spend shows ₹0 with "No expenses recorded this month."
- First month of use (no previous month data) → comparison indicators show "—" instead of percentage.

---

#### US-DASH-02: Spending Sparkline

**As a** user,
**I want to** see a mini chart of my last 7 days of spending,
**So that** I can quickly spot recent trends.

**Acceptance Criteria:**

- [ ] Sparkline chart shows daily total spending for the last 7 days.
- [ ] X-axis: day labels (Mon, Tue, etc.). Y-axis: implied by line height.
- [ ] Hovering over a data point shows a tooltip with the date and amount.
- [ ] Chart animates in with a line-drawing effect.
- [ ] If fewer than 7 days of data, show available days with empty days as ₹0.
- [ ] UI matches the Stitch mockup `Dashboard.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-DASH-03: AI Insight Summary Card

**As a** user,
**I want to** see an AI-generated summary of my financial health on the Dashboard,
**So that** I get actionable advice without navigating to a separate tab.

**Acceptance Criteria:**

- [ ] Card shows a 1–3 sentence natural language summary (e.g., "You overspent on food by ₹4,200 this month. Your savings rate dropped 5% from last month.").
- [ ] Summary refreshes monthly or when user clicks "Refresh insight."
- [ ] While generating, card shows a pulsing skeleton with text "Analyzing your finances…"
- [ ] If AI is unavailable, card shows: "AI insights are temporarily unavailable. Your data is safe."
- [ ] Card has a subtle AI badge/icon indicating it's AI-generated.
- [ ] Clicking the card navigates to the full AI Insights tab.
- [ ] UI matches the Stitch mockup `Dashboard.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-DASH-04: Quick Actions

**As a** user,
**I want to** quickly add an expense or investment from the Dashboard,
**So that** I can log transactions without navigating away.

**Acceptance Criteria:**

- [ ] Two buttons: "Add Expense" and "Add Investment."
- [ ] "Add Expense" opens a modal with the expense form (pre-selects the most recently used board).
- [ ] "Add Investment" opens a modal with the investment form.
- [ ] Both modals can be dismissed with Escape key or clicking outside.
- [ ] After successful submission, a toast confirms the action and relevant Dashboard data refreshes.
- [ ] UI matches the Stitch mockup `Dashboard.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

### 3.3 Boards Tab

> This is the **core differentiator** of Finance OS. The Kanban-style expense board is the primary way users organize and track spending.

#### US-BOARD-01: Board Management

**As a** user,
**I want to** create, edit, and delete expense boards,
**So that** I can organize expenses by bank account.

**Acceptance Criteria:**

- [ ] User can create a new board with: name, linked bank account, month, year.
- [ ] Board name defaults to `{Bank Name} - {Month} {Year}` (editable).
- [ ] User can edit board name and linked account after creation.
- [ ] User can delete a board — confirmation dialog required: "Delete '{Board Name}'? This will remove all expenses on this board. This cannot be undone."
- [ ] Board list view shows all boards as cards (grid layout on desktop, stacked on mobile).
- [ ] Boards are sorted by: most recent month first, then alphabetically.
- [ ] Each board card shows: board name, account name, total spend, expense count.
- [ ] UI matches the Stitch mockup `KanBanBoards.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

**Edge Cases:**

- No boards → show "Create your first expense board" with illustration and CTA.
- Deleting a board with 100+ expenses → show count in confirmation dialog.

---

#### US-BOARD-02: Bank Account Management

**As a** user,
**I want to** add and manage bank accounts,
**So that** I can link them to expense boards.

**Acceptance Criteria:**

- [ ] User can add an account with: name, bank name, account type (Savings, Current, Credit Card, Wallet), color, icon.
- [ ] Account type determines icon suggestions (bank icon, credit card icon, wallet icon).
- [ ] User can edit and delete accounts.
- [ ] Deleting an account with linked boards shows warning: "This account is linked to {N} boards. Delete anyway?"
- [ ] Account list is accessible from board creation and from a settings/accounts page.
- [ ] UI matches the Stitch mockup `KanBanBoards.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-BOARD-03: Kanban Columns

**As a** user,
**I want to** see my expenses organized in three columns: Planned, Spent, Recurring,
**So that** I can track the status of each expense.

**Acceptance Criteria:**

- [ ] Each board opens to a Kanban view with exactly three columns:
  - **Planned**: expenses you expect to make this month.
  - **Spent**: expenses that have been paid/completed.
  - **Recurring**: monthly recurring expenses (subscriptions, EMIs, rent).
- [ ] Each column shows its total amount at the top.
- [ ] Columns are visually distinct (subtle color coding or header styling).
- [ ] On mobile, columns are horizontally scrollable or tabbed.
- [ ] UI matches the Stitch mockup `KanBanBoards.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-BOARD-04: Expense Cards

**As a** user,
**I want to** create expense cards with detailed financial information,
**So that** I have a comprehensive record of every transaction.

**Acceptance Criteria:**

- [ ] Expense card fields:
  - **Title** (required, max 100 chars)
  - **Amount** (required, positive number, entered in rupees — stored in paise)
  - **Category** (required, dropdown from user's categories)
  - **Date** (required, defaults to today)
  - **Notes** (optional, max 500 chars)
  - **Tax type** (optional: GST, TDS, Custom, None)
  - **Tax rate** (% — required if tax type is selected)
  - **Tax amount** (auto-calculated: `amount × taxRate / 100`, displayed read-only)
  - **Custom tax label** (required if tax type is "Custom")
- [ ] Card displays in its column with: title, amount (bold), category badge, date, tax indicator (if applicable).
- [ ] Clicking a card opens a detail/edit modal.
- [ ] Card has a quick delete action (with confirmation).
- [ ] Cards animate in when added (fade + slide from top).
- [ ] UI matches the Stitch mockup `KanBanBoards.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

**Edge Cases:**

- Amount of ₹0 → reject with "Amount must be greater than zero."
- Very long title → truncate in card view, show full in modal.
- Tax rate of 0% with tax type selected → show warning "Tax rate is 0%. Did you mean to select no tax?"
- Future dates → allow (for planned expenses).

---

#### US-BOARD-05: Drag and Drop

**As a** user,
**I want to** drag expense cards between Kanban columns,
**So that** I can update their status visually.

**Acceptance Criteria:**

- [ ] Cards can be dragged from any column to any other column.
- [ ] Drag interaction shows a ghost card following the cursor.
- [ ] Drop zone highlights when a card is dragged over it.
- [ ] On drop, the card's status updates immediately (optimistic update).
- [ ] Drag and drop works on desktop (mouse) and is disabled on mobile (use a "Move to" action instead).
- [ ] Card order within a column is persisted.
- [ ] UI matches the Stitch mockup `KanBanBoards.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-BOARD-06: Board Filters

**As a** user,
**I want to** filter expense cards on a board,
**So that** I can find specific transactions quickly.

**Acceptance Criteria:**

- [ ] Filter bar at the top of each board with options:
  - **Category** (multi-select dropdown)
  - **Date range** (start date – end date picker)
  - **Tax type** (GST, TDS, Custom, None)
  - **Amount range** (min – max slider or inputs)
- [ ] Filters apply across all three columns simultaneously.
- [ ] Active filter count shown as a badge on the filter button.
- [ ] "Clear all filters" button visible when any filter is active.
- [ ] Filtered-out cards are hidden (not grayed out).
- [ ] Column totals update to reflect filtered results.
- [ ] UI matches the Stitch mockup `KanBanBoards.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-BOARD-07: Board Analytics

**As a** user,
**I want to** see analytics for each individual board,
**So that** I understand spending patterns per account.

**Acceptance Criteria:**

- [ ] Board analytics panel (collapsible sidebar or bottom drawer):
  - **Category pie chart**: spending distribution by category on this board.
  - **Spend trend**: bar chart showing daily spending over the board's month.
  - **Total tax paid**: sum of all tax amounts on this board, broken down by tax type.
- [ ] Analytics update in real-time as expenses are added/modified.
- [ ] Charts animate in (staggered reveal).
- [ ] On mobile, analytics are accessible via a "View Analytics" button (opens full-screen overlay).
- [ ] UI matches the Stitch mockup `KanBanBoards.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

### 3.4 Analytics Tab

#### US-ANALYTICS-01: Monthly Comparison

**As a** user,
**I want to** compare my current month's spending against the last 3 months,
**So that** I can identify trends.

**Acceptance Criteria:**

- [ ] Grouped bar chart showing total spend per month (current + last 3 months).
- [ ] Each bar is labeled with the month name and total amount.
- [ ] Color coding: current month in primary color, historical months in muted tones.
- [ ] Tooltip on hover shows exact amounts.
- [ ] If user has fewer than 4 months of data, show available months only.
- [ ] UI matches the Stitch mockup `DetailedAnalytics.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-ANALYTICS-02: Category Breakdown

**As a** user,
**I want to** see my spending broken down by category,
**So that** I know where my money goes.

**Acceptance Criteria:**

- [ ] Donut chart showing percentage of total spend per category.
- [ ] Categories include: Food, Transport, Subscriptions, EMI, Shopping, Bills, Health, Entertainment, Education, Other (user-customizable).
- [ ] Legend shows category name, amount, and percentage.
- [ ] Clicking a category segment filters the view to show matching expenses below the chart.
- [ ] Chart animates in with a radial reveal.
- [ ] UI matches the Stitch mockup `DetailedAnalytics.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-ANALYTICS-03: Tax Aggregation

**As a** user,
**I want to** see total tax paid this month (GST, TDS, custom),
**So that** I can track my tax burden.

**Acceptance Criteria:**

- [ ] Summary cards showing:
  - **Total GST paid** this month
  - **Total TDS deducted** this month
  - **Total custom tax** this month
  - **Grand total tax** this month
- [ ] Below the summary: table listing all tax-bearing expenses with: title, amount, tax type, tax rate, tax amount.
- [ ] Sortable by any column.
- [ ] UI matches the Stitch mockup `DetailedAnalytics.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-ANALYTICS-04: Spend Anomaly Detection

**As a** user,
**I want to** be alerted when an expense is significantly higher than normal,
**So that** I can catch mistakes or unusual spending.

**Acceptance Criteria:**

- [ ] An expense is flagged as anomalous if its amount is **≥ 2× the category average** for the last 3 months.
- [ ] Anomalous expenses are highlighted with a warning badge in the analytics view.
- [ ] A dedicated "Anomalies" section lists all flagged expenses with: title, amount, category average, deviation multiplier.
- [ ] If no anomalies, show: "No spending anomalies detected this month. 👍"
- [ ] UI matches the Stitch mockup `DetailedAnalytics.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-ANALYTICS-05: Export

**As a** user,
**I want to** export my financial data,
**So that** I can use it in spreadsheets or share with my CA.

**Acceptance Criteria:**

- [ ] Export button with two options: **CSV** and **PDF**.
- [ ] Export scope selection: current month, custom date range, specific board, all data.
- [ ] CSV includes: date, title, amount, category, tax type, tax rate, tax amount, board name, status.
- [ ] PDF includes the same data in a formatted table with headers and totals.
- [ ] Export starts a download immediately — no email required.
- [ ] Large exports (>1000 rows) show a progress indicator.
- [ ] UI matches the Stitch mockup `DetailedAnalytics.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

### 3.5 Investments / Net Worth Tab

#### US-INVEST-01: Add Investments

**As a** user,
**I want to** log my investments across different asset types,
**So that** I can track my complete portfolio.

**Acceptance Criteria:**

- [ ] Investment form fields:
  - **Asset type** (required): Stocks, Mutual Funds, Crypto, FD, PPF, Gold, Real Estate
  - **Asset name** (required, max 100 chars)
  - **Invested amount** (required, in base currency)
  - **Current value** (required, manually entered or auto-updated)
  - **Date of investment** (required)
  - **Notes** (optional, max 500 chars)
- [ ] User can add, edit, and delete investments.
- [ ] Delete requires confirmation.

**Edge Cases:**

- Current value less than invested amount → show as loss (red text).
- Current value of ₹0 → allow (for written-off investments).
- Very old investment dates → allow (no restriction on past dates).

---

#### US-INVEST-02: Portfolio Overview

**As a** user,
**I want to** see my total portfolio value and allocation,
**So that** I understand my investment distribution.

**Acceptance Criteria:**

- [ ] Summary cards:
  - **Total Invested**: sum of all invested amounts.
  - **Current Value**: sum of all current values.
  - **Total Gain/Loss**: current value − invested amount (absolute + percentage).
- [ ] **Allocation donut chart**: percentage of portfolio by asset type.
- [ ] Investment list below chart showing each investment with gain/loss.
- [ ] Gain shown in green, loss in red, neutral in gray.
- [ ] List sortable by: name, type, invested amount, current value, gain/loss, date.
- [ ] UI matches the Stitch mockup `InvestmentNetWorth.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-INVEST-03: Net Worth Over Time

**As a** user,
**I want to** see my net worth tracked over time,
**So that** I can visualize my financial growth.

**Acceptance Criteria:**

- [ ] Line chart showing net worth (total account balances + investment current values) plotted monthly.
- [ ] X-axis: months. Y-axis: net worth amount.
- [ ] Data points are clickable — show breakdown (accounts: ₹X, investments: ₹Y).
- [ ] Chart shows all available months (since account creation).
- [ ] If only one month of data, show a single point with message: "Keep tracking to see your trend."
- [ ] UI matches the Stitch mockup `InvestmentNetWorth.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-INVEST-04: Investment Price Updates

**As a** user,
**I want to** update the current value of my investments,
**So that** my portfolio reflects real market conditions.

**Acceptance Criteria:**

- [ ] Each investment has an "Update Value" action.
- [ ] Quick-update inline edit for current value (no modal needed).
- [ ] "Last updated" timestamp shown on each investment.
- [ ] Bulk update: user can update all investments of a type at once.
- [ ] (Future enhancement placeholder): API-based auto-update for stocks and mutual funds.
- [ ] UI matches the Stitch mockup `InvestmentNetWorth.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

### 3.6 AI Insights

#### US-AI-01: Monthly Financial Health Summary

**As a** user,
**I want to** receive an AI-generated monthly summary of my financial health,
**So that** I get a holistic view without manual analysis.

**Acceptance Criteria:**

- [ ] Summary is generated once per month (on first visit or on demand).
- [ ] Summary is in plain English, 3–5 paragraphs covering:
  - Overall spending vs income
  - Top spending categories and changes
  - Investment performance highlights
  - Tax summary
  - One actionable recommendation
- [ ] Summary is displayed in a readable card with proper formatting (bold, bullet points).
- [ ] "Regenerate" button available (rate-limited to once per hour).
- [ ] Generation shows animated loading state with estimated wait time.
- [ ] UI matches the Stitch mockup `AllInsightsDashboard.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-AI-02: Cost Reduction Suggestions

**As a** user,
**I want** AI to suggest specific ways to reduce costs,
**So that** I can save more money.

**Acceptance Criteria:**

- [ ] Suggestions are specific and actionable (e.g., "Cancel 3 subscriptions: Netflix, Spotify, YouTube Premium = ₹2,400/month saved").
- [ ] Each suggestion shows: description, estimated monthly savings, difficulty (Easy, Medium, Hard).
- [ ] User can dismiss suggestions they don't want to see again.
- [ ] Suggestions are based on the user's actual spending data — not generic advice.
- [ ] Minimum 3 suggestions per month (if data is sufficient).
- [ ] UI matches the Stitch mockup `AllInsightsDashboard.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-AI-03: Investment Suggestions

**As a** user,
**I want** AI to suggest investment actions based on my savings rate and portfolio,
**So that** I can optimize my wealth growth.

**Acceptance Criteria:**

- [ ] Suggestions based on: current savings rate, portfolio allocation, investment types.
- [ ] Examples: "Your savings rate of 35% is excellent. Consider increasing SIP in equity mutual funds by ₹5,000/month."
- [ ] Disclaimer shown: "AI suggestions are not financial advice. Consult a certified advisor."
- [ ] Suggestions refresh monthly.
- [ ] UI matches the Stitch mockup `AllInsightsDashboard.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-AI-04: Expense Auto-Categorization

**As a** user,
**I want** AI to suggest a category when I add an expense,
**So that** categorization is faster and more consistent.

**Acceptance Criteria:**

- [ ] When user types an expense title, AI suggests a category (after 3+ characters).
- [ ] Suggestion appears as a subtle hint below the category dropdown.
- [ ] User can accept (one click) or ignore the suggestion.
- [ ] Categorization improves over time based on user's history.
- [ ] If AI is unavailable, category field works normally without suggestions.
- [ ] UI matches the Stitch mockup `AllInsightsDashboard.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-AI-05: Anomaly Alerts in Natural Language

**As a** user,
**I want** AI to explain spending anomalies in plain language,
**So that** I understand unusual patterns without reading charts.

**Acceptance Criteria:**

- [ ] When anomalies are detected (see US-ANALYTICS-04), AI generates a natural language explanation.
- [ ] Example: "Your dining expenses this month (₹12,400) are 2.3× higher than your 3-month average (₹5,400). This was mainly driven by 3 restaurant visits over ₹2,000 each."
- [ ] Alerts appear in the AI Insights tab and as notification cards.
- [ ] UI matches the Stitch mockup `AllInsightsDashboard.html` in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

### 3.7 Notifications

#### US-NOTIF-01: Overspend Alerts

**As a** user,
**I want to** be notified when I exceed my budget for a category,
**So that** I can adjust my spending.

**Acceptance Criteria:**

- [ ] User can set a monthly budget limit per category (in Category settings).
- [ ] When spending in a category reaches 80% of the limit → warning notification.
- [ ] When spending exceeds 100% → alert notification.
- [ ] Notifications appear in an in-app notification center (bell icon in header).
- [ ] Notification shows: category name, amount spent, budget limit, overage amount.
- [ ] UI matches the Stitch design system in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-NOTIF-02: Bill Reminders

**As a** user,
**I want to** receive reminders for recurring expenses that are due,
**So that** I don't miss payments.

**Acceptance Criteria:**

- [ ] Recurring expenses (in the Recurring column) have an optional "due date" field.
- [ ] Reminder generated 3 days before the due date and on the due date.
- [ ] Notification shows: expense title, amount, due date, board name.
- [ ] User can mark a reminder as "Paid" (moves the expense to the Spent column for that month).
- [ ] UI matches the Stitch design system in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-NOTIF-03: Monthly Summary Notification

**As a** user,
**I want to** receive a monthly financial summary,
**So that** I stay informed even without opening the app daily.

**Acceptance Criteria:**

- [ ] Generated on the 1st of each month for the previous month.
- [ ] In-app notification with: total spent, top category, savings rate, investment change.
- [ ] (Optional future enhancement): email delivery of the same summary.
- [ ] User can opt out of monthly summary notifications in settings.
- [ ] UI matches the Stitch design system in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-NOTIF-04: Notification Center

**As a** user,
**I want** a centralized place to view all my notifications,
**So that** I don't miss important financial alerts.

**Acceptance Criteria:**

- [ ] Bell icon in the app header with unread count badge.
- [ ] Clicking opens a dropdown/sidebar with notification list.
- [ ] Each notification shows: icon, message, timestamp, read/unread indicator.
- [ ] "Mark all as read" action.
- [ ] Notifications persist for 30 days, then auto-archived.
- [ ] Clicking a notification navigates to the relevant context (board, analytics, etc.).
- [ ] UI matches the Stitch design system in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

### 3.8 Settings

#### US-SETTINGS-01: Profile Management

**Acceptance Criteria:**

- [ ] User can update: name, profile picture.
- [ ] Email is displayed but not editable (to prevent account confusion).
- [ ] Password change requires current password + new password + confirmation.
- [ ] UI matches the Stitch design system in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-SETTINGS-02: Category Management

**Acceptance Criteria:**

- [ ] User can create custom categories with: name, color, icon, monthly budget limit.
- [ ] Default categories are pre-seeded on account creation: Food, Transport, Subscriptions, EMI, Shopping, Bills, Health, Entertainment, Education, Rent, Salary, Other.
- [ ] User can edit and delete custom categories.
- [ ] Default categories can be edited but not deleted.
- [ ] Deleting a category with existing expenses shows: "Reassign {N} expenses to another category or mark as 'Other'."
- [ ] UI matches the Stitch design system in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

#### US-SETTINGS-03: Currency & Locale

**Acceptance Criteria:**

- [ ] User can select their primary currency: INR (₹), USD ($), EUR (€), GBP (£).
- [ ] Currency symbol and formatting apply globally.
- [ ] Default: INR.
- [ ] UI matches the Stitch design system in layout, spacing, color, and component hierarchy. Verified against `DESIGN.md` tokens.

---

## 4. Cross-Cutting Concerns

### 4.1 Loading States

Every data-dependent section must show a loading state:

- Dashboard cards → skeleton cards (same dimensions, pulsing gray).
- Charts → skeleton chart placeholder.
- Lists → skeleton rows.
- AI insights → pulsing text skeleton with "Analyzing…" message.

### 4.2 Empty States

Every list/collection must handle the empty case:

- No boards → illustration + "Create your first board" CTA.
- No expenses on a board → "Add your first expense" CTA in each column.
- No investments → illustration + "Track your first investment" CTA.
- No notifications → "You're all caught up! 🎉"
- No analytics data → "Add some expenses to see your analytics."

### 4.3 Error States

Every data-fetching operation must handle errors:

- Network error → "Something went wrong. Check your connection and try again." with retry button.
- Server error (5xx) → "We're having trouble. Please try again in a moment." with retry button.
- Auth error (401) → redirect to login.
- Not found (404) → "This page doesn't exist" with link to Dashboard.
- Form validation errors → inline, specific, and red-highlighted.

### 4.4 Confirmation Dialogs

Destructive actions require explicit confirmation:

- Delete board, expense, investment, account, category.
- Dialogs use consistent format: title, description with context, "Cancel" and "Delete" (red) buttons.
- Double-confirmation for irreversible bulk actions.

### 4.5 Toast Notifications

After successful mutations, show a toast:

- "Expense added" / "Investment updated" / "Board deleted"
- Toasts auto-dismiss after 4 seconds.
- Toasts have an "Undo" action where applicable (expense add, expense move).
- Maximum 3 toasts visible at once.

### 4.6 Keyboard Shortcuts

| Shortcut               | Action                                  |
| ---------------------- | --------------------------------------- |
| `Ctrl/Cmd + K`         | Open command palette / quick search     |
| `Ctrl/Cmd + N`         | Add new expense (on Boards tab)         |
| `Ctrl/Cmd + Shift + N` | Add new investment (on Investments tab) |
| `Escape`               | Close any modal/dialog                  |

### 4.7 Navigation

- Persistent sidebar on desktop (collapsible).
- Bottom navigation bar on mobile.
- Tabs: Dashboard, Boards, Analytics, Investments, AI Insights.
- Settings accessible from user avatar menu.
- Notification bell in top-right header area.

---

## 5. What We Are NOT Building

To maintain scope clarity, the following are explicitly **out of scope** for v1:

| Feature                                  | Reason                                                                                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multi-user / Family sharing**          | Single-user app by design.                                                                                                                      |
| **Bank API integration (Plaid, Yodlee)** | Manual entry only in v1; API integration is a future enhancement.                                                                               |
| **Mobile native app**                    | Web-only; responsive design covers mobile use.                                                                                                  |
| **Automated transaction import**         | No CSV import, bank sync, or SMS parsing in v1.                                                                                                 |
| **Budgeting forecasts**                  | AI provides suggestions, not forward-looking budget plans.                                                                                      |
| **Cryptocurrency real-time prices**      | Manual entry for crypto; API integration is a future enhancement.                                                                               |
| **Multi-currency support**               | Single primary currency per user in v1.                                                                                                         |
| **Receipt scanning / OCR**               | No image upload or OCR in v1.                                                                                                                   |
| **Social features**                      | No sharing, leaderboards, or community features.                                                                                                |
| **Recurring payment auto-creation**      | Recurring column is manual; auto-generation of next month's entries is a future enhancement.                                                    |
| **Tax filing assistance**                | We track tax paid; we do not generate tax returns or ITR data.                                                                                  |
| **Email notifications**                  | In-app only for v1; email delivery is a future enhancement.                                                                                     |
| **Dark mode**                            | Light mode only for v1; dark mode is a fast-follow.                                                                                             |
| **Internationalization (i18n)**          | English only for v1.                                                                                                                            |
| **Offline support / PWA**                | Online-only for v1.                                                                                                                             |
| **Direct use of Stitch HTML/CSS**        | We are NOT using exported HTML/CSS directly. All UI must be rebuilt with Next.js, Tailwind, and shadcn/ui.                                      |
| **Deviations from Stitch design system** | We are NOT deviating from the Stitch design system without explicit approval. All visual decisions come from `DESIGN.md` and `stitch-exports/`. |
| **Custom components over shadcn/ui**     | We are NOT creating custom components when shadcn/ui equivalents exist. shadcn/ui is always preferred.                                          |

---

## Appendix: Category Defaults

| Category          | Icon | Default Color | Budget Example |
| ----------------- | ---- | ------------- | -------------- |
| Food & Dining     | 🍕   | Orange        | ₹8,000         |
| Transport         | 🚗   | Blue          | ₹3,000         |
| Subscriptions     | 📱   | Purple        | ₹2,000         |
| EMI               | 🏦   | Dark Blue     | ₹15,000        |
| Shopping          | 🛍️   | Pink          | ₹5,000         |
| Bills & Utilities | ⚡   | Yellow        | ₹4,000         |
| Health            | 🏥   | Red           | ₹2,000         |
| Entertainment     | 🎬   | Teal          | ₹3,000         |
| Education         | 📚   | Green         | ₹2,000         |
| Rent              | 🏠   | Brown         | ₹20,000        |
| Salary / Income   | 💰   | Gold          | —              |
| Other             | 📦   | Gray          | ₹5,000         |

---

_Last updated: 2026-03-30_
_Version: 1.1.0 — Added Stitch design references, mockup acceptance criteria, and design system scope exclusions_
