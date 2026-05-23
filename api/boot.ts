import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import { getDb } from "./queries/connection";
import { payments, users } from "@db/schema";
import { eq } from "drizzle-orm";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// Flip webhook handler — public endpoint for payment notifications
app.post("/api/webhook/flip", async (c) => {
  try {
    const payload = await c.req.json();
    console.log("[Flip Webhook] Received:", JSON.stringify(payload));

    // Flip PWF bill webhook payload structure
    const flipPaymentId = payload.link_id?.toString() || payload.id?.toString();
    const status = payload.status?.toString().toUpperCase() || payload.bill_payment?.status?.toString().toUpperCase();
    const paidAt = payload.paid_at || payload.bill_payment?.paid_at;

    if (!flipPaymentId) {
      return c.json({ error: "Missing flip payment id" }, 400);
    }

    const db = getDb();

    // Find payment by Flip ID
    const payment = await db.query.payments.findFirst({
      where: eq(payments.flipPaymentId, flipPaymentId),
    });

    if (!payment) {
      console.warn(`[Flip Webhook] Payment not found for flip id: ${flipPaymentId}`);
      return c.json({ error: "Payment not found" }, 404);
    }

    // Only process if status indicates success
    if (status === "SUCCESSFUL" || status === "SUCCESS" || status === "PAID") {
      // Update payment status
      await db
        .update(payments)
        .set({
          status: "paid",
          paidAt: paidAt ? new Date(paidAt) : new Date(),
        })
        .where(eq(payments.id, payment.id));

      const amountNum = Number(payment.amount);

      // Handle top-up payments (amount < 10k = credit top-up)
      if (amountNum < 10000) {
        const credits = Math.floor(amountNum / 100); // Rp 100 per chat
        const user = await db.query.users.findFirst({
          where: eq(users.id, payment.userId),
        });
        if (user) {
          await db
            .update(users)
            .set({ extraCredits: (user.extraCredits || 0) + credits })
            .where(eq(users.id, payment.userId));
        }
        console.log(`[Flip Webhook] Top-up ${flipPaymentId} confirmed. User ${payment.userId} got +${credits} credits`);
        return c.json({ success: true, message: `Top-up confirmed. +${credits} credits added.` });
      }

      // Handle subscription payments
      const plan = amountNum >= 99000 ? "pro" : "starter";
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await db
        .update(users)
        .set({
          plan,
          planExpiresAt: expiresAt,
        })
        .where(eq(users.id, payment.userId));

      console.log(`[Flip Webhook] Payment ${flipPaymentId} confirmed. User ${payment.userId} upgraded to ${plan}`);

      return c.json({ success: true, message: "Payment confirmed and plan activated" });
    }

    // Log non-success statuses
    console.log(`[Flip Webhook] Payment ${flipPaymentId} status: ${status}`);
    return c.json({ received: true, status });
  } catch (err) {
    console.error("[Flip Webhook] Error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
