"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

export type ExpenseStatus = "PLANNED" | "SPENT" | "RECURRING";

export type KanbanExpense = {
  id: string;
  title: string;
  amount: number;
  status: ExpenseStatus;
  category: string;
  date: string;
  taxLabel?: string | null;
};

type KanbanBoardProps = {
  expenses: KanbanExpense[];
  onChange: (nextExpenses: KanbanExpense[]) => void;
};

type ColumnConfig = {
  id: ExpenseStatus;
  label: string;
  dotClassName: string;
};

const COLUMNS: ColumnConfig[] = [
  { id: "PLANNED", label: "Planned", dotClassName: "bg-muted-foreground" },
  { id: "SPENT", label: "Spent", dotClassName: "bg-secondary" },
  { id: "RECURRING", label: "Recurring", dotClassName: "bg-primary" }
];

function formatCurrency(amountInPaise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(amountInPaise / 100);
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function getStatusFromDropTarget(targetId: string, expenses: KanbanExpense[]): ExpenseStatus | null {
  if (targetId.startsWith("column-")) {
    const columnId = targetId.replace("column-", "") as ExpenseStatus;
    return COLUMNS.some((column) => column.id === columnId) ? columnId : null;
  }

  const targetExpense = expenses.find((expense) => expense.id === targetId);
  return targetExpense?.status ?? null;
}

type ExpenseCardProps = {
  expense: KanbanExpense;
  dragging?: boolean;
};

function ExpenseCard({ expense, dragging = false }: ExpenseCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={[
        "rounded-lg border border-white/10 bg-surface-high/60 p-3 backdrop-blur-glass",
        dragging ? "shadow-glow" : "hover:bg-surface-high transition-colors"
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-foreground">{expense.title}</h4>
        <p className="text-xs font-semibold text-primary">{formatCurrency(expense.amount)}</p>
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="rounded-sm bg-surface-low px-2 py-1 uppercase tracking-[0.08em]">{expense.category}</span>
        <span>{formatDate(expense.date)}</span>
      </div>
      {expense.taxLabel ? <p className="mt-2 text-[11px] font-medium text-danger">{expense.taxLabel}</p> : null}
    </motion.article>
  );
}

function SortableExpenseCard({ expense }: { expense: KanbanExpense }) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: expense.id
  });

  return (
    <div
      ref={setNodeRef}
      className={isDragging ? "opacity-80" : ""}
      {...attributes}
      {...listeners}
    >
      <ExpenseCard expense={expense} dragging={isDragging} />
    </div>
  );
}

function KanbanColumn({ column, expenses }: { column: ColumnConfig; expenses: KanbanExpense[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`
  });

  return (
    <section
      ref={setNodeRef}
      role="region"
      aria-label={column.label}
      className={[
        "rounded-lg border p-4 backdrop-blur-glass transition-colors",
        isOver ? "border-primary/50 bg-surface-high/70" : "border-white/10 bg-surface-low/50"
      ].join(" ")}
    >
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={["h-2 w-2 rounded-full", column.dotClassName].join(" ")} />
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{column.label}</h3>
        </div>
        <span className="rounded-sm bg-surface-high px-2 py-1 text-[10px] font-semibold text-muted-foreground">
          {expenses.length}
        </span>
      </header>
      <SortableContext items={expenses.map((expense) => expense.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {expenses.map((expense) => (
            <SortableExpenseCard key={expense.id} expense={expense} />
          ))}
          {expenses.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-muted-foreground">
              Drop expense card here
            </div>
          ) : null}
        </div>
      </SortableContext>
    </section>
  );
}

export function KanbanBoard({ expenses, onChange }: KanbanBoardProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [activeExpenseId, setActiveExpenseId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return {
      PLANNED: expenses.filter((expense) => expense.status === "PLANNED"),
      SPENT: expenses.filter((expense) => expense.status === "SPENT"),
      RECURRING: expenses.filter((expense) => expense.status === "RECURRING")
    };
  }, [expenses]);

  const activeExpense = activeExpenseId ? expenses.find((expense) => expense.id === activeExpenseId) ?? null : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveExpenseId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    setActiveExpenseId(null);

    if (!overId) {
      return;
    }

    const nextStatus = getStatusFromDropTarget(overId, expenses);
    if (!nextStatus) {
      return;
    }

    const currentExpense = expenses.find((expense) => expense.id === activeId);
    if (!currentExpense || currentExpense.status === nextStatus) {
      return;
    }

    onChange(
      expenses.map((expense) =>
        expense.id === currentExpense.id
          ? {
              ...expense,
              status: nextStatus
            }
          : expense
      )
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((column) => (
          <KanbanColumn key={column.id} column={column} expenses={grouped[column.id]} />
        ))}
      </div>
      <DragOverlay>{activeExpense ? <ExpenseCard expense={activeExpense} dragging /> : null}</DragOverlay>
    </DndContext>
  );
}
