# MCP Integration Platform Setup Guide

## Overview

This guide provides instructions for setting up the MCP Integration Platform, which offers a standardized interface for integrating diverse AI service capabilities with enhanced security and reliability.

## System Requirements

- Node.js 18.x or later
- PostgreSQL 14.x or later
- 1GB RAM minimum (2GB+ recommended)
- 2GB free disk space

## Quick Start Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/mcp-integration-platform.git
cd mcp-integration-platform
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following content:

```
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/mcp_db

# Server Settings
PORT=5000
NODE_ENV=development

# Security
SESSION_SECRET=your-strong-session-secret
API_KEY_SALT=your-api-key-salt

# Optional External Services
OPENAI_API_KEY=sk-your-openai-key
TAVILY_API_KEY=tvly-your-tavily-key
PERPLEXITY_API_KEY=your-perplexity-key
```

Replace the placeholder values with your actual configuration.

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Setup

Create the PostgreSQL database:

```bash
psql -U postgres
CREATE DATABASE mcp_db;
\q
```

Then push the schema to the database:

```bash
npm run db:push
```

### 5. Start the Development Server

```bash
npm run dev
```

The server will be available at http://localhost:5000

## Production Deployment

### Building for Production

```bash
npm run build
```

This creates optimized production files in the `dist` directory.

### Starting the Production Server

```bash
npm start
```

## Platform Components

The MCP Integration Platform consists of the following main components:

### Backend Services

- **API Server**: Express-based server providing RESTful endpoints and WebSocket connections
- **Authentication**: Session and API key-based authentication
- **Tool Manager**: Handles the execution of MCP tools
- **Vector Storage**: Integration with Pinecone and Weaviate

### MCP Tools

- **Web Search**: Search the web using various providers (Tavily, Perplexity, OpenAI)
- **Form Automation**: Automate form filling and submission
- **Vector Storage**: Store and retrieve vector embeddings
- **Data Scraper**: Extract structured data from websites

### Frontend

- **React UI**: Modern interface for interacting with MCP tools
- **WebSocket Client**: Real-time communication with the server
- **Tool Playground**: Interactive testing environment for MCP tools

## Configuration Options

### Database Options

The platform uses PostgreSQL via Drizzle ORM. The database schema is defined in `shared/schema.ts` and can be modified as needed. After modifying the schema, run:

```bash
npm run db:push
```

This will update the database schema without losing data (when possible).

### Authentication Options

The platform supports two authentication methods:

1. **Session-based Authentication**: For interactive users via the UI
2. **API Key Authentication**: For programmatic access via WebSocket

To configure authentication behavior, modify the `server/auth.ts` file.

### Adding Custom Tools

To add a new MCP tool:

1. Define the tool's schema in `shared/schema.ts`
2. Create a new tool implementation file in `server/tools/`
3. Register the tool in `server/tool-manager.ts`

## Security Considerations

### API Key Management

API keys are stored securely with the following measures:

- Hashed storage in the database
- Automatic expiration support
- Usage tracking and rate limiting

### Session Security

Sessions are secured with:

- HTTP-only cookies
- Secure and SameSite cookie attributes
- CSRF protection
- Session timeout and rotation

### Environment Variable Protection

Sensitive environment variables are:

- Never exposed to the frontend
- Validated at startup
- Rate-limited when used (for API keys)

## WebSocket Communication

The platform uses WebSockets for real-time communication. See the [WebSocket Integration Guide](WEBSOCKET_INTEGRATION_GUIDE.md) for details on:

- Establishing connections
- Authentication
- Message formats
- Error handling
- Reconnection strategies

## Monitoring and Logging

The platform includes built-in monitoring and logging:

- Request logs are stored in the database (configurable retention)
- Tool execution metrics are tracked
- Error logging with contextual information
- System status API for health checks

## Troubleshooting

### Common Issues

**Database Connection Issues**

```
Error: Connection to PostgreSQL database failed
```

Check that:
- PostgreSQL is running
- `DATABASE_URL` environment variable is correct
- Database user has proper permissions

**WebSocket Connection Issues**

```
Error: Failed to establish WebSocket connection
```

Check that:
- Server is running
- No firewall is blocking WebSocket connections
- Proper URL protocol is used (ws:// vs wss://)

**Missing API Keys**

```
Error: Missing required API key for tool execution
```

Check that:
- Required API keys are set in the environment variables
- API keys are valid and not expired

## Further Documentation

- [API Documentation](API_DOCUMENTATION.md)
- [WebSocket Integration Guide](WEBSOCKET_INTEGRATION_GUIDE.md)
- [Data Scraper Guide](DATA_SCRAPER_GUIDE.md)