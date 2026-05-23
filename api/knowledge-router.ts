import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { knowledge } from "@db/schema";

export const knowledgeRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.knowledge.findMany({
      where: eq(knowledge.userId, ctx.user.id),
      orderBy: desc(knowledge.createdAt),
    });
  }),

  create: authedQuery
    .input(
      z.object({
        type: z.enum(["faq", "rule"]),
        question: z.string().optional(),
        answer: z.string().min(1),
        priority: z.number().default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [item] = await db
        .insert(knowledge)
        .values({
          userId: ctx.user.id,
          ...input,
        })
        .returning();
      return item;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        type: z.enum(["faq", "rule"]).optional(),
        question: z.string().optional(),
        answer: z.string().optional(),
        priority: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db
        .update(knowledge)
        .set(data)
        .where(eq(knowledge.id, id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(knowledge).where(eq(knowledge.id, input.id));
      return { success: true };
    }),

  bulkCreate: authedQuery
    .input(
      z.array(
        z.object({
          type: z.enum(["faq", "rule"]),
          question: z.string().optional(),
          answer: z.string().min(1),
          priority: z.number().default(1),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const items = input.map((item) => ({
        userId: ctx.user.id,
        ...item,
      }));
      await db.insert(knowledge).values(items);
      return { success: true, count: items.length };
    }),
});
