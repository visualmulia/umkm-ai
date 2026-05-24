import { relations } from "drizzle-orm";
import {
  users,
  devices,
  products,
  knowledge,
  chats,
  messages,
  orders,
  payments,
  usageLogs,
  sessions,
  services,
  serviceSchedules,
  bookings,
} from "./schema";

export const usersRelations = relations(users, ({ many, one }) => ({
  devices: many(devices),
  products: many(products),
  knowledge: many(knowledge),
  chats: many(chats),
  orders: many(orders),
  payments: many(payments),
  usageLogs: many(usageLogs),
  services: many(services),
  bookings: many(bookings),
  currentDevice: one(devices, {
    fields: [users.currentDeviceId],
    references: [devices.id],
  }),
}));

export const devicesRelations = relations(devices, ({ one, many }) => ({
  user: one(users, {
    fields: [devices.userId],
    references: [users.id],
  }),
  chats: many(chats),
}));

export const productsRelations = relations(products, ({ one }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
}));

export const knowledgeRelations = relations(knowledge, ({ one }) => ({
  user: one(users, {
    fields: [knowledge.userId],
    references: [users.id],
  }),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
  }),
  device: one(devices, {
    fields: [chats.deviceId],
    references: [devices.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  chat: one(chats, {
    fields: [orders.chatId],
    references: [chats.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const usageLogsRelations = relations(usageLogs, ({ one }) => ({
  user: one(users, {
    fields: [usageLogs.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  user: one(users, {
    fields: [services.userId],
    references: [users.id],
  }),
  schedules: many(serviceSchedules),
  bookings: many(bookings),
}));

export const serviceSchedulesRelations = relations(serviceSchedules, ({ one }) => ({
  service: one(services, {
    fields: [serviceSchedules.serviceId],
    references: [services.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
}));
