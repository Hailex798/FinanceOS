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
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { CheckCircle2, MoreHorizontal, Paperclip, Plus, Receipt, RefreshCw } from "lucide-react";
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
  dueDate?: string | null;
};

type KanbanBoardProps = {
  expenses: KanbanExpense[];
  onChange: (nextExpenses: KanbanExpense[]) => void;
  onAddExpense?: (status: ExpenseStatus) => void;
  onClickExpense?: (expenseId: string) => void;
};

type ColumnConfig = {
  id: ExpenseStatus;
  label: string;
  dotColor: string;
  borderColor?: string;
};

const COLUMNS: ColumnConfig[] = [
  { id: "PLANNED", label: "Planned", dotColor: "bg-[#908FA0]" },
  { id: "SPENT", label: "Spent", dotColor: "bg-[#4EDEA3]", borderColor: "border-l-[#4EDEA3]" },
  { id: "RECURRING", label: "Recurring", dotColor: "bg-[#C0C1FF]" }
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
  })
    .format(date)
    .toUpperCase();
}

function formatDueDate(isoDate: string | null | undefined): string | null {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;

  return (
    "NEXT: " +
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short"
    })
      .format(date)
      .toUpperCase()
  );
}

function getStatusFromDropTarget(targetId: string, expenses: KanbanExpense[]): ExpenseStatus | null {
  if (targetId.startsWith("column-")) {
    const columnId = targetId.replace("column-", "") as ExpenseStatus;
    return COLUMNS.some((column) => column.id === columnId) ? columnId : null;
  }

  const targetExpense = expenses.find((expense) => expense.id === targetId);
  return targetExpense?.status ?? null;
}

/* ─── Expense Card ──────────────────────────────────────────────── */

type ExpenseCardProps = {
  expense: KanbanExpense;
  dragging?: boolean;
  onClick?: () => void;
};

function ExpenseCard({ expense, dragging = false, onClick }: ExpenseCardProps) {
  const isSpent = expense.status === "SPENT";
  const isRecurring = expense.status === "RECURRING";
  const dueDateLabel = isRecurring ? formatDueDate(expense.dueDate) : null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: dragging ? 0.9 : 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onClick={onClick}
      className={[
        "glass-card rounded-lg p-4 flex flex-col gap-3 transition-all",
        "hover:translate-y-[-2px] cursor-grab active:cursor-grabbing",
        isSpent ? "border-l-4 border-l-[#4EDEA3]" : "",
        dragging ? "shadow-glow ring-1 ring-[#C0C1FF]/30" : ""
      ].join(" ")}
    >
      {/* Title + Amount */}
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-bold text-[#E3E2E8] leading-tight text-sm">{expense.title}</h4>
        <span className="tabular-nums font-bold text-[#C0C1FF] text-sm shrink-0">
          {formatCurrency(expense.amount)}
        </span>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4EDEA3]/10 text-[#4EDEA3] border border-[#4EDEA3]/20 uppercase">
          {expense.category}
        </span>
        {expense.taxLabel ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFB3AD]/10 text-[#FFB3AD] border border-[#FFB3AD]/20 flex items-center gap-1">
            <Receipt className="h-2.5 w-2.5" />
            {expense.taxLabel}
          </span>
        ) : null}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        {isRecurring && dueDateLabel ? (
          <>
            <div className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 text-[#C0C1FF]" />
              <span className="text-[10px] font-medium text-[#C7C4D7] uppercase">Monthly</span>
            </div>
            <span className="text-[10px] font-medium text-[#C7C4D7] tabular-nums">{dueDateLabel}</span>
          </>
        ) : (
          <>
            <span className="text-[10px] font-medium text-[#C7C4D7] tabular-nums">
              {formatDate(expense.date)}
            </span>
            {isSpent ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-[#4EDEA3] fill-[#4EDEA3]" />
            ) : (
              <Paperclip className="h-3.5 w-3.5 text-[#C7C4D7]" />
            )}
          </>
        )}
      </div>
    </motion.article>
  );
}

/* ─── Sortable Wrapper ─────────────────────────────────────────── */

function SortableExpenseCard({
  expense,
  onClick
}: {
  expense: KanbanExpense;
  onClick?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: expense.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ExpenseCard expense={expense} dragging={isDragging} onClick={onClick} />
    </div>
  );
}

/* ─── Kanban Column ────────────────────────────────────────────── */

function KanbanColumn({
  column,
  expenses,
  onAddExpense,
  onClickExpense
}: {
  column: ColumnConfig;
  expenses: KanbanExpense[];
  onAddExpense?: () => void;
  onClickExpense?: (expenseId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`
  });

  return (
    <section
      ref={setNodeRef}
      role="region"
      aria-label={column.label}
      className={[
        "flex flex-col gap-4 p-4 rounded-xl min-h-[400px] transition-colors",
        isOver
          ? "bg-[#1A1B20]/80 ring-1 ring-[#C0C1FF]/30"
          : "bg-[#1A1B20]/50"
      ].join(" ")}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-2">
          <span className={["w-2 h-2 rounded-full", column.dotColor].join(" ")} />
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#C7C4D7]">
            {column.label}
          </h3>
          <span className="bg-[#292A2E] px-2 py-0.5 rounded text-[10px] tabular-nums font-bold text-[#C7C4D7]">
            {expenses.length}
          </span>
        </div>
        <button type="button" className="text-[#C7C4D7] hover:text-white transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Cards */}
      <SortableContext items={expenses.map((e) => e.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {expenses.map((expense) => (
            <SortableExpenseCard
              key={expense.id}
              expense={expense}
              onClick={() => onClickExpense?.(expense.id)}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add Expense Button */}
      <button
        type="button"
        onClick={onAddExpense}
        className="w-full py-4 border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center text-[#C7C4D7] hover:border-[#C0C1FF]/40 hover:text-[#C0C1FF] transition-all text-sm font-semibold gap-2 mt-auto"
      >
        <Plus className="h-3.5 w-3.5" />
        Add expense
      </button>
    </section>
  );
}

/* ─── Kanban Board ─────────────────────────────────────────────── */

export function KanbanBoard({ expenses, onChange, onAddExpense, onClickExpense }: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const [activeExpenseId, setActiveExpenseId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return {
      PLANNED: expenses.filter((e) => e.status === "PLANNED"),
      SPENT: expenses.filter((e) => e.status === "SPENT"),
      RECURRING: expenses.filter((e) => e.status === "RECURRING")
    };
  }, [expenses]);

  const activeExpense = activeExpenseId
    ? expenses.find((e) => e.id === activeExpenseId) ?? null
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveExpenseId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    setActiveExpenseId(null);

    if (!overId) return;

    const nextStatus = getStatusFromDropTarget(overId, expenses);
    if (!nextStatus) return;

    const currentExpense = expenses.find((e) => e.id === activeId);
    if (!currentExpense || currentExpense.status === nextStatus) return;

    onChange(
      expenses.map((e) =>
        e.id === currentExpense.id ? { ...e, status: nextStatus } : e
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            expenses={grouped[column.id]}
            onAddExpense={() => onAddExpense?.(column.id)}
            onClickExpense={onClickExpense}
          />
        ))}
      </div>
      <DragOverlay>
        {activeExpense ? <ExpenseCard expense={activeExpense} dragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
