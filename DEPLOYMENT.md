# MCP Integration Platform - Deployment Guide

## Overview

This guide provides detailed instructions for deploying the MCP Integration Platform to ensure consistent UI and functionality between development and production environments.

## Prerequisites

- Node.js v18+ installed
- PostgreSQL database configured
- Required API keys for services (OpenAI, Pinecone, etc.)
- Git repository access

## Environment Variables

Ensure these environment variables are properly set in your production environment:

```
DATABASE_URL=postgres://username:password@hostname:port/database
SESSION_SECRET=your_session_secret
OPENAI_API_KEY=your_openai_api_key
PINCONE_API_KEY=your_pinecone_api_key
PINCONE_ENVIRONMENT=your_pinecone_environment
E2B_API_KEY=your_e2b_api_key
```

## Deployment Steps

### 1. Clone Repository

```bash
git clone https://github.com/your-org/mcp-integration-platform.git
cd mcp-integration-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Application

```bash
npm run build
```

This runs the following processes:
- Transpiles TypeScript files
- Bundles React components
- Processes CSS with Tailwind
- Copies static assets

### 4. Database Setup

Run database migrations:

```bash
npx drizzle-kit push
```

### 5. Start the Production Server

```bash
npm run start
```

## Addressing UI Inconsistencies

The most common deployment issues involve CSS styling inconsistencies between development and production environments. We've implemented several solutions to address these:

### CSS Processing

1. **Critical CSS Inline Injection**: Essential styles are inlined in the HTML to ensure immediate rendering without waiting for CSS files to load.

2. **CSS Safelist**: We've explicitly defined a safelist in `tailwind.config.ts` to prevent Tailwind from purging critical CSS classes in production builds.

3. **Verification Component**: A runtime verification component checks for missing CSS and recovers if necessary.

### Build-time Fixes

If you encounter UI inconsistencies, run the deployment fix script:

```bash
node fix-deployment.cjs
```

This script automatically addresses common issues:
- Fixes CSS class purging in production
- Ensures all assets are properly included
- Updates cache control headers
- Verifies MIME types are set correctly

## Verification

After deployment, verify the following:

1. **API Endpoints**: Test `/api/status` to ensure backend is functioning
2. **Authentication**: Verify login functionality works correctly
3. **UI Components**: Check that all UI elements render as expected
4. **Tool Integration**: Test each MCP tool to ensure proper functionality

## Troubleshooting

### Blank Page in Production

If you encounter a blank page in production:

1. Check browser console for JavaScript errors
2. Verify MIME types are set correctly
3. Run `node complete-deployment-fix.cjs` to apply comprehensive fixes

### Missing Styles

If styles appear to be missing:

1. Check that the CSS file is being loaded correctly
2. Verify the class names in the safelist
3. Run `node fix-production-ui.cjs` to rebuild the UI with style fixes

### Authentication Issues

If users can't log in:

1. Check that the session store is configured correctly
2. Verify cookies are being set with proper domain and path
3. Ensure CORS settings are appropriate for your deployment

## CI/CD Integration

For automated deployments, we recommend setting up a CI/CD pipeline with:

1. **Testing Stage**: Run tests before deployment
2. **Build Stage**: Build the application with production settings
3. **Verification Stage**: Run automated UI tests to verify consistency
4. **Deployment Stage**: Deploy to production server

## Version Control

All deployments are versioned with a timestamp to help track and debug issues. The current version can be found at `/api/status`.

## Support

If you encounter issues not covered by this guide, please contact the development team at support@mcp-platform.example.com.
