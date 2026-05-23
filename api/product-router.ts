import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products } from "@db/schema";

export const productRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.products.findMany({
      where: eq(products.userId, ctx.user.id),
      orderBy: desc(products.createdAt),
    });
  }),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1),
        price: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        stock: z.number().default(0),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [product] = await db
        .insert(products)
        .values({
          userId: ctx.user.id,
          ...input,
          price: input.price ? input.price : null,
        })
        .returning();
      return product;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        price: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        stock: z.number().optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db
        .update(products)
        .set(data)
        .where(eq(products.id, id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),
});
