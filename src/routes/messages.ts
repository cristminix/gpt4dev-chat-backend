import { Hono } from "hono"
import {
  createMessage,
  deleteMessageById,
  getMessagesWithParticipantByConversationId,
  getParticipantByUsername,
  createParticipant,
  createMessageGroupMessage,
} from "../db/models"

const app = new Hono()

// Add a message to a conversation
app.post("/conversations/:conversationId", async (c) => {
  try {
    const conversationId = c.req.param("conversationId")
    const body = await c.req.json()

    // Create or get participant (LLM or user)
    let participant
    if (body.username) {
      // Check if participant with this username already exists
      participant = await getParticipantByUsername(body.username)

      // If not, create a new participant
      if (!participant) {
        const participantData = {
          username: body.username,
          role: body.role || "user",
        }
        console.log(`Create participant`, participantData)
        const [newParticipant] = await createParticipant(participantData)
        participant = newParticipant
      }
    } else {
      // Create a new participant for this message
      const participantData = {
        username: body.username || `participant_${Date.now()}`,
        role: body.role || "user",
      }
      const [newParticipant] = await createParticipant(participantData)
      participant = newParticipant
    }

    console.log(`Using participant`, participant)
    // await new Promise((resolve) => setTimeout(resolve, 512)) // Simulate async operation
    // Create the message
    const messageData = {
      id: body.id?.toString() || Math.floor(Math.random() * 1000000).toString(), // Use provided ID or generate a random one
      content: body.content,
      conversationId,
      participantId: participant.id,
      parentId: body.parentId,
    }

    // Remove groupId from messageData as it's not a direct column in messages table
    const [message] = await createMessage(messageData)

    // If groupId is provided, create an entry in message_group_messages
    if (body.groupId && message) {
      await createMessageGroupMessage({
        messageId: message.id,
        messageGroupId: body.groupId,
      })
    }

    // Prepare the response data
    const responseData = {
      ...message,
      groupId: body.groupId || null, // Include groupId in the response
    }

    return c.json({ success: true, data: [responseData] })
  } catch (error) {
    console.error("Error creating message:", error)
    return c.json({ success: false, error: "Failed to create message" }, 400)
  }
})

// Get all messages in a conversation with participant info
app.get("/conversations/:conversationId", async (c) => {
  try {
    const conversationId = c.req.param("conversationId")

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
app.delete("/conversations/:conversationId/:messageId", async (c) => {
  try {
    const messageId = c.req.param("messageId")
    console.log(`Delete message request - Message ID: ${messageId}`)

    // Check if message exists
    // Note: In a production environment, you might want to verify that the message
    // belongs to the specified conversation and that the user has permission to delete it
    const result = await deleteMessageById(messageId)

    if (result.length === 0) {
      console.log(`Message not found for ID: ${messageId}`)
      return c.json({ success: false, error: "Message not found" }, 404)
    }

    console.log(`Message deleted successfully - ID: ${messageId}`)
    return c.json({ success: true, message: "Message deleted successfully" })
  } catch (error) {
    console.error("Error deleting message:", error)
    return c.json({ success: false, error: "Failed to delete message" }, 500)
  }
})

export default app
