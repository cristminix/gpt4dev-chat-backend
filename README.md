# Chat Backend API

A simple chat application backend built with Hono, SQLite, and Drizzle ORM.

## Features

- Participant management (registration, retrieval)
- Conversation management (creation, listing) with UUID primary keys
- Message sending and retrieval
- Conversation membership management
- LLM Chat API for storing conversation messages
- Automatic participant creation by username
- Authentication middleware
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
│   │   ├── chat.ts        # Chat API routes
│   │   └── llm-chat.ts    # LLM Chat API routes
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

### Participant Endpoints

- `POST /api/participants` - Create a new participant
- `GET /api/participants/:id` - Get participant by ID

### Conversation Endpoints

- `POST /api/conversations` - Create a new conversation (requires authentication)
- `GET /api/conversations` - Get all conversations (requires authentication)
- `GET /api/conversations/:id` - Get conversation by ID (requires authentication)

### Message Endpoints

- `POST /api/conversations/:conversationId/messages` - Send a message to a conversation (requires authentication)
- `GET /api/conversations/:conversationId/messages` - Get messages from a conversation (requires authentication)

### Conversation Member Endpoints

- `POST /api/conversations/:conversationId/members` - Add a member to a conversation (requires authentication)

### LLM Chat Endpoints

- `POST /api/llm/conversations` - Create a new conversation
- `GET /api/llm/conversations` - Get all conversations
- `GET /api/llm/conversations/:id` - Get conversation by ID
- `DELETE /api/llm/conversations/:id` - Delete conversation by ID (also deletes all related messages)
- `POST /api/llm/conversations/:conversationId/messages` - Add a message to a conversation
- `GET /api/llm/conversations/:conversationId/messages` - Get all messages in a conversation with participant info
- `DELETE /api/llm/conversations/:conversationId/messages/:messageId` - Delete a message by ID

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

The LLM Chat API is designed specifically for storing conversation messages between LLMs and users:

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

3. Delete a conversation (also deletes all related messages):

   ```bash
   DELETE /api/llm/conversations/:id
   ```

4. Add messages to the conversation:

   ```bash
   POST /api/llm/conversations/1/messages
   {
     "content": "Hello, how can I help you?",
     "participantUsername": "Assistant",
     "participantRole": "assistant"
   }
   ```

5. Retrieve conversation messages:

   ```bash
   GET /api/llm/conversations/1/messages
   ```

6. Delete a message:
   ```bash
   DELETE /api/llm/conversations/1/messages/123
   ```

## Automatic Participant Creation

The LLM Chat API now supports automatic participant creation by username. When adding a message to a conversation, if you provide a `participantUsername` field:

1. The system will first check if a participant with that username already exists
2. If the participant exists, it will be used for the message
3. If the participant doesn't exist, a new one will be created automatically with the provided username and role

This eliminates the need to manually create participants before sending messages.

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
