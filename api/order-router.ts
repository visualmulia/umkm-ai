import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders } from "@db/schema";

export const orderRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.orders.findMany({
      where: eq(orders.userId, ctx.user.id),
      orderBy: desc(orders.createdAt),
    });
  }),

  create: authedQuery
    .input(
      z.object({
        chatId: z.number(),
        customerPhone: z.string(),
        items: z.array(
          z.object({
            name: z.string(),
            price: z.number(),
            quantity: z.number(),
          })
        ),
        totalAmount: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [order] = await db
        .insert(orders)
        .values({
          userId: ctx.user.id,
          chatId: input.chatId,
          customerPhone: input.customerPhone,
          items: JSON.stringify(input.items),
          totalAmount: input.totalAmount.toString(),
        })
        .returning();
      return order;
    }),

  updateStatus: authedQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          "pending", "paid", "processing", "shipped", "completed", "cancelled",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(orders)
        .set({ status: input.status })
        .where(eq(orders.id, input.id));
      return { success: true };
    }),

  generateInvoice: authedQuery
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const order = await db.query.orders.findFirst({
        where: and(eq(orders.id, input.orderId), eq(orders.userId, ctx.user.id)),
      });
      if (!order) return { success: false, message: "Order tidak ditemukan" };

      const now = new Date();
      const invoiceNumber = `INV-UMKM-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(order.id).padStart(4, "0")}`;

      await db
        .update(orders)
        .set({ invoiceNumber })
        .where(eq(orders.id, order.id));

      return { success: true, invoiceNumber };
    }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const allOrders = await db.query.orders.findMany({
      where: eq(orders.userId, ctx.user.id),
    });
    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = allOrders.filter((o) => {
      const orderDate = o.createdAt ? new Date(o.createdAt) : null;
      return orderDate && orderDate >= today;
    });
    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    return {
      totalOrders: allOrders.length,
      totalRevenue,
      todayOrders: todayOrders.length,
      todayRevenue,
    };
  }),
});
