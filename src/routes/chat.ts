import { Hono } from "hono"
import { authMiddleware } from "../middleware/auth"
import {
  createParticipant,
  getParticipantById,
  getParticipantByUsername,
  createConversation,
  getConversationById,
  getAllConversations,
  createMessage,
  getMessagesWithParticipantByConversationId,
  addConversationMember,
  getConversationMembers,
  isConversationMember,
} from "../db/models"

type Participant = {
  id: number
  username: string
}

const app = new Hono()

// Participant routes (no auth required for creating participants)
app.post("/participants", async (c) => {
  try {
    const body = await c.req.json()
    const participant = await createParticipant(body)
    return c.json({ success: true, data: participant })
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to create participant" },
      400
    )
  }
})

app.get("/participants/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"))
    const participant = await getParticipantById(id)

    if (!participant) {
      return c.json({ success: false, error: "Participant not found" }, 404)
    }

    return c.json({ success: true, data: participant })
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch participant" }, 500)
  }
})

// Conversation routes (require authentication)
app.post("/conversations", authMiddleware, async (c) => {
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

app.get("/conversations", authMiddleware, async (c) => {
  try {
    const conversations = await getAllConversations()
    return c.json({ success: true, data: conversations })
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch conversations" },
      500
    )
  }
})

app.get("/conversations/:id", authMiddleware, async (c) => {
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

// Message routes (require authentication)
app.post(
  "/conversations/:conversationId/messages",
  authMiddleware,
  async (c) => {
    try {
      const conversationId = c.req.param("conversationId")
      const body = await c.req.json()

      // Check if conversation exists
      const conversation = await getConversationById(conversationId)
      if (!conversation) {
        return c.json({ success: false, error: "Conversation not found" }, 404)
      }

      // Get participant from context
      const participant = c.get("user") as Participant

      // Check if participant is member of the conversation
      const isMember = await isConversationMember(
        conversationId,
        participant.id
      )
      if (!isMember) {
        return c.json(
          {
            success: false,
            error: "You are not a member of this conversation",
          },
          403
        )
      }

      const message = await createMessage({
        ...body,
        conversationId,
        participantId: participant.id,
      })

      return c.json({ success: true, data: message })
    } catch (error) {
      return c.json({ success: false, error: "Failed to create message" }, 400)
    }
  }
)

app.get(
  "/conversations/:conversationId/messages",
  authMiddleware,
  async (c) => {
    try {
      const conversationId = c.req.param("conversationId")

      // Check if conversation exists
      const conversation = await getConversationById(conversationId)
      if (!conversation) {
        return c.json({ success: false, error: "Conversation not found" }, 404)
      }

      // Get participant from context
      const participant = c.get("user") as Participant

      // Check if participant is member of the conversation
      const isMember = await isConversationMember(
        conversationId,
        participant.id
      )
      if (!isMember) {
        return c.json(
          {
            success: false,
            error: "You are not a member of this conversation",
          },
          403
        )
      }

      const messages = await getMessagesWithParticipantByConversationId(
        conversationId
      )
      return c.json({ success: true, data: messages })
    } catch (error) {
      return c.json({ success: false, error: "Failed to fetch messages" }, 500)
    }
  }
)

// Conversation member routes (require authentication)
app.post(
  "/conversations/:conversationId/members",
  authMiddleware,
  async (c) => {
    try {
      const conversationId = c.req.param("conversationId")
      const body = await c.req.json()

      // Check if conversation exists
      const conversation = await getConversationById(conversationId)
      if (!conversation) {
        return c.json({ success: false, error: "Conversation not found" }, 404)
      }

      // Get participant from context
      const participant = c.get("user") as Participant

      const member = await addConversationMember({
        ...body,
        conversationId,
        participantId: participant.id,
      })

      return c.json({ success: true, data: member })
    } catch (error) {
      return c.json({ success: false, error: "Failed to add member" }, 400)
    }
  }
)

export default app
