// Global type definitions for the MCP Integration Platform

interface Window {
  // Version identifiers for the application
  MCP_VERSION: string;
  mcpVersion: string;
  
  // Style verification functions
  verifyCriticalStyles?: () => void;
  loadFallbackStyles?: () => void;
}

// Extend the HTML element dataset to include version
interface HTMLElementDataset {
  mcpVersion?: string;
}

// Declare non-standard CSS properties for verification
interface CSSStyleDeclaration {
  // Tailwind CSS custom properties
  '--tw-gradient-from': string;
  '--tw-gradient-via': string;
  '--tw-gradient-to': string;
  '--tw-gradient-stops': string;
}