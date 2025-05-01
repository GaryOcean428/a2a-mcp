import React from 'react';
import { useLocation, Link } from 'wouter';
import { ChevronRight, Settings, Database, Search, FileText, Code, RefreshCw } from 'lucide-react';
import { useNavigation } from '@/hooks/use-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ToolSidebarProps {
  showRecent?: boolean;
}

export default function ToolSidebar({ showRecent = true }: ToolSidebarProps) {
  const [location] = useLocation();
  const { getToolRoutes, navigateToTool } = useNavigation();
  
  const toolRoutes = getToolRoutes();
  
  // Get the icon based on the tool ID
  const getToolIcon = (id: string) => {
    switch (id) {
      case 'web-search':
        return <Search className="h-5 w-5" />;
      case 'form-automation':
        return <FileText className="h-5 w-5" />;
      case 'vector-storage':
        return <Database className="h-5 w-5" />;
      case 'data-scraping':
        return <Code className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  // Get recently used tools - would be expanded with real tracking in a production app
  const recentTools = toolRoutes.slice(0, 3);
  
  return (
    <div className="h-full flex-shrink-0 bg-white z-10 relative">
      <ScrollArea className="h-full py-4">
        <div className="px-4 space-y-6">
          {showRecent && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Recent Tools
              </h3>
              <div className="space-y-2">
                {recentTools.map((tool) => (
                  <Link key={tool.id} href={tool.path}>
                    <div 
                      className={`flex items-center py-2 px-3 rounded-md text-sm cursor-pointer ${
                        location === tool.path
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="h-6 w-6 flex items-center justify-center mr-3">
                        {getToolIcon(tool.id)}
                      </div>
                      <span>{tool.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              All Tools
            </h3>
            <div className="space-y-2">
              {toolRoutes.map((tool) => (
                <Link key={tool.id} href={tool.path}>
                  <div 
                    className={`flex items-center py-2 px-3 rounded-md text-sm cursor-pointer ${
                      location === tool.path
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="h-6 w-6 flex items-center justify-center mr-3">
                      {getToolIcon(tool.id)}
                    </div>
                    <span>{tool.name}</span>
                    {location === tool.path && <ChevronRight className="ml-auto h-4 w-4" />}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <Card className="mt-auto">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigateToTool('vector-storage')}
                >
                  <Database className="h-4 w-4 mr-2" />
                  New Vector DB
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigateToTool('web-search')}
                >
                  <Search className="h-4 w-4 mr-2" />
                  New Search Provider
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}