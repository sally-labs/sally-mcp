##  How to Use Locally in Claude Desktop
*Pre-req:* 
- pnpm
- node
- private key from your crypto wallet

1. Download Claude for Desktop
2. Go to Settings > Developer > Local MCP Servers > Edit Config
3. Use this setting for `claude-desktop-config.json`
```{
  "mcpServers": {
    "ask-sally": {
      "command": "pnpm",
      "args": [
        "--silent",
        "-C",
        "{PATH_TO_YOUR_MCP_SERVER}"// ex: "/Users/code/sally-mcp",
        "dev"
      ],
      "env": {
        "PRIVATE_KEY": "{YOUR_WALLET_PRIVATE_KEY}",
        "RESOURCE_SERVER_URL": "https://sbx-x402.sapa-ai.com"
      }
    }
  }
}
```
4. Make sure sally is enabled in `Search and tools` option
5. Use relevant query to trigger the correct tool
   ex:
   - "What's the weather data today?" to trigger the get weather tool
   - "Please use sally chat tool to answer this question: xxx" to trigger the sally chat tool
