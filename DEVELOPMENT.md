# Development Guide — n8n-nodes-opencode

This guide walks through the development, testing, and contribution process for the OpenCode n8n node.

## Quick Start

```bash
cd /workspace/n8n-nodes-opencode
npm install
npm run build
npm run dev  # Watch mode
```

## Architecture Deep Dive

### How n8n Nodes Work

n8n nodes follow a plugin architecture:

```typescript
export class MyNode implements INodeType {
  description: INodeTypeDescription = { /* ... */ }  // UI metadata
  async execute(context: INodeExecuteFunctions) {    // Logic
    // Get inputs
    const items = this.getInputData()
    
    // Process
    const results = items.map(item => process(item))
    
    // Return
    return [results]
  }
}
```

### Our Node Structure

```
OpenCode Node
    │
    ├─ Credentials
    │  └─ BaseURL + SessionTimeout
    │
    ├─ Parameters (from UI)
    │  ├─ prompt (required)
    │  ├─ title (optional)
    │  ├─ waitForResponse (optional, default: true)
    │  ├─ maxRetries (optional, default: 3)
    │  └─ retryDelay (optional, default: 2000ms)
    │
    └─ Execution Flow
       ├─ Validate inputs
       ├─ Create session (HTTP POST /session)
       ├─ Send prompt (HTTP POST /session/{id}/message)
       ├─ Wait for response (if waitForResponse=true)
       └─ Return result { success, response, sessionId }
```

## File Breakdown

### 1. `OpenCode.node.ts` — Main Logic

```typescript
export class OpenCode implements INodeType {
  // Metadata
  description: INodeTypeDescription = {
    displayName: 'OpenCode',
    name: 'openCode',
    group: ['transform'],
    version: 1,
    description: 'Execute tasks in OpenCode',
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'openCodeApi', required: true }],
    properties: [ /* ... */ ]
  }
  
  // Execution
  async execute(this: INodeExecuteFunctions) {
    const items = this.getInputData()
    const credentials = await this.getCredentials('openCodeApi')
    
    const results = []
    for (const item of items) {
      try {
        // 1. Create session
        // 2. Send prompt
        // 3. Wait for response (optional)
        // 4. Parse and return
      } catch (error) {
        // Handle error
      }
    }
    return [results]
  }
}
```

### 2. `OpenCodeDescription.ts` — UI Metadata

Describes:
- Input fields (textbox, dropdown, toggle, etc.)
- Field names, descriptions, defaults
- Help text
- Validation rules

### 3. `OpenCodeApi.credentials.ts` — Credential Type

Defines:
- Which fields credentials need
- How to display in UI
- Validation

### 4. `types.ts` — TypeScript Interfaces

```typescript
interface OpenCodeConfig {
  baseUrl: string
  sessionTimeout: number
}

interface SessionResponse {
  id: string
  created_at: string
}

interface MessageResponse {
  content: string
  tokens_used: number
  execution_time: number
}
```

## Implementation Checklist

### Phase 1: Core Node (Current)
- [ ] Node class definition
- [ ] Credential type
- [ ] Basic parameters (prompt, title)
- [ ] Session creation
- [ ] Message sending
- [ ] Response parsing
- [ ] Error handling

### Phase 2: Advanced Features
- [ ] Retry logic with backoff
- [ ] Timeout handling
- [ ] Polling implementation
- [ ] Batch processing
- [ ] Logging/audit trail

### Phase 3: Testing & Polish
- [ ] Unit tests
- [ ] Integration tests
- [ ] Error cases
- [ ] Documentation
- [ ] Examples

### Phase 4: Publishing
- [ ] npm publish
- [ ] n8n marketplace submission
- [ ] CI/CD setup
- [ ] Release notes

## OpenCode API Reference

### Session API

**Create Session:**
```bash
POST http://opencode:4096/session
Content-Type: application/json

{
  "title": "LinkedIn reply - John Doe"
}

Response:
{
  "id": "sess_abc123xyz",
  "created_at": "2026-05-10T15:30:00Z"
}
```

**Send Message:**
```bash
POST http://opencode:4096/session/{sessionId}/message
Content-Type: application/json
Timeout: 180000ms (configurable)

{
  "parts": [
    {
      "type": "text",
      "text": "Your prompt here..."
    }
  ]
}

Response:
{
  "content": "Response from OpenCode",
  "tokens_used": 1250,
  "execution_time": 45
}
```

### Error Cases

- **400 Bad Request**: Invalid prompt or params
- **404 Not Found**: Session doesn't exist
- **408 Timeout**: Prompt execution exceeded timeout
- **500 Server Error**: OpenCode internal error

