import { eq, and } from "drizzle-orm"
import { db } from "."
import { conversationMembers } from "./schema"
import type { InferInsertModel, InferSelectModel } from "drizzle-orm"

// Types
export type ConversationMember = InferSelectModel<typeof conversationMembers>
export type NewConversationMember = InferInsertModel<typeof conversationMembers>

// Conversation member operations
export const addConversationMember = async (
  conversationMember: NewConversationMember
) => {
  return await db
    .insert(conversationMembers)
    .values(conversationMember)
    .returning()
}

export const getConversationMembers = async (conversationId: string) => {
  return await db
    .select()
    .from(conversationMembers)
    .where(eq(conversationMembers.conversationId, conversationId))
    .all()
}

export const isConversationMember = async (
  conversationId: string,
  participantId: number
) => {
  const member = await db
    .select()
    .from(conversationMembers)
    .where(
      and(
        eq(conversationMembers.conversationId, conversationId),
        eq(conversationMembers.participantId, participantId)
      )
    )
    .get()
  return !!member
}
