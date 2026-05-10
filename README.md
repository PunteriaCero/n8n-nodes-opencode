# n8n-nodes-opencode

OpenCode custom node for n8n. Enables n8n workflows to seamlessly execute tasks in OpenCode with session management, error handling, and retry logic.

## Quick Start (Recommended)

**Download latest release:**
```bash
# Get the latest release from GitHub
cd /path/to/n8n/nodes
wget https://github.com/hlavrencic/n8n-nodes-opencode/releases/download/v1.0.0/n8n-opencode-node-v1.0.0.tar.gz
tar -xzf n8n-opencode-node-v1.0.0.tar.gz

# On CasaOS: /DATA/AppData/n8n/
# Then restart n8n
```

**Or use npm:**
```bash
npm install n8n-nodes-opencode
```

[See all releases →](https://github.com/hlavrencic/n8n-nodes-opencode/releases)

## Overview

This node provides a reusable, production-ready integration between n8n and OpenCode. Instead of making raw HTTP requests, workflows can now use the **OpenCode** node just like any other n8n node.

### Key Features

- ✅ **Session Management** — Automatic session creation and lifecycle management
- ✅ **Error Handling** — Built-in retry logic, timeout handling, and error messages
- ✅ **Credentials** — Centralized OpenCode URL configuration (no hardcoding)
- ✅ **Async Execution** — Wait for responses or fire-and-forget
- ✅ **Batch Processing** — Handle multiple items in a workflow
- ✅ **Logging** — Full audit trail of prompts and responses

## Problem Statement

**Current state (before node):**
```
n8n Workflow
    ↓
├─ HTTP Request: POST /session (create session)
├─ Set: Extract session ID
├─ HTTP Request: POST /session/{id}/message (send prompt)
├─ Wait: Handle timeouts manually
└─ Error handling: scattered across workflow
```

**With this node:**
```
n8n Workflow
    ↓
OpenCode Node
    ↓
├─ Auto session management ✅
├─ Built-in error handling ✅
├─ Configurable timeouts ✅
└─ Response parsing ✅
```

## Use Cases

1. **Scheduled LinkedIn Responder** (current)
   - n8n checks for unread messages daily at 18:00
   - Calls OpenCode node to generate professional responses
   - Sends via LinkedIn API

2. **Code Review Automation**
   - n8n detects PR updates
   - OpenCode analyzes code changes
   - Returns review comments

3. **Customer Support Chatbot**
   - n8n receives Slack messages
   - OpenCode generates contextual responses
   - Posts back to Slack

4. **Document Summarization**
   - n8n monitors email attachments
   - OpenCode summarizes PDFs/docs
   - Stores summaries in database

## Installation

### Prerequisites
- n8n >= 0.200.0
- Node.js >= 16.0.0
- Running OpenCode instance

### Method 1: Via npm (future, when published)
```bash
npm install n8n-nodes-opencode
```

### Method 2: Local Development
```bash
git clone https://github.com/yourusername/n8n-nodes-opencode.git
cd n8n-nodes-opencode
npm install
npm run build

# Copy to n8n custom nodes directory
cp -r dist ~/.n8n/nodes/@opencode/n8n-nodes-opencode
```

### Method 3: Docker Compose
In your `docker-compose.yml`:
```yaml
services:
  n8n:
    environment:
      N8N_NODES_INCLUDE: "@opencode/n8n-nodes-opencode"
    volumes:
      - ./n8n-nodes-opencode:/home/node/.n8n/nodes/@opencode/n8n-nodes-opencode
```

## Configuration

### 1. Create OpenCode Credentials

In n8n UI:
1. **Credentials** → **New** → Search for "OpenCode"
2. Fill in:
   - **Base URL**: `http://192.168.0.214:4096` (or your OpenCode URL)
   - **Session Timeout**: `180` (seconds, default)

### 2. Use in Workflow

1. Add **OpenCode** node to workflow
2. Select previously created credentials
3. Configure node parameters:
   - **Prompt**: Task description for OpenCode
   - **Session Title**: Human-readable title (e.g., "LinkedIn reply - John Doe")
   - **Wait for Response**: Toggle to wait or fire-and-forget

## Node Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | String | ✅ Yes | - | Task description for OpenCode (supports expressions) |
| `title` | String | ❌ No | "n8n task" | Session title for UI identification |
| `waitForResponse` | Boolean | ❌ No | `true` | Wait for OpenCode to complete |
| `maxRetries` | Number | ❌ No | `3` | Retry attempts on failure |
| `retryDelay` | Number | ❌ No | `2000` | Delay between retries (ms) |
| `continueOnError` | Boolean | ❌ No | `false` | Continue workflow if node fails |

## Output Format

### Success Response
```json
{
  "success": true,
  "sessionId": "sess_abc123xyz",
  "response": {
    "content": "Generated response from OpenCode",
    "tokens_used": 1250,
    "execution_time": 45
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Session timeout after 180 seconds",
  "sessionId": "sess_abc123xyz",
  "retryCount": 2
}
```

## Example Workflows

### Example 1: LinkedIn Message Responder

**Trigger:** Cron (daily at 18:00)
1. **HTTP Request** → Get unread conversations
2. **For Each** → Loop through conversations
3. **OpenCode** → Generate response
   - Prompt: `"Responder al mensaje de ${participant}: ${last_message}"`
   - Title: `"LinkedIn reply - ${participant_name}"`
4. **HTTP Request** → Send reply via LinkedIn API

### Example 2: Code Review from PR

**Trigger:** GitHub Webhook (on PR update)
1. **GitHub** → Get PR diff
2. **OpenCode** → Review code
   - Prompt: `"Analiza este código:\n${diff}"`
   - Title: `"Code Review: PR #${pr_number}"`
3. **GitHub** → Post comment with response

## Architecture

```
┌─ Credentials ─────────────────────┐
│  • BaseURL                        │
│  • SessionTimeout                 │
└─────────────────────────────────┬─┘
                                  │
    ┌─────────────────────────────▼──────────────┐
    │         OpenCode n8n Node                  │
    ├──────────────────────────────────────────┤
    │                                           │
    │  execute()                                │
    │    ├─ Validate inputs                    │
    │    ├─ Create session (retry logic)       │
    │    ├─ Send prompt                        │
    │    ├─ Poll response (with timeout)       │
    │    └─ Parse & return result              │
    │                                           │
    └──────────────────────────────────────────┘
                     │
                     │ HTTP
                     ▼
         ┌──────────────────────┐
         │  OpenCode Instance   │
         │  - Session API       │
         │  - Message API       │
         └──────────────────────┘
```

## Development

### Project Structure
```
n8n-nodes-opencode/
├── src/
│   ├── nodes/
│   │   └── OpenCode/
│   │       ├── OpenCode.node.ts          # Node definition & logic
│   │       ├── OpenCodeDescription.ts    # UI params & descriptions
│   │       ├── methods/
│   │       │   ├── credentialMethods.ts  # Credential helpers
│   │       │   └── loadOptions.ts        # Dynamic options
│   │       └── tests/
│   │           └── OpenCode.test.ts      # Unit tests
│   ├── credentials/
│   │   ├── OpenCodeApi.credentials.ts    # Credential type
│   │   └── OpenCodeApi.credentials.test.ts
│   ├── types.ts                          # TypeScript interfaces
│   └── index.ts                          # Entry point
├── dist/                                 # Compiled output (generated)
├── package.json
├── tsconfig.json
├── jest.config.js
├── .gitignore
├── README.md
└── DEVELOPMENT.md                        # Detailed dev guide
```

### Setup Development Environment
```bash
# Clone and install
git clone https://github.com/yourusername/n8n-nodes-opencode.git
cd n8n-nodes-opencode
npm install

# Build
npm run build

# Test
npm test

# Watch mode (auto-rebuild on changes)
npm run dev
```

### Scripts
```bash
npm run build      # Compile TypeScript → JavaScript
npm run dev        # Watch mode + auto-build
npm test           # Run jest tests
npm run lint       # Run ESLint
npm run format     # Format with Prettier
```

## Testing

### Manual Testing
1. Run n8n with custom node installed
2. Create new workflow
3. Add OpenCode node
4. Configure credentials
5. Set test prompt
6. Execute and verify response

### Automated Testing
```bash
npm test

# With coverage
npm test -- --coverage
```

## Troubleshooting

### Node Not Appearing in n8n

**Problem:** Node doesn't show in n8n UI after installation

**Solutions:**
1. Verify installation path: `~/.n8n/nodes/@opencode/n8n-nodes-opencode`
2. Check `package.json` has correct `n8n` field
3. Restart n8n service: `docker-compose restart n8n`
4. Check logs: `docker-compose logs n8n | grep -i opencode`

### Session Timeout

**Problem:** "Session timeout after X seconds"

**Solutions:**
- Increase `Session Timeout` in credentials (max 600s)
- Check OpenCode instance is running: `curl http://your-opencode:4096/health`
- Check network connectivity between n8n and OpenCode

### Authentication Failed

**Problem:** HTTP 401 or connection refused

**Solutions:**
- Verify BaseURL is correct
- Check firewall/network rules
- Ensure OpenCode is accessible from n8n container

## Contributing

Contributions welcome! Please:
1. Fork repo
2. Create feature branch: `git checkout -b feature/my-feature`
3. Write tests for new functionality
4. Submit PR with description

## Publishing to npm

```bash
# Bump version
npm version patch  # or minor/major

# Build
npm run build

# Publish
npm publish --access public

# Tag release
git tag v0.1.0
git push origin v0.1.0
```

## Publishing to n8n Marketplace

Once published on npm, submit to [n8n Community Nodes](https://github.com/n8n-io/n8n-nodes-community) for marketplace listing.

## Roadmap

- [ ] Initial v0.1.0 release
- [ ] Polling implementation (async response handling)
- [ ] Webhooks support (receive OpenCode responses via callback)
- [ ] Session reuse (multiple requests in single session)
- [ ] Rate limiting
- [ ] Metrics collection (response times, token usage)
- [ ] Multi-agent support

## License

MIT

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/n8n-nodes-opencode/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/n8n-nodes-opencode/discussions)
- **Documentation**: [DEVELOPMENT.md](./DEVELOPMENT.md)

## Related Projects

- [n8n](https://n8n.io) — Workflow automation platform
- [OpenCode](https://opencode.ai) — AI coding agent
- [n8n Community Nodes](https://github.com/n8n-io/n8n-nodes-community) — Official node list

---

**Created:** May 2026  
**Status:** 🚀 In Development  
**Version:** 0.0.1
