import React from 'react';
import { Link } from 'wouter';
import { HeartIcon, Code, BookOpen, HelpCircle, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white w-full">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center mb-3">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1 rounded-md mr-2">
                <Code className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-800">MCP Integration Platform</span>
              <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-xs">v2.5</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} MCP Integration Platform.
              <br />
              <span className="flex items-center justify-center md:justify-start mt-1 text-xs">
                Made with <HeartIcon className="h-3 w-3 text-red-500 mx-1" /> for AI developers
              </span>
            </p>
          </div>
          
          {/* Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-gray-800 mb-4">Resources</h3>
            <div className="flex flex-col space-y-2">
              <Link href="/documentation">
                <a className="text-sm text-gray-600 hover:text-purple-600 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" /> Documentation
                </a>
              </Link>
              <Link href="/cline-integration">
                <a className="text-sm text-gray-600 hover:text-purple-600 flex items-center">
                  <Code className="h-4 w-4 mr-2" /> Cline Integration
                </a>
              </Link>
              <a 
                href="https://github.com/cline-ai/cline" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-gray-600 hover:text-purple-600 flex items-center"
              >
                <Github className="h-4 w-4 mr-2" /> Cline GitHub
              </a>
            </div>
          </div>
          
          {/* Status Info */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-gray-800 mb-4">Platform</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                System Status: Online
              </div>
              <Link href="/settings">
                <a className="text-sm text-gray-600 hover:text-purple-600 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" /> Support & Feedback
                </a>
              </Link>
              <div className="text-xs text-gray-500 mt-2">
                API Version: v2.5.0
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;