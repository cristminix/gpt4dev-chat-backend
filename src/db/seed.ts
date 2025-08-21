import { db } from "."
import {
  createParticipant,
  createConversation,
  createMessage,
  addConversationMember,
  createFolder,
  createMessageGroup,
  createMessageGroupMessage,
  createUser,
} from "./models"
import { v4 as uuidv4 } from "uuid"

async function seed() {
  console.log("Seeding database...")

  try {
    // Create users
    console.log("Creating users...")
    const user1Result = await createUser({
      username: "alice",
      email: "alice@example.com",
      fullname: "Alice Smith",
      passwd: "hashed_password_1", // In a real app, this would be a hashed password
    })
    const user1 = user1Result[0]
    if (!user1) throw new Error("Failed to create user1")

    const user2Result = await createUser({
      username: "bob",
      email: "bob@example.com",
      fullname: "Bob Johnson",
      passwd: "hashed_password_2", // In a real app, this would be a hashed password
    })
    const user2 = user2Result[0]
    if (!user2) throw new Error("Failed to create user2")

    console.log("Users created:", [user1, user2])

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

    // Create folders
    console.log("Creating folders...")
    const folder1Result = await createFolder({
      id: uuidv4(),
      name: "General Chats",
      description: "General conversation folders",
    })
    const folder1 = folder1Result[0]
    if (!folder1) throw new Error("Failed to create folder1")

    const folder2Result = await createFolder({
      id: uuidv4(),
      name: "Support Chats",
      description: "Technical support conversation folders",
    })
    const folder2 = folder2Result[0]
    if (!folder2) throw new Error("Failed to create folder2")

    console.log("Folders created:", [folder1, folder2])

    // Create conversations
    console.log("Creating conversations...")
    const conversation1Result = await createConversation({
      id: uuidv4(),
      title: "General Discussion",
      folderId: folder1.id,
    })
    const conversation1 = conversation1Result[0]
    if (!conversation1) throw new Error("Failed to create conversation1")

    const conversation2Result = await createConversation({
      id: uuidv4(),
      title: "Technical Support",
      folderId: folder2.id,
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

    // Create message groups
    console.log("Creating message groups...")
    const messageGroup1Result = await createMessageGroup({
      id: uuidv4(),
      conversationId: conversation1.id,
    })
    const messageGroup1 = messageGroup1Result[0]
    if (!messageGroup1) throw new Error("Failed to create messageGroup1")

    const messageGroup2Result = await createMessageGroup({
      id: uuidv4(),
      conversationId: conversation2.id,
    })
    const messageGroup2 = messageGroup2Result[0]
    if (!messageGroup2) throw new Error("Failed to create messageGroup2")

    const messageGroup3Result = await createMessageGroup({
      id: uuidv4(),
      conversationId: conversation3.id,
    })
    const messageGroup3 = messageGroup3Result[0]
    if (!messageGroup3) throw new Error("Failed to create messageGroup3")

    console.log("Message groups created:", [
      messageGroup1,
      messageGroup2,
      messageGroup3,
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
    const message1_1Result = await createMessage({
      id: uuidv4(),
      conversationId: conversation1.id,
      participantId: participant1.id,
      content: "Hello everyone!",
    })
    const message1_1 = message1_1Result[0]
    if (!message1_1) throw new Error("Failed to create message1_1")

    const message1_2Result = await createMessage({
      id: uuidv4(),
      conversationId: conversation1.id,
      participantId: participant2.id,
      content: "Hi Alice! How are you doing?",
    })
    const message1_2 = message1_2Result[0]
    if (!message1_2) throw new Error("Failed to create message1_2")

    const message1_3Result = await createMessage({
      id: uuidv4(),
      conversationId: conversation1.id,
      participantId: participant1.id,
      content: "I'm doing great, thanks for asking!",
    })
    const message1_3 = message1_3Result[0]
    if (!message1_3) throw new Error("Failed to create message1_3")

    // Create messages for conversation 2
    console.log("Creating messages for conversation 2...")
    const message2_1Result = await createMessage({
      id: uuidv4(),
      conversationId: conversation2.id,
      participantId: participant1.id,
      content: "I need help with my account.",
    })
    const message2_1 = message2_1Result[0]
    if (!message2_1) throw new Error("Failed to create message2_1")

    const message2_2Result = await createMessage({
      id: uuidv4(),
      conversationId: conversation2.id,
      participantId: participant3.id,
      content: "Sure, what seems to be the problem?",
    })
    const message2_2 = message2_2Result[0]
    if (!message2_2) throw new Error("Failed to create message2_2")

    const message2_3Result = await createMessage({
      id: uuidv4(),
      conversationId: conversation2.id,
      participantId: participant1.id,
      content: "I can't access my profile settings.",
    })
    const message2_3 = message2_3Result[0]
    if (!message2_3) throw new Error("Failed to create message2_3")

    // Create messages for conversation 3 (AI chat testing)
    console.log("Creating messages for conversation 3...")
    const message3_1Result = await createMessage({
      id: uuidv4(),
      conversationId: conversation3.id,
      participantId: participant1.id,
      content: "Hello AI assistant, can you help me with something?",
    })
    const message3_1 = message3_1Result[0]
    if (!message3_1) throw new Error("Failed to create message3_1")

    const message3_2Result = await createMessage({
      id: uuidv4(),
      conversationId: conversation3.id,
      participantId: participant4.id,
      content: "Of course! What can I help you with today?",
    })
    const message3_2 = message3_2Result[0]
    if (!message3_2) throw new Error("Failed to create message3_2")

    const message3_3Result = await createMessage({
      id: uuidv4(),
      conversationId: conversation3.id,
      participantId: participant1.id,
      content: "I'm testing the chat functionality. How are you?",
    })
    const message3_3 = message3_3Result[0]
    if (!message3_3) throw new Error("Failed to create message3_3")

    const message3_4Result = await createMessage({
      id: uuidv4(),
      conversationId: conversation3.id,
      participantId: participant4.id,
      content: "I'm functioning properly, thank you for asking!",
    })
    const message3_4 = message3_4Result[0]
    if (!message3_4) throw new Error("Failed to create message3_4")

    // Create message group messages
    console.log("Creating message group messages...")
    // Link first message of each conversation to corresponding message group
    await createMessageGroupMessage({
      messageId: message1_1.id,
      messageGroupId: messageGroup1.id,
    })

    await createMessageGroupMessage({
      messageId: message2_1.id,
      messageGroupId: messageGroup2.id,
    })

    await createMessageGroupMessage({
      messageId: message3_1.id,
      messageGroupId: messageGroup3.id,
    })

    console.log("Message group messages created successfully")
    console.log("Database seeding completed!")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

// Run the seed function
seed()
