import { env } from "@monoexpo/env/server"
import { TRPCError, initTRPC } from "@trpc/server"
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import jwt, { JwtPayload } from "jsonwebtoken"

/**
 * Extract authorization header from request and pass to trpc routes
 * @param opts
 * @returns
 */
export const createContext = async (opts: FetchCreateContextFnOptions) => {
	return {
		authorization: opts.req?.headers.get("Authorization")?.split(" ")[1],
	} as {
		authorization?: string
	}
}

const t = initTRPC.context<typeof createContext>().create()

/**
 * Take authorization from context, decode JWT and authenticate the user.
 * For routes that require an active user
 * @param opts
 * @returns
 */
const withAuthentication = t.middleware(({ ctx, next }) => {
	console.log("CALLING ROUTE WITH AUTHENTICATION")
	const publicKey = env.CLERK_PEM_PUBLIC_KEY
	console.log(publicKey)

	const token = ctx.authorization
	console.log(token)

	if (!token) {
		throw new TRPCError({ code: "UNAUTHORIZED" })
	}

	const decoded = jwt.verify(token, publicKey) as JwtPayload

	console.log(`Session ID ${decoded["sid"]} and User ID ${decoded.sub}`)

	if (!decoded.sub || !(decoded["sid"] as string)) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: `Session ID ${decoded["sid"]} and User ID ${decoded.sub}`,
		})
	}

	return next({
		ctx: {
			userId: decoded.sub,
			sessionId: decoded["sid"],
		},
	})
})

/**
 * Use authorization expecting server environmental variable APIKEY from internal calls from serverless function call
 * Used for routes that are updated within the server. Webhooks etc
 * NOT FOR USER CALLED ACTIONS
 */
const withInternal = t.middleware(({ ctx, next }) => {
	console.log("CALLING ROUTE WITH INTERNAL AUTHORIZATION GUARDS")
	const apiKey = ctx.authorization
	console.log(apiKey)

	if (apiKey !== env.PROJECT_INTERNAL_API_KEY) {
		throw new TRPCError({ code: "UNAUTHORIZED" })
	}

	return next()
})

export const createTRPCRouter = t.router

export const publicProcedure = t.procedure

export const authenticatedProcedure = t.procedure.use(withAuthentication)

export const internalProcedure = t.procedure.use(withInternal)

export const createCallerFactory = t.createCallerFactory
