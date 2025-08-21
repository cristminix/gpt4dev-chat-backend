import { Context, Next } from "hono"
import { getUserById } from "../db/models"

// Mock authentication middleware
// In a real application, this would check for a valid JWT or session
export const authMiddleware = async (c: Context, next: Next) => {
  // Get token from Authorization header
  const authHeader = c.req.header("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { success: false, error: "Missing or invalid authorization token" },
      401
    )
  }

  // Extract token (in a real app, you would verify the token)
  const token = authHeader.substring(7)

  // For demo purposes, we'll just check if token exists
  if (!token) {
    return c.json({ success: false, error: "Invalid authorization token" }, 401)
  }

  // Get user info from database (simplified)
  const user = await getUserById(1) // In a real app, you would get the user ID from the token

  if (!user) {
    return c.json({ success: false, error: "User not found" }, 401)
  }

  // Add user info to context
  c.set("user", { id: user.id, username: user.username })

  await next()
}
