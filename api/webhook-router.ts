import { z } from "zod";
import { eq, gte, and, sql } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chats, messages, devices, usageLogs, users } from "@db/schema";

// Quota config per plan
const PLAN_QUOTAS: Record<string, number> = {
  free: 50,
  starter: 500,
  pro: Infinity,
};

async function getMonthlyChatCount(db: ReturnType<typeof getDb>, userId: number) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(chats)
    .where(
      and(
        eq(chats.userId, userId),
        gte(chats.createdAt, startOfMonth)
      )
    );

  return result[0]?.count ?? 0;
}

function getQuotaStatus(plan: string, used: number) {
  const quota = PLAN_QUOTAS[plan] ?? PLAN_QUOTAS.free;
  if (quota === Infinity) {
    return { status: "active" as const, remaining: Infinity, quota };
  }
  const remaining = Math.max(0, quota - used);
  if (remaining <= 0) {
    return { status: "exhausted" as const, remaining: 0, quota };
  }
  if (remaining <= 5) {
    return { status: "warning" as const, remaining, quota };
  }
  return { status: "active" as const, remaining, quota };
}

const PAYWALL_MESSAGE = `🎉 Alhamdulillah! Saya sudah bantu toko kamu jawab 50 chat customer.

Dari chat itu, ada yang jadi order nggak ya? 😊

Kalau kamu suka saya bantu, upgrade yuk biar saya terus jaga toko 24/7:

💼 Starter — Rp 49.000/bulan
• 500 chat per bulan
• CS Bot + Marketing AI
• Laporan mingguan

🚀 Pro — Rp 99.000/bulan
• Unlimited chat
• Semua pegawai AI
• QRIS payment link
• Follow-up otomatis

Mau upgrade yang mana kak?`;

