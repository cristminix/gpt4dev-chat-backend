import app from "./index"
import { serve } from "@hono/node-server"

const port = parseInt(process.env.PORT || "5007")

console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
