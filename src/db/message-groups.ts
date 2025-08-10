import { eq } from "drizzle-orm"
import { db } from "."
import { messageGroups, messageGroupMessages } from "./schema"
import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"

// Types
export type MessageGroup = InferSelectModel<typeof messageGroups>
export type NewMessageGroup = InferInsertModel<typeof messageGroups>

// Message group operations
export const createMessageGroup = async (messageGroup: NewMessageGroup) => {
  // Generate a UUID if one wasn't provided
  const messageGroupWithId = {
    ...messageGroup,
    id: messageGroup.id || uuidv4(),
  }

  return await db.insert(messageGroups).values(messageGroupWithId).returning()
}



export const getAllMessageGroups = async () => {
  return await db.select().from(messageGroups).all()
}

export const getMessageGroupById = async (id: string) => {
  return await db
    .select()
    .from(messageGroups)
    .where(eq(messageGroups.id, id))
    .get()
}

export const getMessageGroupsByConversationId = async (conversationId: string) => {
  return await db
    .select()
    .from(messageGroups)
    .where(eq(messageGroups.conversationId, conversationId))
    .all()
}

export const checkMessageGroupExists = async (id: string) => {
  const result = await db
    .select({ id: messageGroups.id })
    .from(messageGroups)
    .where(eq(messageGroups.id, id))
    .get()

  return !!result
}

export const updateMessageGroup = async (
  id: string,
  messageGroup: Partial<MessageGroup>
) => {
  // Update the updatedAt timestamp
  const updatedMessageGroup = {
    ...messageGroup,
    updatedAt: new Date(),
  }

  const result = await db
    .update(messageGroups)
    .set(updatedMessageGroup)
    .where(eq(messageGroups.id, id))
    .returning()

  return result
}

export const deleteMessageGroupById = async (id: string) => {
  // First, delete all message group messages related to this message group
  await db
    .delete(messageGroupMessages)
    .where(eq(messageGroupMessages.messageGroupId, id))

  // Then delete the message group itself
  const result = await db
    .delete(messageGroups)
    .where(eq(messageGroups.id, id))
    .returning()

  return result
}
