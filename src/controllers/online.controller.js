
let onlineUsers = [];

exports.getOnlineUsers = (req, res) => {
  res.status(200).json(onlineUsers);
};

const setup = (io) => {
  io.on('connection', (socket) => {
    socket.on('user online', (user) => {
      onlineUsers.push(user);
      io.emit('online users', onlineUsers);
    });

    socket.on('disconnect', () => {
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      io.emit('online users', onlineUsers);
    });
  });
};

module.exports.setup = setup;
