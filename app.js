const express = require("express");
const expressWs = require("express-ws");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { sendMessageOrAppendToChat } = require("./controllers/openaiController");

require("dotenv").config();

const app = express();
const expressWebSocket = expressWs(app);

app.use(express.json());
app.use(cookieParser());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(5000))
  .catch((err) => console.log(err));

app.use(authRoutes);

app.ws("/ws", (ws, req) => {
  console.log("WebSocket connection established");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      const chatId = await sendMessageOrAppendToChat(data);

      if (chatId) ws.send(JSON.stringify({ chatId }));
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});
