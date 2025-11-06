# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an n8n community node package that provides A2A (Agent-to-Agent) protocol integration for n8n workflows. It allows users to send messages to AI agents that implement the A2A protocol and receive responses synchronously.

The A2A protocol is an open standard for agent-to-agent communication, enabling independent AI agents to discover and communicate with each other.

## Development Commands

- `npm run build` - Build the project (compiles TypeScript to dist/)
- `npm run build:watch` - Watch mode for development
- `npm run dev` - Development mode with n8n-node CLI
- `npm run lint` - Lint the codebase
- `npm run lint:fix` - Lint and automatically fix issues
- `npm run release` - Create a release
- `npm run prepublishOnly` - Pre-release checks (runs automatically before publishing)

Note: There are no test scripts configured in this project.

## Architecture

### Node Structure

This project follows n8n's community node architecture with a simple, single-operation structure:

**Main Node Class** (`nodes/A2a/A2a.node.ts`):
- Implements `INodeType` interface
- Defines node metadata (display name, icon, version, etc.)
- Registers the A2A API credential type
- Implements `execute()` method for message sending
- Input parameters: message (required text), contextId (optional string)
- Returns full A2A Task object as output

**A2A Protocol Implementation**:
- Uses JSON-RPC 2.0 format for all requests
- POST to `{serverUrl}/message:send` endpoint
- Request structure:
  ```json
  {
    "jsonrpc": "2.0",
    "method": "message/send",
    "params": {
      "message": { "role": "user", "parts": [{"type": "text", "text": "..."}] },
      "contextId": "..." (optional)
    },
    "id": "unique-request-id"
  }
  ```
- Returns immediately with current task status (no polling)
- Response contains the full Task object with status, message, and artifacts

**HTTP Communication**:
- Uses n8n's built-in `this.helpers.httpRequest()` method
- No external HTTP dependencies (required by n8n)
- Headers: `Content-Type: application/json`
- Authentication: Not implemented yet (MVP)

### Credentials

**A2A API Credential** (`credentials/A2aApi.credentials.ts`):
- Single field: Server URL (e.g., `https://agent.example.com/v1`)
- No authentication in MVP version
- Credential test: Fetches Agent Card from `/.well-known/agent-card.json`
- Implements `ICredentialType` interface

### TypeScript Configuration

- Strict mode enabled (`strict: true`)
- Target: ES2019 with CommonJS modules
- Output: `dist/` directory
- Includes type declarations and source maps

## A2A Protocol Concepts

**Message Format**:
- Messages have a `role` (user or agent) and `parts` array
- Currently supports `text` parts only
- Future: Could support `file` and `data` parts

**Task Object**:
- Returned by the A2A server after sending a message
- Contains: `id`, `contextId`, `status`, `message`, `artifacts`, `final` flag
- Status states: submitted, working, completed, failed, canceled, rejected, input-required, auth-required

**Context Threading**:
- Use `contextId` parameter to maintain conversation context
- Same contextId groups related messages into a conversation
- Optional in MVP - each message can be independent

## Adding New Features

To extend this node:

1. **Add authentication**: Update `A2aApi.credentials.ts` to include auth fields, implement `authenticate` object
2. **Support file/data parts**: Extend the message building logic in `A2a.node.ts` to handle different part types
3. **Add polling for long-running tasks**: Implement task status polling when response is "working"
4. **Add streaming support**: Create separate operation for `/message:stream` endpoint with SSE handling
5. **Add task management operations**: Create operations for listing, getting, or canceling tasks

## n8n-Specific Concepts

- **INodeType Interface**: Core interface that all nodes must implement
- **IExecuteFunctions**: Provides context and helper methods during execution
- **this.helpers.httpRequest()**: Built-in HTTP client (use this, not axios/fetch)
- **continueOnFail()**: Check if node should continue on error or throw
- **pairedItem**: Links output items to input items for n8n's data lineage tracking

## A2A API Integration

- Protocol Documentation: https://a2a-protocol.org
- Base URL: Configured in credentials (e.g., `https://agent.example.com/v1`)
- Agent Discovery: `/.well-known/agent-card.json` (used in credential test)
- Message Endpoint: `/message:send` (synchronous)
- Request Format: JSON-RPC 2.0
- Response Format: JSON-RPC 2.0 with Task object in `result` field
