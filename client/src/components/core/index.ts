/**
 * Core Components Index
 * 
 * This file exports all core components used throughout the application,
 * providing a centralized import point.
 */

// UI Foundation
export { default as StyleFixer } from '../StyleFixerNew';
export { default as WebSocketProvider, useWebSocketContext } from '../WebSocketProviderNew';
export { default as WebSocketReconnectManager } from '../WebSocketReconnectManagerNew';

// Layout Components
export { default as Layout } from '../Layout';
export { default as Header } from '../Header';
export { default as ToolSidebar } from '../ToolSidebar';

// Authentication & Security
export { ProtectedRoute } from '../protected-route';
export { default as LoginPrompt } from '../LoginPrompt';

// Error Handling
export { default as ErrorBoundary } from '../ErrorBoundary';

// Load Management
export { createLazyComponent, LoadingSpinner, lazyLoad, LazyRoute } from '../LazyLoad';
