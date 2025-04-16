import React from 'react';
import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="py-4 border-t border-gray-200 bg-white w-full">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-3 text-sm text-gray-600">
          © {new Date().getFullYear()} MCP Integration Platform
        </div>
        <div className="flex justify-center space-x-4">
          <Link href="/documentation" className="text-sm text-purple-600 hover:text-purple-800">
            📄 Documentation
          </Link>
          <Link href="/cline-integration" className="text-sm text-purple-600 hover:text-purple-800">
            🔗 Cline Integration
          </Link>
          <a 
            href="https://github.com/cline-ai/cline" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            🌐 Cline GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;