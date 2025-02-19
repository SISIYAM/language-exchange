const onlineUsers = new Map();

const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("addUser", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log("User added to online users:", userId);
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    });

    socket.on("sendMessage", (data) => {
      try {
        const receiverSocketId = onlineUsers.get(data.receiverId);
        const messageData = {
          ...data,
          timestamp: new Date().toISOString(),
        };

        // Send to receiver if they're online
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMessage", messageData);
        }

        // Send confirmation back to sender with the same message data
        socket.emit("messageSent", messageData);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Remove user from online users
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    });
  });
};

module.exports = { initializeSocket };
