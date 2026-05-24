import { z } from "zod";
import { eq, and, gte, lte } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bookings, services, serviceSchedules } from "@db/schema";
import { formatDateId, addMinutesToTime } from "./lib/date-parser";

export const bookingRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.bookings.findMany({
      where: eq(bookings.userId, ctx.user.id),
      with: { service: true },
      orderBy: [bookings.bookingDate, bookings.startTime],
    });
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.query.bookings.findFirst({
        where: and(eq(bookings.id, input.id), eq(bookings.userId, ctx.user.id)),
        with: { service: true },
      });
    }),

  checkAvailability: authedQuery
    .input(z.object({ serviceId: z.number(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const { serviceId, date } = input;

      // Get service details
      const service = await db.query.services.findFirst({
        where: and(eq(services.id, serviceId), eq(services.userId, ctx.user.id)),
      });
      if (!service) return { available: false, reason: "Service not found" };

      // Get schedule for this day of week
      const dayOfWeek = new Date(date + "T00:00:00").getDay();
      const schedule = await db.query.serviceSchedules.findFirst({
        where: and(
          eq(serviceSchedules.serviceId, serviceId),
          eq(serviceSchedules.dayOfWeek, dayOfWeek),
          eq(serviceSchedules.isActive, true)
        ),
      });
      if (!schedule) {
        return { available: false, reason: "Tidak ada jadwal di hari ini" };
      }

      // Get existing bookings for this date
      const existingBookings = await db.query.bookings.findMany({
        where: and(
          eq(bookings.serviceId, serviceId),
          eq(bookings.bookingDate, date),
          eq(bookings.userId, ctx.user.id),
        ),
      });
      const activeBookings = existingBookings.filter((b) => !["cancelled", "no_show"].includes(b.status));

      // Check max bookings per day
      if (activeBookings.length >= service.maxBookingsPerDay) {
        return { available: false, reason: "Jadwal penuh di tanggal ini" };
      }

      // Return available slots
      return {
        available: true,
        schedule: {
          start: schedule.startTime,
          end: schedule.endTime,
        },
        existingBookings: activeBookings.map((b) => ({
          startTime: b.startTime,
          endTime: b.endTime,
          status: b.status,
        })),
      };
    }),

  suggestAlternatives: authedQuery
    .input(z.object({
      serviceId: z.number(),
      preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      daysToCheck: z.number().min(1).max(14).default(7),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const { serviceId, preferredDate, startTime, daysToCheck } = input;

      const service = await db.query.services.findFirst({
        where: and(eq(services.id, serviceId), eq(services.userId, ctx.user.id)),
      });
      if (!service) return { suggestions: [] };

      const suggestions: Array<{ date: string; startTime: string; endTime: string; formatted: string }> = [];

      for (let i = 1; i <= daysToCheck && suggestions.length < 3; i++) {
        const checkDate = new Date(preferredDate + "T00:00:00");
        checkDate.setDate(checkDate.getDate() + i);
        const dateStr = checkDate.toISOString().split("T")[0];

        const dayOfWeek = checkDate.getDay();
        const schedule = await db.query.serviceSchedules.findFirst({
          where: and(
            eq(serviceSchedules.serviceId, serviceId),
            eq(serviceSchedules.dayOfWeek, dayOfWeek),
            eq(serviceSchedules.isActive, true)
          ),
        });
        if (!schedule) continue;

        const existingBookings = await db.query.bookings.findMany({
          where: and(
            eq(bookings.serviceId, serviceId),
            eq(bookings.bookingDate, dateStr),
            eq(bookings.userId, ctx.user.id),
          ),
        });
        const activeBookings = existingBookings.filter((b) => !["cancelled", "no_show"].includes(b.status));

        if (activeBookings.length < service.maxBookingsPerDay) {
          const endTime = addMinutesToTime(schedule.startTime, service.durationMinutes);
          suggestions.push({
            date: dateStr,
            startTime: schedule.startTime,
            endTime,
            formatted: `${formatDateId(dateStr)}, jam ${schedule.startTime} - ${endTime}`,
          });
        }
      }

      return { suggestions };
    }),

  create: authedQuery
    .input(
      z.object({
        serviceId: z.number(),
        customerPhone: z.string().min(1),
        customerName: z.string().default("Customer"),
        bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const service = await db.query.services.findFirst({
        where: and(eq(services.id, input.serviceId), eq(services.userId, ctx.user.id)),
      });
      if (!service) throw new Error("Service not found");

      const [booking] = await db
        .insert(bookings)
        .values({
          userId: ctx.user.id,
          serviceId: input.serviceId,
          customerPhone: input.customerPhone,
          customerName: input.customerName,
          bookingDate: input.bookingDate,
          startTime: input.startTime,
          endTime: input.endTime,
          status: "inquiry",
          totalAmount: service.price,
          notes: input.notes,
        })
        .returning();

      return booking;
    }),

  updateStatus: authedQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["inquiry", "pending_deposit", "confirmed", "completed", "cancelled", "no_show"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(bookings)
        .set({ status: input.status, updatedAt: new Date() })
        .where(and(eq(bookings.id, input.id), eq(bookings.userId, ctx.user.id)));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(bookings)
        .where(and(eq(bookings.id, input.id), eq(bookings.userId, ctx.user.id)));
      return { success: true };
    }),
});
