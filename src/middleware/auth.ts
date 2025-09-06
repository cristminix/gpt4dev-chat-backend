import { Context, Next } from "hono"
import {
  getUserById,
  getSessionByToken,
  getValidSessionByToken,
} from "../db/models"

// Authentication middleware using sessions
export const authMiddleware = async (c: Context, next: Next) => {
  // Get token from Authorization header
  const authHeader = c.req.header("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { success: false, error: "Missing or invalid authorization token" },
      401
    )
  }

  // Extract token
  const token = authHeader.substring(7)

  // For demo purposes, we'll just check if token exists
  if (!token) {
    return c.json({ success: false, error: "Invalid authorization token" }, 401)
  }

  // Get session info from database
  const session = await getValidSessionByToken(token)

  if (!session) {
    return c.json({ success: false, error: "Invalid or expired session" }, 401)
  }

  // Get user info from database
  const user = await getUserById(session.userId)

  if (!user) {
    return c.json({ success: false, error: "User not found" }, 401)
  }

  // Add user info to context
  c.set("user", { id: user.id, username: user.username })

  await next()
}
