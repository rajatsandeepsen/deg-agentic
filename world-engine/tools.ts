import { tool } from "ai";
import createClient from "openapi-fetch";
import { z } from "zod";
import type { paths as worldEnginePath } from "./type";

const worldEngineClient = createClient<worldEnginePath>({
    baseUrl: "https://api.worldEngine.com",
});

// --- Global Zod Schemas for static fields ---

// Meter static fields for POST /meters
const meterStaticFields = {
    code: z.string(),
    parent: z.number().nullable(),
    energyResource: z.number().nullable(),
    consumptionLoadFactor: z.number(),
    productionLoadFactor: z.number(),
    type: z.string(),
    city: z.string(),
    state: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    pincode: z.string(),
};

// Energy Resource static fields for POST /energy-resources
const energyResourceStaticFields = {
    name: z.string(),
    type: z.string(),
    meter: z.number(),
};

// DER static fields for POST /der
const derStaticFields = {
    energy_resource: z.number(),
    appliance: z.number(),
};

// Query params for GET /meters
const metersGetQueryStatic = {
    "pagination[page]": z.number().optional(),
    "pagination[pageSize]": z.number().optional(),
    "populate[0]": z.literal("parent").optional(),
    "populate[1]": z.literal("energyResource").optional(),
    "populate[2]": z.literal("children").optional(),
    "populate[3]": z.literal("appliances").optional(),
    "sort[0]": z.string().optional(),
};

// Query params for GET /meters/8
const meterByIdGetQueryStatic = {
    "populate[0]": z.literal("parent").optional(),
    "populate[1]": z.literal("children").optional(),
};

// Query params for GET /energy-resources/1326
const energyResourceByIdGetQueryStatic = {
    "populate[0]": z.literal("meter.parent").optional(),
    "populate[1]": z.literal("meter.children").optional(),
    "populate[2]": z.literal("meter.appliances").optional(),
};

export const tools = (staticData: object, dynamicData: object) => ({
    // --- /meters POST ---
    createMeter: tool({
        description: "Create a new Meter.",
        parameters: z.object({
            code: z.string().describe("Meter code."),
            parent: z.number().nullable().describe("Parent meter ID or null."),
            energyResource: z.number().nullable().describe("Associated energy resource ID or null."),
            consumptionLoadFactor: z.number().describe("Consumption load factor."),
            productionLoadFactor: z.number().describe("Production load factor."),
            type: z.string().describe("Meter type."),
            city: z.string().describe("City name."),
            state: z.string().describe("State name."),
            latitude: z.number().describe("Latitude."),
            longitude: z.number().describe("Longitude."),
            pincode: z.string().describe("Pincode."),
        }),
        execute: async (args) => {
            const staticParsed = z.object(meterStaticFields).partial().parse(staticData);
            return await worldEngineClient.POST("/meters", {
                body: { data: { ...staticParsed, ...dynamicData, ...args } }
            });
        },
    }),

    // --- /meters GET ---
    getMeters: tool({
        description: "Get all meters.",
        parameters: z.object({}),
        execute: async () => {
            const queryParams = {
                "pagination[page]": 1,
                "pagination[pageSize]": 10,
                "sort[0]": "id:asc",
                "populate[0]": "parent",
                "populate[1]": "energyResource",
                "populate[2]": "children",
                "populate[3]": "appliances",
            }
            const staticParsed = z.object(metersGetQueryStatic).partial().parse(staticData);
            return await worldEngineClient.GET("/meters", {
                params: { query: { ...staticParsed, ...dynamicData, ...queryParams, } }
            });
        },
    }),

    // --- /meters/:id GET ---
    getMeterById: tool({
        description: "Get meter by ID.",
        parameters: z.object({
            id: z.number().describe("Meter ID."),
        }),
        execute: async (args) => {
            const queryParams = {
                "populate[0]": "parent",
                "populate[1]": "children",
            }
            const staticParsed = z.object(meterByIdGetQueryStatic).partial().parse(staticData);
            return await worldEngineClient.GET(`/meters/${args.id}`, {
                params: { query: { ...staticParsed, ...dynamicData, ...queryParams } }
            });
        },
    }),

    // --- /energy-resources POST ---
    createEnergyResource: tool({
        description: "Create a new Energy Resource.",
        parameters: z.object({
            name: z.string().describe("Household name."),
            type: z.string().describe("Household type."),
            meter: z.number().describe("Associated meter ID."),
        }),
        execute: async (args) => {
            const staticParsed = z.object(energyResourceStaticFields).partial().parse(staticData);
            return await worldEngineClient.POST("/energy-resources", {
                body: { data: { ...staticParsed, ...dynamicData, ...args } }
            });
        },
    }),

    // --- /energy-resources/:id GET ---
    getEnergyResourceById: tool({
        description: "Get Energy Resource by ID.",
        parameters: z.object({
            id: z.number().describe("Energy Resource ID."),
        }),
        execute: async (args) => {
            const queryParams = {
                "populate[0]": "meter.parent",
                "populate[1]": "meter.children",
                "populate[2]": "meter.appliances",
            }
            const staticParsed = z.object(energyResourceByIdGetQueryStatic).partial().parse(staticData);
            return await worldEngineClient.GET(`/energy-resources/${args.id}`, {
                params: { query: { ...staticParsed, ...dynamicData, ...queryParams } }
            });
        },
    }),

    // --- /energy-resources/:id DELETE ---
    deleteEnergyResourceById: tool({
        description: "Delete Energy Resource by ID.",
        parameters: z.object({
            id: z.number().describe("Energy Resource ID."),
        }),
        execute: async (args) => {
            // No static/dynamic schema for this endpoint
            return await worldEngineClient.DELETE(`/energy-resources/${args.id}`, {});
        },
    }),

    // --- /der POST ---
    createDER: tool({
        description: "Create a DER.",
        parameters: z.object({
            energy_resource: z.number().describe("Energy resource ID."),
            appliance: z.number().describe("Appliance ID."),
        }),
        execute: async (args) => {
            const staticParsed = z.object(derStaticFields).partial().parse(staticData);
            return await worldEngineClient.POST("/der", {
                body: { ...staticParsed, ...dynamicData, ...args }
            });
        },
    }),

    // --- /toggle-der/:id POST ---
    toggleDER: tool({
        description: "Toggle DER switching.",
        parameters: z.object({
            id: z.number().describe("DER ID."),
        }),
        execute: async (args) => {
            // No static/dynamic schema for this endpoint
            return await worldEngineClient.POST(`/toggle-der/${args.id}`, {});
        },
    }),

    // --- /utility/reset PUT ---
    resetWorldEngine: tool({
        description: "Reset World Engine data.",
        parameters: z.object({}),
        execute: async () =>
            await worldEngineClient.PUT("/utility/reset", {}),
    }),
});

export default tools;