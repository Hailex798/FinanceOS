import { ExpenseStatus, TaxType, type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

type DatabaseClient = Pick<PrismaClient, "board" | "category" | "expense" | "$transaction">;

export type NormalizedExpenseInput = {
  title: string;
  amount: number;
  taxType?: TaxType;
  taxRate?: number;
  customTaxLabel?: string | null;
};

export type NormalizedExpenseOutput = {
  title: string;
  amount: number;
  taxType: TaxType;
  taxRate: number;
  taxAmount: number;
  customTaxLabel: string | null;
};

export type CreateExpensePayload = {
  boardId: string;
  categoryId: string;
  title: string;
  amount: number;
  status: ExpenseStatus;
  date?: Date;
  notes?: string;
  taxType: TaxType;
  taxRate: number;
  customTaxLabel?: string | null;
  dueDate?: Date;
};

export type UpdateExpensePayload = {
  id: string;
  categoryId?: string;
  title?: string;
  amount?: number;
  status?: ExpenseStatus;
  date?: Date;
  notes?: string | null;
  taxType?: TaxType;
  taxRate?: number;
  customTaxLabel?: string | null;
  dueDate?: Date | null;
  sortOrder?: number;
};

export type MoveExpensePayload = {
  id: string;
  status: ExpenseStatus;
  sortOrder?: number;
};

export type ReorderExpensePayload = {
  boardId: string;
  status: ExpenseStatus;
  orderedExpenseIds: string[];
};

export function calculateTaxAmount(amountInPaise: number, taxRate: number): number {
  return Math.round((amountInPaise * taxRate) / 100);
}

export function normalizeExpenseInput(input: NormalizedExpenseInput): NormalizedExpenseOutput {
  const title = input.title.trim();
  if (!title) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Expense title is required." });
  }

  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Amount must be a positive integer." });
  }

  const taxType = input.taxType ?? TaxType.NONE;
  const taxRate = taxType === TaxType.NONE ? 0 : Math.max(0, input.taxRate ?? 0);

  const customTaxLabel =
    taxType === TaxType.CUSTOM
      ? (input.customTaxLabel ?? "").trim() || null
      : null;

  if (taxType === TaxType.CUSTOM && !customTaxLabel) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Custom tax label is required for custom tax type." });
  }

  return {
    title,
    amount: input.amount,
    taxType,
    taxRate,
    taxAmount: taxRate > 0 ? calculateTaxAmount(input.amount, taxRate) : 0,
    customTaxLabel
  };
}

export async function assertBoardOwnership(db: DatabaseClient, boardId: string, userId: string): Promise<void> {
  const board = await db.board.findFirst({
    where: {
      id: boardId,
      userId
    },
    select: {
      id: true
    }
  });

  if (!board) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Board not found." });
  }
}

async function assertCategoryOwnership(db: DatabaseClient, categoryId: string, userId: string): Promise<void> {
  const category = await db.category.findFirst({
    where: {
      id: categoryId,
      userId
    },
    select: {
      id: true
    }
  });

  if (!category) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Category not found." });
  }
}

async function getOwnedExpense(db: DatabaseClient, expenseId: string, userId: string) {
  const expense = await db.expense.findFirst({
    where: {
      id: expenseId,
      board: {
        userId
      }
    },
    select: {
      id: true,
      boardId: true
    }
  });

  if (!expense) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Expense not found." });
  }

  return expense;
}

async function enqueueAnalyticsRecalculation(userId: string, boardId: string): Promise<void> {
  const { analyticsQueue } = await import("@/server/jobs/queue");
  await analyticsQueue.add("recalculate", {
    userId,
    boardId,
    triggeredAt: new Date().toISOString()
  });
}

