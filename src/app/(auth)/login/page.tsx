import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="w-full max-w-[420px]">
      <div className="flex flex-col gap-8 rounded-xl border border-[rgba(99,102,241,0.35)] bg-[rgba(31,31,36,0.40)] p-10 shadow-2xl backdrop-blur-[20px]">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-[#6366F1] shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <span className="text-3xl text-[#1000A9]">◉</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Finance OS</h1>
          <p className="text-sm tracking-wide text-[#C7C4D7]">Enter your credentials to access the ledger.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
