/**
 * MCP Integration Platform Global TypeScript Definitions
 * 
 * These definitions extend the Window interface with custom properties and
 * methods added by the MCP platform, particularly for CSS verification and
 * runtime recovery.
 */

interface Window {
  // CSS recovery function exposed by css-recovery.ts
  recoverMissingStyles: () => void;
  
  // CSS verification function exposed by CssVerification component
  verifyCss: () => void;
  
  // Version tracking
  MCP_VERSION: string;
}

// Extend document element with custom data attributes
interface HTMLHtmlElement extends HTMLElement {
  dataset: {
    mcpVersion: string;
  }
}