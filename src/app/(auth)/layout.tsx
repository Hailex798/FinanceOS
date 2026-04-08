import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0B0F] text-[#E3E2E8]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.12)_0%,rgba(10,11,15,0)_70%)]" />
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[#6366F1]/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-[#4EDEA3]/5 blur-[100px]" />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">{children}</main>
    </div>
  );
}
