# Implementation Context

## Project Overview

**Project Name:** n8n-nodes-opencode  
**Status:** 🚀 In Development (Phase 1)  
**Created:** May 10, 2026  
**Location:** `/workspace/n8n-nodes-opencode`

## Problem Statement

Currently, the workflow "LinkedIn - Responder chats no leídos" in n8n uses **raw HTTP requests** to integrate with OpenCode:

- ❌ URL hardcoded in workflow (`http://192.168.0.214:4096`)
- ❌ Manual session management (create → send → close)
- ❌ No centralized error handling
- ❌ Difficult to reuse across multiple workflows
- ❌ Not maintainable when OpenCode URL changes

### Existing Implementation

```
HTTP Request (create session)
    ↓
Extract ID from response
    ↓
HTTP Request (send prompt)
    ↓
Manual timeout handling
    ↓
Parse response
```

**Issues:**
- 5+ HTTP nodes per workflow
- Error handling scattered across workflow
- Credentials stored in code
- Difficult to upgrade/maintain

## Solution: Custom n8n Node

**This project** creates a reusable n8n node that abstracts away complexity:

```
OpenCode Node (drag & drop)
    ↓
├─ Auto session management
├─ Built-in error handling
├─ Configurable via credentials
└─ One node = simplified workflow
```

**Benefits:**
- Single node in workflow
- Centralized credentials
- Professional error handling
- Easy to maintain/upgrade

## Architecture

```
┌─────────────────────────────────────────┐
│         n8n Workflow UI                 │
│                                         │
│  [Trigger] → [OpenCode] → [Action]      │
└─────────────────────────────────────────┘
                    │
                    │ Uses
                    ▼
┌─────────────────────────────────────────┐
│    n8n-nodes-opencode Package          │
│                                         │
│  • OpenCode.node.ts (logic)            │
│  • OpenCodeApi.credentials.ts (config) │
│  • types.ts (interfaces)               │
└─────────────────────────────────────────┘
                    │
                    │ HTTP calls
                    ▼
┌─────────────────────────────────────────┐
│      OpenCode Instance                  │
│      (http://192.168.0.214:4096)       │
│                                         │
│  POST /session → Create session         │
│  POST /session/{id}/message → Execute  │
└─────────────────────────────────────────┘
```

## Current Workflow Analysis

### Workflow: "LinkedIn - Responder chats no leídos"

**Triggers:**
- Cron: 18:00 UTC daily
- Manual webhook: `/linkedin-responder`

**Flow:**
1. Get unread conversations (`/conversations?unread=true`)
2. For each conversation:
   - Get conversation details
   - Get conversation messages
   - Prepare prompt for OpenCode
   - **Create session** (HTTP)
   - **Send message** (HTTP with 180s timeout)
   - Check if more unread messages
   - Wait 5 minutes
   - Loop again

**Inefficiencies:**
- Hardcoded `192.168.0.214:4096` appears 6 times
- Session creation not abstracted
- Error handling minimal
- Timeout hardcoded to 180s

### With OpenCode Node

Same workflow would be:
1. Get unread conversations
2. For each conversation:
   - Get details/messages
   - Prepare prompt
   - **OpenCode node** ✅ (replaces 3 HTTP requests + extraction + timeout)
   - Check if more unread
   - Wait 5 minutes

**Benefits:**
- Simplified workflow
- Professional error handling
- Centralized configuration
- Easier to maintain

## Phase Breakdown

### Phase 1: Core Implementation (Current - Next Session)

**Scope:**
- ✅ Node class definition
- ✅ Credential type definition
- ✅ Basic parameters (prompt, title, timeout)
- ✅ Session creation
- ✅ Prompt sending
- ✅ Response parsing
- ✅ Error handling (basic)

**Deliverables:**
- Functional node
- Installable in n8n
- Works with existing workflow
- Basic tests

**Time:** ~8-12 hours

### Phase 2: Advanced Features (Future)

**Scope:**
- [ ] Retry logic with exponential backoff
- [ ] Polling for long-running tasks
- [ ] Session reuse (multiple messages in one session)
- [ ] Webhook callbacks
- [ ] Metrics/observability
- [ ] Rate limiting

**Time:** ~10-15 hours

### Phase 3: Testing & Documentation (Future)

**Scope:**
- [ ] Integration tests
- [ ] Example workflows
- [ ] troubleshooting guide
- [ ] API documentation
- [ ] Contributing guide

