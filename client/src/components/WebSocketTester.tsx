/**
 * MCP Integration Platform - WebSocket Connection Tester
 * 
 * This component provides a UI to test and monitor WebSocket connections.
 */

import { useState, useEffect } from 'react';
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

interface WebSocketMessage {
  direction: 'sent' | 'received';
  timestamp: number;
  data: string;
}

interface WebSocketTesterProps {
  url?: string;
  autoConnect?: boolean;
  showDebug?: boolean;
}

export function WebSocketTester({
  url = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/mcp-ws`,
  autoConnect = true,
  showDebug = true,
}: WebSocketTesterProps) {
  // Message history
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [connecting, setConnecting] = useState(false);
  
  // Use our enhanced WebSocket hook
  const {
    state,
    sendJson,
    connect,
    disconnect,
    reconnect,
  } = useEnhancedWebSocket({
    url,
    autoConnect,
    debug: showDebug,
    onMessage: (data) => {
      // Add received message to history
      const message: WebSocketMessage = {
        direction: 'received',
        timestamp: Date.now(),
        data: typeof data === 'string' ? data : JSON.stringify(data),
      };
      
      setMessages(prev => [message, ...prev].slice(0, 50)); // Keep last 50 messages
    },
    onConnect: () => {
      setConnecting(false);
      // Log connection
      setMessages(prev => [{
        direction: 'received',
        timestamp: Date.now(),
        data: '🟢 Connected to WebSocket server',
      }, ...prev]);
    },
    onDisconnect: () => {
      setConnecting(false);
      // Log disconnection
      setMessages(prev => [{
        direction: 'received',
        timestamp: Date.now(),
        data: '🔴 Disconnected from WebSocket server',
      }, ...prev]);
    },
    onError: (error) => {
      setConnecting(false);
      // Log error
      setMessages(prev => [{
        direction: 'received',
        timestamp: Date.now(),
        data: `❌ Error: ${error.message}`,
      }, ...prev]);
    },
  });
  
  // Send a ping message
  const sendPing = () => {
    const ping = { messageType: 'ping' };
    const success = sendJson(ping);
    
    // Add sent message to history
    if (success) {
      const message: WebSocketMessage = {
        direction: 'sent',
        timestamp: Date.now(),
        data: JSON.stringify(ping),
      };
      
      setMessages(prev => [message, ...prev]);
    } else {
      setMessages(prev => [{
        direction: 'sent',
        timestamp: Date.now(),
        data: `❌ Failed to send ping message`,
      }, ...prev]);
    }
  };
  
  // Handle connect button
  const handleConnect = () => {
    setConnecting(true);
    connect();
  };
  
  // Calculate connection status label and color
  const connectionStatus = () => {
    if (state.connecting || connecting) return { label: 'Connecting...', color: 'bg-yellow-500' };
    if (state.connected) return { label: 'Connected', color: 'bg-green-500' };
    return { label: 'Disconnected', color: 'bg-red-500' };
  };
  
  const status = connectionStatus();
  
  return (
    <Card className="w-full max-w-[800px] mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>WebSocket Connection Tester</span>
          <Badge className={`${status.color} text-white ml-2`}>{status.label}</Badge>
        </CardTitle>
        <CardDescription>
          <div className="font-mono text-xs break-all">{url}</div>
          {state.error && (
            <div className="text-red-500 mt-2">{state.error.message}</div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Connection controls */}
          <div className="flex space-x-2">
            <Button
              onClick={handleConnect}
              disabled={state.connected || state.connecting || connecting}
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
              disabled={state.connecting || connecting}
              variant="outline"
            >
              Reconnect
            </Button>
            <Button
              onClick={sendPing}
              disabled={!state.connected}
              variant="outline"
            >
              Send Ping
            </Button>
          </div>
          
          {/* Message log */}
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableCaption>WebSocket message history</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Direction</TableHead>
                  <TableHead className="w-[180px]">Time</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No messages yet
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map((message, index) => (
                    <TableRow key={`${message.timestamp}-${index}`}>
                      <TableCell>
                        <Badge variant={message.direction === 'sent' ? 'outline' : 'default'}>
                          {message.direction === 'sent' ? 'Sent' : 'Received'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs break-all">
                        {message.data}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <div>Reconnect attempts: {state.reconnectAttempts}</div>
        <div>MCP Integration Platform v1.0</div>
      </CardFooter>
    </Card>
  );
}
