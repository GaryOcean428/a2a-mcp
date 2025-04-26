#!/bin/bash
set -e

# Display banner
echo "====================================="
echo "MCP Platform v2.5 Deployment Process"
echo "====================================="

# 1. Run version updater
echo "Updating version timestamp..."
TIMESTAMP=$(date +%s)
echo "export const VERSION = \"2.5.$TIMESTAMP\";" > client/src/version.ts
echo "Version updated: 2.5.$TIMESTAMP"

# 2. Verify deployment readiness
echo "Verifying deployment readiness..."
node scripts/deploy-verifier.js

# 3. Run production build
echo "Building for production..."
NODE_ENV=production npm run build

# 4. Clear browser caches
echo "Add this query parameter to force cache refresh: ?v=$TIMESTAMP"

echo "====================================="
echo "Deployment preparation complete!"
echo "Use the Replit Deploy button to deploy."
echo "====================================="
