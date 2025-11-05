# Sally MCP Server with x402

[![smithery badge](https://smithery.ai/badge/@sally-labs/sally-ai-mcp)](https://smithery.ai/server/@sally-labs/sally-ai-mcp)

An MCP (Model Context Protocol) server that enables MCP-compatible clients (such as Claude Desktop, Cursor, and others) to interact with Sally (AskSally) using x402 blockchain-based payments. This integration allows you to access Sally's capabilities directly through your preferred MCP client.

## 🔒 Security First

**Important Security Notice:**

- This MCP server runs **locally on your device only**
- Your private key never leaves your machine
- We never have access to your private key or wallet
- **Always use a dedicated wallet for MCP interactions** - never use your main wallet
- Create a clean, new wallet specifically for this integration

## What This Integration Does

This MCP server connects MCP-compatible clients to Sally, enabling you to interact with Sally's AI capabilities through any supported MCP client.  
All interactions are secured through x402's blockchain-based payment protocol, ensuring transparent and secure transactions.

## Prerequisites

Before you begin, ensure you have:

- An **MCP-compatible client** installed (e.g., [Claude Desktop](https://claude.ai/download), [Cursor](https://cursor.sh/), or other MCP clients)
- **Node.js** (v18 or higher recommended)
- **pnpm** package manager
- A **new, dedicated crypto wallet** with a small amount of funds for x402 transactions

### Installing pnpm

If you don't have pnpm installed:

```
npm install -g pnpm
```


## Installation

### Step 1: Create a Dedicated Wallet

**⚠️ Critical Security Step**  
Do not skip this step. Create a new wallet specifically for MCP interactions:

1. Use your preferred wallet provider (e.g., MetaMask, Coinbase Wallet)
2. Create a **new wallet** separate from your main wallet
3. Transfer only a small amount of funds needed for x402 transactions
4. Export and securely store the private key for this new wallet
5. **Never reuse your main wallet's private key**

### Step 2: Install the MCP Server

Clone and install the MCP server locally:

```
# Clone the repository
git clone https://github.com/yourusername/ask-sally-mcp
cd ask-sally-mcp

# Install dependencies
pnpm install
```

<br>
<br>

### Step 3: Configure Your MCP Client

Configuration varies by MCP client. Below are examples for popular clients:  
For Claude Desktop

1. Open Claude Desktop
2. Navigate to **Settings → Developer → Local MCP Servers → Edit Config**
3. Add the following configuration to your `claude-desktop-config.json`:

```
{
  "mcpServers": {
    "ask-sally": {
      "command": "pnpm",
      "args": [
        "--silent",
        "-C",
        "{PATH_TO_YOUR_MCP_SERVER}",
        "dev"
      ],
      "env": {
        "PRIVATE_KEY": "{YOUR_WALLET_PRIVATE_KEY}",
        "RESOURCE_SERVER_URL": "https://api-x402.asksally.xyz"
      }
    }
  }
}
```

**For Cursor**  

1. Open Cursor
2. Navigate to **Settings → Features → MCP Servers**
3. Add a new MCP server with similar configuration:

```
{
  "ask-sally": {
    "command": "pnpm",
    "args": [
      "--silent",
      "-C",
      "{PATH_TO_YOUR_MCP_SERVER}",
      "dev"
    ],
    "env": {
      "PRIVATE_KEY": "{YOUR_WALLET_PRIVATE_KEY}",
      "RESOURCE_SERVER_URL": "https://api-x402.asksally.xyz"
    }
  }
}
```

<br>
<br>
For Other MCP Clients  
Consult your MCP client's documentation for how to add custom MCP servers. You'll need to provide:  

- Command: `pnpm`
- Arguments: `["--silent", "-C", "{PATH_TO_YOUR_MCP_SERVER}", "dev"]`
- Environment variables as shown above

**Replace the placeholders:**

- `{PATH_TO_YOUR_MCP_SERVER}`: Full path to the `ask-sally-mcp` directory
    - Example (macOS/Linux): `/Users/yourname/code/ask-sally-mcp`
    - Example (Windows): `C:\\Users\\yourname\\code\\ask-sally-mcp`
- `{YOUR_WALLET_PRIVATE_KEY}`: The private key from your **dedicated wallet** (not your main wallet)

### Step 4: Enable the MCP Server

In Claude Desktop

1. Restart Claude Desktop
2. Open the **Search and Tools** menu
3. Verify that **ask-sally** is listed and enabled
4. Toggle it on if it's not already enabled

In Cursor

1. Restart Cursor
2. The MCP server should be automatically available
3. Check your client's MCP server settings to verify it's enabled

In Other MCP Clients  
Restart your MCP client and follow its specific instructions for enabling custom MCP servers.

## Usage

Once configured, you can interact with Sally directly through your MCP client using natural language:

### Example Queries

**Interacting with Sally:**

```
"Please use sally chat tool to answer this question: xxx"
```

<br>

**Using Sally's capabilities:**  

```
"Use the sally tool to help me with this task"
```

<br>
<br>
The MCP server will automatically handle x402 payments for each interaction using your dedicated wallet.  

**Note:** The exact phrasing to trigger the tool may vary by MCP client. Refer to your client's documentation for specific syntax.  

## Understanding x402 Payments

Each interaction with Sally through this MCP server uses x402 for micropayments:

- Payments are processed automatically from your dedicated wallet
- Transaction costs are transparent and minimal
- You maintain full control over your funds
- All payment records are on-chain and verifiable

## Troubleshooting

### MCP Server Not Appearing in Your Client

**Solution:**

1. Verify the configuration file path is correct for your specific MCP client
2. Check that pnpm is properly installed (`pnpm --version`)
3. Ensure the MCP server directory path uses the correct format for your OS
4. Restart your MCP client after any configuration changes
5. Consult your MCP client's documentation for troubleshooting MCP server connections

### Connection Errors

**Solution:**

1. Verify your internet connection
2. Check that the `RESOURCE_SERVER_URL` is correct
3. Ensure your wallet has sufficient funds for x402 transactions
4. Confirm the private key is correctly formatted (no extra spaces or quotes)

### Private Key Issues

**Solution:**

1. Double-check you're using the private key from your **dedicated wallet**
2. Ensure the private key doesn't include any prefixes (like "0x" if not required)
3. Verify there are no extra spaces or line breaks in the key
4. Make sure the key is from a wallet with a small amount of funds

### Tool Not Triggering

**Solution:**

1. Use explicit phrasing like "Please use sally chat tool" or "Use the sally tool"
2. Verify the tool is enabled in your MCP client's settings/tools menu
3. Restart your MCP client if the tool was just enabled
4. Check your client's documentation for the correct syntax to invoke MCP tools

## Security Best Practices

✅ **Do:**

- Use a dedicated, separate wallet for MCP interactions
- Keep only small amounts in your MCP wallet
- Store your private key securely and never share it
- Regularly review your x402 transaction history
- Use the test/sandbox environment before mainnet

❌ **Don't:**

- Use your main wallet's private key
- Share your private key with anyone
- Store your private key in plain text in shared locations
- Keep large amounts in your MCP wallet
- Reuse private keys across different services

## Privacy & Data

- The MCP server runs entirely on your local machine
- Your private key never leaves your device
- We never have access to your wallet or private keys
- Interactions are secured and encrypted
- You maintain full ownership of your data and wallet

## Environment Variables

|     |     |     |
| --- | --- | --- |
| Variable<br> | Description<br> | Required<br> |
| `PRIVATE_KEY`<br> | Your dedicated wallet's private key<br> | Yes<br> |
| `RESOURCE_SERVER_URL`<br> | The x402 resource server endpoint<br> | Yes<br> |

## Support

If you encounter issues or have questions:

- **Support Email:** [support@asksally.xyz](mailto:support@asksally.xyz)
- **Community:** [https://bento.me/a1c]()
- **GitHub Issues:** [https://github.com/sally-labs/sally-mcp/issues]()


* * *

**Remember:** This integration is designed for your security and privacy. Your private key and data remain entirely under your control. Always use a dedicated wallet for MCP interactions.  
<br>
