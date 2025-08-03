import { Hono } from "hono"
import {
  createConversation,
  getConversationById,
  getAllConversations,
  updateConversation,
  deleteConversationById,
  createMessage,
  deleteMessageById,
  getMessagesWithParticipantByConversationId,
  createParticipant,
  getParticipantByUsername,
} from "../db/models"

const app = new Hono()

// Create a new conversation
app.post("/conversations", async (c) => {
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
app.get("/conversations", async (c) => {
  try {
    const conversations = await getAllConversations()
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
app.get("/conversations/:id", async (c) => {
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

// Update conversation by ID
app.put("/conversations/:id", async (c) => {
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
app.delete("/conversations/:id", async (c) => {
  try {
    const id = c.req.param("id")

    // Check if conversation exists
    const conversation = await getConversationById(id)
    if (!conversation) {
      return c.json({ success: false, error: "Conversation not found" }, 404)
    }

    // Delete the conversation and all related messages
    const result = await deleteConversationById(id)

    if (result.length === 0) {
      return c.json(
        { success: false, error: "Failed to delete conversation" },
        500
      )
    }

    return c.json({
      success: true,
      message: "Conversation deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting conversation:", error)
    return c.json(
      { success: false, error: "Failed to delete conversation" },
      500
    )
  }
})

// Add a message to a conversation
app.post("/conversations/:conversationId/messages", async (c) => {
  try {
    const conversationId = c.req.param("conversationId")
    const body = await c.req.json()

    // Check if conversation exists
    const conversation = await getConversationById(conversationId)
    if (!conversation) {
      return c.json({ success: false, error: "Conversation not found" }, 404)
    }

    // Create or get participant (LLM or user)
    let participant
    if (body.participantUsername) {
      // Check if participant with this username already exists
      participant = await getParticipantByUsername(body.participantUsername)

      // If not, create a new participant
      if (!participant) {
        const participantData = {
          username: body.participantUsername,
          role: body.participantRole || "user",
        }
        console.log(`Create participant`, participantData)
        const [newParticipant] = await createParticipant(participantData)
        participant = newParticipant
      }
    } else {
      // Create a new participant for this message
      const participantData = {
        username: body.participantName || `participant_${Date.now()}`,
        role: body.participantRole || "user",
      }
      const [newParticipant] = await createParticipant(participantData)
      participant = newParticipant
    }

    console.log(`Using participant`, participant)
    // await new Promise((resolve) => setTimeout(resolve, 512)) // Simulate async operation
    // Create the message
    const message = await createMessage({
      content: body.content,
      conversationId,
      participantId: participant.id,
    })

    return c.json({ success: true, data: message })
  } catch (error) {
    console.error("Error creating message:", error)
    return c.json({ success: false, error: "Failed to create message" }, 400)
  }
})

// Get all messages in a conversation with participant info
app.get("/conversations/:conversationId/messages", async (c) => {
  try {
    const conversationId = c.req.param("conversationId")

    // Check if conversation exists
    const conversation = await getConversationById(conversationId)
    if (!conversation) {
      return c.json({ success: false, error: "Conversation not found" }, 404)
    }

    // Get all messages with participant info
    const messages = await getMessagesWithParticipantByConversationId(
      conversationId
    )
    return c.json({ success: true, data: messages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return c.json({ success: false, error: "Failed to fetch messages" }, 500)
  }
})

// Delete a message by ID
app.delete("/conversations/:conversationId/messages/:messageId", async (c) => {
  try {
    const messageId = parseInt(c.req.param("messageId"))

    // Check if message exists
    // Note: In a production environment, you might want to verify that the message
    // belongs to the specified conversation and that the user has permission to delete it
    const result = await deleteMessageById(messageId)

    if (result.length === 0) {
      return c.json({ success: false, error: "Message not found" }, 404)
    }

    return c.json({ success: true, message: "Message deleted successfully" })
  } catch (error) {
    console.error("Error deleting message:", error)
    return c.json({ success: false, error: "Failed to delete message" }, 500)
  }
})

export default app
