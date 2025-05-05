# MCP Integration Platform - Architecture

## Overview

The MCP Integration Platform is a comprehensive framework for standardizing and coordinating interactions between AI service capabilities. This document outlines the architecture of the platform after the cleanup and optimization process.

## Core Components

### Client-Side

#### CSS System

The CSS system (`client/src/utils/css-system.ts`) provides a unified approach to CSS recovery and style fixing. It includes:

- **CssRecoveryManager**: A singleton class that verifies and injects critical CSS styles when needed
- **StyleFixer**: A singleton class that applies direct CSS fixes to elements with custom styling needs
- **Auto-initialization**: The system automatically initializes when the DOM is ready

#### WebSocket System

The WebSocket system (`client/src/lib/websocket-system.ts`) provides a robust WebSocket client implementation:

- **EnhancedWebSocketClient**: A client with automatic reconnection, error handling, and event management
- **WebSocketUtils**: Utility functions for creating WebSocket URLs and applying connection fixes
- **Cross-environment support**: Works in both development and production environments

#### React Components

The React components are organized into cohesive groups:

- **StyleFixerNew**: Initializes the CSS recovery and style fixing system
- **WebSocketProviderNew**: Provides WebSocket context to the application
- **WebSocketReconnectManagerNew**: Monitors connection state and provides UI feedback

### Server-Side

#### Deployment Tools

The deployment tools (`scripts/deployment-tools.cjs`) provide a unified approach to deployment:

- **Version management**: Updates version timestamps for cache busting
- **Module compatibility**: Ensures proper module format compatibility between ESM and CommonJS
- **CSS recovery**: Sets up critical CSS recovery files
- **WebSocket configuration**: Applies WebSocket connection fixes
- **HTML updates**: Injects critical CSS into HTML files
- **Build process**: Manages the application build process
- **Cleanup utility**: Removes redundant files from the codebase

## File Organization

### Client-Side

```
client/
  ├── src/
  │   ├── components/       # React components
  │   │   ├── core/         # Core component exports
  │   │   ├── ui/           # UI components (shadcn)
  │   │   ├── StyleFixerNew.tsx
  │   │   ├── WebSocketProviderNew.tsx
  │   │   └── WebSocketReconnectManagerNew.tsx
  │   ├── hooks/            # React hooks
  │   ├── lib/              # Core libraries
  │   │   └── websocket-system.ts
  │   ├── pages/            # Application pages
  │   ├── utils/            # Utility functions
  │   │   └── css-system.ts
  │   └── config/           # Configuration files
  └── public/
      └── assets/
          └── css/
              └── recovery-critical.css
```

### Server-Side

```
server/
  ├── routes.ts             # API routes
  ├── storage.ts            # Storage interface
  ├── prod-server.js        # Production server (ESM)
  └── prod-server.cjs       # Production server (CommonJS)
```

### Scripts

```
scripts/
  ├── deployment-tools.cjs  # Unified deployment tools
  ├── deploy.js             # Deployment script
  └── cleanup.js            # Codebase cleanup script
```

## Consolidation Benefits

The cleanup and organization effort has yielded several benefits:

1. **Reduced file count**: Eliminated 40+ redundant files across CSS recovery, WebSocket implementation, and deployment scripts

2. **Improved maintainability**: Consolidated related functionality into cohesive modules

3. **Enhanced reliability**: Unified error handling and recovery mechanisms

4. **Better organization**: Clear separation of concerns and logical file organization

5. **Simplified deployment**: Streamlined deployment process with a single consolidated script

## Future Improvements

Potential areas for further improvement:

1. **Testing**: Add comprehensive unit and integration tests

2. **Documentation**: Enhance inline documentation and create API reference

3. **Performance optimization**: Further optimize loading and rendering performance

4. **Feature modules**: Implement a modular plugin system for extending platform capabilities

5. **Analytics**: Add performance and usage analytics