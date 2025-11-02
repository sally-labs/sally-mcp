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

// Create an MCP server factory function
// getApiClient: function to retrieve API client for the current session
const createServer = (getApiClient: () => ApiClient | undefined) => {
  const server = new McpServer({
    name: 'x402 MCP Sally Server',
    version: '1.0.0',
  });

  // Add tools to the server
  server.tool('get-weather', 'Get example weather data (requires privateKey configuration)', {}, async () => {
    const apiClient = getApiClient();
    if (!apiClient) {
      return {
        content: [{ type: 'text', text: 'Error: API client not initialized. Please provide a valid privateKey.' }],
      };
    }

    try {
      const res = await apiClient.get('/weather');
      return {
        content: [{ type: 'text', text: JSON.stringify(res.data) }],
      };
    } catch (err: any) {
      console.error(err);
      return {
        content: [
          {
            type: 'text',
            text: `Failed to fetch weather data. Error: ${err.response?.data?.message || err.message}`,
          },
        ],
      };
    }
  });

  server.tool(
    'chat-with-sally',
    'Chat with Sally to talk about metabolic health (requires privateKey configuration)',
    {
      message: z.string().describe('The message to send to Sally'),
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

  return server;
};

// For STDIO mode, create a single server instance with global API client
export const server = createServer(() => api);

// Connect with appropriate transport based on mode
if (transportMode === 'http') {
  // HTTP transport for Smithery hosted deployment
  const app = express();
  const port = process.env.PORT || 8081;

  // Store server instances per session
  const serverInstances = new Map<string, McpServer>();

  // Add middleware for parsing JSON and URL-encoded data
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Create single transport with session management
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(), // Stateful mode with session tracking
    enableJsonResponse: true, // Use JSON responses instead of SSE streams
    onsessioninitialized: async (sessionId: string) => {
      console.log(`Session initialized: ${sessionId}`);

      // Create server instance for this session
      const sessionServer = createServer(() => apiClients.get(sessionId));
      serverInstances.set(sessionId, sessionServer);

      // Connect the session server to the transport
      await sessionServer.connect(transport);
    },
    onsessionclosed: (sessionId: string) => {
      console.log(`Session closed: ${sessionId}`);
      // Clean up session data
      apiClients.delete(sessionId);
      serverInstances.delete(sessionId);
    },
  });

  // Handle all HTTP methods on /mcp endpoint
  app.all('/mcp', async (req, res) => {
    console.log(`Received ${req.method} /mcp request`);

    // Extract privateKey from query parameters or request body (optional for scanning)
    const privateKeyStr = (req.query.privateKey as string) || (req.body?.privateKey as string);

    console.log('Request with privateKey:', privateKeyStr ? 'present' : 'missing');

    // If privateKey is provided, validate and initialize API client for this session
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

          // Create API client with the provided privateKey
          const account = privateKeyToAccount(privateKey);
          const apiClient = withPaymentInterceptor(axios.create({ baseURL: 'https://api-x402.asksally.xyz' }), account);

          // Extract session ID from response header (set by transport after handling request)
          // We'll store the client temporarily and the session callback will pick it up
          // Note: Session ID is generated during handleRequest, so we need a temporary storage
          const tempApiClient = apiClient;

          // Intercept response to extract session ID and store API client
          const originalSetHeader = res.setHeader.bind(res);
          res.setHeader = function(name: string, value: string | number | readonly string[]) {
            if (name.toLowerCase() === 'mcp-session-id' && typeof value === 'string') {
              console.log(`Storing API client for session: ${value}`);
              apiClients.set(value, tempApiClient);
            }
            return originalSetHeader(name, value);
          };

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
      // Let the transport handle the request
      // Transport will generate session ID and call onsessioninitialized callback
      await transport.handleRequest(req, res, req.body);
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
