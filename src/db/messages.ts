import { eq, desc, asc } from "drizzle-orm"
import { db } from "."
import { messages, participants, messageGroupMessages, messageGroups } from "./schema"
import type { InferInsertModel, InferSelectModel } from "drizzle-orm"

// Types
export type Message = InferSelectModel<typeof messages>
export type NewMessage = InferInsertModel<typeof messages>

// Message operations
export const createMessage = async (message: NewMessage) => {
  return await db.insert(messages).values(message).returning()
}

export const getMessagesByConversationId = async (conversationId: string) => {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .all()
}
export const getMessagesById = async (id: string) => {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.id, id))
    .orderBy(desc(messages.createdAt))
    .all()
}
export const deleteMessageById = async (id: string) => {
  console.log(`Attempting to delete message with ID: ${id}`)
  const result = await db
    .delete(messages)
    .where(eq(messages.id, id.toString()))
    .returning()
  console.log(`Delete message result:`, result)
  return result
}

// Refactored function to get messages with participant information including role
export const getMessagesWithParticipantByConversationId = async (
  conversationId: string
) => {
  return await db
    .select({
      id: messages.id,
      content: messages.content,
      username: participants.username,
      role: participants.role,
      createdAt: messages.createdAt,
      parentId: messages.parentId,
      collapsed: messages.collapsed,
      groupId: messageGroupMessages.messageGroupId,
    })
    .from(messages)
    .innerJoin(participants, eq(messages.participantId, participants.id))
    .leftJoin(messageGroupMessages, eq(messages.id, messageGroupMessages.messageId))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt))
    .all()
}
