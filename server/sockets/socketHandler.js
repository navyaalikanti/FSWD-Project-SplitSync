const jwt = require('jsonwebtoken');

let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey123');
        socket.userId = decoded.id;
      } catch (err) {
        console.warn('Socket token verification warning:', err.message);
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
      console.log(`Socket connected for user ${socket.userId}`);
    }

    // Join a specific group room
    socket.on('join_group', (groupId) => {
      if (groupId) {
        socket.join(`group_${groupId}`);
        console.log(`Socket ${socket.id} joined group_${groupId}`);
      }
    });

    socket.on('leave_group', (groupId) => {
      if (groupId) {
        socket.leave(`group_${groupId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
}

function getIO() {
  return ioInstance;
}

function notifyUser(userId, event, payload) {
  if (ioInstance && userId) {
    ioInstance.to(`user_${userId.toString()}`).emit(event, payload);
  }
}

function notifyGroup(groupId, event, payload) {
  if (ioInstance && groupId) {
    ioInstance.to(`group_${groupId.toString()}`).emit(event, payload);
  }
}

module.exports = {
  initSocket,
  getIO,
  notifyUser,
  notifyGroup,
};
