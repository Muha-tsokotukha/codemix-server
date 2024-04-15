const OpenAi = require("openai");
require("dotenv").config();
const Chat = require("../models/Chat");

const config = {
  apiKey: process.env.OPENAI_KEY,
};
const openai = new OpenAi(config);

function generateChatId() {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substr(2, 5);
  return `${timestamp}-${randomString}`;
}

async function sendMessageNewBot(req, res) {
  const { message, userId, userName } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [{ role: "user", content: message }],
    });

    const newChat = new Chat({
      title: message.slice(0, 20),
      id: completion.id,
      participants: [
        { id: userId, name: userName },
        { id: "AI", name: "BOT" },
      ],
      messages: [
        { text: message, senderId: userId },
        { text: completion.choices[0].message.content, senderId: "AI" },
      ],
    });

    await newChat.save();

    res.json({
      message: completion.choices[0].message.content,
      chatId: newChat.id,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getChatList(req, res) {
  try {
    const userId = req.query.userId;

    const chatList = await Chat.aggregate([
      {
        $match: {
          "participants.id": userId,
        },
      },
      {
        $project: {
          title: 1,
          id: 1,
          participants: 1,
          lastMessage: { $arrayElemAt: [{ $slice: ["$messages", -1] }, 0] },
        },
      },
    ]);

    res.json(chatList);
  } catch (error) {
    console.error("Error fetching chat list:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getChatMessages(req, res) {
  try {
    const chatId = req.params.chatId;

    const chat = await Chat.findOne({ id: chatId });

    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const messages = chat.messages;

    res.json(messages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function appendMessageToChat(req, res) {
  const { message, userId } = req.body;
  const { chatId } = req.params;

  try {
    const existingChat = await Chat.findOne({ id: chatId });

    if (!existingChat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [{ role: "user", content: message }],
    });

    existingChat.messages.push({ text: message, senderId: userId });
    existingChat.messages.push({
      text: completion.choices[0].message.content,
      senderId: "AI",
    });

    await existingChat.save();

    res.json({
      message: completion.choices[0].message.content,
      chatId: existingChat.id,
    });
  } catch (error) {
    console.error("Error appending message to chat:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function sendMessageOrAppendToChat(data) {
  try {
    const messageContent = data.message;
    const sender = data.sender;
    const receiver = data.receiver;
    const chatId = data.chatId;

    let existingChat = await Chat.findOne({ id: chatId });

    if (!existingChat) {
      existingChat = new Chat({
        title: receiver.name,
        id: generateChatId(),
        participants: [
          { id: sender.id, name: sender.name },
          { id: receiver.id, name: receiver.name },
        ],
        messages: [],
      });
    }
    existingChat.messages.push({ text: messageContent, senderId: sender.id });

    await existingChat.save();

    return existingChat.id;
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
}

module.exports = {
  sendMessageNewBot,
  getChatList,
  getChatMessages,
  appendMessageToChat,
  sendMessageOrAppendToChat,
};
