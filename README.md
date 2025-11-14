<div align="center">

# Sally MCP Server

### AI-Powered Metabolic Health Assistant with Blockchain-Based Payments

**Connect to Sally through the Model Context Protocol (MCP) with x402 payment infrastructure**

[![Smithery](https://img.shields.io/badge/Smithery-Compatible-blue)](https://smithery.ai/server/@sally-labs/sally-ai-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-1.9-green)](https://modelcontextprotocol.io)

[Quick Start](#-quick-start) · [Installation](#-installation) · [Usage](#-usage) · [API Reference](#-api-reference) · [Deployment](#-deployment)

</div>

---

## What is Sally MCP Server?

Sally MCP Server is a **Model Context Protocol (MCP)** server that enables AI assistants like Claude Desktop, Cursor, and other MCP-compatible clients to interact with **Sally**, an AI-powered metabolic health assistant.

Built with the **x402 blockchain-based payment protocol**, Sally MCP ensures secure, transparent micropayments for each AI interaction while keeping your private keys and data entirely on your local machine.

### Key Features

- 🏥 **Metabolic Health Expertise**: Chat with Sally about nutrition, metabolism, and health optimization
- 💰 **x402 Payment Integration**: Automatic blockchain-based micropayments for API usage
- 🚀 **Multi-Transport Support**: Deploy locally (stdio) or hosted (HTTP/SSE via Smithery)
- 🔒 **Security First**: Private keys never leave your device
- 🔌 **MCP Compatible**: Works with Claude Desktop, Cursor, and any MCP-compatible client
- ⚡ **Type-Safe**: Built with TypeScript and Zod schemas for reliability
- 🐳 **Production Ready**: Dockerized and ready for Smithery cloud deployment

### Architecture

```
┌─────────────────────┐
│  MCP Client         │
│  (Claude, Cursor)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐      ┌──────────────────┐
│  Sally MCP Server   │──────│  x402 Payment    │
│  (Local/Smithery)   │      │  Protocol        │
└──────────┬──────────┘      └──────────────────┘
           │
           ▼
┌─────────────────────┐
│  Sally API          │
│  (Metabolic Health) │
└─────────────────────┘
```

---

## 🚀 Quick Start

Get up and running in 5 minutes:

### Prerequisites

- Node.js 18+ and pnpm installed
- An MCP-compatible client ([Claude Desktop](https://claude.ai/download), [Cursor](https://cursor.sh/), etc.)
- A dedicated crypto wallet with small funds for x402 transactions

### 1. Install via Smithery (Recommended)

The easiest way to use Sally MCP is through [Smithery](https://smithery.ai):

```bash
npx @smithery/cli install @sally-labs/sally-ai-mcp --client claude
```

### 2. Install Locally

```bash
# Clone and setup
git clone https://github.com/sally-labs/sally-mcp.git
cd sally-mcp
pnpm install
pnpm build
```

### 3. Configure Your MCP Client

Add to your MCP client configuration (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "sally": {
      "command": "node",
      "args": ["/path/to/sally-mcp/dist/index.js"],
      "env": {
        "PRIVATE_KEY": "0x...",
        "TRANSPORT_MODE": "stdio"
      }
    }
  }
}
```

### 4. Test the Connection

Restart your MCP client and try:

```
"Use the chat-with-sally tool to ask: What are the benefits of intermittent fasting?"
```

---

## 🔧 Installation

### Option A: Deploy with Smithery (Cloud Hosted)

Smithery provides managed hosting for MCP servers with automatic scaling and updates.

```bash
# Install Smithery CLI
npm install -g @smithery/cli

# Install Sally MCP
npx @smithery/cli install @sally-labs/sally-ai-mcp --client claude
```

Configure via Smithery dashboard:
- **Private Key**: Your dedicated wallet's private key (with 0x prefix)
- The server will be automatically available in your MCP clients

### Option B: Local Development Setup

#### Step 1: Create a Dedicated Wallet

**⚠️ Security Critical**: Never use your main wallet for MCP integrations.

1. Create a new wallet using MetaMask, Coinbase Wallet, or similar
2. Transfer a small amount of funds (e.g., $5-10 worth of crypto)
3. Export the private key (it should start with `0x`)
4. Store it securely

#### Step 2: Clone and Install

```bash
# Clone repository
git clone https://github.com/sally-labs/sally-mcp.git
cd sally-mcp

# Install dependencies
pnpm install
```

#### Step 3: Configure Environment

Create a `.env` file:

```bash
PRIVATE_KEY=0x...
TRANSPORT_MODE=stdio
```

#### Step 4: Build and Run

```bash
# Build TypeScript
pnpm build

# Run the server
node dist/index.js
```

---

## 📱 MCP Client Configuration

### Claude Desktop

1. Open Claude Desktop Settings
2. Navigate to **Developer → Edit Config**
3. Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sally": {
      "command": "node",
      "args": ["/Users/yourname/code/sally-mcp/dist/index.js"],
      "env": {
        "PRIVATE_KEY": "0x...",
        "TRANSPORT_MODE": "stdio"
      }
    }
  }
}
```

4. Restart Claude Desktop
5. The Sally tools should appear automatically

### Cursor

1. Open Cursor Settings
2. Navigate to **Features → MCP Servers**
3. Add server configuration:

```json
{
  "sally": {
    "command": "node",
    "args": ["/path/to/sally-mcp/dist/index.js"],
    "env": {
      "PRIVATE_KEY": "0x...",
      "TRANSPORT_MODE": "stdio"
    }
  }
}
```

4. Restart Cursor

### Other MCP Clients

Refer to your client's documentation for custom MCP server configuration. You'll need:

- **Command**: `node`
- **Args**: `["/path/to/sally-mcp/dist/index.js"]`
- **Environment Variables**: `PRIVATE_KEY`, `TRANSPORT_MODE=stdio`

---

## 💬 Usage

### Basic Interaction

Once configured, interact with Sally naturally through your MCP client:

```
"Use chat-with-sally to ask: What foods help stabilize blood sugar?"
```

```
"Ask Sally about the relationship between sleep and metabolic health"
```

```
"Use Sally to create a meal plan for someone with insulin resistance"
```

### Available Tools

#### chat-with-sally

Chat with Sally about metabolic health topics.

**Parameters:**
- `message` (string, required): Your question or message to Sally

**Example:**

```typescript
{
  "message": "What are the best exercises for improving insulin sensitivity?"
}
```

**Response:**

```json
{
  "report": {
    "message": "Resistance training and high-intensity interval training (HIIT) are particularly effective for improving insulin sensitivity..."
  }
}
```

### Understanding Costs

Each interaction with Sally uses x402 micropayments:

- **Chat messages**: Micropayments per API request
- **Payments are automatic** from your dedicated wallet
- **All transactions are on-chain** and verifiable
- **Monitor your spending** through your wallet or blockchain explorer

---

## 🔐 Security

### Security Architecture

```
┌─────────────────────────┐
│  Your Device (Local)    │
│  ┌─────────────────┐   │
│  │ MCP Client      │   │
│  └────────┬────────┘   │
│           │            │
│  ┌────────▼────────┐   │
│  │ Sally MCP       │   │
│  │ (Local Process) │   │
│  └────────┬────────┘   │
│           │            │
│  ┌────────▼────────┐   │
│  │ Private Key     │   │
│  │ (Never Leaves)  │   │
│  └─────────────────┘   │
└─────────────────────────┘
           │
           ▼ (Only signed transactions)
┌─────────────────────────┐
│  Internet / Blockchain  │
└─────────────────────────┘
```

### Best Practices

✅ **DO:**

- Use a dedicated, separate wallet for MCP interactions
- Keep only small amounts ($5-20) in your MCP wallet
- Store your private key securely (password manager, hardware wallet)
- Regularly review your x402 transaction history
- Use test/sandbox environments before mainnet
- Keep your MCP server and dependencies updated

❌ **DON'T:**

- Use your main wallet's private key
- Share your private key with anyone
- Store private keys in plain text or version control
- Keep large amounts in your MCP wallet
- Reuse private keys across different services
- Commit `.env` files to git

### Security Features

- **Local-First**: Server runs entirely on your machine (stdio mode)
- **No Key Upload**: Private keys never transmitted to external servers
- **Encrypted Transactions**: All payments use blockchain encryption
- **Transparent Costs**: Every payment is verifiable on-chain
- **Isolated Wallet**: Dedicated wallet limits exposure

---

## 🛠️ API Reference

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PRIVATE_KEY` | Your dedicated wallet's private key (with 0x prefix) | Yes* | - |
| `TRANSPORT_MODE` | Transport mode: `stdio` or `http` | No | `stdio` |
| `PORT` | HTTP server port (when `TRANSPORT_MODE=http`) | No | `8081` |

*Required for STDIO mode. Optional for HTTP mode (Smithery deployment).

### MCP Server Capabilities

```typescript
{
  name: 'x402 MCP Sally Server',
  version: '1.0.0',
  capabilities: {
    tools: true,
    prompts: true,
    resources: true
  }
}
```

### Tool Schemas

#### chat-with-sally

```typescript
{
  name: 'chat-with-sally',
  description: 'Chat with Sally to talk about metabolic health (requires privateKey configuration)',
  inputSchema: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'The message to send to Sally'
      }
    },
    required: ['message']
  },
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true
  }
}
```

---

## 🚢 Deployment

### Deploy to Smithery

1. **Create Smithery Account**: Sign up at [smithery.ai](https://smithery.ai)

2. **Install via Smithery CLI**:
   ```bash
   npx @smithery/cli install @sally-labs/sally-ai-mcp --client claude
   ```

3. **Configure**:
   - Add your `PRIVATE_KEY` via Smithery dashboard (optional for browsing)
   - The server will be available at your Smithery URL

4. **Connect MCP Clients**:
   - Smithery automatically configures supported MCP clients
   - Or manually add the Smithery URL to your client config

### Docker Deployment

Build and run locally:

```bash
# Build image
docker build -t sally-mcp .

# Run locally (stdio mode)
docker run -i --rm \
  -e PRIVATE_KEY=0x... \
  -e TRANSPORT_MODE=stdio \
  sally-mcp

# Run as HTTP server
docker run -d -p 8081:8081 \
  -e PRIVATE_KEY=0x... \
  -e TRANSPORT_MODE=http \
  sally-mcp
```

### Deploy to Cloud

The Docker image can be deployed to any container platform:

- **AWS ECS/Fargate**: Use task definitions with environment variables
- **Google Cloud Run**: Deploy with secrets for private key
- **Azure Container Instances**: Configure with environment settings
- **Railway/Render**: Direct GitHub integration available

---

## 🐛 Troubleshooting

### MCP Server Not Appearing

**Symptoms**: Server doesn't show up in your MCP client's tools list

**Solutions**:
1. Verify the configuration file path is correct
2. Check that Node.js is installed: `node --version`
3. Ensure the server path uses absolute paths:
   - macOS/Linux: `/Users/name/path/sally-mcp/dist/index.js`
   - Windows: `C:\\Users\\name\\path\\sally-mcp\\dist\\index.js`
4. Build the project first: `pnpm build`
5. Restart your MCP client completely
6. Check MCP client logs for errors

### Connection Errors

**Symptoms**: "Failed to connect" or timeout errors

**Solutions**:
1. Verify internet connection
2. Check Sally API endpoint is accessible:
   ```bash
   curl https://api-x402.asksally.xyz/health
   ```
3. Ensure wallet has sufficient funds
4. Confirm private key format (should include `0x` prefix and be 66 characters)
5. Check server logs for detailed errors

### Private Key Issues

**Symptoms**: Authentication or payment failures

**Solutions**:
1. Ensure private key starts with `0x` and is exactly 66 characters
2. Check for extra spaces or line breaks in environment variable
3. Verify the wallet has funds on the correct network
4. Test the private key format:
   ```bash
   # Should be: 0x + 64 hex characters = 66 total
   echo $PRIVATE_KEY | wc -c
   ```

### Payment Failures

**Symptoms**: "Insufficient funds" or payment errors (402 status)

**Solutions**:
1. Check wallet balance on blockchain explorer
2. Verify you're on the correct network (mainnet/testnet)
3. Ensure gas fees are accounted for
4. Try with a larger initial wallet balance
5. Review x402 payment logs in server output

### Tool Not Triggering

**Symptoms**: MCP client doesn't recognize tool invocations

**Solutions**:
1. Use explicit phrasing: "Use the chat-with-sally tool"
2. Check that tools are listed: verify server initialized correctly
3. Restart client after configuration changes
4. Check client documentation for tool invocation syntax
5. Verify server is running in stdio mode (not http)

### Getting Help

If you're still experiencing issues:

- **GitHub Issues**: [github.com/sally-labs/sally-mcp/issues](https://github.com/sally-labs/sally-mcp/issues)
- **Email Support**: support@asksally.xyz
- **Community**: [bento.me/a1c](https://bento.me/a1c)

When reporting issues, please include:
- MCP client name and version
- Operating system
- Error messages from logs
- Configuration (with private key redacted)
- Server build output

---

## 🧪 Development

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/sally-labs/sally-mcp.git
cd sally-mcp

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run in stdio mode
PRIVATE_KEY=0x... node dist/index.js
```

### Project Structure

```
sally-mcp/
├── index.ts              # Main server entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── smithery.yaml         # Smithery deployment config
├── Dockerfile            # Container image
├── .dockerignore         # Docker build exclusions
├── .env.example          # Environment template
└── README.md            # This file
```

### Building

```bash
# TypeScript compilation
pnpm build

# Run production build
node dist/index.js
```

### Testing

#### Test stdio mode locally:

```bash
# Set environment
export PRIVATE_KEY=0x...
export TRANSPORT_MODE=stdio

# Run server
node dist/index.js
```

#### Test HTTP mode:

```bash
# Start HTTP server
TRANSPORT_MODE=http PORT=8081 node dist/index.js

# Test health endpoint
curl http://localhost:8081/health

# Test MCP initialize
curl -X POST http://localhost:8081/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'

# Test tools/list
curl -X POST http://localhost:8081/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Ways to Contribute

- **Bug Reports**: Open an issue with reproduction steps
- **Feature Requests**: Describe your use case and proposed solution
- **Code Contributions**: Submit a pull request
- **Documentation**: Improve guides and examples
- **Testing**: Add test coverage

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Make** your changes
4. **Test** thoroughly
5. **Commit** with clear messages: `git commit -m "feat: add new capability"`
6. **Push** to your fork: `git push origin feature/my-feature`
7. **Open** a pull request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Maintenance tasks

### Code Review Process

1. All PRs require review before merging
2. Ensure TypeScript compiles without errors
3. Documentation must be updated for new features
4. Breaking changes require clear migration notes

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Smithery**: [smithery.ai/server/@sally-labs/sally-ai-mcp](https://smithery.ai/server/@sally-labs/sally-ai-mcp)
- **GitHub**: [github.com/sally-labs/sally-mcp](https://github.com/sally-labs/sally-mcp)
- **x402 Protocol**: [x402.org](https://x402.org)
- **Model Context Protocol**: [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Support**: support@asksally.xyz
- **Community**: [bento.me/a1c](https://bento.me/a1c)

---

## 🙏 Acknowledgments

Built with:
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io) - AI integration standard
- [x402 Protocol](https://x402.org) - Blockchain payment infrastructure
- [Smithery](https://smithery.ai) - MCP server hosting platform
- [viem](https://viem.sh) - Ethereum development toolkit

---

<div align="center">

**Made with ❤️ by the Sally Labs team**

[⬆ Back to Top](#sally-mcp-server)

</div>
