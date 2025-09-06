import { sql } from "drizzle-orm"
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
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
})

export const folders = sqliteTable("folders", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
})

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  systemMessage: text("system_message").default(""),
  userId: integer("user_id").default(1),
  enableSystemMessage: numeric("enable_system_message").default("1"),
  folderId: text("folder_id").references(() => folders.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
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
  reasoningContent: text("reasoning_content"),
  collapsed: numeric("collapsed").default("0"),
  hasError: numeric("has_error").default("0"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
})

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  fullname: text("fullname").notNull(),
  passwd: text("passwd").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
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
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
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

export const attachments = sqliteTable("attachments", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  mimetype: text("mimetype").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
})

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
})
