const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatBotSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  messages: [messageSchema],
});

const ChatBot = mongoose.model("chat", chatBotSchema);

module.exports = ChatBot;
