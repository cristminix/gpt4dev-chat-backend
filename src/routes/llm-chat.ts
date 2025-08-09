import { Hono } from "hono"
import foldersRoutes from "./folders"
import conversationsRoutes from "./conversations"
import messagesRoutes from "./messages"
import messageGroupsRoutes from "./message-groups"
import messageGroupMessagesRoutes from "./message-group-messages"

const app = new Hono()

// Mount routes
app.route("/folders", foldersRoutes)
app.route("/conversations", conversationsRoutes)
app.route("/messages", messagesRoutes)
app.route("/message-groups", messageGroupsRoutes)
app.route("/message-group-messages", messageGroupMessagesRoutes)

export default app
