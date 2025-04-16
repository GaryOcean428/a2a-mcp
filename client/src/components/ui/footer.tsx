import React from 'react';
import { Link } from 'wouter';
import { FileText, Code, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-4 border-t border-gray-200 bg-white w-full">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-600">
          &copy; {new Date().getFullYear()} MCP Integration Platform
        </div>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <Link href="/documentation" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            Documentation
          </Link>
          <Link href="/cline-integration" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            <Code className="h-4 w-4 mr-1" />
            Cline Integration
          </Link>
          <a href="https://github.com/cline-ai/cline" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            <Github className="h-4 w-4 mr-1" />
            Cline GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;