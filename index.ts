import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';
import { config } from 'dotenv';
import express from 'express';
import type { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { withPaymentInterceptor } from 'x402-axios';
import { z } from 'zod';

config();

const transportMode = process.env.TRANSPORT_MODE || 'stdio';

// In HTTP mode, API client will be created per-request from query params
// In STDIO mode, use environment variable
let api: ReturnType<typeof withPaymentInterceptor>;

if (transportMode === 'stdio') {
  const privateKey = process.env.PRIVATE_KEY as Hex;
  if (!privateKey) {
    throw new Error('Missing PRIVATE_KEY environment variable for STDIO mode');
  }
  const account = privateKeyToAccount(privateKey);
  api = withPaymentInterceptor(axios.create({ baseURL: 'https://api-x402.asksally.xyz' }), account);
}
// In HTTP mode, api will be set when handling requests

// Create an MCP server
export const server = new McpServer({
  name: 'x402 MCP Sally Server',
  version: '1.0.0',
});

// Add an addition tool
server.tool('get-weather', 'Get example weather data (requires privateKey configuration)', {}, async () => {
  if (!api) {
    return {
      content: [{ type: 'text', text: 'Error: API client not initialized. Please provide a valid privateKey.' }],
    };
  }

  try {
    const res = await api.get('/weather');
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
    if (!api) {
      return {
        content: [{ type: 'text', text: 'Error: API client not initialized. Please provide a valid privateKey.' }],
      };
    }

    const { message } = args;
    try {
      const res = await api.post('/chats', { message });
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

// Connect with appropriate transport based on mode
if (transportMode === 'http') {
  // HTTP/SSE transport for Smithery hosted deployment
  const app = express();
  const port = process.env.PORT || 8081;

  // Add middleware for parsing JSON and URL-encoded data
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/mcp', async (req, res) => {
    // Extract privateKey from query parameters or request body (optional for scanning)
    let privateKeyStr = (req.query.privateKey as string) || (req.body?.privateKey as string);

    console.log('Received /mcp request with privateKey:', privateKeyStr ? 'present' : 'missing');

    // If privateKey is provided, validate and initialize API client
    if (privateKeyStr) {
      // Validate hex format: must start with 0x and be 66 characters (0x + 64 hex digits)
      if (!privateKeyStr.startsWith('0x') || privateKeyStr.length !== 66) {
        console.log('Invalid privateKey format:', privateKeyStr);
        res.status(400).json({
          error: 'Invalid privateKey format',
          details: 'Private key must start with 0x and be 66 characters long (0x + 64 hex digits)'
        });
        return;
      }

      try {
        // Cast to Hex after validation
        const privateKey = privateKeyStr as Hex;

        // Create API client with the provided privateKey
        const account = privateKeyToAccount(privateKey);
        api = withPaymentInterceptor(axios.create({ baseURL: 'https://api-x402.asksally.xyz' }), account);

        console.log('Successfully initialized API client with provided privateKey');
      } catch (error: any) {
        console.error('Failed to initialize API client:', error);
        res.status(500).json({ error: 'Failed to initialize API client', details: error.message });
        return;
      }
    } else {
      console.log('No privateKey provided - tools will require credentials when invoked');
      // Allow connection without API client for tool discovery/scanning
      api = undefined as any;
    }

    try {
      // Connect the transport (works with or without API client)
      const transport = new SSEServerTransport('/mcp', res);
      await server.connect(transport);
    } catch (error: any) {
      console.error('Failed to connect MCP transport:', error);
      res.status(500).json({ error: 'Failed to connect transport', details: error.message });
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
