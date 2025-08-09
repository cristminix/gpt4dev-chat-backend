import { eq, and } from "drizzle-orm"
import { db } from "."
import { messageGroupMessages } from "./schema"
import type { InferInsertModel, InferSelectModel } from "drizzle-orm"

// Types
export type MessageGroupMessage = InferSelectModel<typeof messageGroupMessages>
export type NewMessageGroupMessage = InferInsertModel<
  typeof messageGroupMessages
>

// Message group message operations
export const createMessageGroupMessage = async (
  messageGroupMessage: NewMessageGroupMessage
) => {
  return await db
    .insert(messageGroupMessages)
    .values(messageGroupMessage)
    .returning()
}

export const getMessageGroupMessagesByGroupId = async (
  messageGroupId: string
) => {
  return await db
    .select()
    .from(messageGroupMessages)
    .where(eq(messageGroupMessages.messageGroupId, messageGroupId))
    .all()
}

export const getMessageGroupMessagesByMessageId = async (messageId: string) => {
  return await db
    .select()
    .from(messageGroupMessages)
    .where(eq(messageGroupMessages.messageId, messageId))
    .all()
}

export const deleteMessageGroupMessage = async (
  messageId: string,
  messageGroupId: string
) => {
  const result = await db
    .delete(messageGroupMessages)
    .where(
      and(
        eq(messageGroupMessages.messageId, messageId),
        eq(messageGroupMessages.messageGroupId, messageGroupId)
      )
    )
    .returning()

  return result
}
