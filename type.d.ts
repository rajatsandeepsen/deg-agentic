import type { Client, ClientPathsWithMethod } from "openapi-fetch";

type PathExtracted<T> = T extends Client<infer P> ? P : never;

type MethodExtracted<T> = T extends ClientPathsWithMethod<C, infer P> ? keyof P : never;

type HttpMethod = "get" | "post" | "put" | "delete" | "patch";

type MergeBodyQueryParams<B, Q> = {
    [K in keyof B]: K extends keyof Q ? never : K
} & {
    [K in keyof Q]: K extends keyof B ? never : K
}

import type { createEnvironment } from "@/env-hono";
import type { TriedAsync } from "@/lib/utils";
import type { LanguageModel } from "ai";

export type Env = ReturnType<typeof createEnvironment>;

export type Variables = {
	env: Env;
    model: LanguageModel
};

import type { Context } from "hono";

type Bindings = {
	HOSTNAME: string;
};

export type HonoType = { Bindings: Bindings; Variables: Variables };
export type ContextType = Context<HonoType>;