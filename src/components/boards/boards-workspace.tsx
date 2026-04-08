"use client";

import { useEffect, useMemo, useState } from "react";
import { BoardFilters, type BoardAnalytics } from "@/components/boards/board-filters";
import { BoardList, type BoardListItem } from "@/components/boards/board-list";
import { CreateBoardModal } from "@/components/boards/create-board-modal";
import { ExpenseForm, type ExpenseFormCategory, type ExpenseFormValues } from "@/components/boards/expense-form";
import { KanbanBoard, type KanbanExpense } from "@/components/boards/kanban-board";
import {
  DEFAULT_FILTERS,
  getDefaultMonthYear,
  mapBoardExpense,
  normalizeDate,
  type AccountRecord,
  type BoardExpense,
  type BoardRecord,
  type ExpenseRecord
} from "@/components/boards/boards-workspace.types";
import { trpcClient } from "@/lib/trpc-client";

type BoardsWorkspaceProps = {
  initialBoardId?: string;
};

export function BoardsWorkspace({ initialBoardId }: BoardsWorkspaceProps) {
  const defaults = getDefaultMonthYear();
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [boards, setBoards] = useState<BoardRecord[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(initialBoardId ?? null);
  const [expenses, setExpenses] = useState<BoardExpense[]>([]);
  const [categories, setCategories] = useState<ExpenseFormCategory[]>([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [boardMonth, setBoardMonth] = useState(defaults.month);
  const [boardYear, setBoardYear] = useState(defaults.year);
  const [boardAccountId, setBoardAccountId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeBoard = useMemo(() => boards.find((board) => board.id === activeBoardId) ?? null, [boards, activeBoardId]);

  const boardCards = useMemo<BoardListItem[]>(
    () =>
      boards.map((board) => ({
        id: board.id,
        name: board.name,
        month: board.month,
        year: board.year,
        accountName: board.account.name,
        expenseCount: board._count.expenses,
        totalSpend: board.account.balance
      })),
    [boards]
  );

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        setLoading(true);
        setError(null);

        const [boardRows, accountRows, categoryRows] = await Promise.all([
          trpcClient.board.list.query(),
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

        const nextBoards = boardRows as BoardRecord[];
        setAccounts(nextAccounts);
        setBoards(nextBoards);
        setCategories((categoryRows as Array<{ id: string; name: string }>).map((category) => ({ id: category.id, name: category.name })));
        setBoardAccountId(nextAccounts[0]?.id ?? "");

        if (initialBoardId && nextBoards.some((board) => board.id === initialBoardId)) {
          setActiveBoardId(initialBoardId);
        } else {
          setActiveBoardId((previous) => previous ?? nextBoards[0]?.id ?? null);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load boards.");
      } finally {
        setLoading(false);
      }
    };

    void loadWorkspace();
  }, [initialBoardId]);

  useEffect(() => {
    if (!activeBoardId) {
      setExpenses([]);
      return;
    }

    const loadBoardExpenses = async () => {
      try {
        const rows = (await trpcClient.expense.list.query({ boardId: activeBoardId })) as ExpenseRecord[];
        setExpenses(rows.map(mapBoardExpense));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load expenses.");
      }
    };

    void loadBoardExpenses();
  }, [activeBoardId]);

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
        if (!expenseDate || expenseDate < start) {
          return false;
        }
      }
      if (filters.dateTo) {
        const end = new Date(`${filters.dateTo}T23:59:59.999Z`);
        if (!expenseDate || expenseDate > end) {
          return false;
        }
      }

      const minAmount = filters.minAmount ? Math.round(Number(filters.minAmount) * 100) : null;
      const maxAmount = filters.maxAmount ? Math.round(Number(filters.maxAmount) * 100) : null;
      if (minAmount !== null && Number.isFinite(minAmount) && expense.amount < minAmount) {
        return false;
      }
      if (maxAmount !== null && Number.isFinite(maxAmount) && expense.amount > maxAmount) {
        return false;
      }

      return true;
    });
  }, [expenses, filters]);

  const analytics = useMemo<BoardAnalytics>(() => {
    const totalSpend = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalTax = filteredExpenses.reduce((sum, expense) => sum + expense.taxAmount, 0);

    const byCategoryMap = new Map<string, number>();
    filteredExpenses.forEach((expense) => {
      byCategoryMap.set(expense.category, (byCategoryMap.get(expense.category) ?? 0) + expense.amount);
    });

    return {
      totalSpend,
      totalTax,
      byCategory: [...byCategoryMap.entries()]
        .map(([label, amount]) => ({ label, amount }))
        .sort((left, right) => right.amount - left.amount),
      byStatus: (["PLANNED", "SPENT", "RECURRING"] as const).map((status) => {
        const expensesInStatus = filteredExpenses.filter((expense) => expense.status === status);
        return {
          label: status,
          count: expensesInStatus.length,
          amount: expensesInStatus.reduce((sum, expense) => sum + expense.amount, 0)
        };
      })
    };
  }, [filteredExpenses]);

  const handleCreateBoard = async () => {
    if (!boardAccountId) {
      setError("Select an account before creating a board.");
      return;
    }

    try {
      setError(null);
      const created = await trpcClient.board.create.mutate({
        accountId: boardAccountId,
        name: boardName.trim() || undefined,
        month: boardMonth,
        year: boardYear
      });
      const refreshedBoards = (await trpcClient.board.list.query()) as BoardRecord[];
      setBoards(refreshedBoards);
      setActiveBoardId(created.id);
      setBoardName("");
      setShowCreateBoard(false);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create board.");
    }
  };

  const handleCreateExpense = async (values: ExpenseFormValues) => {
    if (!activeBoardId) {
      setError("Select a board before adding an expense.");
      return;
    }

    await trpcClient.expense.create.mutate({
      boardId: activeBoardId,
      categoryId: values.categoryId,
      title: values.title,
      amount: Math.round(values.amount * 100),
      status: values.status,
      date: new Date(values.date),
      notes: values.notes,
      taxType: values.taxType,
      taxRate: values.taxRate,
      customTaxLabel: values.customTaxLabel
    });

    const rows = (await trpcClient.expense.list.query({ boardId: activeBoardId })) as ExpenseRecord[];
    setExpenses(rows.map(mapBoardExpense));
  };

  const handleKanbanChange = async (nextExpenses: KanbanExpense[]) => {
    const previousById = new Map(expenses.map((expense) => [expense.id, expense.status]));
    const nextById = new Map(nextExpenses.map((expense) => [expense.id, expense]));
    const optimistic = expenses.map((expense) => {
      const next = nextById.get(expense.id);
      return next ? { ...expense, status: next.status } : expense;
    });
    const moved = optimistic.filter((expense) => previousById.get(expense.id) !== expense.status);

    setExpenses(optimistic);

    if (moved.length === 0) {
      return;
    }

    await Promise.all(moved.map((expense) => trpcClient.expense.move.mutate({ id: expense.id, status: expense.status })));
  };

  return (
    <main className="min-h-screen bg-surface-lowest px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-surface-low/60 p-4 backdrop-blur-glass">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Boards</h1>
            <p className="text-sm text-muted-foreground">Operational workspace for monthly spending boards.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreateBoard(true)}
              className="rounded-sm border border-white/10 bg-surface-high px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-highest"
            >
              Create Board
            </button>
            <button
              type="button"
              onClick={() => setShowExpenseForm(true)}
              disabled={!activeBoardId || categories.length === 0}
              className="rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add Expense
            </button>
          </div>
        </header>

        {error ? <p className="rounded-sm border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}
        {loading ? <p className="text-sm text-muted-foreground">Loading boards...</p> : null}

        <BoardList boards={boardCards} activeBoardId={activeBoardId} onSelectBoard={setActiveBoardId} />
        <BoardFilters categories={categories} value={filters} onChange={setFilters} onClear={() => setFilters(DEFAULT_FILTERS)} analytics={analytics} />
        {activeBoard ? <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-muted-foreground">{activeBoard.name}</h2> : null}
        <KanbanBoard expenses={filteredExpenses} onChange={handleKanbanChange} />
      </div>

      <CreateBoardModal
        open={showCreateBoard}
        accounts={accounts}
        boardName={boardName}
        boardMonth={boardMonth}
        boardYear={boardYear}
        boardAccountId={boardAccountId}
        onClose={() => setShowCreateBoard(false)}
        onChangeBoardName={setBoardName}
        onChangeBoardMonth={setBoardMonth}
        onChangeBoardYear={setBoardYear}
        onChangeBoardAccountId={setBoardAccountId}
        onSave={() => void handleCreateBoard()}
      />

      <ExpenseForm
        open={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        onSubmit={(values) => void handleCreateExpense(values)}
        categories={categories}
      />
    </main>
  );
}
