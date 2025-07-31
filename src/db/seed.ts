import { db } from "."
import {
  createParticipant,
  createConversation,
  createMessage,
  addConversationMember,
} from "./models"
import { v4 as uuidv4 } from "uuid"

async function seed() {
  console.log("Seeding database...")

  try {
    // Create participants
    console.log("Creating participants...")
    const participant1Result = await createParticipant({
      username: "alice",
      role: "user",
    })
    const participant1 = participant1Result[0]
    if (!participant1) throw new Error("Failed to create participant1")

    const participant2Result = await createParticipant({
      username: "bob",
      role: "user",
    })
    const participant2 = participant2Result[0]
    if (!participant2) throw new Error("Failed to create participant2")

    const participant3Result = await createParticipant({
      username: "charlie",
      role: "admin",
    })
    const participant3 = participant3Result[0]
    if (!participant3) throw new Error("Failed to create participant3")

    const participant4Result = await createParticipant({
      username: "ai_assistant",
      role: "assistant",
    })
    const participant4 = participant4Result[0]
    if (!participant4) throw new Error("Failed to create participant4")

    console.log("Participants created:", [
      participant1,
      participant2,
      participant3,
      participant4,
    ])

    // Create conversations
    console.log("Creating conversations...")
    const conversation1Result = await createConversation({
      id: uuidv4(),
      title: "General Discussion",
    })
    const conversation1 = conversation1Result[0]
    if (!conversation1) throw new Error("Failed to create conversation1")

    const conversation2Result = await createConversation({
      id: uuidv4(),
      title: "Technical Support",
    })
    const conversation2 = conversation2Result[0]
    if (!conversation2) throw new Error("Failed to create conversation2")

    const conversation3Result = await createConversation({
      id: uuidv4(),
      title: "AI Chat Testing",
    })
    const conversation3 = conversation3Result[0]
    if (!conversation3) throw new Error("Failed to create conversation3")

    console.log("Conversations created:", [
      conversation1,
      conversation2,
      conversation3,
    ])

    // Add participants to conversations
    console.log("Adding participants to conversations...")
    await addConversationMember({
      conversationId: conversation1.id,
      participantId: participant1.id,
    })

    await addConversationMember({
      conversationId: conversation1.id,
      participantId: participant2.id,
    })

    await addConversationMember({
      conversationId: conversation2.id,
      participantId: participant1.id,
    })

    await addConversationMember({
      conversationId: conversation2.id,
      participantId: participant3.id,
    })

    await addConversationMember({
      conversationId: conversation3.id,
      participantId: participant1.id,
    })

    await addConversationMember({
      conversationId: conversation3.id,
      participantId: participant4.id,
    })

    console.log("Participants added to conversations")

    // Create messages for conversation 1
    console.log("Creating messages for conversation 1...")
    await createMessage({
      conversationId: conversation1.id,
      participantId: participant1.id,
      content: "Hello everyone!",
    })

    await createMessage({
      conversationId: conversation1.id,
      participantId: participant2.id,
      content: "Hi Alice! How are you doing?",
    })

    await createMessage({
      conversationId: conversation1.id,
      participantId: participant1.id,
      content: "I'm doing great, thanks for asking!",
    })

    // Create messages for conversation 2
    console.log("Creating messages for conversation 2...")
    await createMessage({
      conversationId: conversation2.id,
      participantId: participant1.id,
      content: "I need help with my account.",
    })

    await createMessage({
      conversationId: conversation2.id,
      participantId: participant3.id,
      content: "Sure, what seems to be the problem?",
    })

    await createMessage({
      conversationId: conversation2.id,
      participantId: participant1.id,
      content: "I can't access my profile settings.",
    })

    // Create messages for conversation 3 (AI chat testing)
    console.log("Creating messages for conversation 3...")
    await createMessage({
      conversationId: conversation3.id,
      participantId: participant1.id,
      content: "Hello AI assistant, can you help me with something?",
    })

    await createMessage({
      conversationId: conversation3.id,
      participantId: participant4.id,
      content: "Of course! What can I help you with today?",
    })

    await createMessage({
      conversationId: conversation3.id,
      participantId: participant1.id,
      content: "I'm testing the chat functionality. How are you?",
    })

    await createMessage({
      conversationId: conversation3.id,
      participantId: participant4.id,
      content: "I'm functioning properly, thank you for asking!",
    })

    console.log("Messages created successfully")
    console.log("Database seeding completed!")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

// Run the seed function
seed()
