import { expect, test } from "@playwright/test";

test("auth journey smoke: login and signup shells render", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Finance OS" })).toBeVisible();
  await expect(page.getByLabel("Email Address")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();

  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Finance OS" })).toBeVisible();
  await expect(page.getByLabel("Full Name")).toBeVisible();
  await expect(page.getByLabel("Email Address")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByLabel("Confirm Password")).toBeVisible();
});
