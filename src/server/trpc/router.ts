import { accountRouter } from "@/server/trpc/routers/account.router";
import { authRouter } from "@/server/trpc/routers/auth.router";
import { boardRouter } from "@/server/trpc/routers/board.router";
import { expenseRouter } from "@/server/trpc/routers/expense.router";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => ({
    status: "ok" as const,
    timestamp: new Date().toISOString()
  })),
  auth: authRouter,
  account: accountRouter,
  board: boardRouter,
  expense: expenseRouter
});

export type AppRouter = typeof appRouter;
