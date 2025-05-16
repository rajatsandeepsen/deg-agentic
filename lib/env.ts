import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { getURL } from "./utils";

export const createEnvironment = (env: NodeJS.Process["env"]) =>
	createEnv({
		/**
		 * Specify your server-side environment variables schema here. This way you can ensure the app
		 * isn't built with invalid env vars.
		 */
		server: {
			BACKEND_URL: z.string().url(),
            GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
            SANDBOX_API_KEY: z.string(),
            WORLD_ENGINE_API_KEY: z.string(),
		},

		/**
		 * Specify your client-side environment variables schema here. This way you can ensure the app
		 * isn't built with invalid env vars. To expose them to the client, prefix them with
		 * `NEXT_PUBLIC_`.
		 */
		client: {},

		/**
		 * You can't destruct `env.env` as a regular object in the Next.js edge runtimes (e.g.
		 * middlewares) or client-side so we need to destruct manually.
		 */
		runtimeEnv: {
			BACKEND_URL: getURL(env.BACKEND_URL),
            GOOGLE_GENERATIVE_AI_API_KEY: env.GOOGLE_GENERATIVE_AI_API_KEY,
            SANDBOX_API_KEY: env.SANDBOX_API_KEY,
            WORLD_ENGINE_API_KEY: env.WORLD_ENGINE_API_KEY,
		},
		/**
		 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
		 * useful for Docker builds.
		 */
		skipValidation: !!env.SKIP_ENV_VALIDATION,
		/**
		 * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
		 * `SOME_VAR=''` will throw an error.
		 */
		emptyStringAsUndefined: true,
	});