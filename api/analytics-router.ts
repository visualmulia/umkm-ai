import { eq, and, gte } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chats, orders, products } from "@db/schema";
import { callAI } from "./lib/ai-provider";

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

  aiInsights: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const allOrders = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
    });
    const allProducts = await db.query.products.findMany({
      where: eq(products.userId, userId),
    });
    const allChats = await db.query.chats.findMany({
      where: eq(chats.userId, userId),
    });

    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const avgOrderValue = allOrders.length > 0 ? Math.round(totalRevenue / allOrders.length) : 0;
    const aiHandleRate = allChats.length > 0
      ? Math.round((allChats.filter((c) => c.status === "ai_handled").length / allChats.length) * 100)
      : 0;

    const lowStockProducts = allProducts.filter((p) => p.stock !== null && p.stock <= 5 && p.isActive);
    const productSales: Record<string, number> = {};
    allOrders.forEach((order) => {
      let items: Array<{ name: string; quantity: number }> = [];
      try {
        items = JSON.parse(order.items || "[]");
      } catch { /* ignore */ }
      items.forEach((item) => {
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
      });
    });
    const bestSeller = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0];

    const promptData = {
      totalOrders: allOrders.length,
      totalRevenue,
      avgOrderValue,
      totalChats: allChats.length,
      aiHandleRate,
      productCount: allProducts.length,
      lowStockCount: lowStockProducts.length,
      bestSeller: bestSeller ? bestSeller[0] : null,
      bestSellerQty: bestSeller ? bestSeller[1] : 0,
    };

    try {
      const systemPrompt = `Kamu adalah Pak AI — Business Analyst untuk UMKM Indonesia.
Tugas: Analisis data bisnis dan berikan insight singkat (maksimal 3 poin) + 3 rekomendasi actionable dalam Bahasa Indonesia yang santai dan mudah dipahami UMKM owner.
Format: gunakan bullet point dengan emoji.`;

      const userPrompt = `Data bisnis 30 hari terakhir:
${JSON.stringify(promptData, null, 2)}

Berikan insight dan rekomendasi.`;

      const aiResult = await callAI(systemPrompt, userPrompt);
      return { insights: aiResult.content, generatedAt: new Date() };
    } catch (err) {
      console.error("AI Insights error:", err);
      return {
        insights: "📊 Data bisnis sedang diproses. Coba refresh dalam beberapa saat ya!",
        generatedAt: new Date(),
      };
    }
  }),
});
