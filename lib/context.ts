import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { env as getEnv } from "hono/adapter";
import { createMiddleware } from "hono/factory";
import { createEnvironment } from "./env";
import type { HonoType } from "../type";

export const initEnv = createMiddleware<HonoType>(async (c, next) => {
    const BACKEND_URL = new URL(c.req.url).origin;

    const envData = createEnvironment({
        ...getEnv(c),
        BACKEND_URL,
    })

    c.set("env", envData);

    const model = createGoogleGenerativeAI({
        apiKey: envData.GOOGLE_GENERATIVE_AI_API_KEY,
    })

    c.set("model", model("gemini-1.5-flash"));
    await next();
});
