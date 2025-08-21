import { eq, desc } from "drizzle-orm"
import { db } from "."
import { attachments } from "./schema"
import type { InferInsertModel, InferSelectModel } from "drizzle-orm"

// Types
export type Attachment = InferSelectModel<typeof attachments>
export type NewAttachment = InferInsertModel<typeof attachments>

// Attachment operations
export const createAttachment = async (attachment: NewAttachment) => {
  return await db.insert(attachments).values(attachment).returning()
}

export const getAttachmentById = async (id: string) => {
  return await db.select().from(attachments).where(eq(attachments.id, id)).all()
}

export const getAllAttachments = async () => {
  return await db
    .select()
    .from(attachments)
    .orderBy(desc(attachments.createdAt))
    .all()
}

export const updateAttachmentById = async (
  id: string,
  data: Partial<NewAttachment>
) => {
  return await db
    .update(attachments)
    .set(data)
    .where(eq(attachments.id, id))
    .returning()
}

export const deleteAttachmentById = async (id: string) => {
  return await db.delete(attachments).where(eq(attachments.id, id)).returning()
}
