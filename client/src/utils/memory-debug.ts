/**
 * MCP Integration Platform - Memory Debugging Utility
 * 
 * This utility helps identify memory leaks and track component mount/unmount cycles.
 * It's only active in development mode and provides console logging for debugging.
 */

import { useRef, useEffect } from 'react';
import { isDevelopment } from './environment';
import { logger } from './logger';

// Object to keep track of mounted components for leak detection
const mountedComponents: Record<string, number> = {};

/**
 * Register a component mount
 */
function registerMount(componentName: string): void {
  if (!isDevelopment()) return;
  
  if (!mountedComponents[componentName]) {
    mountedComponents[componentName] = 0;
  }
  
  mountedComponents[componentName]++;
  
  logger.debug(`Component mounted: ${componentName}`, {
    tags: ['memory', 'component-lifecycle'],
    data: {
      component: componentName,
      count: mountedComponents[componentName],
      mounted: mountedComponents,
    },
  });
}

/**
 * Register a component unmount
 */
function registerUnmount(componentName: string): void {
  if (!isDevelopment()) return;
  
  if (mountedComponents[componentName]) {
    mountedComponents[componentName]--;
    
    if (mountedComponents[componentName] === 0) {
      delete mountedComponents[componentName];
    }
  }
  
  logger.debug(`Component unmounted: ${componentName}`, {
    tags: ['memory', 'component-lifecycle'],
    data: {
      component: componentName,
      count: mountedComponents[componentName] || 0,
      mounted: mountedComponents,
    },
  });
}

/**
 * Print a report of currently mounted components
 */
export function printMountedComponents(): void {
  if (!isDevelopment()) return;
  
  logger.info('Currently mounted components', {
    tags: ['memory', 'component-report'],
    data: { mounted: mountedComponents },
  });
}

/**
 * React hook for tracking component mount/unmount for memory leak detection
 */
export function useTraceUpdate(componentName: string, props: Record<string, any>): void {
  if (!isDevelopment()) return;
  
  const prev = useRef(props);
  
  useEffect(() => {
    const changedProps: Record<string, { old: any; new: any }> = {};
    Object.entries(props).forEach(([key, value]) => {
      if (prev.current[key] !== value) {
        changedProps[key] = {
          old: prev.current[key],
          new: value,
        };
      }
    });
    
    if (Object.keys(changedProps).length > 0) {
      logger.debug(`${componentName} props changed`, {
        tags: ['props', 'update', componentName],
        data: { changedProps },
      });
    }
    
    prev.current = props;
  }, [componentName, props]);
}

/**
 * React hook to track component lifecycles
 */
export function useComponentTrace(componentName: string, log = true): void {
  if (!isDevelopment()) return;
  
  const mountCount = useRef(0);
  
  useEffect(() => {
    mountCount.current++;
    
    if (log) {
      registerMount(`${componentName}[${mountCount.current}]`);
    }
    
    return () => {
      if (log) {
        registerUnmount(`${componentName}[${mountCount.current}]`);
      }
    };
  }, [componentName, log]);
}

/**
 * Set up memory leak detection intervals
 * Call this once at the application level
 */
export function setupMemoryMonitoring(intervalMs = 60000): () => void {
  if (!isDevelopment()) return () => {};
  
  const interval = setInterval(() => {
    // Log memory usage if available
    if (window.performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      logger.debug('Memory usage', {
        tags: ['memory'],
        data: {
          totalJSHeapSize: formatBytes(memory.totalJSHeapSize),
          usedJSHeapSize: formatBytes(memory.usedJSHeapSize),
          jsHeapSizeLimit: formatBytes(memory.jsHeapSizeLimit),
          percentUsed: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1) + '%',
        },
      });
    }
    
    // Log currently mounted components
    printMountedComponents();
  }, intervalMs);
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
  };
}

/**
 * Format bytes to a human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
