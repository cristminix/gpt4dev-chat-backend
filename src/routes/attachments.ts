import { Hono } from "hono"
import {
  createAttachment,
  getAttachmentById,
  getAllAttachments,
  updateAttachmentById,
  deleteAttachmentById,
} from "../db/models"
import { createWriteStream, existsSync, mkdirSync } from "fs"
import { join } from "path"
import { randomUUID } from "crypto"

// Function to get file extension from mimetype
const getExtensionFromMimetype = (mimetype: string): string => {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "image/webp": ".webp",
    "text/plain": ".txt",
    "text/html": ".html",
    "text/css": ".css",
    "text/csv": ".csv",
    "application/json": ".json",
    "application/pdf": ".pdf",
    "application/zip": ".zip",
    "application/x-tar": ".tar",
    "application/javascript": ".js",
    "application/xml": ".xml",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      ".xlsx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      ".pptx",
  }

  return mimeToExt[mimetype] || ""
}

const app = new Hono()

// Create a new attachment
app.post("/", async (c) => {
  try {
    const body = await c.req.json()

    // Validate required fields
    if (!body.filename) {
      return c.json({ success: false, error: "Filename is required" }, 400)
    }

    if (!body.mimetype) {
      return c.json({ success: false, error: "Mimetype is required" }, 400)
    }

    // Generate ID if not provided
    const attachmentData = {
      id: body.id || Math.floor(Math.random() * 1000000).toString(),
      filename: body.filename,
      mimetype: body.mimetype,
    }

    const [attachment] = await createAttachment(attachmentData)
    return c.json({ success: true, data: [attachment] })
  } catch (error) {
    console.error("Error creating attachment:", error)
    return c.json({ success: false, error: "Failed to create attachment" }, 500)
  }
})

// Download a file from URL and save it to file_attachments directory
app.post("/download", async (c) => {
  try {
    const body = await c.req.json()

    // Validate required fields
    if (!body.url) {
      return c.json({ success: false, error: "URL is required" }, 400)
    }

    // Ensure file_attachments directory exists
    const attachmentsDir = join(process.cwd(), "file_attachments")
    if (!existsSync(attachmentsDir)) {
      mkdirSync(attachmentsDir, { recursive: true })
    }

    // Generate a unique filename
    const fileId = randomUUID()
    const filePath = join(attachmentsDir, fileId)

    // Download the file from URL
    const response = await fetch(body.url)
    if (!response.ok) {
      return c.json(
        { success: false, error: "Failed to download file from URL" },
        400
      )
    }

    // Save the file to disk
    const fileStream = createWriteStream(filePath)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    fileStream.write(buffer)
    fileStream.end()

    // Extract filename from URL or use a default name
    const urlFilename = body.url.split("/").pop() || "downloaded_file"
    let filename = body.filename || urlFilename

    // Get mimetype from response or use a default
    const mimetype =
      response.headers.get("content-type") || "application/octet-stream"

    // Add extension to filename based on mimetype if not already present
    const extension = getExtensionFromMimetype(mimetype)
    if (extension && !filename.endsWith(extension)) {
      filename = `${filename}${extension}`
    }

    // Create attachment record in database
    const attachmentData = {
      id: fileId,
      filename: filename,
      mimetype: mimetype,
    }

    const [attachment] = await createAttachment(attachmentData)
    return c.json({ success: true, data: [attachment] })
  } catch (error) {
    console.error("Error downloading attachment:", error)
    return c.json(
      { success: false, error: "Failed to download attachment" },
      500
    )
  }
})

// Get all attachments
app.get("/", async (c) => {
  try {
    const attachments = await getAllAttachments()
    return c.json({ success: true, data: attachments })
  } catch (error) {
    console.error("Error fetching attachments:", error)
    return c.json({ success: false, error: "Failed to fetch attachments" }, 500)
  }
})

// Get attachment by ID
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const attachments = await getAttachmentById(id)

    if (attachments.length === 0) {
      return c.json({ success: false, error: "Attachment not found" }, 404)
    }

    return c.json({ success: true, data: attachments })
  } catch (error) {
    console.error("Error fetching attachment:", error)
    return c.json({ success: false, error: "Failed to fetch attachment" }, 500)
  }
})

// Update attachment by ID
app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const body = await c.req.json()

    // Check if attachment exists
    const existing = await getAttachmentById(id)
    if (existing.length === 0) {
      return c.json({ success: false, error: "Attachment not found" }, 404)
    }

    // Remove fields that shouldn't be updated
    const { id: _, ...updateData } = body

    const result = await updateAttachmentById(id, updateData)
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error("Error updating attachment:", error)
    return c.json({ success: false, error: "Failed to update attachment" }, 500)
  }
})

// Delete attachment by ID
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id")

    // Check if attachment exists
    const existing = await getAttachmentById(id)
    if (existing.length === 0) {
      return c.json({ success: false, error: "Attachment not found" }, 404)
    }

    const result = await deleteAttachmentById(id)
    return c.json({ success: true, message: "Attachment deleted successfully" })
  } catch (error) {
    console.error("Error deleting attachment:", error)
    return c.json({ success: false, error: "Failed to delete attachment" }, 500)
  }
})

export default app
