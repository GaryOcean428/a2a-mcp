# MCP Integration Platform - Deployment Guide

This guide explains how to deploy the MCP Integration Platform correctly to ensure UI consistency between development and production environments.

## Understanding the Issues

The platform uses modern CSS features that can sometimes be inconsistently processed between development and production environments, causing styling differences. Key problematic CSS classes include:

- `feature-card`
- `animate-fade-in-down`
- `bg-gradient-to-r` 
- `bg-grid-gray-100`
- `bg-blob-gradient`

## Fix Scripts

We've created multiple deployment scripts to address different aspects of the deployment process:

1. **fix-production-css.cjs**: Addresses PostCSS parsing errors by simplifying CSS structure
2. **fix-production-ui.cjs**: Ensures critical CSS classes are available in production
3. **fix-deployment.cjs**: Fixes path resolution and MIME type issues
4. **complete-deployment-fix.cjs**: Comprehensive solution that combines all fixes

## Deployment Process

### Option 1: Automatic Deployment (Recommended)

1. Run the comprehensive fix script:
   ```bash
   node complete-deployment-fix.cjs
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Start the production server:
   ```bash
   npm run start
   ```

Alternatively, you can use Replit's deployment feature, which will automatically apply these fixes through the `.replit.deployConfig.js` file.

### Option 2: Manual Deployment Steps

If you need to troubleshoot specific issues:

1. Fix CSS parsing errors:
   ```bash
   node fix-production-css.cjs
   ```

2. Fix UI inconsistencies:
   ```bash
   node fix-production-ui.cjs
   ```

3. Fix deployment-specific issues:
   ```bash
   node fix-deployment.cjs
   ```

4. Build the application:
   ```bash
   npm run build
   ```

5. Start the production server:
   ```bash
   node server/prod-server.js
   ```

## Verification

After deployment, the application automatically verifies that critical CSS classes are working correctly through the built-in verification system. If any issues are detected, emergency CSS recovery will be applied automatically.

## Troubleshooting

If you see a blank white page after deployment:

1. Check browser console for errors related to MIME types or path resolution
2. Ensure all static assets are correctly copied to the dist folder
3. Verify the production server is properly serving the static files
4. Run the complete deployment fix script again and redeploy

## Architecture

The deployment solution works through several mechanisms:

1. Critical CSS inline in the HTML for immediate rendering
2. Production-specific CSS file with all required classes
3. Runtime verification and recovery system
4. Fallback static content for initial load
5. Correct MIME type handling for all static assets
6. Proper path resolution with base href tag

By using these mechanisms, we ensure consistent rendering across all environments.