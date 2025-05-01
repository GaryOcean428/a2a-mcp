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
  Loader
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

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
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
  }
];

export default function Header() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const isAuthenticated = !!user;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1.5 rounded-md">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text hidden md:inline-block">
                    MCP Integration Platform <span className="text-sm font-medium ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">v2.5</span>
                  </span>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text md:hidden">
                    MCP <span className="text-xs font-medium ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">v2.5</span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors cursor-pointer ${
                    location === item.href 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                    <span className="mr-1.5">{item.icon}</span>
                    {item.label}
                  </div>
                </Link>
              ))}
            </nav>

            {/* Right Section with User Menu or Login Button */}
            <div className="flex items-center space-x-3">
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      className="hidden md:flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
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
              
              {isAuthenticated ? (
                // User is logged in - show user menu
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 p-2 flex items-center justify-center hover:from-purple-200 hover:to-indigo-200 transition-colors">
                      <User className="h-5 w-5 text-purple-600" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
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
                // User is not logged in - show login button (with high visibility)
                <Link href="/auth">
                  <Button 
                    className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-sm"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
              
              {/* Always show login link for production environments as a backup */}
              {!isAuthenticated && (process.env.NODE_ENV === 'production' || import.meta.env.PROD) && (
                <div className="ml-2">
                  <a 
                    href="/auth" 
                    className="text-xs text-purple-600 underline hover:text-purple-800"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/auth');
                    }}
                  >
                    Login Page
                  </a>
                </div>
              )}
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden rounded-full p-2 text-gray-500 hover:bg-gray-100 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? 
                  <X className="h-6 w-6" /> : 
                  <Menu className="h-6 w-6" />
                }
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile menu (slide down when mobile button is clicked) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-sm">
          <nav className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                <div 
                  className={`px-3 py-2 rounded-md text-base font-medium flex items-center ${
                    location === item.href 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            ))}
            
            {isAuthenticated ? (
              <div 
                className="px-3 py-2 rounded-md text-base font-medium flex items-center bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 mt-4"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/settings");
                }}
              >
                <span className="mr-3"><PlusCircle className="h-5 w-5" /></span>
                New Connection
              </div>
            ) : (
              // Login button for mobile when not authenticated
              <div 
                className="px-3 py-2 rounded-md text-base font-medium flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white mt-4"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/auth");
                }}
              >
                <span className="mr-3"><LogIn className="h-5 w-5" /></span>
                Sign In / Register
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}