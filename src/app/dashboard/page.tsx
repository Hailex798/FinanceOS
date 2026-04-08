import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#0A0B0F] px-6 py-12 text-[#E3E2E8]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-xl border border-[rgba(99,102,241,0.35)] bg-[rgba(31,31,36,0.40)] p-8 backdrop-blur-[20px]">
          <p className="text-xs uppercase tracking-[0.18em] text-[#908FA0]">Finance OS</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#C7C4D7]">
            Authentication is wired and this route now exists so auth redirects do not hit a 404 page.
          </p>
        </header>

        <section className="rounded-xl border border-[rgba(99,102,241,0.2)] bg-[rgba(20,21,25,0.55)] p-6">
          <p className="text-sm text-[#C7C4D7]">Next implementation phases will replace this with the full dashboard experience.</p>
          <div className="mt-4">
            <Link href="/login" className="text-sm font-medium text-[#6366F1] underline-offset-4 hover:underline">
              Open Login
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
