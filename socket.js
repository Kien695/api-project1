const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_API_URL, process.env.ADMIN_API_URL],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) throw new Error("No token");
      console.log("New client connected, token:", token);
      const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
      socket.join(decoded.id);

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    } catch (err) {
      console.log("Invalid token");
      socket.disconnect();
      return;
    }
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket chưa được khởi tạo");
  }
  return io;
};

module.exports = { initSocket, getIO };
