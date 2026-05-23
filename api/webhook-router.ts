import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chats, messages, devices, usageLogs, users } from "@db/schema";

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

        // Check if user has AI enabled (any paid plan or within free quota)
        const isAiEnabled = user?.plan !== "free";

        if (isAiEnabled) {
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
