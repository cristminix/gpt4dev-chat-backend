import { Context, Next } from "hono"

export const requestLogger = async (c: Context, next: Next) => {
  const start = Date.now()

  // Log request
  console.log(`--> ${c.req.method} ${c.req.url}`)

  await next()

  // Log response
  const ms = Date.now() - start
  console.log(`<-- ${c.req.method} ${c.req.url} ${c.res.status} ${ms}ms`)
}
