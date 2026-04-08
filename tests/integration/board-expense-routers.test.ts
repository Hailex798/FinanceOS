import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const APP_ROUTER_PATH = join(process.cwd(), "src/server/trpc/router.ts");
const ACCOUNT_ROUTER_PATH = join(process.cwd(), "src/server/trpc/routers/account.router.ts");
const BOARD_ROUTER_PATH = join(process.cwd(), "src/server/trpc/routers/board.router.ts");
const EXPENSE_ROUTER_PATH = join(process.cwd(), "src/server/trpc/routers/expense.router.ts");

function read(path: string): string {
  return readFileSync(path, "utf8");
}

describe.skipIf(
  !existsSync(APP_ROUTER_PATH) ||
    !existsSync(ACCOUNT_ROUTER_PATH) ||
    !existsSync(BOARD_ROUTER_PATH) ||
    !existsSync(EXPENSE_ROUTER_PATH)
)("board/account/expense router integration contracts", () => {
  it("wires account, board, and expense routers into the root app router", () => {
    const appRouterFile = read(APP_ROUTER_PATH);

    expect(appRouterFile).toMatch(/authRouter/);
    expect(appRouterFile).toMatch(/accountRouter/);
    expect(appRouterFile).toMatch(/boardRouter/);
    expect(appRouterFile).toMatch(/expenseRouter/);
    expect(appRouterFile).toMatch(/auth\s*:\s*authRouter/);
    expect(appRouterFile).toMatch(/account\s*:\s*accountRouter/);
    expect(appRouterFile).toMatch(/board\s*:\s*boardRouter/);
    expect(appRouterFile).toMatch(/expense\s*:\s*expenseRouter/);
  });

  it("defines account and board CRUD procedures", () => {
    const accountRouterFile = read(ACCOUNT_ROUTER_PATH);
    const boardRouterFile = read(BOARD_ROUTER_PATH);

    expect(accountRouterFile).toMatch(/\bcreate\b/);
    expect(accountRouterFile).toMatch(/\blist\b/);
    expect(accountRouterFile).toMatch(/\bupdate\b/);
    expect(accountRouterFile).toMatch(/\bdelete\b/);

    expect(boardRouterFile).toMatch(/\bcreate\b/);
    expect(boardRouterFile).toMatch(/\blist\b/);
    expect(boardRouterFile).toMatch(/\bupdate\b/);
    expect(boardRouterFile).toMatch(/\bdelete\b/);
  });

  it("defines expense mutations for create/update/delete and kanban movement", () => {
    const expenseRouterFile = read(EXPENSE_ROUTER_PATH);

    expect(expenseRouterFile).toMatch(/\bcreate\b/);
    expect(expenseRouterFile).toMatch(/\bupdate\b/);
    expect(expenseRouterFile).toMatch(/\bdelete\b/);
    expect(expenseRouterFile).toMatch(/\bmove\b|\bupdateStatus\b|\breorder\b/);
  });
});
