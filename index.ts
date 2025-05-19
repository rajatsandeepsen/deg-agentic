import { generateText } from "ai";
import { Hono } from "hono";
import { v4 as uuid } from "uuid";
import { initBecknSandbox, initWorldEngine } from "./lib/beckn";
import { initEnv } from "./lib/context";
import { ToolRunner } from "./lib/tooler";
import { triedAsync } from "./lib/utils";
import sandboxTool, { type BecknDynamicContext } from "./sandbox/tools";
import type { ContextType, HonoType } from "./type";
import worldEngineTool from "./world-engine/tools";

const app = new Hono<HonoType>({
    strict: false,
}).basePath("/api");

app.use(initEnv);

app.use(initBecknSandbox);
app.use(initWorldEngine);

app.get("/chat/sandbox", async (c) => {
    const userText = c.req.query("text");

    if (!userText) {
        return c.json({ message: "No text provided" }, 300);
    }

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

    const response = await generateText({
        model: c.var.model,
        tools: sandboxTool({
            sandboxClient: c.var.sandbox.client,
            staticData: c.var.sandbox.staticData,
            dynamicData
        }),
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

    const response = await generateText({
        model: c.var.model,
        tools: worldEngineTool({
            worldEngineClient: c.var.worldEngine.client,
            staticData: c.var.worldEngine.staticData,
            dynamicData
        }),
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

// Helper for world-engine tool execution
async function handleWorldEngineTool(c: ContextType) {
    const toolName = c.req.param("toolName");
    const body = c.req.method === "GET"
        ? Object(c.req.queries()).flat()
        : await c.req.json();

    if (!toolName) {
        return c.json({ message: "Tool not found" }, 404);
    }

    const dynamicData = {};

    const Executer = ToolRunner(worldEngineTool({
        worldEngineClient: c.var.worldEngine.client,
        staticData: c.var.worldEngine.staticData,
        dynamicData
    }));

    const { data, error, isSuccess } = await triedAsync(Executer(toolName, body));

    if (!isSuccess) {
        return c.json({ message: error.message }, 400);
    }

    return c.json(data);
}

// Helper for sandbox tool execution
async function handleSandboxTool(c: ContextType) {
    const toolName = c.req.param("toolName");
    const body = c.req.method === "GET"
        ? Object(c.req.queries()).flat()
        : await c.req.json();

    if (!toolName) {
        return c.json({ message: "Tool not found" }, 404);
    }

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
    } satisfies Omit<BecknDynamicContext, "action">;

    const Executer = ToolRunner(sandboxTool({
        sandboxClient: c.var.sandbox.client,
        staticData: c.var.sandbox.staticData,
        dynamicData
    }));

    const { data, error, isSuccess } = await triedAsync(Executer(toolName, body));

    if (!isSuccess) {
        return c.json({ message: error.message }, 400);
    }

    return c.json(data);
}

app.get("/api/world-engine/{toolName}", handleWorldEngineTool);
app.post("/api/world-engine/{toolName}", handleWorldEngineTool);

app.get("/api/sandbox/{toolName}", handleSandboxTool);
app.post("/api/sandbox/{toolName}", handleSandboxTool);

export default app;