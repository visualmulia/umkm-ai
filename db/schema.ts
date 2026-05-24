import {
  sqliteTable,
  integer,
  text,
} from "drizzle-orm/sqlite-core";

// ─── Users ───
export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  unionId: text("unionId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  avatar: text("avatar"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  // UMKM fields
  whatsapp: text("whatsapp"),
  businessName: text("businessName"),
  businessCategory: text("businessCategory"),
  city: text("city"),
  plan: text("plan", { enum: ["free", "starter", "pro"] }).default("free").notNull(),
  planExpiresAt: integer("planExpiresAt", { mode: "timestamp" }),
  extraCredits: integer("extraCredits", { mode: "number" }).default(0).notNull(),
  onboardingStep: integer("onboardingStep", { mode: "number" }).default(0).notNull(),
  currentDeviceId: integer("currentDeviceId", { mode: "number" }),
  isActive: integer("isActive", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  lastSignInAt: integer("lastSignInAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Devices (WhatsApp via Kirimi) ───
export const devices = sqliteTable("devices", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).notNull(),
  kirimiDeviceId: text("kirimiDeviceId").notNull(),
  name: text("name").default("Mbak AI").notNull(),
  tone: text("tone", { enum: ["ramah", "profesional", "gaul"] }).default("ramah").notNull(),
  status: text("device_status", { enum: ["active", "inactive", "expired"] }).default("active").notNull(),
  qrCode: text("qrCode"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Device = typeof devices.$inferSelect;

// ─── Products ───
export const products = sqliteTable("products", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).notNull(),
  name: text("name").notNull(),
  price: text("price"), // stored as decimal string
  description: text("description"),
  imageUrl: text("imageUrl"),
  stock: integer("stock", { mode: "number" }).default(0),
  category: text("category"),
  isActive: integer("isActive", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Product = typeof products.$inferSelect;

// ─── Knowledge Base (AI Training) ───
export const knowledge = sqliteTable("knowledge", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).notNull(),
  type: text("knowledge_type", { enum: ["faq", "rule"] }).notNull(),
  question: text("question"),
  answer: text("answer").notNull(),
  priority: integer("priority", { mode: "number" }).default(1).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Knowledge = typeof knowledge.$inferSelect;

// ─── Chats ───
export const chats = sqliteTable("chats", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).notNull(),
  customerPhone: text("customerPhone").notNull(),
  customerName: text("customerName").default("Customer").notNull(),
  deviceId: integer("deviceId", { mode: "number" }),
  lastMessage: text("lastMessage"),
  unreadCount: integer("unreadCount", { mode: "number" }).default(0).notNull(),
  status: text("chat_status", { enum: ["active", "ai_handled", "human_needed"] }).default("active").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Chat = typeof chats.$inferSelect;

// ─── Messages ───
export const messages = sqliteTable("messages", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  chatId: integer("chatId", { mode: "number" }).notNull(),
  sender: text("sender", { enum: ["customer", "ai", "user"] }).notNull(),
  content: text("content").notNull(),
  aiConfidence: text("aiConfidence"), // stored as string (e.g., "0.85")
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Message = typeof messages.$inferSelect;

// ─── Orders ───
export const orders = sqliteTable("orders", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).notNull(),
  chatId: integer("chatId", { mode: "number" }),
  customerPhone: text("customerPhone").notNull(),
  items: text("items").notNull(), // JSON stored as string
  totalAmount: text("totalAmount").notNull(), // decimal as string
  status: text("order_status", {
    enum: ["pending", "paid", "processing", "shipped", "completed", "cancelled"],
  }).default("pending").notNull(),
  paymentLink: text("paymentLink"),
  invoiceNumber: text("invoiceNumber"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Order = typeof orders.$inferSelect;

// ─── Payments ───
export const payments = sqliteTable("payments", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).notNull(),
  amount: text("amount").notNull(), // decimal as string
  status: text("payment_status", { enum: ["pending", "paid", "failed"] }).default("pending").notNull(),
  flipPaymentId: text("flipPaymentId"),
  paidAt: integer("paidAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Payment = typeof payments.$inferSelect;

// ─── Usage Logs ───
export const usageLogs = sqliteTable("usage_logs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).notNull(),
  action: text("action").notNull(),
  details: text("details"), // JSON stored as string
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type UsageLog = typeof usageLogs.$inferSelect;

// ─── Sessions ───
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("userId", { mode: "number" }).notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Session = typeof sessions.$inferSelect;

// ─── Services (for booking system) ───
export const services = sqliteTable("services", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  durationMinutes: integer("durationMinutes", { mode: "number" }).default(60).notNull(),
  price: text("price").notNull(), // decimal as string
  bufferMinutes: integer("bufferMinutes", { mode: "number" }).default(0),
  maxBookingsPerDay: integer("maxBookingsPerDay", { mode: "number" }).default(1),
  depositPercent: integer("depositPercent", { mode: "number" }).default(50),
  isActive: integer("isActive", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Service = typeof services.$inferSelect;

// ─── Service Schedules (weekly template) ───
export const serviceSchedules = sqliteTable("service_schedules", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  serviceId: integer("serviceId", { mode: "number" }).notNull(),
  dayOfWeek: integer("dayOfWeek", { mode: "number" }).notNull(), // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: text("startTime").notNull(), // "HH:mm" format
  endTime: text("endTime").notNull(),     // "HH:mm" format
  isActive: integer("isActive", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type ServiceSchedule = typeof serviceSchedules.$inferSelect;

// ─── Bookings ───
export const bookings = sqliteTable("bookings", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).notNull(),
  serviceId: integer("serviceId", { mode: "number" }).notNull(),
  customerPhone: text("customerPhone").notNull(),
  customerName: text("customerName").default("Customer").notNull(),
  bookingDate: text("bookingDate").notNull(), // "YYYY-MM-dd" format
  startTime: text("startTime").notNull(),     // "HH:mm" format
  endTime: text("endTime").notNull(),         // "HH:mm" format
  status: text("booking_status", { enum: ["inquiry", "pending_deposit", "confirmed", "completed", "cancelled", "no_show"] }).default("inquiry").notNull(),
  depositAmount: text("depositAmount"),       // decimal as string
  totalAmount: text("totalAmount").notNull(), // decimal as string
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Booking = typeof bookings.$inferSelect;
