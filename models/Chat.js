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

const chatSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  participants: [
    {
      id: { type: String, required: true },
      name: {
        type: String,
        required: true,
      },
    },
  ],
  messages: [messageSchema],
});

const Chat = mongoose.model("chat", chatSchema);

module.exports = Chat;
