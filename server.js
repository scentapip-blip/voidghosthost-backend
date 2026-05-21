import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;
const GROQ_KEY = process.env.GROQ_API_KEY;

// ===== MIDDLEWARE =====
app.use(cors({ origin: '*' }));
app.use(express.json());

// ===== CHAT MEMORY =====
let chatHistory = [];
let onlineUsers = {};

// ===== SOCKET.IO — PUBLIC CHAT REALTIME =====
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET','POST'] }
});

io.on('connection', (socket) => {
  console.log('User connect:', socket.id);

  // Kirim history ke user baru
  socket.emit('chat:history', chatHistory);

  // User join
  socket.on('user:join', (username) => {
    onlineUsers[socket.id] = username || 'GHOST';
    io.emit('user:online', Object.keys(onlineUsers).length);
    io.emit('chat:message', {
      id: Date.now(),
      username: 'SYSTEM',
      message: `${onlineUsers[socket.id]} bergabung 👻`,
const USERS = [
  { username: 'admin', password: 'admin123', role: 'OWNER' },
  { username: 'namauser', password: 'passwordnya', role: 'MEMBER' },
];
      time: new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}),
      isSystem: true
    });
  });

  // Terima & broadcast pesan
  socket.on('chat:send', (data) => {
    const msg = {
      id: Date.now(),
      username: onlineUsers[socket.id] || 'GHOST',
      message: data.message,
      time: new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}),
      isSystem: false
    };
    chatHistory.push(msg);
    if (chatHistory.length > 50) chatHistory.shift(); // max 50 pesan
    io.emit('chat:message', msg); // kirim ke semua user
  });

  // User disconnect
  socket.on('disconnect', () => {
    const username = onlineUsers[socket.id];
    delete onlineUsers[socket.id];
    io.emit('user:online', Object.keys(onlineUsers).length);
    if (username) {
      io.emit('chat:message', {
        id: Date.now(),
        username: 'SYSTEM',
        message: `${username} keluar`,
        time: new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}),
        isSystem: true
      });
    }
  });
});

// ===== API: TEST =====
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'VoidGhost Backend Online 👻' });
});

// ===== API: GROQ AI =====
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: 'messages required' });
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages,
        max_tokens: 800,
        temperature: 0.75
      })
    });
    const data = await response.json();
    res.json(data);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== START SERVER =====
httpServer.listen(PORT, () => {
  console.log(`✅ VoidGhost Backend jalan di port ${PORT}`);
}); 