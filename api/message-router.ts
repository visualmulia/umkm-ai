import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { messages, chats } from "@db/schema";

export const messageRouter = createRouter({
  listByChat: authedQuery
    .input(z.object({ chatId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.query.messages.findMany({
        where: eq(messages.chatId, input.chatId),
        orderBy: desc(messages.createdAt),
      });
    }),

  create: authedQuery
    .input(
      z.object({
        chatId: z.number(),
        sender: z.enum(["customer", "ai", "user"]),
        content: z.string().min(1),
        aiConfidence: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { chatId, sender, content, aiConfidence } = input;

      const [msg] = await db
        .insert(messages)
        .values({
          chatId,
          sender,
          content,
          aiConfidence: aiConfidence ? aiConfidence : null,
        })
        .returning();

      // Update chat's lastMessage
      await db
        .update(chats)
        .set({ lastMessage: content })
        .where(eq(chats.id, chatId));

      // Increment unread for customer messages
      if (sender === "customer") {
        await db
          .update(chats)
          .set({ unreadCount: sql`unread_count + 1` })
          .where(eq(chats.id, chatId));
      }

      return msg;
    }),

  aiResponse: authedQuery
    .input(
      z.object({
        chatId: z.number(),
        customerMessage: z.string(),
        businessName: z.string().optional(),
        products: z.string().optional(),
        knowledge: z.string().optional(),
        tone: z.string().default("ramah"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Build AI prompt
      const systemPrompt = `Kamu adalah AI Customer Service untuk ${input.businessName || "bisnis ini"}. 
Bicara dengan tone yang ${input.tone || "ramah"}. 
Jawab pertanyaan customer dengan singkat dan helpful.
${input.knowledge ? `\nKnowledge base:\n${input.knowledge}` : ""}
${input.products ? `\nDaftar produk:\n${input.products}` : ""}`;

      const userPrompt = input.customerMessage;

      // Call Kimi AI
      try {
        const apiKey = process.env.KIMI_API_KEY;
        if (!apiKey) {
          return { response: "Maaf, sistem AI sedang maintenance. Hubungi owner langsung ya!", confidence: 0 };
        }

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
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (!res.ok) throw new Error(`AI API error: ${res.status}`);
        const data = await res.json();
        const aiResponse = data.choices?.[0]?.message?.content || "Maaf, saya tidak mengerti. Bisa diulangi?";

        // Save AI message
        await db.insert(messages).values({
          chatId: input.chatId,
          sender: "ai",
          content: aiResponse,
          aiConfidence: "0.85",
        });

        // Update chat
        await db
          .update(chats)
          .set({ lastMessage: aiResponse, status: "ai_handled" })
          .where(eq(chats.id, input.chatId));

        return { response: aiResponse, confidence: 0.85 };
      } catch (err) {
        console.error("AI Error:", err);
        const fallback = "Maaf, saya sedang tidak bisa menjawab. Owner akan segera membantu!";
        await db.insert(messages).values({
          chatId: input.chatId,
          sender: "ai",
          content: fallback,
          aiConfidence: "0.00",
        });
        return { response: fallback, confidence: 0 };
      }
    }),
});
