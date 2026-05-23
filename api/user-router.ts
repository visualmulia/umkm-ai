import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";

export const userRouter = createRouter({
  me: publicQuery.query(async ({ ctx }) => {
    // Return user from context (populated by session or OAuth)
    if (!ctx.user) return null;
    return ctx.user;
  }),

  updateProfile: authedQuery
    .input(
      z.object({
        name: z.string().optional(),
        whatsapp: z.string().optional(),
        businessName: z.string().optional(),
        businessCategory: z.string().optional(),
        city: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(users)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  updateOnboarding: authedQuery
    .input(z.object({ step: z.number().min(0).max(3) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(users).set({ onboardingStep: input.step }).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  updatePlan: authedQuery
    .input(z.object({ plan: z.enum(["free", "starter", "pro"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(users).set({ plan: input.plan }).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
      with: {
        devices: true,
        products: true,
        chats: true,
      },
    });
    if (!user) return null;
    return {
      plan: user.plan,
      deviceCount: user.devices.length,
      productCount: user.products.length,
      chatCount: user.chats.length,
    };
  }),
});
