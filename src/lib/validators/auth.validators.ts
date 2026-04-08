const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export type PasswordValidationResult = {
  isValid: boolean;
  message: string | null;
};

export type RateLimitConfig = {
  maxAttempts: number;
  windowMs: number;
};

type AttemptRecord = {
  count: number;
  windowStart: number;
};

export function validatePasswordStrength(password: string): PasswordValidationResult {
  if (PASSWORD_RULE.test(password)) {
    return { isValid: true, message: null };
  }

  return {
    isValid: false,
    message:
      "Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character."
  };
}

export function createRateLimiter(config: RateLimitConfig) {
  const store = new Map<string, AttemptRecord>();

  function resolveRecord(key: string, now: number): AttemptRecord {
    const current = store.get(key);
    if (!current || now - current.windowStart > config.windowMs) {
      const fresh = { count: 0, windowStart: now };
      store.set(key, fresh);
      return fresh;
    }

    return current;
  }

  function registerFailure(key: string, now: number = Date.now()): number {
    const record = resolveRecord(key, now);
    record.count += 1;
    store.set(key, record);
    return record.count;
  }

  function reset(key: string): void {
    store.delete(key);
  }

  function isLocked(key: string, now: number = Date.now()): boolean {
    const record = resolveRecord(key, now);
    return record.count >= config.maxAttempts;
  }

  return {
    registerFailure,
    reset,
    isLocked
  };
}
