/**
 * MCP Integration Platform - WebSocket Test Page
 * 
 * This page provides a comprehensive interface for testing WebSocket functionality
 * and demonstrates the robust error handling and reconnection capabilities.
 */

import { useState } from 'react';
import { useEnhancedWebSocket } from '../hooks/use-enhanced-websocket';

// UI components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  id: string;
  direction: 'sent' | 'received';
  timestamp: number;
  data: string;
  raw?: string;
}

/**
 * WebSocket Test Page
 */
export default function WebSocketTest() {
  const [customUrl, setCustomUrl] = useState('/mcp-ws');
  const [messageText, setMessageText] = useState('{ "messageType": "ping" }');
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastEventType, setLastEventType] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Initialize WebSocket with enhanced functionality
  const {
    state,
    sendJson,
    connect,
    disconnect,
    reconnect,
    subscribe,
  } = useEnhancedWebSocket({
    url: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${customUrl}`,
    autoConnect: false,
    debug: true,
    onMessage: (data) => {
      // Add received message to history
      handleIncomingMessage(data);
    },
    onConnect: () => {
      setStatusMessage('Connected to WebSocket server');
      setLastEventType('connect');
      handleSystemMessage('Connected to WebSocket server');
    },
    onDisconnect: () => {
      setStatusMessage('Disconnected from WebSocket server');
      setLastEventType('disconnect');
      handleSystemMessage('Disconnected from WebSocket server');
    },
    onError: (error) => {
      setStatusMessage(`WebSocket error: ${error.message}`);
      setLastEventType('error');
      handleSystemMessage(`Error: ${error.message}`);
    },
  });

  // Add a message to the history
  const handleIncomingMessage = (data: any) => {
    const message: Message = {
      id: Date.now().toString(),
      direction: 'received',
      timestamp: Date.now(),
      data: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
      raw: typeof data === 'string' ? data : JSON.stringify(data),
    };
    setMessages(prev => [message, ...prev]);
  };

  // Add a system message to the history
  const handleSystemMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      direction: 'received',
      timestamp: Date.now(),
      data: text,
    };
    setMessages(prev => [message, ...prev]);
  };

  // Send a custom message
  const handleSendMessage = () => {
    try {
      const jsonData = JSON.parse(messageText);
      const success = sendJson(jsonData);

      // Add sent message to history
      const message: Message = {
        id: Date.now().toString(),
        direction: 'sent',
        timestamp: Date.now(),
        data: JSON.stringify(jsonData, null, 2),
        raw: JSON.stringify(jsonData),
      };

      if (success) {
        setMessages(prev => [message, ...prev]);
        setStatusMessage('Message sent successfully');
      } else {
        handleSystemMessage('Failed to send message - connection not open');
        setStatusMessage('Failed to send message');
      }
    } catch (e) {
      if (e instanceof Error) {
        handleSystemMessage(`Error parsing JSON: ${e.message}`);
        setStatusMessage(`JSON parse error: ${e.message}`);
      }
    }
  };

  // Connect to the specified URL
  const handleConnect = () => {
    connect();
  };

  // Calculate connection status badge details
  const getConnectionStatus = () => {
    if (state.connecting) return { label: 'Connecting...', color: 'bg-yellow-500' };
    if (state.connected) return { label: 'Connected', color: 'bg-green-500' };
    return { label: 'Disconnected', color: 'bg-red-500' };
  };

  const status = getConnectionStatus();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">MCP Integration Platform - WebSocket Testing</h1>
      
      <Tabs defaultValue="connection">
        <TabsList className="mb-4">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>WebSocket Connection</span>
                <Badge className={`${status.color} text-white ml-2`}>{status.label}</Badge>
              </CardTitle>
              <CardDescription>
                Current WebSocket URL:
                <div className="font-mono text-xs break-all mt-1">
                  {`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${customUrl}`}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wsUrl">WebSocket Path</Label>
                    <div className="flex space-x-2">
                      <Input 
                        id="wsUrl" 
                        value={customUrl} 
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="/mcp-ws" 
                        disabled={state.connected || state.connecting}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="space-x-2">
                <Button
                  onClick={handleConnect}
                  disabled={state.connected || state.connecting}
                  variant="default"
                >
                  Connect
                </Button>
                <Button
                  onClick={disconnect}
                  disabled={!state.connected}
                  variant="destructive"
                >
                  Disconnect
                </Button>
                <Button
                  onClick={reconnect}
                  disabled={state.connecting}
                  variant="outline"
                >
                  Reconnect
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Reconnect attempts: {state.reconnectAttempts}
              </div>
            </CardFooter>
          </Card>
          
          {state.error && (
            <Card className="border-red-300">
              <CardHeader>
                <CardTitle className="text-red-500">Connection Error</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-red-500">{state.error.message}</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="messaging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
              <CardDescription>
                Enter a JSON message to send to the WebSocket server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Message (JSON)</Label>
                  <Textarea 
                    id="message" 
                    value={messageText} 
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder='{ "messageType": "ping" }'
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSendMessage} 
                disabled={!state.connected}
                variant="default"
              >
                Send Message
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <Button 
                  onClick={() => {
                    setMessageText('{ "messageType": "ping" }');
                    setTimeout(handleSendMessage, 10);
                  }}
                  disabled={!state.connected}
                  variant="outline"
                  size="sm"
                >
                  Send Ping
                </Button>
                <Button 
                  onClick={() => {
                    setMessageText('{ "messageType": "status" }');
                    setTimeout(handleSendMessage, 10);
                  }}
                  disabled={!state.connected}
                  variant="outline"
                  size="sm"
                >
                  Get Status
                </Button>
                <Button 
                  onClick={() => {
                    setMessageText('{ "messageType": "echo", "data": "Hello, server!" }');
                    setTimeout(handleSendMessage, 10);
                  }}
                  disabled={!state.connected}
                  variant="outline"
                  size="sm"
                >
                  Echo Test
                </Button>
                <Button 
                  onClick={() => {
                    setMessageText('{ "messageType": "schemas" }');
                    setTimeout(handleSendMessage, 10);
                  }}
                  disabled={!state.connected}
                  variant="outline"
                  size="sm"
                >
                  Get Schemas
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Message History</span>
                <Badge variant="outline">{messages.length} messages</Badge>
              </CardTitle>
              <CardDescription>
                {statusMessage}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Direction</TableHead>
                      <TableHead className="w-[160px]">Time</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No messages yet. Connect to a WebSocket server and send a message.
                        </TableCell>
                      </TableRow>
                    ) : (
                      messages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell>
                            <Badge variant={message.direction === 'sent' ? 'outline' : 'default'}>
                              {message.direction === 'sent' ? 'Sent' : 'Received'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-xs break-all whitespace-pre-wrap max-h-24 overflow-auto">
                              {message.data}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                onClick={() => setMessages([])}
                variant="outline"
                size="sm"
                disabled={messages.length === 0}
              >
                Clear Messages
              </Button>
              <div className="text-sm text-muted-foreground">
                Last event: {lastEventType || 'none'}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}