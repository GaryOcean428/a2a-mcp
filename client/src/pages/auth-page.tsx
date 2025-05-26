/**
 * MCP Integration Platform - Authentication Page
 * 
 * This page handles user authentication with both login and registration forms.
 */

import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, LockIcon, UserIcon, Info, Mail, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuthHook';
import { logger } from '@/utils/logger';

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Registration form schema
const registrationSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  name: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegistrationFormValues = z.infer<typeof registrationSchema>;

/**
 * Authentication Page Component
 */
export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isLoading, login, register } = useAuth();
  
  // Parse return URL from query string
  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('returnUrl') || '/';
  
  // Add derived isAuthenticated property
  const isAuthenticated = !!user;

  // If user is already authenticated, redirect to returnUrl
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      logger.info('User already authenticated, redirecting', {
        tags: ['auth', 'redirect'],
        data: { returnUrl }
      });
      navigate(returnUrl);
    }
  }, [isAuthenticated, isLoading, navigate, returnUrl]);
  
  // Set up login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  // Set up registration form
  const registrationForm = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
      name: '',
    },
  });
  
  // Handle login form submission
  const onLoginSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    setError(null);
    
    try {
      logger.debug('Redirecting to Replit Auth', {
        tags: ['auth', 'login', 'redirect']
      });
      
      // Redirect to Replit Auth login
      window.location.href = '/api/login';
      
    } catch (err: any) {
      logger.error('Login redirect error', {
        tags: ['auth', 'login', 'error'],
        error: err
      });
      setError('Unable to redirect to login');
      setSubmitting(false);
    }
  };
  
  // Handle registration form submission
  const onRegisterSubmit = async (values: RegistrationFormValues) => {
    setSubmitting(true);
    setError(null);
    
    try {
      logger.debug('Attempting registration', {
        tags: ['auth', 'register', 'submit'],
        data: { username: values.username, email: values.email }
      });
      
      await register(values);
      
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created',
      });
      
      // Redirect to returnUrl or home page
      navigate(returnUrl);
    } catch (err: any) {
      logger.error('Registration error', {
        tags: ['auth', 'register', 'error'],
        error: err
      });
      setError(err.message || 'Failed to register');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Auth forms */}
      <div className="flex flex-col justify-center w-full max-w-md px-4 py-8 sm:px-6 md:px-8 lg:w-1/2">
        <div className="flex flex-col space-y-2 text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter">MCP Integration Platform</h1>
          <p className="text-muted-foreground">Sign in to your account or create a new one</p>
        </div>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>
                  Enter your credentials to access the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="flex items-center relative">
                              <UserIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter your username"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="flex items-center relative">
                              <LockIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? 'Logging in...' : 'Login'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col items-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    className="text-primary hover:underline"
                    onClick={() => setActiveTab('register')}
                  >
                    Register
                  </button>
                </p>
                <div className="w-full border-t pt-3 flex justify-center">
                  <a href="/documentation" className="no-underline">
                    <Button variant="outline" size="sm" className="text-xs">
                      <HelpCircle className="h-3 w-3 mr-1" />
                      View Documentation
                    </Button>
                  </a>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                  Fill out the form below to create your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Form {...registrationForm}>
                  <form onSubmit={registrationForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registrationForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="flex items-center relative">
                              <UserIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Choose a username"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registrationForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="flex items-center relative">
                              <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registrationForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex items-center relative">
                              <UserIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter your full name"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registrationForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="flex items-center relative">
                              <LockIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="password"
                                placeholder="Create a password"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    className="text-primary hover:underline"
                    onClick={() => setActiveTab('login')}
                  >
                    Login
                  </button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Right side - Hero section */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-r from-purple-50 to-white">
        <div className="flex flex-col justify-center items-center h-full p-12">
          <div className="max-w-lg">
            <h2 className="text-4xl font-bold mb-6">MCP Integration Platform</h2>
            <p className="text-xl mb-8">
              Connect and enhance your AI applications with powerful capabilities like web search, form automation, vector storage, and data scraping.  
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Info className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Standardized Interface</h3>
                  <p className="text-muted-foreground">Access multiple tool providers through a single, consistent API</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Info className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Secure by Design</h3>
                  <p className="text-muted-foreground">Built with security in mind, keeping your data and access safe</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Info className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Easy Integration</h3>
                  <p className="text-muted-foreground">Get up and running quickly with documentation and client libraries</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
