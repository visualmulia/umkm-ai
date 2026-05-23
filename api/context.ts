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

async function resolveUserWithExpiryCheck(
  user: User | undefined,
): Promise<User | undefined> {
  if (!user) return undefined;
  if (user.plan === "free") return user;

  const now = new Date();
  if (user.planExpiresAt && user.planExpiresAt < now) {
    // Plan expired — auto-downgrade to free
    const db = getDb();
    await db
      .update(users)
      .set({ plan: "free", planExpiresAt: null })
      .where(eq(users.id, user.id));
    return { ...user, plan: "free", planExpiresAt: null };
  }

  return user;
}

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
        if (user) ctx.user = await resolveUserWithExpiryCheck(user);
      }
    } catch {
      // ignore
    }
  }

  // Fallback to OAuth
  if (!ctx.user) {
    try {
      const user = await authenticateRequest(opts.req.headers);
      ctx.user = await resolveUserWithExpiryCheck(user);
    } catch {
      // Authentication is optional
    }
  }

  return ctx;
}
