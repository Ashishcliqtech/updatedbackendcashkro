const socketIo = require('socket.io');

let io;

function initSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: '*', // Adjust for your frontend URL in production
      methods: ['GET', 'POST'],
    },
  });
  return io;
}

function getIo() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = { initSocket, getIo };
