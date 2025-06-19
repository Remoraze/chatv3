import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { readFile, writeFile } from "fs/promises";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesFile = path.join(__dirname, "messages.json");
const passFile = path.join(__dirname, "pass.json");

app.use(express.static(__dirname));
app.use(express.json());

// Gate check API
app.post("/api/check-pass", async (req, res) => {
  const { code } = req.body;
  try {
    const data = JSON.parse(await readFile(passFile, "utf8"));
    res.json({ success: code === data.code });
  } catch {
    res.status(500).json({ success: false });
  }
});

// Messages API
app.get("/api/messages", async (req, res) => {
  try {
    const data = await readFile(messagesFile, "utf8");
    res.json(JSON.parse(data));
  } catch {
    res.json([]);
  }
});
app.post("/api/messages", async (req, res) => {
  const { username, message } = req.body;
  if (!username || !message) return res.status(400).json({ success: false });
  try {
    const data = await readFile(messagesFile, "utf8");
    let messages = [];
    try { messages = JSON.parse(data); } catch {}
    messages.push({ username, message, timestamp: new Date().toISOString() });
    await writeFile(messagesFile, JSON.stringify(messages, null, 2));
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

// Pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/chat.html", (req, res) => res.sendFile(path.join(__dirname, "chat.html")));

app.listen(PORT, () => {
  console.log(`Chat app running on http://localhost:${PORT}`);
});