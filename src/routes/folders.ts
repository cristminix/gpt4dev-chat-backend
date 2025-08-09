import { Hono } from "hono"
import {
  createFolder,
  getFolderById,
  getAllFolders,
  updateFolder,
  deleteFolderById,
} from "../db/models"

const app = new Hono()

// Folder routes
app.post("/", async (c) => {
  try {
    const body = await c.req.json()
    const folder = await createFolder(body)
    return c.json({ success: true, data: folder })
  } catch (error) {
    return c.json({ success: false, error: "Failed to create folder" }, 400)
  }
})

app.get("/", async (c) => {
  try {
    const folders = await getAllFolders()
    return c.json({ success: true, data: folders })
  } catch (error) {
    console.error("Error fetching folders:", error)
    return c.json({ success: false, error: "Failed to fetch folders" }, 500)
  }
})

app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const folder = await getFolderById(id)

    if (!folder) {
      return c.json({ success: false, error: "Folder not found" }, 404)
    }

    return c.json({ success: true, data: folder })
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch folder" }, 500)
  }
})

app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const body = await c.req.json()

    // Check if folder exists
    const folder = await getFolderById(id)
    if (!folder) {
      return c.json({ success: false, error: "Folder not found" }, 404)
    }

    // Update the folder
    const updatedFolder = await updateFolder(id, body)

    if (updatedFolder.length === 0) {
      return c.json({ success: false, error: "Failed to update folder" }, 500)
    }

    return c.json({
      success: true,
      data: updatedFolder[0],
      message: "Folder updated successfully",
    })
  } catch (error) {
    console.error("Error updating folder:", error)
    return c.json({ success: false, error: "Failed to update folder" }, 500)
  }
})

app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id")

    // Check if folder exists
    const folder = await getFolderById(id)
    if (!folder) {
      return c.json({ success: false, error: "Folder not found" }, 404)
    }

    // Delete the folder and all related conversations
    const result = await deleteFolderById(id)

    if (result.length === 0) {
      return c.json({ success: false, error: "Failed to delete folder" }, 500)
    }

    return c.json({
      success: true,
      message: "Folder deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting folder:", error)
    return c.json({ success: false, error: "Failed to delete folder" }, 500)
  }
})

export default app
