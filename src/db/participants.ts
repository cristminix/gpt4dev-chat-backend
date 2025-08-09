import { eq } from "drizzle-orm"
import { db } from "."
import { participants } from "./schema"
import type { InferInsertModel, InferSelectModel } from "drizzle-orm"

// Types
export type Participant = InferSelectModel<typeof participants>
export type NewParticipant = InferInsertModel<typeof participants>

// Participant operations
export const createParticipant = async (participant: NewParticipant) => {
  return await db.insert(participants).values(participant).returning()
}

export const getParticipantById = async (id: number) => {
  return await db
    .select()
    .from(participants)
    .where(eq(participants.id, id))
    .get()
}

export const getParticipantByUsername = async (username: string) => {
  return await db
    .select()
    .from(participants)
    .where(eq(participants.username, username))
    .get()
}
