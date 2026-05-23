import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { callAI } from "./lib/ai-provider";

export const marketingRouter = createRouter({
  generateCaption: authedQuery
    .input(
      z.object({
        productName: z.string().min(1),
        keywords: z.string().optional(),
        tone: z.enum(["ramah", "profesional", "gaul"]).default("ramah"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const systemPrompt = `Kamu adalah Mas AI — Marketing Specialist untuk UMKM Indonesia.
Tugas: Buatkan caption Instagram yang menarik dan engaging.
Tone: ${input.tone}. Gunakan bahasa Indonesia gaul ringan yang friendly.
Rules:
- Caption harus catchy, ada hook di awal
- Tambahkan emoji yang relevan
- Sertakan call-to-action (CTA)
- Hasilkan juga 30 hashtag yang relevan
- Maksimal 200 kata untuk caption utama`;

      const userPrompt = `Produk: ${input.productName}
${input.keywords ? `Keywords: ${input.keywords}` : ""}

Buatkan caption Instagram + hashtag.`;

      try {
        const result = await callAI(systemPrompt, userPrompt);
        return { caption: result.content, confidence: result.confidence };
      } catch (err) {
        console.error("Marketing AI Error:", err);
        return { caption: "Maaf, saya sedang tidak bisa membuat caption. Coba lagi nanti ya!", confidence: 0 };
      }
    }),

  generateCopy: authedQuery
    .input(
      z.object({
        productName: z.string().min(1),
        targetAudience: z.string().optional(),
        promo: z.string().optional(),
        tone: z.enum(["ramah", "profesional", "gaul"]).default("ramah"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const systemPrompt = `Kamu adalah Mas AI — Copywriter untuk UMKM Indonesia.
Tugas: Buatkan copy iklan yang converting.
Tone: ${input.tone}. Gunakan bahasa Indonesia yang persuasive.
Rules:
- Headline yang catchy dan attention-grabbing
- Body copy yang menjelaskan benefit, bukan fitur
- Urgency atau scarcity (opsional)
- Call-to-action yang jelas
- Panjang: 3-5 paragraf`;

      const userPrompt = `Produk: ${input.productName}
${input.targetAudience ? `Target Audience: ${input.targetAudience}` : ""}
${input.promo ? `Promo/Discount: ${input.promo}` : ""}

Buatkan copy iklan lengkap (Headline + Body + CTA).`;

      try {
        const result = await callAI(systemPrompt, userPrompt);
        return { copy: result.content, confidence: result.confidence };
      } catch (err) {
        console.error("Marketing AI Error:", err);
        return { copy: "Maaf, saya sedang tidak bisa membuat copy iklan. Coba lagi nanti ya!", confidence: 0 };
      }
    }),

  generateScript: authedQuery
    .input(
      z.object({
        productName: z.string().min(1),
        duration: z.enum(["15", "30", "60"]).default("30"),
        tone: z.enum(["ramah", "profesional", "gaul"]).default("ramah"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const systemPrompt = `Kamu adalah Mas AI — Content Creator untuk TikTok/Reels UMKM Indonesia.
Tugas: Buatkan script video pendek yang viral-worthy.
Tone: ${input.tone}. Gunakan bahasa Indonesia yang natural.
Rules:
- Hook di 3 detik pertama
- Struktur: Hook → Problem → Solution → CTA
- Tambahkan direction visual [dalam kurung]
- Durasi: ${input.duration} detik`;

      const userPrompt = `Produk: ${input.productName}
Durasi: ${input.duration} detik

Buatkan script video lengkap dengan direction visual.`;

      try {
        const result = await callAI(systemPrompt, userPrompt);
        return { script: result.content, confidence: result.confidence };
      } catch (err) {
        console.error("Marketing AI Error:", err);
        return { script: "Maaf, saya sedang tidak bisa membuat script. Coba lagi nanti ya!", confidence: 0 };
      }
    }),
});
