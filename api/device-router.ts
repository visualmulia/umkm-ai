import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { devices, users } from "@db/schema";

export const deviceRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.devices.findMany({
      where: eq(devices.userId, ctx.user.id),
      orderBy: desc(devices.createdAt),
    });
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.query.devices.findFirst({
        where: eq(devices.id, input.id),
      });
    }),

  create: authedQuery
    .input(
      z.object({
        kirimiDeviceId: z.string(),
        name: z.string().default("Mbak AI"),
        tone: z.enum(["ramah", "profesional", "gaul"]).default("ramah"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [device] = await db
        .insert(devices)
        .values({
          userId: ctx.user.id,
          ...input,
        })
        .returning();

      // Update user's current device
      await db
        .update(users)
        .set({ currentDeviceId: device.id })
        .where(eq(users.id, ctx.user.id));

      return device;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        tone: z.enum(["ramah", "profesional", "gaul"]).optional(),
        status: z.enum(["active", "inactive", "expired"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db
        .update(devices)
        .set(data)
        .where(eq(devices.id, id));
      return { success: true };
    }),

  setCurrent: authedQuery
    .input(z.object({ deviceId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(users)
        .set({ currentDeviceId: input.deviceId })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),
});
