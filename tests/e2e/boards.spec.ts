import { expect, test } from "@playwright/test";

const TEST_PASSWORD = "BoardFlow123!";

function uniqueEmail(): string {
  return `board-flow-${Date.now()}@example.com`;
}

test("boards workflow: create board, add expense, move to spent", async ({ page }) => {
  const email = uniqueEmail();

  await page.goto("/signup");
  await page.getByLabel("Full Name").fill("Board Flow User");
  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByLabel("Confirm Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Create Account" }).click();

  await page.goto("/login");
  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  const boardsResponse = await page.goto("/boards");
  if (!boardsResponse || boardsResponse.status() === 404) {
    test.skip(true, "Boards route is not implemented yet (pending T043).");
  }

  await expect(page.getByRole("heading", { name: /Boards/i })).toBeVisible();

  await page.getByRole("button", { name: /Create Board/i }).click();
  await page.getByLabel(/Board Name/i).fill("Primary Account - Test Month");
  await page.getByRole("button", { name: /Save Board|Create/i }).click();

  await expect(page.getByText("Primary Account - Test Month")).toBeVisible();

  await page.getByRole("button", { name: /Add Expense/i }).click();
  await page.getByLabel(/Title/i).fill("Monthly Internet");
  await page.getByLabel(/Amount/i).fill("1499");
  await page.getByRole("button", { name: /Save Expense|Create/i }).click();

  const plannedCard = page.getByText("Monthly Internet").first();
  await expect(plannedCard).toBeVisible();

  const spentColumn = page.getByRole("region", { name: /Spent/i }).first();
  await plannedCard.dragTo(spentColumn);

  await expect(spentColumn.getByText("Monthly Internet")).toBeVisible();
});
