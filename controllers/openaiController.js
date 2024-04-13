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
      messages: [{ text: message, senderId: userId }],
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

module.exports = { sendMessageNewBot };
