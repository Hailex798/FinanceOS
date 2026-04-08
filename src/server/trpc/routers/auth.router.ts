import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "@/server/db";
import { createRateLimiter } from "@/lib/validators/auth.validators";
import { loginSchema, signupSchema } from "@/lib/validators/auth.schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/trpc";
import { buildAuthService } from "@/server/services/auth.service";

const limiter = createRateLimiter({
  maxAttempts: 5,
  windowMs: 60_000
});

const authService = buildAuthService({
  async findUserByEmail(email) {
    return db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true }
    });
  },
  async createUser(input) {
    return db.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash
      },
      select: { id: true, email: true, name: true, passwordHash: true }
    });
  },
  async linkGoogle(email) {
    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true }
    });

    if (existing) {
      return existing;
    }

    const created = await db.user.create({
      data: {
        email,
        name: null,
        passwordHash: null
      },
      select: { id: true, email: true, name: true, passwordHash: true }
    });

    await db.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: `google:${email}`
        }
      },
      create: {
        userId: created.id,
        type: "oauth",
        provider: "google",
        providerAccountId: `google:${email}`
      },
      update: {
        userId: created.id
      }
    });

    return created;
  }
});

export const authRouter = createTRPCRouter({
  signup: publicProcedure.input(signupSchema).mutation(async ({ input }) => {
    try {
      const user = await authService.signup(input);
      return { id: user.id, email: user.email, name: user.name };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed.";
      throw new TRPCError({ code: "BAD_REQUEST", message });
    }
  }),

  login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
    const key = input.email.trim().toLowerCase();

    if (limiter.isLocked(key)) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many attempts. Try again in 1 minute."
      });
    }

    const isValid = await authService.login(input);
    if (!isValid) {
      limiter.registerFailure(key);
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
    }

    limiter.reset(key);
    return { success: true };
  }),

  linkGoogleAccount: publicProcedure
    .input(z.object({ email: z.string().email().max(255) }))
    .mutation(async ({ input }) => {
      const linked = await authService.linkGoogleAccount(input.email);
      return { id: linked.id, email: linked.email };
    }),

  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        image: z.string().url().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.userId },
        data: {
          name: input.name,
          image: input.image
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true
        }
      });
    })
});
