import { eq, and, gte } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chats, orders, usageLogs } from "@db/schema";

export const analyticsRouter = createRouter({
  dashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    // Chat stats
    const allChats = await db.query.chats.findMany({
      where: eq(chats.userId, userId),
    });
    const totalChats = allChats.length;
    const aiHandledChats = allChats.filter((c) => c.status === "ai_handled").length;
    const aiPercentage = totalChats > 0 ? Math.round((aiHandledChats / totalChats) * 100) : 0;

    // Order stats
    const allOrders = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
    });
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    // Weekly trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyChats = allChats.filter((c) => {
      const chatDate = c.createdAt ? new Date(c.createdAt) : null;
      return chatDate && chatDate >= sevenDaysAgo;
    });

    const dailyChats: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyChats[d.toISOString().split("T")[0]] = 0;
    }
    weeklyChats.forEach((c) => {
      const date = c.createdAt ? new Date(c.createdAt).toISOString().split("T")[0] : '';
      if (date && dailyChats[date] !== undefined) dailyChats[date]++;
    });

    // Top products
    const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
    allOrders.forEach((order) => {
      let items: Array<{ name: string; price: number; quantity: number }> = [];
      try {
        items = JSON.parse(order.items || "[]");
      } catch { /* ignore parse error */ }
      items.forEach((item) => {
        if (!productSales[item.name]) {
          productSales[item.name] = { name: item.name, count: 0, revenue: 0 };
        }
        productSales[item.name].count += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Monthly comparison
    const now = new Date();
    const thisMonth = now.getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;

    const thisMonthOrders = allOrders.filter((o) => {
      const d = o.createdAt ? new Date(o.createdAt) : null;
      return d && d.getMonth() === thisMonth;
    });
    const lastMonthOrders = allOrders.filter((o) => {
      const d = o.createdAt ? new Date(o.createdAt) : null;
      return d && d.getMonth() === lastMonth;
    });

    const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + Number(o.totalAmount), 0);
    const lastMonthRevenue = lastMonthOrders.reduce((s, o) => s + Number(o.totalAmount), 0);

    const monthlyGrowth = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

    return {
      totalChats,
      aiPercentage,
      totalOrders,
      totalRevenue,
      dailyChats,
      topProducts,
      monthlyGrowth,
    };
  }),
});
