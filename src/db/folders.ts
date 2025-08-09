import { eq, desc } from "drizzle-orm"
import { db } from "."
import { folders, conversations } from "./schema"
import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"

// Types
export type Folder = InferSelectModel<typeof folders>
export type NewFolder = InferInsertModel<typeof folders>
export type UpdateFolder = Partial<
  Omit<Folder, "id" | "createdAt" | "updatedAt">
>

// Folder operations
export const createFolder = async (folder: NewFolder) => {
  // Generate a UUID if one wasn't provided
  const folderWithId = {
    ...folder,
    id: folder.id || uuidv4(),
  }

  return await db.insert(folders).values(folderWithId).returning()
}

export const getFolderById = async (id: string) => {
  return await db.select().from(folders).where(eq(folders.id, id)).get()
}

export const getAllFolders = async () => {
  return await db.select().from(folders).orderBy(desc(folders.updatedAt)).all()
}

export const updateFolder = async (id: string, folder: UpdateFolder) => {
  // Update the updatedAt timestamp
  const updatedFolder = {
    ...folder,
    updatedAt: new Date(),
  }

  const result = await db
    .update(folders)
    .set(updatedFolder)
    .where(eq(folders.id, id))
    .returning()

  return result
}

export const deleteFolderById = async (id: string) => {
  // First, delete all conversations in this folder
  await db.delete(conversations).where(eq(conversations.folderId, id))

  // Then delete the folder itself
  const result = await db.delete(folders).where(eq(folders.id, id)).returning()

  return result
}
