const dotenv = require("dotenv");
const path = require("path");
const { connectMongoDB } = require("./mongo.js");
const ChatHistory = require("./llmHistory.js");
const User = require("./user.js");
const AIChatroom = require("./aichatroom.js");
const bcrypt = require("bcryptjs");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");

dotenv.config({path: path.join(__dirname, 'resources', '.env')});

async function deleteHistory() {
  try {
    await connectMongoDB();

    const chatroom = process.env.AI_TEST_CHATROOM;
    await ChatHistory.findOneAndDelete({
      aichatroom: localStorage.getItem("aichatroomID"),
    });

    return "AI memory has been wiped!!!";
  } catch (err) {
    console.log("Failed to Forget: ", err);
    throw err;
  }
}

async function returnUserDetails() {
  try {
    await connectMongoDB();

    const user = await User.findOne({_id: localStorage.getItem("userID")}).select('-_id email name username');

    const userString = JSON.stringify(user, null, 2)

    return userString;
  } catch (error) {
    return error;
  }
}

async function createChatroom(input) {
  if (
    !localStorage.getItem("aichatroomID") &&
    !localStorage.getItem("signup")
  ) {
    localStorage.clear();
    localStorage.setItem("signup", "started");
    return "This is the Sign up/Login Process, First enter your username: ";
  }
  if (!localStorage.getItem("userID")) {
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
  }

  let aichatroom = await AIChatroom.findOne({
    participants: [localStorage.getItem("userID"), process.env.ai_id],
  });

  if (!aichatroom) {
    aichatroom = await AIChatroom.create({
      participants: [localStorage.getItem("userID"), process.env.ai_id],
    });
  }

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

async function loginUser() {
  const username = localStorage.getItem("tmpUsername");
  const password = localStorage.getItem("tmpPassword");

  await connectMongoDB();

  const user = await User.findOne({ username });

  if (!user) return "no User found!";

  const passwordCheck = await bcrypt.compare(password, user.password);

  if (!passwordCheck) {
    return "Wrong Password";
  }

  localStorage.setItem("userID", user._id);

  return user;
}

async function findChatroom(input) {
  if (input === ":login" || localStorage.getItem("login")) {
    if (input === ":login") {
      if (localStorage.getItem("tmpUsername")) {
        localStorage.removeItem("tmpUsername");
      }
      if (localStorage.getItem("tmpPassword")) {
        localStorage.removeItem("tmpPassword");
      }

      localStorage.setItem("login", "started");
      return "Login proccess started now enter Username:";
    }

    if (!localStorage.getItem("tmpUsername")) {
      localStorage.setItem("tmpUsername", input);

      return "Success, now Password: ";
    }

    if (!localStorage.getItem("tmpPassword")) {
      localStorage.setItem("tmpPassword", input);

      return "Success, enter an input in order to attempt logging in with the provided credentials...";
    }

    //Checkin if there is already a User in localStorage or a chatroom and removing them

    if (localStorage.getItem("userID")) {
      localStorage.removeItem("userID");
    }

    if (localStorage.getItem("aichatroomID")) {
      localStorage.removeItem("aichatroomID");
    }

    const user = await loginUser();

    if (!user) {
      localStorage.removeItem("login");
      return "Credentials are wrong please try again by entering :login or type anything else to start Sign up proccess";
    }

    localStorage.removeItem("userID");
    localStorage.setItem("userID", user._id);

    let aichatroom = await AIChatroom.findOne({
      participants: [localStorage.getItem("userID"), process.env.ai_id],
    });

    if (!aichatroom) {
      if (!user) return;
      aichatroom = await AIChatroom.create({
        participants: [localStorage.getItem("userID"), process.env.ai_id],
      });
    }

    if (!aichatroom) return;

    localStorage.setItem("aichatroomID", aichatroom._id);
    localStorage.removeItem("login");

    return "Ask King Solomon any questions you may have about God and the Bible, his wisdom comes from above!!!";
  }
}

module.exports = {
  deleteHistory,
  createChatroom,
  findChatroom,
  returnUserDetails,
};
