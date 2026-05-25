import { getRequestListener } from "@hono/node-server";
import app from "./boot";

// Vercel serverless function entry point
export default getRequestListener(app.fetch);
