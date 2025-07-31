import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { requestLogger } from "./middleware/logger"
import chatRoutes from "./routes/chat"
import llmChatRoutes from "./routes/llm-chat"

// Extend Hono context type
declare module "hono" {
  interface ContextVariableMap {
    user: {
      id: number
      username: string
    }
  }
}

const app = new Hono()

// Middleware
app.use("*", logger())
app.use("*", requestLogger)
app.use("*", cors())

// Routes
app.route("/api", chatRoutes)
app.route("/api/llm", llmChatRoutes)

// Health check endpoint
app.get("/", (c) => {
  return c.json({
    success: true,
    message: "Chat Backend API is running!",
    timestamp: new Date().toISOString(),
  })
})

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, error: "Route not found" }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error("Error:", err)
  return c.json({ success: false, error: "Internal server error" }, 500)
})

export default app
