# @agentic-layer/n8n-nodes-a2a

This is an n8n community node that provides integration with the A2A (Agent-to-Agent) protocol, enabling your n8n workflows to communicate with AI agents.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

**Send Message**
- Send a text message to an A2A-compatible AI agent
- Optionally provide a `contextId` to maintain conversation context
- Returns the full task object with status, response message, and artifacts

## Credentials

**A2A API**
- **Server URL**: The base URL of the A2A-compatible agent (e.g., `https://agent.example.com/v1`)
- Authentication is not yet implemented in the current version

To configure credentials:
1. In n8n, go to Credentials
2. Create new credentials of type "A2A API"
3. Enter the Server URL of your A2A-compatible agent
4. Test the connection (validates by fetching the agent card from `/.well-known/agent-card.json`)

## Compatibility

Compatible with n8n@1.60.0 or later

## What is A2A?

The [A2A protocol](https://a2a-protocol.org) is an open standard for agent-to-agent communication, enabling independent AI agents to discover and communicate with each other. This node allows n8n workflows to interact with any agent that implements the A2A protocol.

## Current Capabilities

This is an MVP (Minimum Viable Product) implementation with the following features:

- Send text messages to A2A-compatible agents via JSON-RPC 2.0
- Receive immediate task responses (synchronous communication)
- Support for conversation threading via `contextId` parameter
- Access to full task details including status, messages, and artifacts
- Agent discovery via standard `/.well-known/agent-card.json` endpoint

**Not yet implemented:**
- Authentication
- Long-running task polling
- Streaming responses
- File and data parts (only text messages supported)
- Task management operations (list, get, cancel)

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [A2A Protocol documentation](https://a2a-protocol.org)
* [A2A Protocol specification](https://github.com/a2aproject/A2A)
