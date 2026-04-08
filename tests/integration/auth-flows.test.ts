import { describe, expect, it } from "vitest";
import { hash } from "bcryptjs";
import { buildAuthService } from "@/server/services/auth.service";

function createMockStore() {
  const users = new Map<string, { id: string; email: string; name: string | null; passwordHash: string | null }>();

  return {
    users,
    findUserByEmail(email: string) {
      return users.get(email) ?? null;
    },
    async createUser(input: { email: string; name: string; passwordHash: string }) {
      const user = { id: `usr_${users.size + 1}`, email: input.email, name: input.name, passwordHash: input.passwordHash };
      users.set(input.email, user);
      return user;
    },
    async linkGoogle(email: string) {
      const user = users.get(email);
      if (!user) {
        const created = { id: `usr_${users.size + 1}`, email, name: null, passwordHash: null };
        users.set(email, created);
        return created;
      }

      return user;
    }
  };
}

describe("auth integration flows", () => {
  it("handles signup and duplicate signup", async () => {
    const store = createMockStore();
    const service = buildAuthService(store);

    const created = await service.signup({
      name: "Test User",
      email: "test@example.com",
      password: "Abcd1234!",
      confirmPassword: "Abcd1234!"
    });

    expect(created.email).toBe("test@example.com");

    await expect(
      service.signup({
        name: "Test User",
        email: "test@example.com",
        password: "Abcd1234!",
        confirmPassword: "Abcd1234!"
      })
    ).rejects.toThrow("already exists");
  });

  it("validates login credentials", async () => {
    const store = createMockStore();
    const service = buildAuthService(store);

    const passwordHash = await hash("Abcd1234!", 12);
    await store.createUser({ email: "test@example.com", name: "User", passwordHash });

    await expect(service.login({ email: "test@example.com", password: "Abcd1234!" })).resolves.toBe(true);
    await expect(service.login({ email: "test@example.com", password: "wrong-pass" })).resolves.toBe(false);
  });

  it("links google account to existing or creates for new user", async () => {
    const store = createMockStore();
    const service = buildAuthService(store);

    const passwordHash = await hash("Abcd1234!", 12);
    await store.createUser({ email: "known@example.com", name: "Known", passwordHash });

    const linkedExisting = await service.linkGoogleAccount("known@example.com");
    expect(linkedExisting.email).toBe("known@example.com");

    const linkedNew = await service.linkGoogleAccount("new@example.com");
    expect(linkedNew.email).toBe("new@example.com");
  });
});
