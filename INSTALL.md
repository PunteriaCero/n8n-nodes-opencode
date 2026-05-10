# Installation & Testing Guide

## Quick Start (Development)

### 1. Install Dependencies

```bash
cd /workspace/n8n-nodes-opencode
npm install
```

**Expected output:**
```
added 156 packages in 2m 15s
```

### 2. Build the Project

```bash
npm run build
```

**Expected output:**
```
✅ Successfully compiled TypeScript
Generated: dist/ directory with .js and .d.ts files
```

### 3. Verify Build

```bash
ls -la dist/
```

**Expected output:**
```
dist/
├── index.js
├── types.js
├── nodes/
│   └── OpenCode/
│       ├── OpenCode.node.js
│       ├── OpenCodeDescription.js
│       └── OpenCode.test.js
└── credentials/
    └── OpenCodeApi.credentials.js
```

## Installation in n8n

### Option 1: Docker Compose (Recommended for Development)

**File:** `docker-compose.yml` in your n8n directory

```yaml
version: '3.8'

services:
  n8n:
    image: n8n:latest
    ports:
      - "5678:5678"
    environment:
      NODE_ENV: production
      # Enable custom node loading
      N8N_NODES_INCLUDE: "@opencode/n8n-nodes-opencode"
    volumes:
      # Mount local node during development
      - /workspace/n8n-nodes-opencode:/home/node/.n8n/nodes/@opencode/n8n-nodes-opencode
      # Persist n8n data
      - n8n_data:/home/node/.n8n
    networks:
      - n8n_net

volumes:
  n8n_data:

networks:
  n8n_net:
```

**Start n8n:**
```bash
docker-compose up -d
```

**Check logs:**
```bash
docker-compose logs -f n8n
```

**Expected in logs:**
```
OpenCode node loaded successfully
```

### Option 2: Manual Installation

```bash
# Create n8n custom nodes directory
mkdir -p ~/.n8n/nodes/@opencode/n8n-nodes-opencode

# Copy compiled node
cp -r /workspace/n8n-nodes-opencode/dist/* \
  ~/.n8n/nodes/@opencode/n8n-nodes-opencode/

# Restart n8n
docker-compose restart n8n
```

### Option 3: npm Link (Advanced)

```bash
cd /workspace/n8n-nodes-opencode
npm link

# In your n8n project
npm link n8n-nodes-opencode
```

## Verifying Installation

### In n8n UI

1. **Open n8n:** http://localhost:5678
2. **Create new workflow**
3. **Add node** (click `+` button)
4. **Search:** "opencode"
5. **Should see:** "OpenCode" node

If not visible:
- Restart n8n: `docker-compose restart n8n`
- Check logs: `docker-compose logs n8n | grep -i opencode`
- Verify package.json has correct `n8n.nodes` path

### Via API

```bash
# Get installed nodes
curl http://localhost:5678/api/nodes | jq '.[] | select(.name=="openCode")'

# Expected:
{
  "name": "openCode",
  "displayName": "OpenCode",
  "group": ["transform"],
  "icon": "file:opencode.svg"
}
```

## Setting Up Credentials

### 1. In n8n UI

1. **Credentials** (top right menu)
2. **New** → Search "OpenCode"
3. **Create credential:**
   - **Base URL:** `http://192.168.0.214:4096` (or your OpenCode URL)
   - **Session Timeout:** `180` seconds
4. **Save**

### 2. Verify Credentials

Test connection to OpenCode:

```bash
curl -X POST http://192.168.0.214:4096/session \
  -H "Content-Type: application/json" \
  -d '{"title": "test"}'

# Expected:
{
  "id": "sess_abc123xyz",
  "created_at": "2026-05-10T15:30:00Z"
}
```

If fails:
- Verify OpenCode is running: `docker ps | grep opencode`
- Check network: `ping 192.168.0.214`
- Check port: `curl -v http://192.168.0.214:4096/health`

## Testing the Node

### Test 1: Basic Execution

1. **Create workflow** in n8n
2. **Add OpenCode node**
3. **Configure:**
   - Credentials: (select created credentials)
   - Prompt: `"Hello OpenCode, respond with 'OK'"`
   - Title: `"Test"`
4. **Execute**
5. **Verify response:**
   - Success: ✅ true
   - Response contains: "OK"

### Test 2: Expression Support

