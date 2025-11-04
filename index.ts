import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';
import crypto from 'crypto';
import { config } from 'dotenv';
import express from 'express';
import type { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { withPaymentInterceptor } from 'x402-axios';
import { z } from 'zod';

config();

const transportMode = process.env.TRANSPORT_MODE || 'stdio';

// Type for API client
type ApiClient = ReturnType<typeof withPaymentInterceptor>;

// In HTTP mode, API clients are stored per session ID
// In STDIO mode, use environment variable for single global client
let api: ApiClient | undefined;
const apiClients = new Map<string, ApiClient>();

if (transportMode === 'stdio') {
  const privateKey = process.env.PRIVATE_KEY as Hex;
  if (!privateKey) {
    throw new Error('Missing PRIVATE_KEY environment variable for STDIO mode');
  }
  const account = privateKeyToAccount(privateKey);
  api = withPaymentInterceptor(axios.create({ baseURL: 'https://api-x402.asksally.xyz' }), account);
}

// Helper function to set up prompts
const setupPrompts = (server: McpServer) => {
  // Prompt 1: Ask Sally about metabolic health
  server.prompt(
    'ask-sally-metabolic',
    'Generate a well-formed question for Sally about metabolic health',
    {
      topic: z.string().describe('The metabolic health topic to ask about'),
    },
    async (args) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please use the chat-with-sally tool to ask: "${args.topic}"`,
            },
          },
        ],
      };
    },
  );

  // Prompt 2: General chat with Sally
  server.prompt(
    'ask-sally-general',
    'Start a general conversation with Sally',
    async () => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: 'Please use the chat-with-sally tool to start a conversation about health and wellness.',
            },
          },
        ],
      };
    },
  );
};

// Helper function to set up resources
const setupResources = (server: McpServer, getApiClient: () => ApiClient | undefined) => {
  // Resource 1: Server configuration info
  server.resource(
    'server-config',
    'sally://config/info',
    {
      description: 'Information about the Sally MCP server configuration and status',
      mimeType: 'application/json',
    },
    async () => {
      const apiClient = getApiClient();
      return {
        contents: [
          {
            uri: 'sally://config/info',
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                serverName: 'x402 MCP Sally Server',
                version: '1.0.0',
                apiConnected: apiClient !== undefined,
                apiEndpoint: 'https://api-x402.asksally.xyz',
                availableTools: ['chat-with-sally'],
                transportMode: process.env.TRANSPORT_MODE || 'stdio',
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // Resource 2: Sally API documentation
  server.resource(
    'sally-docs',
    'sally://docs/api',
    {
      description: 'Documentation for chatting with Sally and the x402 payment protocol',
      mimeType: 'text/markdown',
    },
    async () => {
      return {
        contents: [
          {
            uri: 'sally://docs/api',
            mimeType: 'text/markdown',
            text: `# Sally MCP Server Documentation

## Overview
This MCP server provides access to Sally, an AI assistant specializing in metabolic health, through the x402 blockchain-based payment protocol.

## Available Tools

### chat-with-sally
Chat with Sally about metabolic health topics.

**Parameters:**
- \`message\` (string, required): Your question or message for Sally

**Requirements:** Valid privateKey configuration

**Returns:** Sally's response in JSON format

**Example topics:**
- Metabolic health and wellness
- Nutrition advice
- Exercise recommendations
- Health goal setting

## x402 Payment Protocol
All interactions with Sally use the x402 protocol for micropayments. Each API call is automatically paid for using your configured wallet.

## Security Best Practices
- Always use a dedicated wallet for MCP interactions
- Never use your main wallet's private key
- Keep your private key secure and never share it
- Monitor your wallet balance regularly

## Getting Started
1. Configure your privateKey in the MCP client settings
2. Use the chat-with-sally tool to start a conversation
3. Ask Sally about metabolic health, nutrition, or wellness topics

## Support
For issues or questions about Sally, visit the Sally Labs documentation.
`,
          },
        ],
      };
    },
  );
};

