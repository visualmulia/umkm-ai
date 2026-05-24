import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { services, serviceSchedules } from "@db/schema";

export const serviceRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.services.findMany({
      where: eq(services.userId, ctx.user.id),
      with: { schedules: true },
    });
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.query.services.findFirst({
        where: and(eq(services.id, input.id), eq(services.userId, ctx.user.id)),
        with: { schedules: true },
      });
    }),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        durationMinutes: z.number().min(15).max(1440),
        price: z.string().min(1),
        bufferMinutes: z.number().min(0).max(120).default(0),
        maxBookingsPerDay: z.number().min(1).max(100).default(1),
        depositPercent: z.number().min(0).max(100).default(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [service] = await db
        .insert(services)
        .values({ userId: ctx.user.id, ...input })
        .returning();
      return service;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        durationMinutes: z.number().min(15).max(1440).optional(),
        price: z.string().min(1).optional(),
        bufferMinutes: z.number().min(0).max(120).optional(),
        maxBookingsPerDay: z.number().min(1).max(100).optional(),
        depositPercent: z.number().min(0).max(100).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db
        .update(services)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(services.id, id), eq(services.userId, ctx.user.id)));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(services)
        .where(and(eq(services.id, input.id), eq(services.userId, ctx.user.id)));
      return { success: true };
    }),

  // ─── Schedules ───
  listSchedules: authedQuery
    .input(z.object({ serviceId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.query.serviceSchedules.findMany({
        where: eq(serviceSchedules.serviceId, input.serviceId),
      });
    }),

  setSchedule: authedQuery
    .input(
      z.object({
        serviceId: z.number(),
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { serviceId, dayOfWeek, startTime, endTime, isActive } = input;

      // Verify service belongs to user
      const svc = await db.query.services.findFirst({
        where: and(eq(services.id, serviceId), eq(services.userId, ctx.user.id)),
      });
      if (!svc) throw new Error("Service not found");

      // Upsert: delete existing for this day, then insert
      await db
        .delete(serviceSchedules)
        .where(and(eq(serviceSchedules.serviceId, serviceId), eq(serviceSchedules.dayOfWeek, dayOfWeek)));

      const [schedule] = await db
        .insert(serviceSchedules)
        .values({ serviceId, dayOfWeek, startTime, endTime, isActive })
        .returning();

      return schedule;
    }),

  deleteSchedule: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(serviceSchedules)
        .where(eq(serviceSchedules.id, input.id));
      return { success: true };
    }),
});
