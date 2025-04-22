import WebSocket from 'ws';

const wsUrl = 'ws://localhost:5000/mcp-ws';
console.log(`Connecting to WebSocket server at: ${wsUrl}`);

const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('WebSocket connection established!');
  
  // Send a ping message
  ws.send(JSON.stringify({
    type: 'ping',
    timestamp: Date.now()
  }));
  
  // Close after 5 seconds
  setTimeout(() => {
    console.log('Closing connection...');
    ws.close();
  }, 5000);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('Received message:', message);
  } catch (error) {
    console.error('Error parsing message:', error);
    console.log('Raw message:', data.toString());
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', (code, reason) => {
  console.log(`WebSocket closed with code: ${code}, reason: ${reason || 'none'}`);
  process.exit(0);
});
