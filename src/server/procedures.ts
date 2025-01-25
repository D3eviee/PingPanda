import { db } from "@/db"
import { j } from "./__internals/j"
import { currentUser } from "@clerk/nextjs/server"
import { HTTPException } from "hono/http-exception"
/*
* This is the base piece you use to build new queries and mutations on your API.
*/

const authMiddleware = j.middleware(async ({ c, next }) => {

    const authHeader = c.req.header("Authorization")

    if (authHeader) {
        // Bearer <API_KEYY>  
        const apiKey = authHeader.split(" ")[1]
        const user = await db.user.findUnique({
            where: { apiKey }
        })

        if (user) return next({ user })
    }

    const auth = await currentUser()
    if (!auth) {
        throw new HTTPException(401, { message: "Unothorized" })
    }

    const user = await db.user.findUnique({
        where: { externalId: auth.id }
    })

    if (!user) {
        throw new HTTPException(401, { message: "Unothorized" })
    }

    return next({user})
})

export const baseProcedure = j.procedure
export const publicProcedure = baseProcedure

export const privateProcedure = publicProcedure.use(authMiddleware)