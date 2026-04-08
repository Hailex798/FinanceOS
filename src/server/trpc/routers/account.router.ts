import { AccountType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

const accountIdSchema = z.object({
  id: z.string().min(1)
});

const createAccountSchema = z.object({
  name: z.string().trim().min(1).max(100),
  bankName: z.string().trim().min(1).max(100),
  accountType: z.nativeEnum(AccountType),
  initialBalance: z.number().int().nonnegative().default(0),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#6366f1"),
  icon: z.string().trim().min(1).max(40).default("bank")
});

const updateAccountSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(100).optional(),
  bankName: z.string().trim().min(1).max(100).optional(),
  accountType: z.nativeEnum(AccountType).optional(),
  balance: z.number().int().nonnegative().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  icon: z.string().trim().min(1).max(40).optional()
});

export const accountRouter = createTRPCRouter({
  create: protectedProcedure.input(createAccountSchema).mutation(async ({ ctx, input }) => {
    return ctx.db.bankAccount.create({
      data: {
        userId: ctx.userId,
        name: input.name,
        bankName: input.bankName,
        accountType: input.accountType,
        balance: input.initialBalance,
        color: input.color,
        icon: input.icon
      },
      select: {
        id: true,
        userId: true,
        name: true,
        bankName: true,
        accountType: true,
        balance: true,
        color: true,
        icon: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.bankAccount.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        name: true,
        bankName: true,
        accountType: true,
        balance: true,
        color: true,
        icon: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            boards: true
          }
        }
      }
    });
  }),

  update: protectedProcedure.input(updateAccountSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.db.bankAccount.findFirst({
      where: {
        id: input.id,
        userId: ctx.userId
      },
      select: { id: true }
    });

    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Account not found." });
    }

    return ctx.db.bankAccount.update({
      where: { id: input.id },
      data: {
        name: input.name,
        bankName: input.bankName,
        accountType: input.accountType,
        balance: input.balance,
        color: input.color,
        icon: input.icon
      },
      select: {
        id: true,
        userId: true,
        name: true,
        bankName: true,
        accountType: true,
        balance: true,
        color: true,
        icon: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }),

  delete: protectedProcedure.input(accountIdSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.db.bankAccount.findFirst({
      where: {
        id: input.id,
        userId: ctx.userId
      },
      select: {
        id: true,
        _count: {
          select: {
            boards: true
          }
        }
      }
    });

    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Account not found." });
    }

    await ctx.db.bankAccount.delete({
      where: { id: input.id }
    });

    return {
      id: input.id,
      deleted: true,
      linkedBoardsRemoved: existing._count.boards
    };
  })
});
