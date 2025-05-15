import { env as getEnv } from "hono/adapter";
import { createMiddleware } from "hono/factory";
import type { HonoType } from "../type";
import { google } from "@ai-sdk/google";

export const initEnv = createMiddleware<HonoType>(async (c, next) => {
    const BACKEND_URL = new URL(c.req.url).origin;

    const envData = {
        ...getEnv(c),
        BACKEND_URL,
    }

    c.set("env", envData);

    const model = google("gemini-1.5-flash")

    c.set("model", model);
    await next();
});
