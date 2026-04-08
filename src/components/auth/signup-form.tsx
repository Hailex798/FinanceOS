"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { signupSchema, type SignupInput } from "@/lib/validators/auth.schema";
import { validatePasswordStrength } from "@/lib/validators/auth.validators";
import { GoogleButton } from "@/components/auth/google-button";
import { trpcClient } from "@/lib/trpc-client";

export function SignupForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (values: SignupInput) => {
    const passwordCheck = validatePasswordStrength(values.password);
    if (!passwordCheck.isValid) {
      setError("password", {
        message: passwordCheck.message ?? "Invalid password"
      });
      return;
    }

    try {
      await trpcClient.auth.signup.mutate(values);
      window.location.href = "/login";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed. Please try again.";

      if (message.toLowerCase().includes("already exists")) {
        setError("email", { message });
      } else {
        setError("root", { message });
      }
    }
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
        <label htmlFor="name" className="ml-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#C7C4D7]">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Your full name"
          className="w-full border-b border-[#464554] bg-[#1A1B20] px-1 py-3 text-sm text-[#E3E2E8] placeholder:text-[#908FA0] transition-all duration-300 focus:border-[#6366F1] focus:bg-[#292A2E] focus:outline-none"
          {...register("name")}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? <p className="text-xs text-[#FFB3AD]">{errors.name.message}</p> : null}
      </div>

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
        <label htmlFor="password" className="ml-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#C7C4D7]">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Create a strong password"
          className="w-full border-b border-[#464554] bg-[#1A1B20] px-1 py-3 text-sm text-[#E3E2E8] placeholder:text-[#908FA0] transition-all duration-300 focus:border-[#6366F1] focus:bg-[#292A2E] focus:outline-none"
          {...register("password")}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? <p className="text-xs text-[#FFB3AD]">{errors.password.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="ml-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#C7C4D7]">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          className="w-full border-b border-[#464554] bg-[#1A1B20] px-1 py-3 text-sm text-[#E3E2E8] placeholder:text-[#908FA0] transition-all duration-300 focus:border-[#6366F1] focus:bg-[#292A2E] focus:outline-none"
          {...register("confirmPassword")}
          aria-invalid={Boolean(errors.confirmPassword)}
        />
        {errors.confirmPassword ? <p className="text-xs text-[#FFB3AD]">{errors.confirmPassword.message}</p> : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full rounded-lg bg-gradient-to-r from-[#6366F1] to-[#4F46E5] py-3.5 font-bold text-[#1000A9] shadow-[0_4px_12px_rgba(99,102,241,0.2)] transition-all duration-300 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </button>

      {errors.root ? <p className="text-xs text-[#FFB3AD]">{errors.root.message}</p> : null}

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-[rgba(70,69,84,0.3)]" />
        <span className="mx-4 flex-shrink text-[10px] font-bold uppercase tracking-[0.2em] text-[#908FA0]">OR</span>
        <div className="flex-grow border-t border-[rgba(70,69,84,0.3)]" />
      </div>

      <GoogleButton callbackUrl="/dashboard" />

      <p className="text-center text-sm text-[#C7C4D7]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#6366F1] underline-offset-4 transition-all hover:underline">
          Sign in
        </Link>
      </p>
    </motion.form>
  );
}
