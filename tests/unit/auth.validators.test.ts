import { describe, expect, it } from "vitest";
import { createRateLimiter, validatePasswordStrength } from "@/lib/validators/auth.validators";

describe("auth password validator", () => {
  it("accepts strong passwords", () => {
    const result = validatePasswordStrength("Abcd1234!");
    expect(result.isValid).toBe(true);
    expect(result.message).toBeNull();
  });

  it("rejects weak passwords", () => {
    const result = validatePasswordStrength("password");
    expect(result.isValid).toBe(false);
    expect(result.message).toContain("at least 8 characters");
  });
});

describe("auth rate limiter", () => {
  it("locks after configured failed attempts", () => {
    const limiter = createRateLimiter({ maxAttempts: 5, windowMs: 60_000 });
    const key = "user@example.com";

    for (let index = 0; index < 5; index += 1) {
      limiter.registerFailure(key, 1_000 + index);
    }

    expect(limiter.isLocked(key, 1_010)).toBe(true);
  });

  it("resets lock after time window", () => {
    const limiter = createRateLimiter({ maxAttempts: 3, windowMs: 1_000 });
    const key = "user@example.com";

    limiter.registerFailure(key, 0);
    limiter.registerFailure(key, 1);
    limiter.registerFailure(key, 2);

    expect(limiter.isLocked(key, 3)).toBe(true);
    expect(limiter.isLocked(key, 2_000)).toBe(false);
  });
});
