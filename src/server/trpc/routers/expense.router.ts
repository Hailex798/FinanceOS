import { ExpenseStatus, TaxType } from "@prisma/client";
import { z } from "zod";
import { assertBoardOwnership, expenseService } from "@/server/services/expense.service";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

const expenseIdSchema = z.object({
  id: z.string().min(1)
});

const boardIdSchema = z.object({
  boardId: z.string().min(1)
});

const listExpensesSchema = z.object({
  boardId: z.string().min(1),
  status: z.nativeEnum(ExpenseStatus).optional()
});

const createExpenseSchema = z.object({
  boardId: z.string().min(1),
  categoryId: z.string().min(1),
  title: z.string().trim().min(1).max(100),
  amount: z.number().int().positive(),
  status: z.nativeEnum(ExpenseStatus).default(ExpenseStatus.PLANNED),
  date: z.date().optional(),
  notes: z.string().trim().max(500).optional(),
  taxType: z.nativeEnum(TaxType).default(TaxType.NONE),
  taxRate: z.number().min(0).max(100).default(0),
  customTaxLabel: z.string().trim().max(100).optional(),
  dueDate: z.date().optional()
});

const updateExpenseSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1).optional(),
  title: z.string().trim().min(1).max(100).optional(),
  amount: z.number().int().positive().optional(),
  status: z.nativeEnum(ExpenseStatus).optional(),
  date: z.date().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
  taxType: z.nativeEnum(TaxType).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  customTaxLabel: z.string().trim().max(100).nullable().optional(),
  dueDate: z.date().nullable().optional(),
  sortOrder: z.number().int().optional()
});

const moveExpenseSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(ExpenseStatus),
  sortOrder: z.number().int().min(0).optional()
});

const reorderExpenseSchema = z.object({
  boardId: z.string().min(1),
  status: z.nativeEnum(ExpenseStatus),
  orderedExpenseIds: z.array(z.string().min(1)).min(1)
});

export const expenseRouter = createTRPCRouter({
  listCategories: protectedProcedure.query(async ({ ctx }) => {
    const existing = await ctx.db.category.findMany({
      where: { userId: ctx.userId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true
      }
    });

    if (existing.length > 0) {
      return existing;
    }

    const created = await ctx.db.category.create({
      data: {
        userId: ctx.userId,
        name: "Other",
        isDefault: true
      },
      select: {
        id: true,
        name: true
      }
    });

    return [created];
  }),

  create: protectedProcedure.input(createExpenseSchema).mutation(async ({ ctx, input }) => {
    return expenseService.createExpense(ctx.db, ctx.userId, input);
  }),

  list: protectedProcedure.input(listExpensesSchema).query(async ({ ctx, input }) => {
    await assertBoardOwnership(ctx.db, input.boardId, ctx.userId);

    return ctx.db.expense.findMany({
      where: {
        boardId: input.boardId,
        status: input.status
      },
      orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        boardId: true,
        categoryId: true,
        title: true,
        amount: true,
        status: true,
        date: true,
        notes: true,
        taxType: true,
        taxRate: true,
        taxAmount: true,
        customTaxLabel: true,
        dueDate: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        }
      }
    });
  }),

  listByBoard: protectedProcedure.input(boardIdSchema).query(async ({ ctx, input }) => {
    await assertBoardOwnership(ctx.db, input.boardId, ctx.userId);

    return ctx.db.expense.findMany({
      where: {
        boardId: input.boardId
      },
      orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        boardId: true,
        categoryId: true,
        title: true,
        amount: true,
        status: true,
        date: true,
        notes: true,
        taxType: true,
        taxRate: true,
        taxAmount: true,
        customTaxLabel: true,
        dueDate: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }),

  update: protectedProcedure.input(updateExpenseSchema).mutation(async ({ ctx, input }) => {
    return expenseService.updateExpense(ctx.db, ctx.userId, input);
  }),

  delete: protectedProcedure.input(expenseIdSchema).mutation(async ({ ctx, input }) => {
    return expenseService.deleteExpense(ctx.db, ctx.userId, input.id);
  }),

  move: protectedProcedure.input(moveExpenseSchema).mutation(async ({ ctx, input }) => {
    return expenseService.moveExpense(ctx.db, ctx.userId, input);
  }),

  reorder: protectedProcedure.input(reorderExpenseSchema).mutation(async ({ ctx, input }) => {
    return expenseService.reorderExpenses(ctx.db, ctx.userId, input);
  })
});
