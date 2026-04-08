"use client";

import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BoardFilters, type BoardAnalytics } from "@/components/boards/board-filters";
import { AccountTabs, type AccountTab } from "@/components/boards/board-list";
import { CreateAccountModal } from "@/components/boards/create-board-modal";
import { ExpenseForm, type ExpenseFormCategory, type ExpenseFormValues } from "@/components/boards/expense-form";
import { KanbanBoard, type ExpenseStatus, type KanbanExpense } from "@/components/boards/kanban-board";
import {
  DEFAULT_FILTERS,
  mapBoardExpense,
  normalizeDate,
  type BoardExpense,
  type ExpenseRecord
} from "@/components/boards/boards-workspace.types";
import { trpcClient } from "@/lib/trpc-client";

/* ─── Types ────────────────────────────────────────────────────── */

type AccountRecord = {
  id: string;
  name: string;
  bankName: string;
  accountType: string;
};

type BoardsWorkspaceProps = {
  initialBoardId?: string;
};

/* ─── Helpers ──────────────────────────────────────────────────── */

function getDefaultMonthYear() {
  const now = new Date();
  return { month: now.getUTCMonth() + 1, year: now.getUTCFullYear() };
}

function formatMonthYear(month: number, year: number): string {
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function stepMonth(month: number, year: number, delta: -1 | 1): { month: number; year: number } {
  let m = month + delta;
  let y = year;
  if (m < 1) {
    m = 12;
    y -= 1;
  } else if (m > 12) {
    m = 1;
    y += 1;
  }
  return { month: m, year: y };
}

/* ─── Component ────────────────────────────────────────────────── */

export function BoardsWorkspace({ initialBoardId }: BoardsWorkspaceProps) {
  const defaults = getDefaultMonthYear();

  // Core state
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(defaults.month);
  const [selectedYear, setSelectedYear] = useState(defaults.year);

  // Board + expenses for current account+month
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<BoardExpense[]>([]);
  const [categories, setCategories] = useState<ExpenseFormCategory[]>([]);

  // Filters
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // UI state
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseFormInitialStatus, setExpenseFormInitialStatus] = useState<ExpenseStatus>("PLANNED");
  const [loading, setLoading] = useState(true);
  const [boardLoading, setBoardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived
  const activeAccount = useMemo(
    () => accounts.find((a) => a.id === activeAccountId) ?? null,
    [accounts, activeAccountId]
  );

  const accountTabs = useMemo<AccountTab[]>(
    () => accounts.map((a) => ({ id: a.id, name: a.name, bankName: a.bankName })),
    [accounts]
  );

  /* ─── Load accounts + categories on mount ─────────────────── */

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [accountRows, categoryRows] = await Promise.all([
          trpcClient.account.list.query(),
          trpcClient.expense.listCategories.query()
        ]);

        let nextAccounts = accountRows as AccountRecord[];
        if (nextAccounts.length === 0) {
          const created = await trpcClient.account.create.mutate({
            name: "Primary Account",
            bankName: "Default Bank",
            accountType: "SAVINGS",
            initialBalance: 0,
            color: "#6366f1",
            icon: "bank"
          });
          nextAccounts = [created as AccountRecord];
        }

        setAccounts(nextAccounts);
        setCategories(
          (categoryRows as Array<{ id: string; name: string }>).map((c) => ({
            id: c.id,
            name: c.name
          }))
        );

        // Select first account by default
        setActiveAccountId(nextAccounts[0]?.id ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load accounts.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  /* ─── Load/auto-create board when account or month changes ── */

  const loadBoardForAccountMonth = useCallback(
    async (accountId: string, month: number, year: number) => {
      try {
        setBoardLoading(true);
        setError(null);
        setExpenses([]);
        setActiveBoardId(null);

        // Get all boards, find the one matching account+month
        const allBoards = await trpcClient.board.list.query();
        type BoardRow = {
          id: string;
          accountId: string;
          month: number;
          year: number;
          name: string;
        };
        const boards = allBoards as BoardRow[];
        let board = boards.find(
          (b) => b.accountId === accountId && b.month === month && b.year === year
        );

        // Auto-create if board doesn't exist for this account+month
        if (!board) {
          const created = await trpcClient.board.create.mutate({
            accountId,
            month,
            year
          });
          board = created as BoardRow;
        }

        setActiveBoardId(board.id);

        // Load expenses for this board
        const rows = (await trpcClient.expense.list.query({
          boardId: board.id
        })) as ExpenseRecord[];
        setExpenses(rows.map(mapBoardExpense));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load board.");
      } finally {
        setBoardLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!activeAccountId) {
      setActiveBoardId(null);
      setExpenses([]);
      return;
    }

    void loadBoardForAccountMonth(activeAccountId, selectedMonth, selectedYear);
  }, [activeAccountId, selectedMonth, selectedYear, loadBoardForAccountMonth]);

  /* ─── Filtering ──────────────────────────────────────────────── */

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (filters.categoryIds.length > 0 && !filters.categoryIds.includes(expense.categoryId)) {
        return false;
      }
      if (filters.taxType !== "ALL" && expense.taxType !== filters.taxType) {
        return false;
      }

      const expenseDate = normalizeDate(expense.date);
      if (filters.dateFrom) {
        const start = new Date(`${filters.dateFrom}T00:00:00.000Z`);
        if (!expenseDate || expenseDate < start) return false;
      }
      if (filters.dateTo) {
        const end = new Date(`${filters.dateTo}T23:59:59.999Z`);
        if (!expenseDate || expenseDate > end) return false;
      }

      const minAmount = filters.minAmount ? Math.round(Number(filters.minAmount) * 100) : null;
      const maxAmount = filters.maxAmount ? Math.round(Number(filters.maxAmount) * 100) : null;
      if (minAmount !== null && Number.isFinite(minAmount) && expense.amount < minAmount) return false;
      if (maxAmount !== null && Number.isFinite(maxAmount) && expense.amount > maxAmount) return false;

      return true;
    });
  }, [expenses, filters]);

  const analytics = useMemo<BoardAnalytics>(() => {
    const totalSpend = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalTax = filteredExpenses.reduce((sum, e) => sum + e.taxAmount, 0);

    const byCategoryMap = new Map<string, number>();
    filteredExpenses.forEach((e) => {
      byCategoryMap.set(e.category, (byCategoryMap.get(e.category) ?? 0) + e.amount);
    });

    return {
      totalSpend,
      totalTax,
      byCategory: [...byCategoryMap.entries()]
        .map(([label, amount]) => ({ label, amount }))
        .sort((a, b) => b.amount - a.amount),
      byStatus: (["PLANNED", "SPENT", "RECURRING"] as const).map((status) => {
        const inStatus = filteredExpenses.filter((e) => e.status === status);
        return {
          label: status,
          count: inStatus.length,
          amount: inStatus.reduce((sum, e) => sum + e.amount, 0)
        };
      })
    };
  }, [filteredExpenses]);

  /* ─── Handlers ───────────────────────────────────────────────── */

  const handlePrevMonth = () => {
    const { month, year } = stepMonth(selectedMonth, selectedYear, -1);
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleNextMonth = () => {
    const { month, year } = stepMonth(selectedMonth, selectedYear, 1);
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleCreateAccount = async (data: { name: string; bankName: string; accountType: string }) => {
    try {
      setError(null);
      const created = await trpcClient.account.create.mutate({
        name: data.name,
        bankName: data.bankName,
        accountType: data.accountType as "SAVINGS" | "CURRENT" | "CREDIT_CARD" | "WALLET",
        initialBalance: 0,
        color: "#6366f1",
        icon: "bank"
      });
      const refreshed = (await trpcClient.account.list.query()) as AccountRecord[];
      setAccounts(refreshed);
      setActiveAccountId(created.id);
      setShowCreateAccount(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create account.");
    }
  };

  const handleCreateExpense = async (values: ExpenseFormValues) => {
    if (!activeAccountId) {
      setError("No active account. Select an account first.");
      return;
    }

    try {
      // Determine the correct board based on the expense date
      const expenseDate = new Date(values.date);
      const expMonth = expenseDate.getUTCMonth() + 1;
      const expYear = expenseDate.getUTCFullYear();
      const isCurrentMonth = expMonth === selectedMonth && expYear === selectedYear;

      // Find or create the board for the expense's month
      let targetBoardId = activeBoardId;

      if (!isCurrentMonth || !activeBoardId) {
        const allBoards = await trpcClient.board.list.query();
        type BoardRow = { id: string; accountId: string; month: number; year: number };
        const boards = allBoards as BoardRow[];
        let board = boards.find(
          (b) => b.accountId === activeAccountId && b.month === expMonth && b.year === expYear
        );

        if (!board) {
          const created = await trpcClient.board.create.mutate({
            accountId: activeAccountId,
            month: expMonth,
            year: expYear
          });
          board = created as BoardRow;
        }

        targetBoardId = board.id;
      }

      if (!targetBoardId) {
        setError("Unable to resolve board for this date.");
        return;
      }

      await trpcClient.expense.create.mutate({
        boardId: targetBoardId,
        categoryId: values.categoryId,
        title: values.title,
        amount: Math.round(values.amount * 100),
        status: values.status,
        date: expenseDate,
        notes: values.notes,
        taxType: values.taxType,
        taxRate: values.taxRate,
        customTaxLabel: values.customTaxLabel
      });

      // Navigate to the expense's month so the user sees it
      if (!isCurrentMonth) {
        setSelectedMonth(expMonth);
        setSelectedYear(expYear);
        // The useEffect for month change will reload the board and expenses
      } else {
        // Refresh current view
        const rows = (await trpcClient.expense.list.query({
          boardId: targetBoardId
        })) as ExpenseRecord[];
        setExpenses(rows.map(mapBoardExpense));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create expense.");
    }
  };

  const handleKanbanChange = async (nextExpenses: KanbanExpense[]) => {
    const previousById = new Map(expenses.map((e) => [e.id, e.status]));
    const nextById = new Map(nextExpenses.map((e) => [e.id, e]));
    const optimistic = expenses.map((e) => {
      const next = nextById.get(e.id);
      return next ? { ...e, status: next.status } : e;
    });
    const moved = optimistic.filter((e) => previousById.get(e.id) !== e.status);

    setExpenses(optimistic);

    if (moved.length === 0) return;

    await Promise.all(
      moved.map((e) => trpcClient.expense.move.mutate({ id: e.id, status: e.status }))
    );
  };

  const handleAddExpenseFromColumn = (status: ExpenseStatus) => {
    setExpenseFormInitialStatus(status);
    setShowExpenseForm(true);
  };

  /* ─── Render ─────────────────────────────────────────────────── */

  return (
    <main className="min-h-screen bg-[#0D0E12]">
      <div className="px-8 py-8 flex flex-col gap-8">
        {/* ─── Page Header ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#E3E2E8]">
              Financial Overview
            </h1>
            <p className="text-[#C7C4D7] text-sm font-medium uppercase tracking-widest mt-1">
              Operational Workspace / Boards
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* ── Month Picker ──────────────────────────────── */}
            <div className="bg-[#1F1F24] flex items-center rounded-lg border border-white/5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="px-2 py-2 text-[#C7C4D7] hover:text-white transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center px-2 py-2 gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-[#C0C1FF]" />
                <span className="text-sm font-semibold text-[#E3E2E8] min-w-[130px] text-center">
                  {formatMonthYear(selectedMonth, selectedYear)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="px-2 py-2 text-[#C7C4D7] hover:text-white transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* ── Add Expense ───────────────────────────────── */}
            <button
              type="button"
              onClick={() => {
                setExpenseFormInitialStatus("PLANNED");
                setShowExpenseForm(true);
              }}
              disabled={!activeBoardId || categories.length === 0}
              className="bg-[#C0C1FF] text-[#1000A9] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#C0C1FF]/20 hover:scale-[1.02] active:scale-95 transition-transform disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Expense
            </button>
          </div>
        </motion.div>

        {/* ─── Error Banner ──────────────────────────────────── */}
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-[#FFB3AD]/30 bg-[#FFB3AD]/10 px-4 py-2.5 text-sm text-[#FFB3AD]"
          >
            {error}
          </motion.p>
        ) : null}

        {/* ─── Loading (initial) ─────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-1 border-b border-white/5 pb-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-24 animate-pulse rounded bg-white/5" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl bg-[#1A1B20]/50" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ─── Account Tabs ─────────────────────────────── */}
            <AccountTabs
              accounts={accountTabs}
              activeAccountId={activeAccountId}
              onSelectAccount={setActiveAccountId}
              onAddAccount={() => setShowCreateAccount(true)}
            />

            {/* ─── Filters ──────────────────────────────────── */}
            <BoardFilters
              categories={categories}
              value={filters}
              onChange={setFilters}
              onClear={() => setFilters(DEFAULT_FILTERS)}
              analytics={analytics}
            />

            {/* ─── Board Loading ─────────────────────────────── */}
            {boardLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 animate-pulse rounded-xl bg-[#1A1B20]/50" />
                ))}
              </div>
            ) : (
              /* ─── Kanban Board ────────────────────────────── */
              <KanbanBoard
                expenses={filteredExpenses}
                onChange={handleKanbanChange}
                onAddExpense={handleAddExpenseFromColumn}
              />
            )}
          </>
        )}
      </div>

      {/* ─── Modals ───────────────────────────────────────────── */}
      <CreateAccountModal
        open={showCreateAccount}
        onClose={() => setShowCreateAccount(false)}
        onSave={(data) => void handleCreateAccount(data)}
      />

      <ExpenseForm
        open={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        onSubmit={(values) => void handleCreateExpense(values)}
        categories={categories}
        initialValues={{ status: expenseFormInitialStatus }}
      />
    </main>
  );
}
