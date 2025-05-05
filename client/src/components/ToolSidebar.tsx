import React from 'react';
import { useLocation, Link } from 'wouter';
import { ChevronRight, Settings, Database, Search, FileText, Code, RefreshCw, Sparkles, Server } from 'lucide-react';
import { useNavigation } from '@/hooks/use-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ToolSidebarProps {
  showRecent?: boolean;
  collapsed?: boolean;
}

export default function ToolSidebar({ showRecent = true, collapsed = false }: ToolSidebarProps) {
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
  
  const renderToolItem = (tool: any, showLabel = true) => {
    const content = (
      <div 
        className={cn(
          "flex items-center py-2 rounded-md text-sm cursor-pointer transition-colors",
          collapsed ? "justify-center px-0" : "px-3",
          location === tool.path
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
      >
        <div className={cn(
          "flex items-center justify-center",
          collapsed ? "h-8 w-8" : "h-6 w-6 mr-3"
        )}>
          {getToolIcon(tool.id)}
        </div>
        {!collapsed && (
          <>
            <span>{tool.name}</span>
            {location === tool.path && <ChevronRight className="ml-auto h-4 w-4" />}
          </>
        )}
      </div>
    );
    
    return collapsed ? (
      <TooltipProvider key={tool.id} delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={tool.path}>
              {content}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            {tool.name}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      <Link key={tool.id} href={tool.path}>
        {content}
      </Link>
    );
  };
  
  return (
    <div className="h-full flex-shrink-0 bg-background z-10 relative">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className={cn(
          "py-4 space-y-6",
          collapsed ? "px-2" : "px-4"
        )}>
          {/* Logo section for collapsed mode */}
          {collapsed && (
            <div className="flex justify-center mb-4">
              <div className="h-8 w-8 flex items-center justify-center bg-primary/10 rounded-md text-primary">
                <Server className="h-4 w-4" />
              </div>
            </div>
          )}
          
          {showRecent && !collapsed && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Recent Tools
              </h3>
              <div className="space-y-1">
                {recentTools.map((tool) => renderToolItem(tool))}
              </div>
            </div>
          )}
          
          <div>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                All Tools
              </h3>
            )}
            <div className="space-y-1">
              {toolRoutes.map((tool) => renderToolItem(tool, !collapsed))}
            </div>
          </div>
          
          {!collapsed && (
            <Card className="mt-6 bg-card/60 border-muted backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">QUICK ACTIONS</h4>
                  <Sparkles className="h-3 w-3 text-primary/60" />
                </div>
                <div className="space-y-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-xs h-8"
                    onClick={() => navigateToTool('vector-storage')}
                  >
                    <Database className="h-3.5 w-3.5 mr-2 text-blue-500" />
                    New Vector DB
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-xs h-8"
                    onClick={() => navigateToTool('web-search')}
                  >
                    <Search className="h-3.5 w-3.5 mr-2 text-green-500" />
                    New Search Provider
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-xs h-8"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-2 text-amber-500" />
                    Refresh Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
