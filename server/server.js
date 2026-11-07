const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

initSocket(io);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`SplitSync Server & Socket.IO running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  // Still listen so client gets appropriate errors instead of ECONNREFUSED
  server.listen(PORT, () => {
    console.log(`SplitSync Server running in standalone mode on http://localhost:${PORT}`);
  });
});
