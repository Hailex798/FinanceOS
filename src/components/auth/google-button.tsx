"use client";

import { signIn } from "next-auth/react";

type GoogleButtonProps = {
  callbackUrl?: string;
};

export function GoogleButton({ callbackUrl = "/dashboard" }: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl })}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-[rgba(144,143,160,0.5)] bg-transparent px-4 py-3 text-sm font-semibold text-[#E3E2E8] transition-all duration-300 hover:bg-white/5"
      aria-label="Continue with Google"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.9 2.9l3 2.3c1.8-1.6 2.8-4 2.8-7 0-.7-.1-1.4-.2-2H12z" />
        <path fill="#34A853" d="M12 22c2.7 0 5-0.9 6.7-2.5l-3-2.3c-.8.6-2 1-3.7 1-2.8 0-5.1-1.9-5.9-4.4l-3.1 2.4C4.7 19.8 8.1 22 12 22z" />
        <path fill="#4A90E2" d="M6.1 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.3.3-1.8L3 7.8C2.4 9 2 10.5 2 12s.4 3 1 4.2l3.1-2.4z" />
        <path fill="#FBBC05" d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.8-2.8C17 2.9 14.7 2 12 2 8.1 2 4.7 4.2 3 7.8l3.1 2.4c.8-2.5 3.1-4.4 5.9-4.4z" />
      </svg>
      <span>Continue with Google</span>
    </button>
  );
}
