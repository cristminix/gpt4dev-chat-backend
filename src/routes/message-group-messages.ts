import { Hono } from "hono"
import {
  createMessageGroupMessage,
  getMessageGroupMessagesByGroupId,
  getMessageGroupById,
  deleteMessageGroupMessage,
} from "../db/models"

const app = new Hono()

// Message group message routes
app.post("/:messageGroupId", async (c) => {
  try {
    const messageGroupId = c.req.param("messageGroupId")
    const body = await c.req.json()

    // Check if message group exists
    const messageGroup = await getMessageGroupById(messageGroupId)
    if (!messageGroup) {
      return c.json({ success: false, error: "Message group not found" }, 404)
    }

    // Create the message group message
    const messageGroupMessage = await createMessageGroupMessage({
      messageId: body.messageId,
      messageGroupId,
    })

    return c.json({ success: true, data: messageGroupMessage })
  } catch (error) {
    console.error("Error creating message group message:", error)
    return c.json(
      { success: false, error: "Failed to create message group message" },
      400
    )
  }
})

app.get("/:messageGroupId", async (c) => {
  try {
    const messageGroupId = c.req.param("messageGroupId")

    // Check if message group exists
    const messageGroup = await getMessageGroupById(messageGroupId)
    if (!messageGroup) {
      return c.json({ success: false, error: "Message group not found" }, 404)
    }

    // Get all message group messages
    const messageGroupMessages = await getMessageGroupMessagesByGroupId(
      messageGroupId
    )
    return c.json({ success: true, data: messageGroupMessages })
  } catch (error) {
    console.error("Error fetching message group messages:", error)
    return c.json(
      { success: false, error: "Failed to fetch message group messages" },
      500
    )
  }
})

app.delete("/:messageGroupId/:messageId", async (c) => {
  try {
    const messageGroupId = c.req.param("messageGroupId")
    const messageId = c.req.param("messageId")

    // Check if message group exists
    const messageGroup = await getMessageGroupById(messageGroupId)
    if (!messageGroup) {
      return c.json({ success: false, error: "Message group not found" }, 404)
    }

    // Delete the message group message
    const result = await deleteMessageGroupMessage(messageId, messageGroupId)

    if (result.length === 0) {
      return c.json(
        { success: false, error: "Message group message not found" },
        404
      )
    }

    return c.json({
      success: true,
      message: "Message group message deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting message group message:", error)
    return c.json(
      { success: false, error: "Failed to delete message group message" },
      500
    )
  }
})

export default app
