import { tool } from "ai";
import createClient, { type Client } from "openapi-fetch";
import { z } from "zod";
import type { paths as sandboxPath } from "./type";

type SandBoxClient = Client<sandboxPath>;

export type BecknDynamicContext = z.infer<typeof dynamicContext>;
export const dynamicContext = z.object({
    action: z.string().describe("Action to be performed"),
    location: z.object({
        city: z.object({
            code: z.string().describe("City code"),
        }),
        country: z.object({
            code: z.string().describe("Country code"),
        }),
    }),
    transaction_id: z.string().describe("Transaction ID"),
    message_id: z.string().describe("Message ID"),
    timestamp: z.string().describe("Timestamp"),
})

export type BecknStaticContext = z.infer<typeof staticContext>;
export const staticContext = z.object({
    bap_id: z.string().describe("BAP ID"),
    bap_uri: z.string().url().describe("BAP URI"),
    bpp_id: z.string().describe("BPP ID"),
    bpp_uri: z.string().url().describe("BPP URI"),
    domain: z.string().describe("Domain"),
    version: z.string().describe("Version"),
})

// Common context schema (static part, no descriptions)
export const context = staticContext.merge(dynamicContext).describe("Common context schema");
export type BecknContext = z.infer<typeof context>;


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
const tools = (sandboxClient: SandBoxClient, staticData: BecknStaticContext, dynamicData: Omit<BecknDynamicContext, "action">) => ({
    searchProduct: tool({
        description: "Search for solar services.",
        parameters: z.object({
            message: searchMessage,
        }),
        execute: async (args) =>
            await sandboxClient.POST("/search", {
                body: {
                    context: context.parse({ ...staticData, ...dynamicData, action: "search" }),
                    message: args.message,
                },
            }),
    }),

    selectProduct: tool({
        description: "Select provider and items.",
        parameters: z.object({
            message: selectMessage,
        }),
        execute: async (args) =>
            await sandboxClient.POST("/select", {
                body: {
                    context: context.parse({ ...staticData, ...dynamicData, action: "select" }),
                    message: args.message,
                },
            }),
    }),

    initOrder: tool({
        description: "Initialize an order.",
        parameters: z.object({
            message: initMessage,
        }),
        execute: async (args) =>
            await sandboxClient.POST("/init", {
                body: {
                    context: context.parse({ ...staticData, ...dynamicData, action: "init" }),
                    message: args.message,
                },
            }),
    }),

    confirmOrder: tool({
        description: "Confirm an order.",
        parameters: z.object({
            message: confirmMessage,
        }),
        execute: async (args) =>
            await sandboxClient.POST("/confirm", {
                body: {
                    context: context.parse({ ...staticData, ...dynamicData, action: "confirm" }),
                    message: args.message,
                },
            }),
    }),

    statusOrder: tool({
        description: "Check order status.",
        parameters: z.object({
            message: statusMessage,
        }),
        execute: async (args) =>
            await sandboxClient.POST("/status", {
                body: {
                    context: context.parse({ ...staticData, ...dynamicData, action: "status" }),
                    message: args.message,
                },
            }),
    }),
});

export default tools;