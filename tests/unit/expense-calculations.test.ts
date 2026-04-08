import { describe, expect, it } from "vitest";
import { calculateTaxAmount, normalizeExpenseInput } from "@/server/services/expense.service";

describe("expense calculations", () => {
  it("calculates tax amount using integer money math", () => {
    const amountInPaise = 123_456;
    const taxRate = 18;
    const taxAmount = calculateTaxAmount(amountInPaise, taxRate);

    expect(Number.isInteger(taxAmount)).toBe(true);
    expect(taxAmount).toBe(22_222);
  });

  it("normalizes expense payload with stable defaults", () => {
    const normalized = normalizeExpenseInput({
      title: "  Monthly Internet Bill  ",
      amount: 49_999,
      taxType: "NONE",
      taxRate: 18,
      customTaxLabel: "Ignored label"
    });

    expect(normalized.title).toBe("Monthly Internet Bill");
    expect(Number.isInteger(normalized.amount)).toBe(true);
    expect(normalized.taxType).toBe("NONE");
    expect(normalized.taxRate).toBe(0);
    expect(normalized.taxAmount).toBe(0);
    expect(normalized.customTaxLabel).toBeNull();
  });
});
