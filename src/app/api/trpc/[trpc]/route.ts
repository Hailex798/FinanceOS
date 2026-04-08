import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/trpc/router";
import { createTRPCContext } from "@/server/trpc";

const handler = (req: Request): Promise<Response> =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError({ path, error }) {
      if (process.env.NODE_ENV === "development") {
        console.error(`tRPC failed on ${path ?? "<unknown>"}`, error);
      }
    }
  });

export { handler as GET, handler as POST };

