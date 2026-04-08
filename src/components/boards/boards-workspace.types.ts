import type { AccountType, ExpenseStatus, TaxType } from "@prisma/client";
import type { BoardFilterValue } from "@/components/boards/board-filters";
import type { KanbanExpense } from "@/components/boards/kanban-board";

export type AccountRecord = {
  id: string;
  name: string;
  bankName: string;
  accountType: AccountType;
};

export type BoardRecord = {
  id: string;
  accountId: string;
  name: string;
  month: number;
  year: number;
  account: {
    id: string;
    name: string;
    bankName: string;
    accountType: AccountType;
    balance: number;
  };
  _count: {
    expenses: number;
  };
};

export type ExpenseRecord = {
  id: string;
  categoryId: string;
  title: string;
  amount: number;
  status: ExpenseStatus;
  date: string | Date;
  taxType: TaxType;
  taxRate: number;
  taxAmount: number;
  customTaxLabel: string | null;
  category: {
    id: string;
    name: string;
  };
};

export type BoardExpense = KanbanExpense & {
  categoryId: string;
  taxType: TaxType;
  taxAmount: number;
};

export const DEFAULT_FILTERS: BoardFilterValue = {
  categoryIds: [],
  taxType: "ALL",
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: ""
};

export function normalizeDate(input: string | Date): Date | null {
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function mapBoardExpense(expense: ExpenseRecord): BoardExpense {
  const normalizedDate = normalizeDate(expense.date);

  return {
    id: expense.id,
    categoryId: expense.categoryId,
    title: expense.title,
    amount: expense.amount,
    status: expense.status,
    category: expense.category.name,
    date: normalizedDate ? normalizedDate.toISOString() : new Date().toISOString(),
    taxType: expense.taxType,
    taxAmount: expense.taxAmount,
    taxLabel:
      expense.taxType === "NONE"
        ? null
        : `${expense.taxRate}% ${expense.customTaxLabel ?? expense.taxType}`
  };
}

export function getDefaultMonthYear() {
  const now = new Date();
  return {
    month: now.getUTCMonth() + 1,
    year: now.getUTCFullYear()
  };
}
