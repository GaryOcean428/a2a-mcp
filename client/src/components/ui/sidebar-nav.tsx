import React from 'react';
import { Link, useLocation } from 'wouter';
import { Search, FileText, Database, Code, Settings, HelpCircle, CheckCircle } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const coreTools: NavItem[] = [
  {
    href: '/web-search',
    label: 'Web Search',
    icon: <Search className="h-5 w-5 mr-3" />
  },
  {
    href: '/form-automation',
    label: 'Form Automation',
    icon: <FileText className="h-5 w-5 mr-3" />
  },
  {
    href: '/vector-storage',
    label: 'Vector Storage',
    icon: <Database className="h-5 w-5 mr-3" />
  },
  {
    href: '/data-scraping',
    label: 'Data Scraping',
    icon: <Code className="h-5 w-5 mr-3" />
  }
];

const adminTools: NavItem[] = [
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5 mr-3" />
  },
  {
    href: '/documentation',
    label: 'Documentation',
    icon: <HelpCircle className="h-5 w-5 mr-3" />
  }
];

export function SidebarNav() {
  const [location] = useLocation();
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search tools..." 
            className="w-full px-3 py-2 border border-gray-200 rounded-md pl-9 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          <div className="absolute left-3 top-2.5 text-gray-500">
            <Search className="h-5 w-5" />
          </div>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-sm font-medium text-gray-500">Core Tools</div>
        <ul>
          {coreTools.map((item) => (
            <li key={item.href} className="px-2">
              <Link href={item.href}>
                <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === item.href 
                    ? 'bg-primary bg-opacity-10 text-primary' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  {item.icon}
                  {item.label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="px-3 py-2 text-sm font-medium text-gray-500">Administration</div>
        <ul>
          {adminTools.map((item) => (
            <li key={item.href} className="px-2">
              <Link href={item.href}>
                <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === item.href 
                    ? 'bg-primary bg-opacity-10 text-primary' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  {item.icon}
                  {item.label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-600 mr-2"></div>
          <span className="text-sm">Status: Running</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">v0.1.0-alpha</div>
      </div>
    </aside>
  );
}
