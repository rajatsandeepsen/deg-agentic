import { createMiddleware } from "hono/factory";
import type { HonoType } from "../type";
import type { BecknDynamicContext, BecknStaticContext } from "../sandbox/tools";
import createClient from "openapi-fetch";


export const initBecknSandbox = createMiddleware<HonoType>(async (c, next) => {

    const client = createClient({
        baseUrl: "https://bap-ps-client-deg.becknprotocol.io",
        headers: {
            Authorization: `Bearer ${c.var.env.SANDBOX_API_KEY}`,
        }
    });

    const staticData = {
        bap_id: "bap-ps-network-deg.becknprotocol.io",
        bap_uri: "https://bap-ps-network-deg.becknprotocol.io",
        bpp_id: "bpp-ps-network-deg.becknprotocol.io",
        bpp_uri: "https://bpp-ps-network-deg.becknprotocol.io",
        domain: "energy",
        version: "1.0.0",
    } satisfies BecknStaticContext

    c.set("sandbox", {
        staticData,
        client,
    });
    await next();
});

export const initWorldEngine = createMiddleware<HonoType>(async (c, next) => {
    const client = createClient({
        baseUrl: "https://playground.becknprotocol.io",
        headers: {
            Authorization: `Bearer ${c.var.env.WORLD_ENGINE_API_KEY}`,
        }
    });

    const staticData = {}

    c.set("worldEngine", {
        staticData,
        client,
    });
    await next();
});