import { Hono } from "hono"
import {
  createConversation,
  getConversationById,
  getAllConversations,
  updateConversation,
  deleteConversationById,
  getMessageGroupsByConversationId,
  getMessageGroupMessagesByGroupId,
  deleteMessageById,
  deleteMessageGroupMessage,
  deleteMessageGroupById,
  deleteMessageByConversationId,
} from "../db/models"
import {
  getAllConversationsByUserID,
  getConversationCountByUserID,
} from "src/db/conversations"

const app = new Hono()

// Create a new conversation
app.post("/", async (c) => {
  try {
    const body = await c.req.json()
    const conversation = await createConversation(body)
    return c.json({ success: true, data: conversation })
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to create conversation" },
      400
    )
  }
})

// Get all conversations
app.get("/users/:userId", async (c) => {
  try {
    const userId = parseInt(c.req.param("userId"))
    const conversations = await getAllConversationsByUserID(userId)
    return c.json({ success: true, data: conversations })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return c.json(
      { success: false, error: "Failed to fetch conversations" },
      500
    )
  }
})

// Get conversation by ID
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const conversation = await getConversationById(id)

    if (!conversation) {
      return c.json({ success: false, error: "Conversation not found" }, 404)
    }

    return c.json({ success: true, data: conversation })
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch conversation" },
      500
    )
  }
})

// Get message groups by conversation ID
app.get("/:id/message-groups", async (c) => {
  try {
    const id = c.req.param("id")

    // Check if conversation exists
    const conversation = await getConversationById(id)
    if (!conversation) {
      return c.json({ success: false, error: "Conversation not found" }, 404)
    }

    // Get message groups by conversation ID
    const messageGroups = await getMessageGroupsByConversationId(id)

    return c.json({
      success: true,
      data: messageGroups,
    })
  } catch (error) {
    console.error("Error fetching message groups:", error)
    return c.json(
      { success: false, error: "Failed to fetch message groups" },
      500
    )
  }
})

// Get count of conversations by user ID
app.get("/users/:userId/counts", async (c) => {
  try {
    const userId = parseInt(c.req.param("userId"))
    const count = await getConversationCountByUserID(userId)
    return c.json({ success: true, data: { count } })
  } catch (error) {
    console.error("Error fetching conversation count:", error)
    return c.json(
      { success: false, error: "Failed to fetch conversation count" },
      500
    )
  }
})

// Update conversation by ID
app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const body = await c.req.json()

    // Check if conversation exists
    const conversation = await getConversationById(id)
    if (!conversation) {
      return c.json({ success: false, error: "Conversation not found" }, 404)
    }

    // Update the conversation
    const updatedConversation = await updateConversation(id, body)

    if (updatedConversation.length === 0) {
      return c.json(
        { success: false, error: "Failed to update conversation" },
        500
      )
    }

    return c.json({
      success: true,
      data: updatedConversation[0],
      message: "Conversation updated successfully",
    })
  } catch (error) {
    console.error("Error updating conversation:", error)
    return c.json(
      { success: false, error: "Failed to update conversation" },
      500
    )
  }
})

// Delete conversation by ID
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id")

    // Check if conversation exists
    const conversation = await getConversationById(id)
    if (!conversation) {
      return c.json({ success: false, error: "Conversation not found" }, 404)
    }

    // Get message groups by conversation
    const messageGroups = await getMessageGroupsByConversationId(id)
    for (const group of messageGroups) {
      const groupId = group.id
      const messageGroupMessages = await getMessageGroupMessagesByGroupId(
        groupId
      )

      for (const mgm of messageGroupMessages) {
        const { messageId } = mgm
        await deleteMessageGroupMessage(messageId, groupId)
        try {
          await deleteMessageById(messageId)
        } catch (error) {
          console.error(error)
        }
      }
      console.log({ messageGroupMessages })
      await deleteMessageGroupById(groupId)
    }
    console.log({ messageGroups })
    let result = await deleteMessageByConversationId(id)

    // Delete the conversation and all related messages
    //@ts-ignore
    result = await deleteConversationById(id)

    if (result.length === 0) {
      return c.json(
        { success: false, error: "Failed to delete conversation" },
        500
      )
    }

    return c.json({
      success: true,
      message: "Conversation deleted successfully",
      data: conversation,
    })
  } catch (error) {
    console.error("Error deleting conversation:", error)
    return c.json(
      { success: false, error: "Failed to delete conversation" },
      500
    )
  }
})

export default app
