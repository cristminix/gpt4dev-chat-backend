import { eq } from "drizzle-orm"
import { db } from "."
import { users } from "./schema"
import type { InferInsertModel, InferSelectModel } from "drizzle-orm"

// Types
export type User = InferSelectModel<typeof users>
export type NewUser = InferInsertModel<typeof users>

// User operations
export const createUser = async (user: NewUser) => {
  return await db.insert(users).values(user).returning()
}

export const getUserById = async (id: number) => {
  return await db.select().from(users).where(eq(users.id, id)).get()
}

export const getUserByUsername = async (username: string) => {
  return await db.select().from(users).where(eq(users.username, username)).get()
}

export const getUserByEmail = async (email: string) => {
  return await db.select().from(users).where(eq(users.email, email)).get()
}
