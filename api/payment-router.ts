import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { payments, users } from "@db/schema";

const PLAN_PRICES: Record<string, number> = {
  starter: 49000,
  pro: 99000,
};

export const paymentRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.payments.findMany({
      where: eq(payments.userId, ctx.user.id),
      orderBy: desc(payments.createdAt),
    });
  }),

  createPayment: authedQuery
    .input(z.object({ plan: z.enum(["starter", "pro"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const amount = PLAN_PRICES[input.plan];

      // Create payment record
      const [payment] = await db
        .insert(payments)
        .values({
          userId: ctx.user.id,
          amount: amount.toString(),
          status: "pending",
        })
        .returning();

      // Create Flip bill
      const flipKey = process.env.FLIP_SECRET_KEY;
      if (!flipKey) {
        return { success: false, message: "Payment gateway not configured", payment };
      }

      try {
        const res = await fetch("https://bigflip.id/api/v2/pwf/bill", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${flipKey}`,
          },
          body: JSON.stringify({
            title: `UMKM-AI ${input.plan.toUpperCase()} Plan`,
            amount,
            type: "SINGLE",
            expired_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            redirect_url: `${process.env.APP_URL || "http://localhost:3000"}/dashboard/settings`,
            is_address_required: 0,
            is_phone_number_required: 0,
          }),
        });

        if (!res.ok) throw new Error(`Flip API error: ${res.status}`);
        const flipData = await res.json();

        // Update payment with Flip ID
        await db
          .update(payments)
          .set({ flipPaymentId: flipData.link_id?.toString() })
          .where(eq(payments.id, payment.id));

        return {
          success: true,
          payment: { ...payment, flipPaymentId: flipData.link_id?.toString() },
          paymentUrl: flipData.link_url,
        };
      } catch (err) {
        console.error("Flip Error:", err);
        return { success: false, message: "Failed to create payment", payment };
      }
    }),

  confirmPayment: authedQuery
    .input(z.object({ paymentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(payments)
        .set({ status: "paid", paidAt: new Date() })
        .where(eq(payments.id, input.paymentId));

      // Update user plan + expiry (30 days from now)
      const payment = await db.query.payments.findFirst({
        where: eq(payments.id, input.paymentId),
      });
      if (payment) {
        const plan = Number(payment.amount) >= 99000 ? "pro" : "starter";
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await db
          .update(users)
          .set({ plan, planExpiresAt: expiresAt })
          .where(eq(users.id, payment.userId));
      }

      return { success: true };
    }),

  verify: authedQuery
    .input(z.object({ flipPaymentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const payment = await db.query.payments.findFirst({
        where: eq(payments.flipPaymentId, input.flipPaymentId),
      });
      return payment ?? null;
    }),

  createTopup: authedQuery
    .input(z.object({ credits: z.number().min(10).max(1000) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const pricePerCredit = 100; // Rp 100 per chat
      const amount = input.credits * pricePerCredit;

      const [payment] = await db
        .insert(payments)
        .values({
          userId: ctx.user.id,
          amount: amount.toString(),
          status: "pending",
        })
        .returning();

      const flipKey = process.env.FLIP_SECRET_KEY;
      if (!flipKey) {
        return { success: false, message: "Payment gateway not configured", payment };
      }

      try {
        const res = await fetch("https://bigflip.id/api/v2/pwf/bill", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${flipKey}`,
          },
          body: JSON.stringify({
            title: `Top-up ${input.credits} Chat UMKM-AI`,
            amount,
            type: "SINGLE",
            expired_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            redirect_url: `${process.env.APP_URL || "http://localhost:3000"}/dashboard/settings`,
            is_address_required: 0,
            is_phone_number_required: 0,
          }),
        });

        if (!res.ok) throw new Error(`Flip API error: ${res.status}`);
        const flipData = await res.json();

        await db
          .update(payments)
          .set({ flipPaymentId: flipData.link_id?.toString() })
          .where(eq(payments.id, payment.id));

        return {
          success: true,
          payment: { ...payment, flipPaymentId: flipData.link_id?.toString() },
          paymentUrl: flipData.link_url,
        };
      } catch (err) {
        console.error("Flip Topup Error:", err);
        return { success: false, message: "Failed to create top-up payment", payment };
      }
    }),
});
