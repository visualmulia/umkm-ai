import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { userRouter } from "./user-router";
import { deviceRouter } from "./device-router";
import { productRouter } from "./product-router";
import { knowledgeRouter } from "./knowledge-router";
import { chatRouter } from "./chat-router";
import { messageRouter } from "./message-router";
import { orderRouter } from "./order-router";
import { paymentRouter } from "./payment-router";
import { webhookRouter } from "./webhook-router";
import { analyticsRouter } from "./analytics-router";
import { marketingRouter } from "./marketing-router";
import { adminRouter } from "./admin-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  user: userRouter,
  device: deviceRouter,
  product: productRouter,
  knowledge: knowledgeRouter,
  chat: chatRouter,
  message: messageRouter,
  order: orderRouter,
  payment: paymentRouter,
  webhook: webhookRouter,
  analytics: analyticsRouter,
  marketing: marketingRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