export const expenseService = {
  async createExpense(db: DatabaseClient, userId: string, input: CreateExpensePayload) {
    await assertBoardOwnership(db, input.boardId, userId);
    await assertCategoryOwnership(db, input.categoryId, userId);

    const normalized = normalizeExpenseInput({
      title: input.title,
      amount: input.amount,
      taxType: input.taxType,
      taxRate: input.taxRate,
      customTaxLabel: input.customTaxLabel
    });

    const lastInStatus = await db.expense.findFirst({
      where: {
        boardId: input.boardId,
        status: input.status
      },
      orderBy: {
        sortOrder: "desc"
      },
      select: {
        sortOrder: true
      }
    });

    const created = await db.expense.create({
      data: {
        boardId: input.boardId,
        categoryId: input.categoryId,
        title: normalized.title,
        amount: normalized.amount,
        status: input.status,
        date: input.date,
        notes: input.notes,
        taxType: normalized.taxType,
        taxRate: normalized.taxRate,
        taxAmount: normalized.taxAmount,
        customTaxLabel: normalized.customTaxLabel,
        dueDate: input.dueDate,
        sortOrder: (lastInStatus?.sortOrder ?? -1) + 1
      }
    });

    await enqueueAnalyticsRecalculation(userId, input.boardId);
    return created;
  },

  async updateExpense(db: DatabaseClient, userId: string, input: UpdateExpensePayload) {
    const ownedExpense = await getOwnedExpense(db, input.id, userId);

    if (input.categoryId) {
      await assertCategoryOwnership(db, input.categoryId, userId);
    }

    const current = await db.expense.findUnique({
      where: { id: input.id },
      select: {
        title: true,
        amount: true,
        taxType: true,
        taxRate: true,
        customTaxLabel: true
      }
    });

    if (!current) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Expense not found." });
    }

    const mergedCustomTaxLabel =
      input.customTaxLabel === undefined ? current.customTaxLabel : input.customTaxLabel;

    const normalized = normalizeExpenseInput({
      title: input.title ?? current.title,
      amount: input.amount ?? current.amount,
      taxType: input.taxType ?? current.taxType,
      taxRate: input.taxRate ?? current.taxRate,
      customTaxLabel: mergedCustomTaxLabel
    });

    const updated = await db.expense.update({
      where: { id: input.id },
      data: {
        categoryId: input.categoryId,
        title: normalized.title,
        amount: normalized.amount,
        status: input.status,
        date: input.date,
        notes: input.notes === undefined ? undefined : input.notes,
        taxType: normalized.taxType,
        taxRate: normalized.taxRate,
        taxAmount: normalized.taxAmount,
        customTaxLabel: normalized.customTaxLabel,
        dueDate: input.dueDate === undefined ? undefined : input.dueDate,
        sortOrder: input.sortOrder
      }
    });

    await enqueueAnalyticsRecalculation(userId, ownedExpense.boardId);
    return updated;
  },

  async deleteExpense(db: DatabaseClient, userId: string, expenseId: string) {
    const ownedExpense = await getOwnedExpense(db, expenseId, userId);

    await db.expense.delete({
      where: { id: expenseId }
    });

    await enqueueAnalyticsRecalculation(userId, ownedExpense.boardId);

    return {
      id: expenseId,
      deleted: true
    };
  },

  async moveExpense(db: DatabaseClient, userId: string, input: MoveExpensePayload) {
    const ownedExpense = await getOwnedExpense(db, input.id, userId);

    const lastInStatus = await db.expense.findFirst({
      where: {
        boardId: ownedExpense.boardId,
        status: input.status,
        id: {
          not: input.id
        }
      },
      orderBy: {
        sortOrder: "desc"
      },
      select: {
        sortOrder: true
      }
    });

    const updated = await db.expense.update({
      where: { id: input.id },
      data: {
        status: input.status,
        sortOrder: input.sortOrder ?? (lastInStatus?.sortOrder ?? -1) + 1
      }
    });

    await enqueueAnalyticsRecalculation(userId, ownedExpense.boardId);
    return updated;
  },

  async reorderExpenses(db: DatabaseClient, userId: string, input: ReorderExpensePayload) {
    await assertBoardOwnership(db, input.boardId, userId);

    const targetExpenses = await db.expense.findMany({
      where: {
        boardId: input.boardId,
        status: input.status
      },
      select: { id: true }
    });

    const targetIds = new Set(targetExpenses.map((expense) => expense.id));
    const includesUnknownIds = input.orderedExpenseIds.some((id) => !targetIds.has(id));
    if (includesUnknownIds) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Reorder payload includes invalid expense ids." });
    }

    await db.$transaction(
      input.orderedExpenseIds.map((expenseId, index) =>
        db.expense.update({
          where: { id: expenseId },
          data: {
            sortOrder: index
          }
        })
      )
    );

    await enqueueAnalyticsRecalculation(userId, input.boardId);

    return {
      boardId: input.boardId,
      status: input.status,
      updatedCount: input.orderedExpenseIds.length
    };
  }
};
