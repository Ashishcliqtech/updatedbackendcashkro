
let io;

const initChat = (socketIO) => {
  io = socketIO;
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });

    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
  });
};

module.exports = { initChat };
