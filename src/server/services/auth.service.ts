import { compare, hash } from "bcryptjs";
import type { LoginInput, SignupInput } from "@/lib/validators/auth.schema";
import { validatePasswordStrength } from "@/lib/validators/auth.validators";

export type AuthUserRecord = {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string | null;
};

export type AuthServiceStore = {
  findUserByEmail: (email: string) => Promise<AuthUserRecord | null> | AuthUserRecord | null;
  createUser: (input: {
    name: string;
    email: string;
    passwordHash: string;
  }) => Promise<AuthUserRecord> | AuthUserRecord;
  linkGoogle: (email: string) => Promise<AuthUserRecord> | AuthUserRecord;
};

export function buildAuthService(store: AuthServiceStore) {
  return {
    async signup(input: SignupInput): Promise<AuthUserRecord> {
      const email = input.email.trim().toLowerCase();
      const passwordValidation = validatePasswordStrength(input.password);

      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message ?? "Invalid password.");
      }

      const existing = await store.findUserByEmail(email);
      if (existing) {
        throw new Error("An account with this email already exists.");
      }

      const passwordHash = await hash(input.password, 12);
      return store.createUser({
        name: input.name.trim(),
        email,
        passwordHash
      });
    },

    async login(input: LoginInput): Promise<boolean> {
      const email = input.email.trim().toLowerCase();
      const user = await store.findUserByEmail(email);

      if (!user?.passwordHash) {
        return false;
      }

      return compare(input.password, user.passwordHash);
    },

    async linkGoogleAccount(email: string): Promise<AuthUserRecord> {
      return store.linkGoogle(email.trim().toLowerCase());
    }
  };
}