// Create an MCP server factory function
// getApiClient: function to retrieve API client for the current session
const createServer = (getApiClient: () => ApiClient | undefined) => {
  const server = new McpServer({
    name: 'x402 MCP Sally Server',
    version: '1.0.0',
  });

  // Add tools to the server
  server.tool(
    'chat-with-sally',
    'Chat with Sally to talk about metabolic health (requires privateKey configuration)',
    {
      message: z.string().describe('The message to send to Sally'),
    },
    {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    async (args) => {
      const apiClient = getApiClient();
      if (!apiClient) {
        return {
          content: [{ type: 'text', text: 'Error: API client not initialized. Please provide a valid privateKey.' }],
        };
      }

      const { message } = args;
      try {
        const res = await apiClient.post('/chats', { message });
        return {
          content: [{ type: 'text', text: JSON.stringify(res.data) }],
        };
      } catch (err: any) {
        console.error(err);
        return {
          content: [
            {
              type: 'text',
              text: `Failed to chat with Sally. Error: ${err.response?.data?.message || err.message}`,
            },
          ],
        };
      }
    },
  );

  // Set up prompts and resources
  setupPrompts(server);
  setupResources(server, getApiClient);

  return server;
};

// For STDIO mode, create a single server instance with global API client
export const server = createServer(() => api);

// Connect with appropriate transport based on mode
if (transportMode === 'http') {
  // HTTP transport for Smithery hosted deployment
  const app = express();
  const port = process.env.PORT || 8081;

  // Add middleware for parsing JSON and URL-encoded data
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Handle all HTTP methods on /mcp endpoint
  app.all('/mcp', async (req, res) => {
    console.log(`Received ${req.method} /mcp request`);

    // Extract privateKey from query parameters or request body (optional for scanning)
    const privateKeyStr = (req.query.privateKey as string) || (req.body?.privateKey as string);

    console.log('Request with privateKey:', privateKeyStr ? 'present' : 'missing');

    // Initialize API client for this request if valid privateKey provided
    let requestApiClient: ApiClient | undefined;

    if (privateKeyStr) {
      // Validate hex format: must start with 0x and be 66 characters (0x + 64 hex digits)
      const isValidFormat = privateKeyStr.startsWith('0x') && privateKeyStr.length === 66;

      if (!isValidFormat) {
        console.log('Invalid or incomplete privateKey provided - proceeding without API client');
        console.log(`PrivateKey validation failed: length=${privateKeyStr.length}, starts_with_0x=${privateKeyStr.startsWith('0x')}`);
        // Don't fail the request - just continue without API client
        // Tools will return appropriate errors when invoked without credentials
      } else {
        try {
          // Cast to Hex after validation
          const privateKey = privateKeyStr as Hex;

          // Create API client with the provided privateKey for this request
          const account = privateKeyToAccount(privateKey);
          requestApiClient = withPaymentInterceptor(axios.create({ baseURL: 'https://api-x402.asksally.xyz' }), account);

          console.log('Successfully created API client with provided privateKey');
        } catch (error: any) {
          console.error('Failed to initialize API client:', error);
          // Log error but don't fail the request - allow scan to proceed
          console.log('Continuing without API client - tools will require valid credentials');
        }
      }
    } else {
      console.log('No privateKey provided - tools will require credentials when invoked');
    }

    try {
      // Create a new server and transport for each request
      // Pass the API client directly via closure
      const requestServer = createServer(() => requestApiClient);
      const requestTransport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless mode
        enableJsonResponse: true, // Use JSON responses instead of SSE streams
      });

      await requestServer.connect(requestTransport);

      // Let the transport handle the request
      await requestTransport.handleRequest(req, res, req.body);
    } catch (error: any) {
      console.error('Failed to handle MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to handle request', details: error.message });
      }
    }
  });

  app.listen(port, () => {
    console.log(`Sally MCP server listening on port ${port}`);
  });
} else {
  // STDIO transport for local Smithery CLI deployment
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
