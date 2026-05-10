═════════════════════════════════════════════════════════════════
  n8n-nodes-opencode PROJECT SUMMARY
  Last Updated: 2026-05-10
═════════════════════════════════════════════════════════════════

PROJECT STATUS: ✅ READY FOR DEPLOYMENT

📍 LOCATION: /workspace/n8n-nodes-opencode/

═════════════════════════════════════════════════════════════════
WHAT WAS ACCOMPLISHED
═════════════════════════════════════════════════════════════════

✅ Fixed n8n 2.x Compatibility
   - Updated dependencies from ^0.200.0 to ^2.20.2
   - Fixed all TypeScript errors
   - Verified with npm run build (no errors)
   - All 8 unit tests passing

✅ Compiled & Ready
   - dist/ directory contains production-ready files
   - Files: OpenCode.node.js, OpenCodeApi.credentials.js, etc.
   - Can be deployed directly to n8n

✅ Comprehensive Documentation
   - QUICK_START.md: Full step-by-step guide
   - DEPLOYMENT_CASAOS.md: CasaOS-specific setup
   - STATUS.md: Project overview
   - DEVELOPMENT.md: Architecture & patterns
   - CONTEXT.md: Requirements analysis
   - README.md: Feature overview

═════════════════════════════════════════════════════════════════
DEPLOYMENT QUICK COMMANDS
═════════════════════════════════════════════════════════════════

Option A - SCP (Fast):
  scp -r dist/nodes/OpenCode root@192.168.0.177:/DATA/AppData/n8n/nodes/
  scp -r dist/credentials root@192.168.0.177:/DATA/AppData/n8n/
  ssh root@192.168.0.177 'docker restart n8n'

Option B - Manual:
  1. SSH to CasaOS: ssh root@192.168.0.177
  2. Create dirs: mkdir -p /DATA/AppData/n8n/nodes/OpenCode
  3. Copy files via File Manager or SCP
  4. Restart n8n from CasaOS UI

═════════════════════════════════════════════════════════════════
NEXT STEPS (For You)
═════════════════════════════════════════════════════════════════

[ ] 1. Deploy node to n8n (CasaOS) - 5 min
     Command: scp -r dist/* root@192.168.0.177:/DATA/AppData/n8n/
     Then: ssh root@192.168.0.177 'docker restart n8n'

[ ] 2. Verify in n8n UI - 5 min
     Visit: http://192.168.0.177:5678
     Search node picker for: "opencode"
     Should appear in Transform section

[ ] 3. Create credentials - 2 min
     Credentials → New → OpenCode API
     Base URL: http://192.168.0.214:4096
     Timeout: 180 seconds

[ ] 4. Test with manual workflow - 5 min
     New workflow → Manual trigger → OpenCode node
     Prompt: "Respond 'OK'"
     Execute and verify response

[ ] 5. Migrate LinkedIn workflow - 15-20 min
     Open: "LinkedIn - Responder chats no leídos"
     Replace 3 HTTP nodes with 1 OpenCode node
     Update variable references
     Test and update original

═════════════════════════════════════════════════════════════════
KEY FILES LOCATIONS
═════════════════════════════════════════════════════════════════

Compiled Files:
  dist/nodes/OpenCode/OpenCode.node.js
  dist/credentials/OpenCodeApi.credentials.js

Documentation:
  QUICK_START.md              - Full deployment guide
  DEPLOYMENT_CASAOS.md        - CasaOS-specific
  STATUS.md                   - Current status
  README.md                   - Project overview
  DEVELOPMENT.md              - Architecture
  CONTEXT.md                  - Requirements

Build Commands:
  npm install                 - Install dependencies
  npm run build               - Compile TypeScript
  npm test                    - Run unit tests
  npm run lint                - Lint code

═════════════════════════════════════════════════════════════════
ENVIRONMENT DETAILS
═════════════════════════════════════════════════════════════════

n8n Server (CasaOS):
  URL: http://192.168.0.177:5678
  Data: /DATA/AppData/n8n/
  Config: n8n 1.123.0 with Docker

OpenCode Server:
  URL: http://192.168.0.214:4096
  Endpoints:
    POST /session                        - Create session
    POST /session/{id}/message           - Send message
    GET /health                          - Health check

Node Specification:
  Name: OpenCode
  Group: Transform
  Version: 0.1.0
  License: MIT
  Node Type: openCode
  Credentials: openCodeApi

═════════════════════════════════════════════════════════════════
TROUBLESHOOTING
═════════════════════════════════════════════════════════════════

If node doesn't appear:
  1. Clear browser cache: Ctrl+Shift+Del
  2. Reload page: F5
  3. Check files: ssh root@192.168.0.177 'ls /DATA/AppData/n8n/nodes/OpenCode/'
  4. Check logs: ssh root@192.168.0.177 'docker logs n8n | tail -50'
  5. Restart n8n: ssh root@192.168.0.177 'docker restart n8n'

If connection error:
  1. Verify OpenCode is running: curl http://192.168.0.214:4096/health
  2. Check credentials in n8n (correct IP/port)
  3. Test connectivity: curl -X POST http://192.168.0.214:4096/session -H "Content-Type: application/json" -d '{"title":"test"}'

═════════════════════════════════════════════════════════════════
IMPORTANT NOTES
═════════════════════════════════════════════════════════════════

✓ Node is production-ready
✓ All tests passing (8/8)
✓ TypeScript strict mode enabled
✓ Error handling implemented
✓ Retry logic included
✓ Batch processing supported
✓ Expression support (n8n expressions work)

Future Enhancements (Phase 2+):
  - Session reuse/caching
  - Polling support
  - Webhook handling
  - Advanced authentication
  - npm package publication

═════════════════════════════════════════════════════════════════
