import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  numeric,
} from "drizzle-orm/sqlite-core"

export const participants = sqliteTable("participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  role: text("role").notNull().default("member"), // 'admin', 'moderator', 'member'
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
})

export const folders = sqliteTable("folders", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
})

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  systemMessage: text("system_message").default(""),
  enableSystemMessage: numeric("enable_system_message").default("1"),
  folderId: text("folder_id").references(() => folders.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
})

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id),
  participantId: integer("participant_id")
    .notNull()
    .references(() => participants.id),
  content: text("content").notNull(),
  parentId: text("parent_id"),
  collapsed: numeric("collapsed").default("0"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
})

export const conversationMembers = sqliteTable(
  "conversation_members",
  {
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id),
    participantId: integer("participant_id")
      .notNull()
      .references(() => participants.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.conversationId, table.participantId] }),
  })
)

export const messageGroups = sqliteTable("message_groups", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
})

export const messageGroupMessages = sqliteTable(
  "message_group_messages",
  {
    messageId: text("message_id")
      .notNull()
      .references(() => messages.id),
    messageGroupId: text("message_group_id")
      .notNull()
      .references(() => messageGroups.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.messageId, table.messageGroupId] }),
  })
)
