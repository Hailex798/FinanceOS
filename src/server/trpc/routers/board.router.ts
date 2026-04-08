import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

const boardIdSchema = z.object({
  id: z.string().min(1)
});

const createBoardSchema = z.object({
  accountId: z.string().min(1),
  name: z.string().trim().min(1).max(120).optional(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100)
});

const updateBoardSchema = z.object({
  id: z.string().min(1),
  accountId: z.string().min(1).optional(),
  name: z.string().trim().min(1).max(120).optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).max(2100).optional()
});

function buildDefaultBoardName(accountName: string, month: number, year: number): string {
  const date = new Date(Date.UTC(year, month - 1, 1));
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(date);
  return `${accountName} - ${monthLabel} ${year}`;
}

async function ensureOwnedAccount(db: typeof import("@/server/db").db, userId: string, accountId: string) {
  const account = await db.bankAccount.findFirst({
    where: {
      id: accountId,
      userId
    },
    select: {
      id: true,
      name: true
    }
  });

  if (!account) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Account not found." });
  }

  return account;
}

export const boardRouter = createTRPCRouter({
  create: protectedProcedure.input(createBoardSchema).mutation(async ({ ctx, input }) => {
    const account = await ensureOwnedAccount(ctx.db, ctx.userId, input.accountId);
    const boardName = input.name ?? buildDefaultBoardName(account.name, input.month, input.year);

    try {
      return await ctx.db.board.create({
        data: {
          userId: ctx.userId,
          accountId: input.accountId,
          name: boardName,
          month: input.month,
          year: input.year
        },
        select: {
          id: true,
          userId: true,
          accountId: true,
          name: true,
          month: true,
          year: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A board for this account and month already exists."
        });
      }

      throw error;
    }
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.board.findMany({
      where: { userId: ctx.userId },
      orderBy: [{ year: "desc" }, { month: "desc" }, { name: "asc" }],
      select: {
        id: true,
        userId: true,
        accountId: true,
        name: true,
        month: true,
        year: true,
        createdAt: true,
        updatedAt: true,
        account: {
          select: {
            id: true,
            name: true,
            bankName: true,
            accountType: true,
            balance: true
          }
        },
        _count: {
          select: {
            expenses: true
          }
        }
      }
    });
  }),

  update: protectedProcedure.input(updateBoardSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.db.board.findFirst({
      where: {
        id: input.id,
        userId: ctx.userId
      },
      select: {
        id: true,
        accountId: true,
        month: true,
        year: true
      }
    });

    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Board not found." });
    }

    if (input.accountId) {
      await ensureOwnedAccount(ctx.db, ctx.userId, input.accountId);
    }

    try {
      return await ctx.db.board.update({
        where: { id: input.id },
        data: {
          accountId: input.accountId,
          name: input.name,
          month: input.month,
          year: input.year
        },
        select: {
          id: true,
          userId: true,
          accountId: true,
          name: true,
          month: true,
          year: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A board for this account and month already exists."
        });
      }

      throw error;
    }
  }),

  delete: protectedProcedure.input(boardIdSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.db.board.findFirst({
      where: {
        id: input.id,
        userId: ctx.userId
      },
      select: {
        id: true,
        _count: {
          select: {
            expenses: true
          }
        }
      }
    });

    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Board not found." });
    }

    await ctx.db.board.delete({
      where: { id: input.id }
    });

    return {
      id: input.id,
      deleted: true,
      removedExpenses: existing._count.expenses
    };
  })
});
