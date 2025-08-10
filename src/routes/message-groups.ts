import { Hono } from "hono"
import {
  createMessageGroup,
  getMessageGroupById,
  getAllMessageGroups,
  getMessageGroupsByConversationId,
  updateMessageGroup,
  deleteMessageGroupById,
} from "../db/models"

const app = new Hono()

// Message group routes
app.post("/", async (c) => {
  try {
    const body = await c.req.json()
    const messageGroup = await createMessageGroup(body)
    return c.json({ success: true, data: messageGroup })
  } catch (error) {
    console.error("Error creating message group:", error)
    return c.json(
      { success: false, error: "Failed to create message group" },
      400
    )
  }
})

app.get("/", async (c) => {
  try {
    const messageGroups = await getAllMessageGroups()
    return c.json({ success: true, data: messageGroups })
  } catch (error) {
    console.error("Error fetching message groups:", error)
    return c.json(
      { success: false, error: "Failed to fetch message groups" },
      500
    )
  }
})

app.get("/conversation/:conversationId", async (c) => {
  try {
    const conversationId = c.req.param("conversationId")
    const messageGroups = await getMessageGroupsByConversationId(conversationId)
    return c.json({ success: true, data: messageGroups })
  } catch (error) {
    console.error("Error fetching message groups by conversation ID:", error)
    return c.json(
      { success: false, error: "Failed to fetch message groups by conversation ID" },
      500
    )
  }
})

app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const messageGroup = await getMessageGroupById(id)

    if (!messageGroup) {
      return c.json({ success: false, error: "Message group not found" }, 404)
    }

    return c.json({ success: true, data: messageGroup })
  } catch (error) {
    console.error("Error fetching message group:", error)
    return c.json(
      { success: false, error: "Failed to fetch message group" },
      500
    )
  }
})

app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const body = await c.req.json()

    // Check if message group exists
    const messageGroup = await getMessageGroupById(id)
    if (!messageGroup) {
      return c.json({ success: false, error: "Message group not found" }, 404)
    }

    // Update the message group
    const updatedMessageGroup = await updateMessageGroup(id, body)

    if (updatedMessageGroup.length === 0) {
      return c.json(
        { success: false, error: "Failed to update message group" },
        500
      )
    }

    return c.json({
      success: true,
      data: updatedMessageGroup[0],
      message: "Message group updated successfully",
    })
  } catch (error) {
    console.error("Error updating message group:", error)
    return c.json(
      { success: false, error: "Failed to update message group" },
      500
    )
  }
})

app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id")

    // Check if message group exists
    const messageGroup = await getMessageGroupById(id)
    if (!messageGroup) {
      return c.json({ success: false, error: "Message group not found" }, 404)
    }

    // Delete the message group and all related message group messages
    const result = await deleteMessageGroupById(id)

    if (result.length === 0) {
      return c.json(
        { success: false, error: "Failed to delete message group" },
        500
      )
    }

    return c.json({
      success: true,
      message: "Message group deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting message group:", error)
    return c.json(
      { success: false, error: "Failed to delete message group" },
      500
    )
  }
})

export default app
