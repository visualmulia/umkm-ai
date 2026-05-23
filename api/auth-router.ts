import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, sessions } from "@db/schema";
import { randomBytes } from "crypto";

// OTP store (in-memory for dev, use Redis in production)
const otpStore = new Map<string, { code: string; expires: number }>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export const authRouter = createRouter({
  // Send OTP via Kirimi.id
  sendOtp: publicQuery
    .input(z.object({ phone: z.string().min(10) }))
    .mutation(async ({ input }) => {
      const otp = generateOtp();
      const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
      otpStore.set(input.phone, { code: otp, expires });

      // Send OTP via Kirimi.id
      const kirimiUserCode = process.env.KIRIMI_USER_CODE;
      const kirimiSecret = process.env.KIRIMI_SECRET;
      const kirimiDeviceId = process.env.KIRIMI_DEVICE_ID;

      if (kirimiUserCode && kirimiSecret && kirimiDeviceId) {
        try {
          await fetch("https://api.kirimi.id/v2/otp/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-User-Code": kirimiUserCode,
              "X-Secret": kirimiSecret,
            },
            body: JSON.stringify({
              device_id: kirimiDeviceId,
              phone: input.phone,
              otp: otp,
              message: `Kode OTP UMKM-AI kamu: ${otp}. Berlaku 5 menit. Jangan bagikan ke siapapun.`,
            }),
          });
        } catch (err) {
          console.error("Kirimi OTP send error:", err);
        }
      }

      // For development: log OTP to console
      console.log(`[DEV OTP] Phone: ${input.phone}, Code: ${otp}`);

      return { success: true, message: "OTP sent" };
    }),

  // Verify OTP and create session
  verifyOtp: publicQuery
    .input(z.object({ phone: z.string().min(10), otp: z.string().length(6) }))
    .mutation(async ({ input }) => {
      const stored = otpStore.get(input.phone);

      if (!stored || stored.code !== input.otp || Date.now() > stored.expires) {
        throw new Error("Kode OTP salah atau sudah expired");
      }

      // Clear OTP
      otpStore.delete(input.phone);

      const db = getDb();

      // Find or create user
      let user = await db.query.users.findFirst({
        where: eq(users.whatsapp, input.phone),
      });

      if (!user) {
        // Create new user
        const [newUser] = await db
          .insert(users)
          .values({
            unionId: `wa_${input.phone}`,
            name: "UMKM Owner",
            whatsapp: input.phone,
            plan: "free",
            onboardingStep: 0,
            role: "user",
          })
          .returning();
        user = newUser;
      }

      // Create session (30 days expiry)
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await db.insert(sessions).values({
        id: token,
        userId: user.id,
        expiresAt,
      });

      return {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          whatsapp: user.whatsapp,
          plan: user.plan,
          role: user.role,
        },
      };
    }),

  // Get current user from context (already populated by session or OAuth)
  me: publicQuery.query(async ({ ctx }) => {
    return ctx.user ?? null;
  }),

  // Logout
  logout: publicQuery.mutation(async ({ ctx }) => {
    const sessionToken = ctx.sessionToken;
    if (sessionToken) {
      const db = getDb();
      await db.delete(sessions).where(eq(sessions.id, sessionToken));
    }
    return { success: true };
  }),
});
