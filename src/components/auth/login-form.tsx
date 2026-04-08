"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginInput } from "@/lib/validators/auth.schema";
import { GoogleButton } from "@/components/auth/google-button";

const MAX_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 60_000;

export function LoginForm() {
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values: LoginInput) => {
    if (lockedUntil && Date.now() < lockedUntil) {
      setFormError("Too many attempts. Try again in 1 minute.");
      return;
    }

    setFormError(null);

    const response = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl: "/dashboard"
    });

    if (!response || response.error) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      if (nextAttempts >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCK_WINDOW_MS);
        setFormError("Too many attempts. Try again in 1 minute.");
      } else {
        setFormError("Invalid email or password.");
      }
      return;
    }

    setAttempts(0);
    setLockedUntil(null);
    window.location.href = response.url ?? "/dashboard";
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="ml-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#C7C4D7]">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="name@company.com"
          className="w-full border-b border-[#464554] bg-[#1A1B20] px-1 py-3 text-sm text-[#E3E2E8] tabular-nums placeholder:text-[#908FA0] transition-all duration-300 focus:border-[#6366F1] focus:bg-[#292A2E] focus:outline-none"
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <p className="text-xs text-[#FFB3AD]">{errors.email.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="ml-1 flex items-center justify-between">
          <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#C7C4D7]">
            Password
          </label>
          <Link href="#" className="text-[11px] font-medium text-[#6366F1] transition-colors hover:text-[#8083FF]">
            Forgot Password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          className="w-full border-b border-[#464554] bg-[#1A1B20] px-1 py-3 text-sm text-[#E3E2E8] placeholder:text-[#908FA0] transition-all duration-300 focus:border-[#6366F1] focus:bg-[#292A2E] focus:outline-none"
          {...register("password")}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? <p className="text-xs text-[#FFB3AD]">{errors.password.message}</p> : null}
      </div>

      {formError ? <p className="text-xs text-[#FFB3AD]">{formError}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#6366F1] to-[#4F46E5] py-3.5 font-bold text-[#1000A9] shadow-[0_4px_12px_rgba(99,102,241,0.2)] transition-all duration-300 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Signing In..." : "Sign In"}
      </button>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-[rgba(70,69,84,0.3)]" />
        <span className="mx-4 flex-shrink text-[10px] font-bold uppercase tracking-[0.2em] text-[#908FA0]">OR</span>
        <div className="flex-grow border-t border-[rgba(70,69,84,0.3)]" />
      </div>

      <GoogleButton callbackUrl="/dashboard" />

      <p className="text-center text-sm text-[#C7C4D7]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-[#6366F1] underline-offset-4 transition-all hover:underline">
          Sign up
        </Link>
      </p>
    </motion.form>
  );
}
