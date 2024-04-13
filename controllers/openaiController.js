const OpenAi = require("openai");
require("dotenv").config();
const ChatBot = require("../models/Chat");

const config = {
  apiKey: process.env.OPENAI_KEY,
};
const openai = new OpenAi(config);

async function sendMessageNewBot(req, res) {
  const { message, userId } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [{ role: "user", content: message }],
    });

    const newChat = new ChatBot({
      title: message.slice(0, 20),
      id: completion.id,
      userId: userId,
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
    const chatList = await ChatBot.aggregate([
      { $match: { userId } },
      {
        $project: {
          title: 1,
          id: 1,
          userId: 1,
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

    const chat = await ChatBot.findOne({ id: chatId });

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
    const existingChat = await ChatBot.findOne({ id: chatId });

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

module.exports = {
  sendMessageNewBot,
  getChatList,
  getChatMessages,
  appendMessageToChat,
};
