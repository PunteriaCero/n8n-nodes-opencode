# Installing from GitHub Releases

This is the recommended way to get the latest compiled build of the n8n OpenCode node.

## Step 1: Download the latest release

Visit [GitHub Releases](https://github.com/hlavrencic/n8n-nodes-opencode/releases) and download the `.tar.gz` file for the latest version.

Or use the command line:

```bash
# Set the version you want to download
VERSION="1.0.0"

# Download
wget "https://github.com/hlavrencic/n8n-nodes-opencode/releases/download/v${VERSION}/n8n-opencode-node-v${VERSION}.tar.gz"
```

## Step 2: Extract and deploy

### Option A: CasaOS (Recommended for this setup)

```bash
# SSH into your CasaOS server
ssh root@192.168.0.177

# Navigate to n8n custom nodes directory
cd /DATA/AppData/n8n

# Extract the archive
tar -xzf n8n-opencode-node-v1.0.0.tar.gz

# Verify files were extracted
ls -la nodes/OpenCode/
ls -la credentials/

# Restart n8n container
docker restart n8n

# Watch logs to confirm startup
docker logs -f n8n | tail -20
```

### Option B: Docker Compose (Local)

```bash
# Stop n8n
docker compose down

# Extract to your n8n custom nodes directory
mkdir -p ~/.n8n/nodes
tar -xzf n8n-opencode-node-v1.0.0.tar.gz -C ~/.n8n/nodes

# Start n8n
docker compose up -d

# Check logs
docker compose logs -f n8n
```

### Option C: npm (for development)

```bash
npm install https://github.com/hlavrencic/n8n-nodes-opencode/releases/download/v1.0.0/n8n-opencode-node-v1.0.0.tar.gz
```

## Step 3: Verify installation

1. Open n8n UI: http://192.168.0.177:5678 (CasaOS) or http://localhost:3000 (local)
2. Create a new workflow
3. Click **+** to add a node
4. Search for **"opencode"**
5. You should see the **OpenCode** node under the **Custom** category

## Step 4: Create credentials

1. In n8n, go to **Credentials** → **New**
2. Search for **"OpenCode"**
3. Fill in:
   - **Base URL**: `http://192.168.0.214:4096` (or your OpenCode URL)
   - **Session Timeout**: `180` (seconds)
4. Click **Save**

## Step 5: Create your first workflow

See [QUICK_START.md](./QUICK_START.md) for example workflows.

## Troubleshooting

### Node doesn't appear in picker

1. Check that files were extracted correctly:
   ```bash
   ls /DATA/AppData/n8n/nodes/OpenCode/
   ls /DATA/AppData/n8n/credentials/
   ```

2. Verify n8n restarted:
   ```bash
   docker ps | grep n8n
   docker logs n8n | grep -i "opencode"
   ```

3. Clear n8n cache:
   ```bash
   docker restart n8n
   ```

### "Module not found" errors

- Ensure `dist/index.js` was extracted
- Check file permissions: `ls -la /DATA/AppData/n8n/`
- Restart n8n: `docker restart n8n`

### Credentials not appearing

1. Restart n8n: `docker restart n8n`
2. Check `/DATA/AppData/n8n/credentials/` has the extracted files
3. Clear browser cache and refresh

## Automatic Updates (CI/CD)

Every time code is pushed to the `main` branch:

1. GitHub Actions automatically builds the project
2. Runs tests to ensure quality
3. Creates a new GitHub Release with the compiled `dist/` archive
4. You can then download and deploy the latest version

To stay updated:
- Watch the [Releases page](https://github.com/hlavrencic/n8n-nodes-opencode/releases)
- Or check the project README for the latest version link
