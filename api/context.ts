import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { getDb } from "./queries/connection";
import { sessions, users } from "@db/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  sessionToken?: string;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Try custom session token first (from localStorage)
  const sessionToken = opts.req.headers.get("x-umkm-session");
  if (sessionToken) {
    ctx.sessionToken = sessionToken;
    try {
      const db = getDb();
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionToken),
      });
      if (session && session.expiresAt > new Date()) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, session.userId),
        });
        if (user) ctx.user = user;
      }
    } catch {
      // ignore
    }
  }

  // Fallback to OAuth
  if (!ctx.user) {
    try {
      ctx.user = await authenticateRequest(opts.req.headers);
    } catch {
      // Authentication is optional
    }
  }

  return ctx;
}