**Time:** ~5-8 hours

### Phase 4: Publishing (Future)

**Scope:**
- [ ] npm publish
- [ ] n8n marketplace submission
- [ ] CI/CD setup
- [ ] Release automation

**Time:** ~3-5 hours

## OpenCode API Reference (Quick)

### Create Session

```bash
POST http://192.168.0.214:4096/session
Content-Type: application/json

{
  "title": "LinkedIn reply - John Doe"
}

Response 200:
{
  "id": "sess_abc123xyz",
  "created_at": "2026-05-10T15:30:00Z"
}
```

### Send Message

```bash
POST http://192.168.0.214:4096/session/{sessionId}/message
Content-Type: application/json
Timeout: 180000ms (configurable per node)

{
  "parts": [
    {
      "type": "text",
      "text": "Your prompt here..."
    }
  ]
}

Response 200:
{
  "content": "Response from OpenCode",
  "tokens_used": 1250,
  "execution_time": 45
}
```

### Error Responses

- **400 Bad Request** — Invalid JSON or missing fields
- **404 Not Found** — Session doesn't exist
- **408 Timeout** — Prompt execution exceeded timeout
- **500 Server Error** — OpenCode internal error

## Development Environment

### Prerequisites

```bash
# macOS
brew install node@18
brew install typescript

# Linux
sudo apt-get install nodejs npm
sudo npm install -g typescript

# Windows
# Download from https://nodejs.org (v18+)
```

### Initial Setup

```bash
cd /workspace/n8n-nodes-opencode
npm install                    # Install dependencies
npm run build                  # Compile TypeScript
npm run dev                    # Watch mode (auto-compile)
npm test                       # Run tests
npm run lint                   # Check code style
```

### File Structure

```
n8n-nodes-opencode/
├── src/
│   ├── nodes/
│   │   └── OpenCode/
│   │       ├── OpenCode.node.ts ← Main logic
│   │       ├── OpenCodeDescription.ts ← UI params
│   │       └── OpenCode.test.ts ← Tests
│   ├── credentials/
│   │   └── OpenCodeApi.credentials.ts ← Config type
│   ├── types.ts ← TypeScript interfaces
│   └── index.ts ← Entry point
├── dist/ ← Compiled output (generated)
├── package.json
├── tsconfig.json
├── jest.config.js
├── README.md ← User guide
├── DEVELOPMENT.md ← Dev guide (this file expanded)
└── CONTEXT.md ← This file
```

## Next Steps (for next session)

1. **Install dependencies**
   ```bash
   cd /workspace/n8n-nodes-opencode
   npm install
   ```

2. **Verify TypeScript compilation**
   ```bash
   npm run build
   ```

3. **Review implementation**
   - `src/nodes/OpenCode/OpenCode.node.ts` — Main logic
   - `src/credentials/OpenCodeApi.credentials.ts` — Credentials
   - `src/types.ts` — Interfaces

4. **Test locally**
   - Set up n8n with custom node
   - Create test workflow
   - Verify node appears in UI
   - Test with sample prompt

5. **Integration**
   - Refactor existing LinkedIn workflow to use new node
   - Verify same behavior
   - Test error cases

6. **Enhancements**
   - Add retry logic
   - Add polling support
   - Add session reuse

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| TypeScript | Type safety, better DX |
| n8n SDK | Official, well-maintained |
| Fetch API | Built-in, no extra deps |
| Jest for tests | Standard, integrates with TS |
| MIT License | Community-friendly |

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| OpenCode API changes | Breaks node | Version lock, docs |
| n8n version conflict | Won't load | Peer dependencies defined |
| Network timeouts | Long waits | Configurable timeout |
| Missing credentials | Silent failure | Validation in code |

## Success Criteria

✅ **Phase 1 Complete When:**
- [ ] Node compiles without errors
- [ ] Node appears in n8n UI
- [ ] Can create credentials
- [ ] Can send prompt to OpenCode
- [ ] Gets response back
- [ ] Handles errors gracefully
- [ ] Tests pass
- [ ] Existing workflow still works
- [ ] Documentation complete

## References

- n8n Docs: https://docs.n8n.io/create-nodes/
- OpenCode API: https://opencode.ai/docs
- Existing workflow: "LinkedIn - Responder chats no leídos" in n8n
- Custom nodes example: https://github.com/n8n-io/n8n-nodes-starter

---

**Last Updated:** May 10, 2026  
**Next Review:** After Phase 1 completion
