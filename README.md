# Chat Backend API

A simple chat application backend built with Hono, SQLite, and Drizzle ORM.

## Features

- Participant management (registration, retrieval)
- Conversation management (creation, listing) with UUID primary keys
- Message sending and retrieval with automatic participant creation
- Conversation membership management
- LLM Chat API for storing conversation messages with advanced organization features
- Folder management for organizing conversations
- Message group management for organizing related messages
- Message group message management for linking messages to groups
- Automatic participant creation by username
- Authentication middleware for secure chat endpoints
- RESTful API design

## Technologies Used

- [Hono](https://hono.dev/) - Fast web framework for Node.js
- [SQLite](https://www.sqlite.org/) - Lightweight database
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [UUID](https://github.com/uuidjs/uuid) - UUID generation

## Project Structure

```
.
├── src/
│   ├── db/
│   │   ├── index.ts       # Database connection
│   │   ├── schema.ts      # Database schema
│   │   ├── models.ts      # Data access layer
│   │   ├── migrate.ts     # Database migration script
│   │   └── seed.ts        # Database seed data
│   ├── routes/
│   │   ├── chat.ts                # Chat API routes (require authentication)
│   │   ├── llm-chat.ts            # LLM Chat API routes (no authentication)
│   │   ├── folders.ts             # Folder management routes
│   │   ├── conversations.ts       # Conversation management routes
│   │   ├── messages.ts            # Message management routes
│   │   ├── message-groups.ts      # Message group management routes
│   │   └── message-group-messages.ts  # Message group message management routes
│   ├── middleware/
│   │   ├── auth.ts        # Authentication middleware
│   │   └── logger.ts      # Request logging middleware
│   ├── index.ts           # Main Hono app
│   └── server.ts          # Server entry point
├── drizzle/               # Database migrations
├── drizzle.config.ts      # Drizzle ORM configuration
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── sqlite.db              # SQLite database file
```

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd chat-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Generate database migrations:

   ```bash
   npm run db:generate
   ```

4. Run database migrations:

   ```bash
   npm run db:migrate
   ```

5. (Optional) Seed the database with test data:

   ```bash
   npm run db:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on port 5007 by default.

## API Endpoints

### Chat API Endpoints (Require Authentication)

#### Participant Endpoints

- `POST /api/participants` - Create a new participant
- `GET /api/participants/:id` - Get participant by ID

#### Conversation Endpoints

- `POST /api/conversations` - Create a new conversation
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:id` - Get conversation by ID
- `PUT /api/conversations/:id` - Update conversation by ID
- `DELETE /api/conversations/:id` - Delete conversation by ID

#### Message Endpoints

- `POST /api/conversations/:conversationId/messages` - Send a message to a conversation
- `GET /api/conversations/:conversationId/messages` - Get messages from a conversation

#### Conversation Member Endpoints

- `POST /api/conversations/:conversationId/members` - Add a member to a conversation

### LLM Chat API Endpoints (No Authentication Required)

#### Folder Endpoints

- `POST /api/llm/folders` - Create a new folder
- `GET /api/llm/folders` - Get all folders
- `GET /api/llm/folders/:id` - Get folder by ID
- `PUT /api/llm/folders/:id` - Update folder by ID
- `DELETE /api/llm/folders/:id` - Delete folder by ID (also deletes all related conversations)

#### Conversation Endpoints

- `POST /api/llm/conversations` - Create a new conversation
- `GET /api/llm/conversations` - Get all conversations
- `GET /api/llm/conversations/:id` - Get conversation by ID
- `PUT /api/llm/conversations/:id` - Update conversation by ID
- `DELETE /api/llm/conversations/:id` - Delete conversation by ID (also deletes all related messages)

#### Message Endpoints

- `POST /api/llm/messages/conversations/:conversationId` - Add a message to a conversation
- `GET /api/llm/messages/conversations/:conversationId` - Get all messages in a conversation with participant info
- `DELETE /api/llm/messages/conversations/:conversationId/:messageId` - Delete a message by ID

#### Message Group Endpoints

- `POST /api/llm/message-groups` - Create a new message group
- `GET /api/llm/message-groups` - Get all message groups
- `GET /api/llm/message-groups/:id` - Get message group by ID
- `PUT /api/llm/message-groups/:id` - Update message group by ID
- `DELETE /api/llm/message-groups/:id` - Delete message group by ID (also deletes all related message group messages)

#### Message Group Message Endpoints

- `POST /api/llm/message-group-messages/:messageGroupId` - Add a message to a message group
- `GET /api/llm/message-group-messages/:messageGroupId` - Get all messages in a message group
- `DELETE /api/llm/message-group-messages/:messageGroupId/:messageId` - Remove a message from a message group

## Authentication

Most endpoints require authentication. To authenticate, include an `Authorization` header with a Bearer token:

```
Authorization: Bearer your-token-here
```

For demo purposes, any non-empty token will work.

LLM Chat endpoints do not require authentication.

## Database Schema

The database consists of four tables:

1. `participants` - Stores participant information with role field
2. `conversations` - Stores chat conversations with UUID primary keys and title field
3. `messages` - Stores messages sent in conversations
4. `conversation_members` - Stores conversation membership information

## Database Seeding

This project includes a database seeding script that creates sample data for testing purposes. The seed data includes:

- 4 participants (alice, bob, charlie, ai_assistant)
- 3 conversations (General Discussion, Technical Support, AI Chat Testing)
- Conversation memberships for all participants
- Sample messages in each conversation

To seed the database, run:

```bash
npm run db:seed
```

Note: The seeding script will only work with an empty database. If you already have data, you may need to reset the database first.

## LLM Chat API Usage

The LLM Chat API is designed specifically for storing conversation messages between LLMs and users. It has a more complex structure with support for folders, message groups, and advanced message management.

### Basic Conversation Management

1. Create a conversation:

   ```bash
   POST /api/llm/conversations
   {
     "title": "LLM Chat Session"
   }
   ```

2. Get all conversations:

   ```bash
   GET /api/llm/conversations
   ```

3. Update a conversation:

   ```bash
   PUT /api/llm/conversations/:id
   {
     "title": "Updated Conversation Title"
   }
   ```

4. Delete a conversation (also deletes all related messages):

   ```bash
   DELETE /api/llm/conversations/:id
   ```

### Message Management

1. Add messages to the conversation:

   ```bash
   POST /api/llm/messages/conversations/1
   {
     "content": "Hello, how can I help you?",
     "username": "Assistant",
     "role": "assistant"
   }
   ```

2. Retrieve conversation messages:

   ```bash
   GET /api/llm/messages/conversations/1
   ```

3. Delete a message:
   ```bash
   DELETE /api/llm/messages/conversations/1/123
   ```

### Folder Management

1. Create a folder to organize conversations:

   ```bash
   POST /api/llm/folders
   {
     "name": "Project Alpha",
     "description": "Conversations related to Project Alpha"
   }
   ```

2. Get all folders:

   ```bash
   GET /api/llm/folders
   ```

3. Update a folder:

   ```bash
   PUT /api/llm/folders/:id
   {
     "name": "Project Beta",
     "description": "Conversations related to Project Beta"
   }
   ```

4. Delete a folder (also deletes all related conversations):

   ```bash
   DELETE /api/llm/folders/:id
   ```

### Message Group Management

1. Create a message group to organize related messages:

   ```bash
   POST /api/llm/message-groups
   {
     "name": "Technical Discussion",
     "description": "Messages related to technical topics"
   }
   ```

2. Get all message groups:

   ```bash
   GET /api/llm/message-groups
   ```

3. Update a message group:

   ```bash
   PUT /api/llm/message-groups/:id
   {
     "name": "General Discussion",
     "description": "Messages related to general topics"
   }
   ```

4. Delete a message group (also deletes all related message group messages):

   ```bash
   DELETE /api/llm/message-groups/:id
   ```

### Message Group Message Management

1. Add a message to a message group:

   ```bash
   POST /api/llm/message-group-messages/:messageGroupId
   {
     "messageId": "123"
   }
   ```

2. Get all messages in a message group:

   ```bash
   GET /api/llm/message-group-messages/:messageGroupId
   ```

3. Remove a message from a message group:
   ```bash
   DELETE /api/llm/message-group-messages/:messageGroupId/:messageId
   ```

## Automatic Participant Creation

The LLM Chat API now supports automatic participant creation by username. When adding a message to a conversation, if you provide a `username` field:

1. The system will first check if a participant with that username already exists
2. If the participant exists, it will be used for the message
3. If the participant doesn't exist, a new one will be created automatically with the provided username and role

This eliminates the need to manually create participants before sending messages.

To add a message with automatic participant creation:

```bash
POST /api/llm/messages/conversations/:conversationId
{
  "content": "Hello, how can I help you?",
  "username": "Assistant",
  "role": "assistant"
}
```

## UUID Primary Keys

Conversations now use UUIDs as primary keys instead of auto-incrementing integers. This provides better scalability and prevents ID collisions in distributed systems.

When creating a new conversation, you can either:

1. Provide your own UUID in the `id` field
2. Let the system generate one automatically

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project
- `npm run start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database with test data
- `npm run db:studio` - Open Drizzle Studio for database management

## License

This project is licensed under the MIT License.