## Testing Strategy

### 1. Unit Tests (Jest)

Test individual functions:
```typescript
describe('OpenCode Node', () => {
  test('should validate prompt is not empty', () => {
    // Expect error if prompt is empty
  })
  
  test('should use default title if not provided', () => {
    // Verify "n8n task" is used
  })
  
  test('should retry on timeout', () => {
    // Mock timeout, verify retry happens
  })
})
```

### 2. Integration Tests

Test with real/mock OpenCode:
```typescript
describe('OpenCode Integration', () => {
  test('should create session and send prompt', async () => {
    const node = new OpenCode()
    const result = await node.execute({
      /* mock context */
    })
    expect(result[0][0].success).toBe(true)
  })
})
```

### 3. Manual Testing

1. Start n8n with node installed
2. Create test workflow
3. Add OpenCode node
4. Set test prompt
5. Execute and verify response

## Common Issues & Solutions

### Issue: "Cannot find module 'n8n-workflow'"

**Solution:**
```bash
npm install --save-dev n8n-workflow n8n-core
```

### Issue: Node doesn't appear in UI

**Checklist:**
1. `package.json` has correct `n8n.nodes` array
2. File exports default class extending `INodeType`
3. Compiled `dist/` folder exists
4. n8n path is correct: `~/.n8n/nodes/@opencode/n8n-nodes-opencode`
5. Restart n8n: `docker-compose restart n8n`

### Issue: Session creation fails

**Debug:**
1. Verify OpenCode is running: `curl http://your-opencode:4096/health`
2. Check credentials in n8n UI
3. Check n8n logs: `docker-compose logs n8n -f`
4. Try direct curl: `curl -X POST http://your-opencode:4096/session -d '{"title":"test"}'`

## Code Style

### ESLint & Prettier

```bash
npm run lint      # Check code style
npm run format    # Auto-fix style
```

Rules:
- 2-space indentation
- Semicolons required
- Single quotes for strings
- Max line length: 100

### Naming Conventions

- **Classes**: PascalCase (`OpenCode`, `OpenCodeApi`)
- **Functions**: camelCase (`createSession`, `sendPrompt`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`)
- **Private**: prefix with `_` (`_createSession`)

## Performance Considerations

### Session Reuse (Future)

Instead of creating new session per request:
```typescript
// Current (inefficient)
for (item of items) {
  session = createSession()  // ❌ Creates N sessions for N items
  sendPrompt(session)
}

// Future (optimized)
session = createSession()    // ✅ One session for all items
for (item of items) {
  sendPrompt(session)
}
```

### Timeout Tuning

- Default: 180s (good for most tasks)
- Short tasks (1-10s): 30s
- Complex tasks (10-30s): 60s
- Research tasks (30+s): 180-300s

### Batch Processing

Max concurrent requests per OpenCode instance:
- Depends on OpenCode's resource limits
- Suggest max 5-10 concurrent sessions
- Implement backpressure in n8n

## Versioning

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., `1.2.3`)
- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes

Example:
- `0.1.0` → Initial release
- `0.2.0` → Add retry logic
- `0.2.1` → Fix timeout bug
- `1.0.0` → Stable release

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/session-reuse

# Make changes, commit
git add src/
git commit -m "feat: implement session reuse"

# Push to GitHub
git push origin feature/session-reuse

# Create Pull Request on GitHub
# → Review & merge → Publish new version
```

## Publishing Checklist

Before `npm publish`:

- [ ] Tests pass: `npm test`
- [ ] Builds: `npm run build`
- [ ] Lints: `npm run lint`
- [ ] README updated
- [ ] CHANGELOG updated
- [ ] Version bumped (`npm version patch`)
- [ ] Git tagged (`git tag v0.1.0`)
- [ ] Pushed to GitHub

## Useful Resources

- [n8n Developer Docs](https://docs.n8n.io/create-nodes/)
- [n8n SDK Reference](https://docs.n8n.io/reference/n8n-nodes/n8n-nodes-lib/)
- [Custom Nodes Examples](https://github.com/n8n-io/n8n-nodes-starter)
- [Community Nodes](https://github.com/n8n-io/n8n-nodes-community)
- [OpenCode Docs](https://opencode.ai/docs)

## Getting Help

1. Check this guide first
2. Search GitHub Issues
3. Ask in GitHub Discussions
4. Open an issue with:
   - Node version
   - n8n version
   - Error logs
   - Minimal reproduction steps

---

**Last Updated:** May 2026
