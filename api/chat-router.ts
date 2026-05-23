import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chats, messages } from "@db/schema";

export const chatRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.chats.findMany({
      where: eq(chats.userId, ctx.user.id),
      orderBy: desc(chats.createdAt),
      with: {
        messages: { limit: 1, orderBy: desc(messages.createdAt) },
      },
    });
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.query.chats.findFirst({
        where: eq(chats.id, input.id),
        with: {
          messages: { orderBy: desc(messages.createdAt) },
        },
      });
    }),

  create: authedQuery
    .input(
      z.object({
        customerPhone: z.string(),
        customerName: z.string().default("Customer"),
        deviceId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [chat] = await db
        .insert(chats)
        .values({
          userId: ctx.user.id,
          ...input,
        })
        .returning();
      return chat;
    }),

  updateStatus: authedQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["active", "ai_handled", "human_needed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(chats)
        .set({ status: input.status })
        .where(eq(chats.id, input.id));
      return { success: true };
    }),

  resetUnread: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(chats)
        .set({ unreadCount: 0 })
        .where(eq(chats.id, input.id));
      return { success: true };
    }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const allChats = await db.query.chats.findMany({
      where: eq(chats.userId, ctx.user.id),
    });
    const total = allChats.length;
    const aiHandled = allChats.filter((c) => c.status === "ai_handled").length;
    const humanNeeded = allChats.filter((c) => c.status === "human_needed").length;
    const unread = allChats.reduce((sum, c) => sum + c.unreadCount, 0);
    return { total, aiHandled, humanNeeded, unread };
  }),
});