export const webhookRouter = createRouter({
  // Kirimi.id incoming webhook
  kirimi: publicQuery
    .input(z.any())
    .mutation(async ({ input }) => {
      const db = getDb();
      const event = input.event || input.type;

      // Handle incoming message
      if (event === "message" || event === "msg") {
        const {
          deviceId: kirimiDeviceId,
          from: customerPhone,
          name: customerName,
          message: content,
          isFromMe,
          messageType,
        } = input;

        if (isFromMe || messageType !== "text" || !content) {
          return { received: true, ignored: true, reason: "from_me_or_non_text" };
        }

        // Find device by Kirimi device ID
        const device = await db.query.devices.findFirst({
          where: eq(devices.kirimiDeviceId, kirimiDeviceId),
        });

        if (!device) {
          return { received: true, ignored: true, reason: "device_not_found" };
        }

        // Find or create chat
        let chat = await db.query.chats.findFirst({
          where: eq(chats.customerPhone, customerPhone),
        });

        if (!chat) {
          const [newChat] = await db
            .insert(chats)
            .values({
              userId: device.userId,
              customerPhone,
              customerName: customerName || "Customer",
              deviceId: device.id,
            })
            .returning();
          chat = newChat;
        }

        // Save customer message
        await db.insert(messages).values({
          chatId: chat.id,
          sender: "customer",
          content,
        });

        // Update chat
        await db
          .update(chats)
          .set({
            lastMessage: content,
            unreadCount: (chat?.unreadCount || 0) + 1,
          })
          .where(eq(chats.id, chat.id));

        // Log usage
        await db.insert(usageLogs).values({
          userId: device.userId,
          action: "chat_incoming",
          details: JSON.stringify({ customerPhone, contentPreview: content.substring(0, 100) }),
        });

        // Get user's knowledge and products for AI context
        const user = await db.query.users.findFirst({
          where: eq(users.id, device.userId),
          with: {
            knowledge: true,
            products: true,
          },
        });

        if (!user) {
          return { received: true, ignored: true, reason: "user_not_found" };
        }

        // Check plan expiry
        const now = new Date();
        const isPlanExpired = user.planExpiresAt && user.planExpiresAt < now;
        const effectivePlan = isPlanExpired ? "free" : user.plan;

        // Check quota
        const monthlyChatCount = await getMonthlyChatCount(db, user.id);
        const quotaStatus = getQuotaStatus(effectivePlan, monthlyChatCount);

        // Silent warning logs (chat 45-49 for free, 495-499 for starter)
        if (quotaStatus.status === "warning") {
          console.log(`[QUOTA WARNING] User ${user.id} (${effectivePlan}): ${monthlyChatCount}/${quotaStatus.quota} chats used`);
        }

        // Quota exhausted — check extra credits first, then send paywall
        if (quotaStatus.status === "exhausted") {
          if (user.extraCredits > 0) {
            // Use 1 extra credit and continue with AI
            await db
              .update(users)
              .set({ extraCredits: user.extraCredits - 1 })
              .where(eq(users.id, user.id));

            console.log(`[OVERAGE] User ${user.id} used 1 extra credit. Remaining: ${user.extraCredits - 1}`);
            // Fall through to AI response below
          } else {
            // No extra credits — send paywall
            await sendViaKirimi(kirimiDeviceId, customerPhone, PAYWALL_MESSAGE);

            await db.insert(messages).values({
              chatId: chat.id,
              sender: "ai",
              content: PAYWALL_MESSAGE,
              aiConfidence: "0.99",
            });

            await db
              .update(chats)
              .set({
                lastMessage: PAYWALL_MESSAGE,
                status: "ai_handled",
              })
              .where(eq(chats.id, chat.id));

            return { received: true, aiHandled: true, paywall: true };
          }
        }

        // Proceed with AI if quota active, warning, or exhausted but with extra credits
        if (quotaStatus.status === "active" || quotaStatus.status === "warning" || (quotaStatus.status === "exhausted" && user.extraCredits > 0)) {
          // Build AI prompt
          const knowledgeText = user?.knowledge
            ?.map((k) => `${k.type === "faq" ? `Q: ${k.question}\nA: ${k.answer}` : `Rule: ${k.answer}`}`)
            .join("\n\n");

          const productsText = user?.products
            ?.filter((p) => p.isActive)
            .map((p) => `- ${p.name}: Rp ${p.price}${p.stock ? ` (Stok: ${p.stock})` : ""}${p.description ? ` - ${p.description}` : ""}`)
            .join("\n");

          const systemPrompt = `Kamu adalah ${device.name || "AI Customer Service"} untuk ${user?.businessName || "bisnis ini"}. 
Bicara dengan tone yang ${device.tone || "ramah"}. 
Jawab pertanyaan customer dengan singkat dan helpful.
${knowledgeText ? `\nKnowledge base:\n${knowledgeText}` : ""}
${productsText ? `\nDaftar produk:\n${productsText}` : ""}`;

          // Call Kimi AI
          const apiKey = process.env.KIMI_API_KEY;
          if (apiKey) {
            try {
              const res = await fetch("https://api.moonshot.cn/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                  model: "kimi-k2.5-lite-preview",
                  messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: content },
                  ],
                  temperature: 0.7,
                  max_tokens: 500,
                }),
              });

              if (res.ok) {
                const data = await res.json();
                const aiResponse = data.choices?.[0]?.message?.content || "";

                // Save AI response
                await db.insert(messages).values({
                  chatId: chat.id,
                  sender: "ai",
                  content: aiResponse,
                  aiConfidence: "0.85",
                });

                // Update chat
                await db
                  .update(chats)
                  .set({
                    lastMessage: aiResponse,
                    status: "ai_handled",
                  })
                  .where(eq(chats.id, chat.id));

                // Send response via Kirimi
                await sendViaKirimi(kirimiDeviceId, customerPhone, aiResponse);

                return { received: true, aiHandled: true };
              }
            } catch (err) {
              console.error("AI processing error:", err);
            }
          }
        }

        return { received: true, aiHandled: false };
      }

      // Handle connection events
      if (event === "connection.connected" || event === "connection.disconnected") {
        const { deviceId: kirimiDeviceId } = input;
        const status = event === "connection.connected" ? "active" : "inactive";

        await db
          .update(devices)
          .set({ status })
          .where(eq(devices.kirimiDeviceId, kirimiDeviceId));

        return { received: true, deviceStatus: status };
      }

      return { received: true, event };
    }),
});

async function sendViaKirimi(deviceId: string, to: string, message: string) {
  try {
    const res = await fetch("https://api.kirimi.id/v1/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Code": process.env.KIRIMI_USER_CODE || "",
        "X-Secret": process.env.KIRIMI_SECRET || "",
        "X-Device-Id": deviceId,
      },
      body: JSON.stringify({
        phone: to,
        message,
        type: "text",
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("Send via Kirimi error:", err);
    return false;
  }
}
