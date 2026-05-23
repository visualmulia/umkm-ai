import { z } from "zod";
import { eq, and, lte } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, products, chats, devices } from "@db/schema";

export const adminRouter = createRouter({
  // Get order pipeline grouped by status
  orderPipeline: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const allOrders = await db.query.orders.findMany({
      where: eq(orders.userId, ctx.user.id),
      orderBy: [orders.createdAt],
    });

    const pipeline = {
      pending: allOrders.filter((o) => o.status === "pending"),
      paid: allOrders.filter((o) => o.status === "paid"),
      processing: allOrders.filter((o) => o.status === "processing"),
      shipped: allOrders.filter((o) => o.status === "shipped"),
      completed: allOrders.filter((o) => o.status === "completed"),
      cancelled: allOrders.filter((o) => o.status === "cancelled"),
    };

    return pipeline;
  }),

  // Get stock alerts (products with low stock)
  stockAlerts: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const allProducts = await db.query.products.findMany({
      where: eq(products.userId, ctx.user.id),
    });

    // Alert threshold = 5
    const alerts = allProducts.filter((p) => p.stock !== null && p.stock <= 5 && p.isActive);
    return alerts;
  }),

  // Send broadcast message to all customers via WhatsApp
  sendBroadcast: authedQuery
    .input(z.object({ message: z.string().min(1).max(1000) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Get all unique customer phones from chats
      const userChats = await db.query.chats.findMany({
        where: eq(chats.userId, ctx.user.id),
      });

      const uniquePhones = Array.from(new Set(userChats.map((c) => c.customerPhone)));
      if (uniquePhones.length === 0) {
        return { success: true, sent: 0, message: "Tidak ada customer untuk dikirimi broadcast" };
      }

      // Get user's primary device
      const device = await db.query.devices.findFirst({
        where: eq(devices.userId, ctx.user.id),
      });

      if (!device) {
        return { success: false, sent: 0, message: "WhatsApp device belum terhubung" };
      }

      // Send messages (sequentially to avoid rate limits)
      let sentCount = 0;
      for (const phone of uniquePhones) {
        try {
          const res = await fetch("https://api.kirimi.id/v1/send-message", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-User-Code": process.env.KIRIMI_USER_CODE || "",
              "X-Secret": process.env.KIRIMI_SECRET || "",
              "X-Device-Id": device.kirimiDeviceId,
            },
            body: JSON.stringify({
              phone,
              message: input.message,
              type: "text",
            }),
          });
          if (res.ok) sentCount++;
        } catch (err) {
          console.error(`Broadcast failed for ${phone}:`, err);
        }
      }

      return {
        success: true,
        sent: sentCount,
        total: uniquePhones.length,
        message: `Broadcast terkirim ke ${sentCount} dari ${uniquePhones.length} customer`,
      };
    }),
});
