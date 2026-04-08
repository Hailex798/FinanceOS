export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="glass-card w-full max-w-md rounded-md p-8">
        <h1 className="text-2xl font-semibold text-foreground">Finance OS</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The foundation is set up. Continue to the authentication flow.
        </p>
        <div className="mt-6">
          <a
            href="/login"
            className="inline-flex rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
          >
            Go to Login
          </a>
        </div>
      </div>
    </main>
  );
}
