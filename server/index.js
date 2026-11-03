const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// ---------------- FILE STORAGE ----------------

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const CHATS_FILE = path.join(DATA_DIR, "chats.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
if (!fs.existsSync(CHATS_FILE)) fs.writeFileSync(CHATS_FILE, "[]");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ---------------- REGISTER ----------------

app.post("/api/auth/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role)
    return res.status(400).json({ error: "All fields required" });

  const users = readJson(USERS_FILE);

  if (users.find((u) => u.username === username))
    return res.status(400).json({ error: "User exists" });

  const hashed = await bcrypt.hash(password, 10);

  const newUser = {
    id: uuidv4(),
    username,
    password: hashed,
    role,
  };

  users.push(newUser);
  writeJson(USERS_FILE, users);

  res.status(201).json({ message: "Registered successfully" });
});

// ---------------- LOGIN ----------------

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  const users = readJson(USERS_FILE);
  const user = users.find((u) => u.username === username);

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  const { password: _, ...safeUser } = user;

  res.json(safeUser);
});

// ---------------- CHAT ----------------

app.get("/api/chat/:userId/:professionalId", (req, res) => {
  const chats = readJson(CHATS_FILE);
  res.json(chats);
});

app.post("/api/chat/send", (req, res) => {
  const { from, to, message } = req.body;

  const chats = readJson(CHATS_FILE);

  const newMessage = {
    id: uuidv4(),
    from,
    to,
    message,
    timestamp: new Date().toISOString(),
  };

  chats.push(newMessage);
  writeJson(CHATS_FILE, chats);

  res.status(201).json(newMessage);
});

// ---------------- START SERVER ----------------

app.listen(PORT, () => {
  console.log(`✅ ArchiFind backend running on http://localhost:${PORT}`);
});