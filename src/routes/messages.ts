import { Hono } from "hono"
import {
  createMessage,
  deleteMessageById,
  getMessagesWithParticipantByConversationId,
  getParticipantByUsername,
  createParticipant,
  createMessageGroupMessage,
  checkMessageGroupExists,
  updateMessageById,
} from "../db/models"
import { getMessagesById } from "../db/messages"

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
    // Remove groupId from body to prevent it from being passed to createMessage
    const { groupId, ...bodyWithoutGroupId } = body

    const messageData = {
      id:
        bodyWithoutGroupId.id?.toString() ||
        Math.floor(Math.random() * 1000000).toString(), // Use provided ID or generate a random one
      content: bodyWithoutGroupId.content,
      conversationId,
      participantId: participant.id,
      parentId: bodyWithoutGroupId.parentId,
    }

    // Remove groupId from messageData as it's not a direct column in messages table
    let [message] = await getMessagesById(messageData.id)
    if (!message) {
      const [newMessage] = await createMessage(messageData)
      message = newMessage
    }

    // If groupId is provided, create an entry in message_group_messages
    // But only if the groupId doesn't already exist in message_groups
    if (groupId && message) {
      const groupExists = await checkMessageGroupExists(groupId)
      console.log({ groupExists })
      if (groupExists) {
        const messageGroupMessage = await createMessageGroupMessage({
          messageId: message.id,
          messageGroupId: groupId,
        })
        console.log({ messageGroupMessage })
      }
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

// Update a message by ID
app.put("/conversations/:conversationId/:messageId", async (c) => {
  try {
    const messageId = c.req.param("messageId")
    const body = await c.req.json()

    console.log(`Update message request - Message ID: ${messageId}`, body)

    // Remove fields that shouldn't be updated
    const { id, conversationId, participantId, ...updateData } = body

    // Update the message
    const existing = await getMessagesById(body.id)
    console.log({ existing })
    const result = await updateMessageById(messageId, updateData)

    if (result.length === 0) {
      console.log(`Message not found for ID: ${messageId}`)
      return c.json({ success: false, error: "Message not found" }, 404)
    }

    console.log(`Message updated successfully - ID: ${messageId}`)
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error("Error updating message:", error)
    return c.json({ success: false, error: "Failed to update message" }, 500)
  }
})

export default app
