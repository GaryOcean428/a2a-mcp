# MCP Integration Platform - Deployment Guide

## Overview

This document outlines the steps required to successfully deploy the MCP Integration Platform to production environments. It covers the standard deployment process as well as solutions to common issues that might occur during deployment.

## Current Deployment Status

- **Module compatibility**: Fixed ✅ - Added dual format (ESM/CommonJS) support
- **CSS consistency**: Fixed ✅ - Added runtime verification and recovery
- **API documentation**: Available ✅ - Accessible at /api/docs endpoint
- **WebSocket connectivity**: Available ✅ - Access at /mcp-ws path
- **Database connectivity**: Configured ✅ - PostgreSQL integration ready
- **Security**: Enhanced ✅ - Environment variables management and secret protection

## Prerequisites

- Node.js v20.x or higher
- PostgreSQL database (connection string available in environment)
- Required API keys (set as environment variables)
  - OpenAI API key for embeddings and completions
  - Pinecone API key for vector storage
  - E2B API key for sandbox execution

## Deployment Steps

### 1. Environment Setup

**IMPORTANT: Never commit secrets or API keys to the repository!**

The project includes a `.env.example` file that shows all required environment variables. Make a copy named `.env` for local development:

```bash
cp .env.example .env
```

Then edit the `.env` file with your actual values:

```
DATABASE_URL=<your-database-connection-string>
OPENAI_API_KEY=<your-openai-api-key>
PINECONE_API_KEY=<your-pinecone-api-key>
E2B_API_KEY=<your-e2b-api-key>
SESSION_SECRET=<random-string-for-session-security>
```

For production deployments, set these environment variables in your hosting platform's configuration. Do not include the `.env` file in deployments.

### 2. Build the Application

```bash
npm run prepare-deploy  # Ensures production compatibility
npm run build           # Builds the frontend and backend
```

### 3. Run Database Migrations

```bash
npm run db:push
```

### 4. Start the Production Server

Use our universal launcher script which handles module format compatibility:

```bash
node start.js
```

This will automatically detect and use the appropriate server file (CommonJS or ESM) based on your environment.

## Common Deployment Issues and Solutions

### Module Format Compatibility

**Issue**: Error with `require is not defined in ES module scope` when running `npm run start`. This occurs because the package.json has `"type": "module"` but the production server might be using CommonJS syntax.

**Solution**: We've implemented a dual-format compatibility solution. The application now includes both CommonJS (.cjs) and ES Module (.js) versions of the production server. Use the launcher script which automatically selects the right one:

```bash
node start.js
```

If you still encounter issues, you can run the CommonJS version directly:

```bash
node server/prod-server.cjs
```

**Details**:
- The error occurs because Node.js treats .js files as ES modules when `"type": "module"` is set in package.json
- CommonJS uses `require()` and `module.exports`
- ES modules use `import` and `export`
- Our fix provides files in both formats for maximum compatibility

### CSS Inconsistency Between Development and Production

**Issue**: Certain CSS styles may be missing in production due to purging.

**Solution**: The application includes a CSS verification system that automatically detects and recovers missing styles. If you notice missing styles, check the browser console for verification logs.

For manual recovery, run:

```bash
node scripts/fix-ui-inconsistencies.js
```

### API Documentation

API documentation is available at `/api/docs` when the server is running. This provides a Swagger UI interface for exploring and testing available endpoints.

## WebSocket Connection

The platform provides WebSocket connectivity at the `/mcp-ws` path. Client applications should connect using:

```javascript
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `${protocol}//${window.location.host}/mcp-ws`;
const socket = new WebSocket(wsUrl);
```

## Verification

After deployment, verify that all key components are working:

1. Navigate to the home page to verify UI rendering
2. Try logging in to verify authentication
3. Visit `/api/docs` to verify API documentation
4. Check `/api/status` for system health


### Automated Deployment Fix

For convenience, we've included automated fix scripts that handle all compatibility issues:

```bash
# Comprehensive fix for all deployment issues
node complete-deployment-fix.cjs

# This script rebuilds the UI, verifies CSS consistency,
# and then runs the standard deployment fixes. It
# resolves issues where the interface renders with
# missing styles or appears blocky after deployment.

# Deploy with compatibility fixes applied
node deploy-fix.cjs
```

These scripts ensure that the correct module format is used, CSS is consistent, and all security checks pass.
## Troubleshooting

If you encounter any issues not covered in this guide, check the application logs for error details. Common sources of deployment issues include:

- Missing environment variables
- Database connection problems
- CORS configuration for production domains
- API key issues with third-party services

For module compatibility issues, run the fix script:

```bash
node scripts/fix-production-server.cjs
```

## Security Best Practices

### Environment Variables and Secrets

- **Never commit API keys or secrets** to version control
- Use environment variables for all sensitive information
- The project's `.gitignore` file is configured to exclude `.env` files
- For local development, use the `.env` file (copied from `.env.example`)
- For production, configure environment variables in your hosting platform

#### Secret Detection Tool

We've included a secret detection tool that scans the codebase for potentially hardcoded secrets or API keys. Run it before committing code to ensure you haven't accidentally included sensitive information:

```bash
# Using CommonJS version
node scripts/check-for-secrets.cjs

# Or using ES Module version
node scripts/check-for-secrets.js
```

This tool detects various patterns that could indicate hardcoded credentials, such as API keys, passwords, or connection strings. It's recommended to run this check before committing code.

### API Key Rotation

- Regularly rotate API keys for all external services
- Update environment variables after rotation without code changes
- Consider using a secrets management service for production deployments

### Database Security

- Use strong, unique passwords for database access
- Limit database user permissions to only what's necessary
- Enable SSL for database connections in production
- Never expose the database directly to the internet

### Session Security

- Use a strong, random string for `SESSION_SECRET`
- In production, use a secure cookie configuration with `secure: true`
- The default session expiration is 24 hours; adjust as needed for your security requirements

## Support

For additional support, please contact the development team or open an issue in the repository.