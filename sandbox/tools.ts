import { tool } from "ai";
import createClient from "openapi-fetch";
import { z } from "zod";
import type { paths as sandboxPath } from "./type";

const sandboxClient = createClient<sandboxPath>({
    baseUrl: "https://api.sandbox.com",
});

// Common context schema (static part, no descriptions)
const context = z.object({
    action: z.string(),
    bap_id: z.string(),
    bap_uri: z.string().url(),
    bpp_id: z.string(),
    bpp_uri: z.string().url(),
    domain: z.string(),
    location: z.object({
        city: z.object({
            code: z.string(),
        }),
        country: z.object({
            code: z.string(),
        }),
    }),
    message_id: z.string(),
    timestamp: z.string(),
    transaction_id: z.string(),
    version: z.string(),
});

// /search tool
const searchMessage = z.object({
    intent: z.object({
        descriptor: z.object({
            name: z.string().describe("Search intent (e.g., service name)"),
        }),
    }),
}).describe("Search message");

// /select tool
const selectMessage = z.object({
    order: z.object({
        provider: z.object({ id: z.string().describe("Provider ID") }),
        items: z.array(z.object({ id: z.string().describe("Item ID") })),
    }),
}).describe("Select message");

// /init tool
const initMessage = z.object({
    order: z.object({
        provider: z.object({ id: z.string().describe("Provider ID") }),
        items: z.array(z.object({ id: z.string().describe("Item ID") })),
    }),
}).describe("Init message");

// /confirm tool
const confirmMessage = z.object({
    order: z.object({
        provider: z.object({ id: z.string().describe("Provider ID") }),
        items: z.array(z.object({ id: z.string().describe("Item ID") })),
        fulfillments: z.array(
            z.object({
                id: z.string().describe("Fulfillment ID"),
                customer: z.object({
                    person: z.object({ name: z.string().describe("Customer name") }),
                    contact: z.object({
                        phone: z.string().describe("Customer phone"),
                        email: z.string().describe("Customer email"),
                    }),
                }),
            })
        ),
    }),
}).describe("Confirm message");

// /status tool
const statusMessage = z.object({
    order_id: z.string().describe("Order ID to check status"),
}).describe("Status message");

// Tools object
const tools = (staticData: object, dynamicData: object) => ({
    searchProduct: tool({
        description: "Search for solar services.",
        parameters: z.object({
            context,
            message: searchMessage,
        }),
        execute: async (args) =>
            await sandboxClient.POST("/search", {
                body: {
                    context: { ...context.partial().parse(staticData), ...dynamicData, ...args.context },
                    message: args.message,
                },
            }),
    }),

    selectProduct: tool({
        description: "Select provider and items.",
        parameters: z.object({
            context,
            message: selectMessage,
        }),
        execute: async (args) =>
            await sandboxClient.POST("/select", {
                body: {
                    context: { ...context.partial().parse(staticData), ...dynamicData, ...args.context },
                    message: args.message,
                },
            }),
    }),

    initOrder: tool({
        description: "Initialize an order.",
        parameters: z.object({
            context,
            message: initMessage,
        }),
        execute: async (args) =>
            await sandboxClient.POST("/init", {
                body: {
                    context: { ...context.partial().parse(staticData), ...dynamicData, ...args.context },
                    message: args.message,
                },
            }),
    }),

    confirmOrder: tool({
        description: "Confirm an order.",
        parameters: z.object({
            context,
            message: confirmMessage,
        }),
        execute: async (args) =>
            await sandboxClient.POST("/confirm", {
                body: {
                    context: { ...context.partial().parse(staticData), ...dynamicData, ...args.context },
                    message: args.message,
                },
            }),
    }),

    statusOrder: tool({
        description: "Check order status.",
        parameters: z.object({
            context,
            message: statusMessage,
        }),
        execute: async (args) =>
            await sandboxClient.POST("/status", {
                body: {
                    context: { ...context.partial().parse(staticData), ...dynamicData, ...args.context },
                    message: args.message,
                },
            }),
    }),
});

export default tools;