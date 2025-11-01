import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';
import { config } from 'dotenv';
import type { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { withPaymentInterceptor } from 'x402-axios';
import { z } from 'zod';

config();

const privateKey = process.env.PRIVATE_KEY as Hex;
const resourceServerUrl = process.env.RESOURCE_SERVER_URL;

if (!privateKey) {
  throw new Error('Missing private keys');
}

if (!resourceServerUrl) {
  throw new Error('Missing RESOURCE_SERVER_URL');
}

const account = privateKeyToAccount(privateKey);

const api = withPaymentInterceptor(axios.create({ baseURL: resourceServerUrl }), account);

// Create an MCP server
export const server = new McpServer({
  name: 'x402 MCP Sally Server',
  version: '1.0.0',
});

// Add an addition tool
server.tool('get-weather', 'Get example weather data', {}, async () => {
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

const transport = new StdioServerTransport();
await server.connect(transport);
