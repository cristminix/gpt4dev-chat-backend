import { eq, and, lt } from "drizzle-orm"
import { db } from "."
import { sessions } from "./schema"
import type { InferInsertModel, InferSelectModel } from "drizzle-orm"

// Types
export type Session = InferSelectModel<typeof sessions>
export type NewSession = InferInsertModel<typeof sessions>

// Session operations
export const createSession = async (session: NewSession) => {
  return await db.insert(sessions).values(session).returning()
}

export const getSessionById = async (id: string) => {
  return await db.select().from(sessions).where(eq(sessions.id, id)).get()
}

export const getSessionByToken = async (token: string) => {
  return await db
    .select()
    .from(sessions)
    .where(eq(sessions.sessionToken, token))
    .get()
}

export const getValidSessionByToken = async (token: string) => {
  const now = new Date()
  return await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.sessionToken, token), lt(sessions.expiresAt, now)))
    .get()
}

export const deleteSessionById = async (id: string) => {
  return await db.delete(sessions).where(eq(sessions.id, id)).returning()
}

export const deleteSessionByToken = async (token: string) => {
  return await db
    .delete(sessions)
    .where(eq(sessions.sessionToken, token))
    .returning()
}

export const deleteExpiredSessions = async () => {
  const now = new Date()
  return await db
    .delete(sessions)
    .where(lt(sessions.expiresAt, now))
    .returning()
}
