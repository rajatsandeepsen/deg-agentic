import { generateText } from "ai";
import { Hono } from "hono";
import { initEnv } from "./lib/context";
import sandboxTool from "./sandbox/tools";
import type { HonoType } from "./type";
import worldEngineTool from "./world-engine/tools";

const app = new Hono<HonoType>({
    strict: false,
}).basePath("/api");

app.use(initEnv);

app.get("/chat/sandbox", async (c) => {
    const userText = c.req.query("text");

    if (!userText) {
        return c.json({ message: "No text provided" }, 300);
    }

    const dynamicData = {}
    const staticData = {}

    const response = await generateText({
        model: c.var.model,
        tools: sandboxTool(staticData, dynamicData),
        system: "You are a helpful assistant.",
        toolChoice: "auto",
        maxSteps: 4,
        messages: [
            {
                role: "user",
                content: userText,
            },
        ],
    })

    return c.json(response.steps)
})

app.get("/chat/world-engine", async (c) => {
    const userText = c.req.query("text");

    if (!userText) {
        return c.json({ message: "No text provided" }, 300);
    }

    const dynamicData = {}
    const staticData = {}

    const response = await generateText({
        model: c.var.model,
        tools: worldEngineTool(staticData, dynamicData),
        system: "You are a helpful assistant.",
        toolChoice: "auto",
        maxSteps: 4,
        messages: [
            {
                role: "user",
                content: userText,
            },
        ],
    })

    return c.json(response.steps)

})

export default app;