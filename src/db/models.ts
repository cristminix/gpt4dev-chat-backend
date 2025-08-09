import { eq, desc, and, asc } from "drizzle-orm"
import { db } from "."
import {
  participants,
  conversations,
  messages,
  conversationMembers,
} from "./schema"
import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"

// Types
export type Participant = InferSelectModel<typeof participants>
export type NewParticipant = InferInsertModel<typeof participants>

export type Conversation = InferSelectModel<typeof conversations>
export type NewConversation = InferInsertModel<typeof conversations>
export type UpdateConversation = Partial<
  Omit<Conversation, "id" | "createdAt" | "updatedAt">
>

// Helper type for creating conversations with optional timestamps
export type CreateConversationInput = Omit<
  NewConversation,
  "createdAt" | "updatedAt"
>

// Message types
export type Message = InferSelectModel<typeof messages>
export type NewMessage = InferInsertModel<typeof messages>

export type ConversationMember = InferSelectModel<typeof conversationMembers>
export type NewConversationMember = InferInsertModel<typeof conversationMembers>

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

// Conversation operations
export const createConversation = async (
  conversation: CreateConversationInput
) => {
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

export const deleteMessageById = async (id: string) => {
  const result = await db
    .delete(messages)
    .where(eq(messages.id, id))
    .returning()
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
      groupId: messages.groupId,
    })
    .from(messages)
    .innerJoin(participants, eq(messages.participantId, participants.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt))
    .all()
}

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
