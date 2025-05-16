import { generateText } from "ai";
import { Hono } from "hono";
import { initEnv } from "./lib/context";
import sandboxTool, { type BecknContext, type BecknDynamicContext, type BecknStaticContext } from "./sandbox/tools";
import type { HonoType } from "./type";
import { v4 as uuid } from "uuid";
import worldEngineTool from "./world-engine/tools";
import createClient from "openapi-fetch";

const app = new Hono<HonoType>({
    strict: false,
}).basePath("/api");

app.use(initEnv);

app.get("/chat/sandbox", async (c) => {
    const userText = c.req.query("text");

    if (!userText) {
        return c.json({ message: "No text provided" }, 300);
    }

    const staticData = {
        bap_id: "bap-ps-network-deg.becknprotocol.io",
        bap_uri: "https://bap-ps-network-deg.becknprotocol.io",
        bpp_id: "bpp-ps-network-deg.becknprotocol.io",
        bpp_uri: "https://bpp-ps-network-deg.becknprotocol.io",
        domain: "energy",
        version: "1.0.0",
    } satisfies BecknStaticContext

    const dynamicData = {
        timestamp: Date.now().toLocaleString(),
        message_id: uuid(),
        location: {
            city: {
                code: "city_code",
            },
            country: {
                code: "country_code",
            },
        },
        transaction_id: uuid(),

    } satisfies Omit<BecknDynamicContext, "action">

    const sandboxClient = createClient({
        baseUrl: "https://bap-ps-client-deg.becknprotocol.io",
        headers: {
            Authorization: `Bearer ${c.var.env.SANDBOX_API_KEY}`,
        }
    });

    const response = await generateText({
        model: c.var.model,
        tools: sandboxTool(sandboxClient, staticData, dynamicData),
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

    const worldEngineClient = createClient({
        baseUrl: "https://playground.becknprotocol.io",
        headers: {
            Authorization: `Bearer ${c.var.env.WORLD_ENGINE_API_KEY}`,
        }
    });

    const dynamicData = {}
    const staticData = {}

    const response = await generateText({
        model: c.var.model,
        tools: worldEngineTool(worldEngineClient, staticData, dynamicData),
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