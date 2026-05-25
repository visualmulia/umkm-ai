import { serve } from "@hono/node-server";
import { env } from "./api/lib/env";
import app from "./api/boot";

// Local development / standalone server entry point
const port = parseInt(process.env.PORT || "3000");

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
