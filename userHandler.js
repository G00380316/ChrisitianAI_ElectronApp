const dotenv = require("dotenv");
const { connectMongoDB } = require("./mongo.js");
const ChatHistory = require("./llmHistory.js");
const User = require("./user.js");
const AIChatroom = require("./aichatroom.js");
const bcrypt = require("bcryptjs");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");

dotenv.config();

async function deleteHistory() {
  try {
    await connectMongoDB();

    const chatroom = process.env.AI_TEST_CHATROOM;
    await ChatHistory.findOneAndDelete({ aichatroom: chatroom });

    return "AI memory has been wiped!!!";
  } catch (err) {
    console.log("Failed to Forget: ", err);
    throw err;
  }
}

async function createChatroom(input) {
  if (
    !localStorage.getItem("aiChatroomID") &&
    !localStorage.getItem("signin")
  ) {
    localStorage.clear();
    localStorage.setItem("signin", "started");
    return "This is the Sign up and Login Process, First enter your username: ";
  }
  if (!localStorage.getItem("username")) {
    localStorage.setItem("username", input);

    return "Success, now Full Name: ";
  }

  if (!localStorage.getItem("name")) {
    localStorage.setItem("name", input);

    return "Success, now Email: ";
  }

  if (!localStorage.getItem("email")) {
    localStorage.setItem("email", input);

    return "Success, now Password: ";
  }

  if (!localStorage.getItem("password")) {
    localStorage.setItem("password", input);
  }

  const user = await createUser();

  if (!user) return;

  const aichatroom = await AIChatroom.create({
    participants: [localStorage.getItem("userID"), process.env.AI_ID],
  });

  if (!aichatroom) return;

  localStorage.setItem("aichatroomID", aichatroom._id);

  return "Ask King Solomon any questions you may have about God and the Bible, his wisdom comes from above!!!";
}

async function createUser() {
  const username = localStorage.getItem("username");
  const name = localStorage.getItem("name");
  const email = localStorage.getItem("email");
  const password = localStorage.getItem("password");

  const hashPassword = await bcrypt.hash(password, 10);

  await connectMongoDB();

  const user = await User.create({
    username,
    name,
    email,
    password: hashPassword,
  });

  console.log(user);
  localStorage.setItem("userID", user._id);

  return user;
}

module.exports = { deleteHistory, createChatroom };
