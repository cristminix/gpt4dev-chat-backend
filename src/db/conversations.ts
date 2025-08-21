import { eq, desc } from "drizzle-orm"
import { db } from "."
import { conversations, messages, conversationMembers } from "./schema"
import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"

// Types
export type Conversation = InferSelectModel<typeof conversations>
export type NewConversation = InferInsertModel<typeof conversations>
export type UpdateConversation = Partial<
  Omit<Conversation, "id" | "createdAt" | "updatedAt">
>

// Conversation operations
export const createConversation = async (conversation: NewConversation) => {
  // Generate a UUID if one wasn't provided
  const conversationWithId = {
    ...conversation,
    id: conversation.id || uuidv4(),
  }

  return await db.insert(conversations).values(conversationWithId).returning()
}

export const getConversationById = async (id: string) => {
  return await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .get()
}

export const getAllConversations = async () => {
  return await db
    .select({
      id: conversations.id,
      title: conversations.title,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
    })
    .from(conversations)
    .orderBy(desc(conversations.updatedAt))
    .all()
}
export const getAllConversationsByUserID = async (userId: number) => {
  return await db
    .select({
      id: conversations.id,
      title: conversations.title,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
    })
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt))
    .all()
}
export const updateConversation = async (
  id: string,
  conversation: UpdateConversation
) => {
  // Update the updatedAt timestamp
  const updatedConversation = {
    ...conversation,
    updatedAt: new Date(),
  }

  const result = await db
    .update(conversations)
    .set(updatedConversation)
    .where(eq(conversations.id, id))
    .returning({
      id: conversations.id,
      title: conversations.title,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
    })

  return result
}

export const deleteConversationById = async (id: string) => {
  // Delete all messages related to this conversation first
  await db.delete(messages).where(eq(messages.conversationId, id))

  // Delete all conversation members related to this conversation
  await db
    .delete(conversationMembers)
    .where(eq(conversationMembers.conversationId, id))

  // Finally, delete the conversation itself
  const result = await db
    .delete(conversations)
    .where(eq(conversations.id, id))
    .returning({
      id: conversations.id,
      title: conversations.title,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
    })

  return result
}
