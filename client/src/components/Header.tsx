import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useNavigation } from '@/hooks/use-navigation';
import { 
  PlusCircle, 
  Code, 
  User, 
  LogIn, 
  LogOut, 
  Key, 
  Menu, 
  X,
  Search,
  FileText,
  Database,
  Settings,
  HelpCircle,
  Loader,
  PanelLeft, 
  PanelLeftClose,
  Moon,
  Sun,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuthHook";
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarVisible?: boolean;
}

const navLinks: NavItem[] = [
  {
    href: '/web-search',
    label: 'Web Search',
    icon: <Search className="h-5 w-5" />
  },
  {
    href: '/form-automation',
    label: 'Form Automation',
    icon: <FileText className="h-5 w-5" />
  },
  {
    href: '/vector-storage',
    label: 'Vector Storage',
    icon: <Database className="h-5 w-5" />
  },
  {
    href: '/data-scraping',
    label: 'Data Scraping',
    icon: <Code className="h-5 w-5" />
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />
  },
  {
    href: '/documentation',
    label: 'Documentation',
    icon: <HelpCircle className="h-5 w-5" />
  },
  {
    href: '/cline-integration',
    label: 'Cline Integration',
    icon: <Code className="h-5 w-5" />
  },
  {
    href: '/spinner-showcase',
    label: 'Spinner Showcase',
    icon: <Loader className="h-5 w-5" />
  }
];

export default function Header({ onToggleSidebar, sidebarVisible }: HeaderProps) {
  const { user, logout, isLoading: authLoading } = useAuth();
  const isAuthenticated = !!user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { activeRoute, navigateToTool } = useNavigation();
  const { toast } = useToast();

  // Handle logout
  async function handleLogout() {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <>
      <header className="w-full px-4 h-16 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Left section: Toggle and Logo */}
        <div className="flex items-center gap-2">
          {/* Only show toggle if sidebar is visible */}
          {sidebarVisible && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleSidebar}
              className="mr-1 text-muted-foreground hover:text-foreground" 
              title="Toggle Sidebar"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          )}
          
          {/* Logo and Brand */}
          <Link href="/">
            <div className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-primary/90 to-primary-foreground/90 rounded-lg w-9 h-9 flex items-center justify-center shadow-sm group-hover:shadow transition-all duration-200">
                <Code className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="hidden md:flex flex-col">
                <h1 className="text-lg font-semibold leading-none tracking-tight">
                  MCP Integration Platform
                </h1>
                <p className="text-xs text-muted-foreground">AI Service Integration Framework</p>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary-foreground rounded-full ml-1">v2.5</span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation links */}
        <nav className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 space-x-1">
          {navLinks.slice(0, 5).map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200",
                location === item.href 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}>
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}
          
          {/* More dropdown for additional menu items */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                More <ChevronRight className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {navLinks.slice(5).map((item) => (
                <DropdownMenuItem key={item.href} onClick={() => navigate(item.href)}>
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* New Connection button (for authenticated users) */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="hidden md:flex" 
                  size="sm"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Connection
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Connection Types</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  navigate("/vector-storage");
                  toast({
                    title: "Vector Database Selected",
                    description: "Redirecting to Vector Storage configuration"
                  });
                }}>
                  <Database className="mr-2 h-4 w-4 text-blue-600" />
                  <span>Vector Database</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  toast({
                    title: "AI Service Selected",
                    description: "This feature is coming soon!"
                  });
                }}>
                  <Code className="mr-2 h-4 w-4 text-purple-600" />
                  <span>AI Service</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  navigate("/web-search");
                  toast({
                    title: "Search Provider Selected",
                    description: "Redirecting to Web Search configuration"
                  });
                }}>
                  <Search className="mr-2 h-4 w-4 text-green-600" />
                  <span>Search Provider</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  toast({
                    title: "Custom Tool Selected",
                    description: "This feature is coming soon!"
                  });
                }}>
                  <Settings className="mr-2 h-4 w-4 text-amber-600" />
                  <span>Custom Tool</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Theme toggle (placeholder) */}
          <Button variant="ghost" size="icon" className="text-muted-foreground hidden md:flex">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          {/* User account or sign in */}
          {isAuthenticated ? (
            // User is logged in - show user menu
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 overflow-hidden bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-default">
                  <User className="mr-2 h-4 w-4" />
                  <span>{user?.username}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("/settings")}>
                  <Key className="mr-2 h-4 w-4" />
                  <span>API Keys</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // User is not logged in - show login button
            <Link href="/auth">
              <Button size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? 
              <X className="h-5 w-5" /> : 
              <Menu className="h-5 w-5" />
            }
          </Button>
        </div>
      </header>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b bg-background shadow-sm">
          <nav className="p-4 grid gap-2">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                <div 
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all",
                    location === item.href 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-accent"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            ))}
            
            {isAuthenticated ? (
              <Button 
                className="mt-2"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/settings");
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Connection
              </Button>
            ) : (
              null
            )}
          </nav>
        </div>
      )}
    </>
  );
}
