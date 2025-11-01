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
server.tool('get-weather', 'Get example weather data', {}, async () => {
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
  'Chat with Sally to talk about metabolic health',
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

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/mcp', async (req, res) => {
    // Extract privateKey from query parameters
    const privateKey = req.query.privateKey as Hex;

    if (!privateKey) {
      res.status(400).json({ error: 'Missing privateKey query parameter' });
      return;
    }

    try {
      // Create API client with the provided privateKey
      const account = privateKeyToAccount(privateKey);
      api = withPaymentInterceptor(axios.create({ baseURL: 'https://api-x402.asksally.xyz' }), account);

      // Connect the transport
      const transport = new SSEServerTransport('/mcp', res);
      await server.connect(transport);
    } catch (error: any) {
      console.error('Failed to initialize MCP connection:', error);
      res.status(500).json({ error: 'Failed to initialize connection', details: error.message });
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