1. **Add Webhook trigger**
2. **Connect to OpenCode node**
3. **Prompt:** `"{{ $json.message }}"`
4. **Trigger webhook:**
   ```bash
   curl -X POST http://localhost:5678/webhook/test \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello OpenCode"}'
   ```
5. **Verify:** Prompt sent successfully

### Test 3: Error Handling

1. **Change Base URL** to invalid: `http://invalid.local:4096`
2. **Execute**
3. **Verify error:**
   - Success: ❌ false
   - Error message displayed
   - Retried 3 times (check logs)

### Test 4: Timeout Handling

1. **Create long prompt:** `"Think deeply for 5 minutes about..."`
2. **Set Session Timeout:** `10` seconds (in credentials)
3. **Execute**
4. **Verify:** Times out after 10 seconds

## Integration Test with Existing Workflow

### Before: LinkedIn Responder (Old Implementation)

```
├─ HTTP Request (create session)
├─ Set (extract ID)
├─ HTTP Request (send prompt)
├─ If (wait logic)
└─ HTTP Request (send reply)
```

### After: LinkedIn Responder (New Implementation)

```
├─ OpenCode (replaces 3 HTTP requests)
└─ HTTP Request (send reply)
```

### Migration Steps

1. **Backup workflow:** Export current workflow as JSON
2. **Duplicate workflow** in n8n (Create copy for testing)
3. **In duplicate:**
   - Delete "Crear sesión en OpenCode" node
   - Delete "Preparar prompt para OpenCode" node
   - Delete "Enviar prompt a OpenCode" node
4. **Add OpenCode node** after message fetch
5. **Configure OpenCode node:**
   - Credentials: (select)
   - Prompt: Use same prompt from "Preparar prompt" code node
   - Title: `"LinkedIn reply - {{ $json.participant_name }}"`
6. **Test with sample data**
7. **Compare results** with original workflow

## Troubleshooting

### Issue: Node doesn't appear in UI

**Checklist:**
```bash
# 1. Check dist folder exists
ls -la dist/

# 2. Check package.json n8n field
cat package.json | grep -A 5 '"n8n"'

# 3. Check node file exports correctly
grep "export class OpenCode" dist/nodes/OpenCode/OpenCode.node.js

# 4. Restart n8n
docker-compose restart n8n

# 5. Check logs
docker-compose logs n8n | grep -i "opencode\|error"
```

### Issue: Credentials not appearing

```bash
# Check credentials file compiled
ls -la dist/credentials/OpenCodeApi.credentials.js

# Restart n8n
docker-compose restart n8n

# Clear n8n cache
rm -rf ~/.n8n/.credentials*
docker-compose restart n8n
```

### Issue: "Session timeout" errors

```bash
# 1. Verify OpenCode is running
docker ps | grep opencode

# 2. Test connectivity
curl http://192.168.0.214:4096/health

# 3. Check firewall
telnet 192.168.0.214 4096

# 4. Increase timeout in credentials
# (Set Session Timeout to 300 seconds)

# 5. Check OpenCode logs
docker logs opencode_container_name
```

### Issue: HTTP 401/403 errors

```bash
# Verify OpenCode doesn't require auth
curl -v http://192.168.0.214:4096/session \
  -H "Content-Type: application/json" \
  -d '{"title": "test"}'

# If auth required, implement auth headers in node
# (Contact OpenCode support or check their docs)
```

## Development Workflow

### Watch Mode (Auto-Compile)

```bash
# Terminal 1: Compile on changes
npm run dev

# Terminal 2: Restart n8n when changes compile
watch 'docker-compose restart n8n' dist/
```

### Debugging

```bash
# Add console logs to OpenCode.node.ts
console.log('Creating session:', { baseUrl, title })

# Watch logs
docker-compose logs -f n8n | grep -i "creating\|error"
```

### Testing Changes Quickly

```bash
# 1. Compile
npm run build

# 2. Restart n8n
docker-compose restart n8n

# 3. Open n8n UI
# http://localhost:5678

# 4. Create test workflow
# 5. Execute and check logs
docker-compose logs n8n
```

## Next Steps

- [ ] Install dependencies: `npm install`
- [ ] Build: `npm run build`
- [ ] Set up n8n with docker-compose
- [ ] Create credentials in n8n UI
- [ ] Test with sample workflow
- [ ] Verify existing workflow still works
- [ ] Document any issues found

---

**Created:** May 10, 2026  
**Last Updated:** May 10, 2026
