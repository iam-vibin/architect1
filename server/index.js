const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"], credentials: true }));

// ─────────────────────── DATA DIRECTORY SETUP ───────────────────────
const DATA_DIR = path.join(__dirname, "data");
const UPLOADS_DIR = path.join(__dirname, "uploads");

const FILES = {
  users:         path.join(DATA_DIR, "users.json"),
  professionals: path.join(DATA_DIR, "professionals.json"),
  chats:         path.join(DATA_DIR, "chats.json"),
  quotes:        path.join(DATA_DIR, "quotes.json"),
  enquiries:     path.join(DATA_DIR, "enquiries.json"),
  favourites:    path.join(DATA_DIR, "favourites.json"),
  reviews:       path.join(DATA_DIR, "reviews.json"),
  notifications: path.join(DATA_DIR, "notifications.json"),
};

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Seed files if missing
Object.entries(FILES).forEach(([key, file]) => {
  if (!fs.existsSync(file)) {
    let seed = "[]";
    if (key === "users") {
      seed = JSON.stringify([
        { id: uuidv4(), username: "user1", password: bcrypt.hashSync("user123", 10), role: "user", name: "Vibin Kumar", email: "user1@archifind.com", createdAt: new Date().toISOString() },
        { id: uuidv4(), username: "pro1",  password: bcrypt.hashSync("pro123", 10),  role: "professional", name: "Arun Architect", email: "pro1@archifind.com", createdAt: new Date().toISOString() },
        { id: uuidv4(), username: "admin", password: bcrypt.hashSync("admin123", 10), role: "admin", name: "Admin", email: "admin@archifind.com", createdAt: new Date().toISOString() },
      ], null, 2);
    }
    fs.writeFileSync(file, seed);
  }
});

// Serve uploaded files
app.use("/uploads", express.static(UPLOADS_DIR));

// ─────────────────────── HELPERS ───────────────────────
function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf-8")); }
  catch (e) { return []; }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ─────────────────────── FILE UPLOAD ───────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ═══════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, role, name, email } = req.body;
    if (!username || !password || !role) return res.status(400).json({ error: "username, password and role are required" });

    const validRoles = ["user", "professional", "admin"];
    if (!validRoles.includes(role)) return res.status(400).json({ error: "Invalid role" });

    const users = readJson(FILES.users);
    if (users.find(u => u.username === username)) return res.status(400).json({ error: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      username,
      password: hashed,
      role,
      name: name || username,
      email: email || "",
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    users.push(newUser);
    writeJson(FILES.users, users);

    // If professional, create an empty professional profile
    if (role === "professional") {
      const pros = readJson(FILES.professionals);
      pros.push({
        id: newUser.id,
        userId: newUser.id,
        name: newUser.name,
        username: newUser.username,
        profession: "Architect",
        specialization: "",
        location: "",
        experience: 0,
        bio: "",
        phoneNumber: "",
        avatar: "",
        portfolio: [],
        rating: 0,
        reviewCount: 0,
        projectsCompleted: 0,
        isVerified: false,
        verificationStatus: "pending",
        profileViews: 0,
        leadsCount: 0,
        isAvailable: true,
        createdAt: new Date().toISOString(),
      });
      writeJson(FILES.professionals, pros);
    }

    res.status(201).json({ success: true, message: "Registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });

    const users = readJson(FILES.users);
    const user = users.find(u => u.username === username);

    if (!user) return res.status(401).json({ error: "Invalid username or password" });

    // Support both hashed and plain-text legacy passwords
    let match = false;
    if (user.password.startsWith("$2")) {
      match = await bcrypt.compare(password, user.password);
    } else {
      match = user.password === password;
      // Upgrade to hashed
      if (match) {
        user.password = await bcrypt.hash(password, 10);
        writeJson(FILES.users, users);
      }
    }

    if (!match) return res.status(401).json({ error: "Invalid username or password" });

    const { password: _, ...safeUser } = user;

    // Increment profile views if professional
    if (user.role === "professional") {
      const pros = readJson(FILES.professionals);
      const idx = pros.findIndex(p => p.userId === user.id || p.id === user.id);
      if (idx !== -1) {
        pros[idx].profileViews = (pros[idx].profileViews || 0) + 1;
        writeJson(FILES.professionals, pros);
      }
    }

    res.json({ ...safeUser, id: user.id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ═══════════════════════════════════════
//  USERS (Admin)
// ═══════════════════════════════════════

app.get("/api/users", (req, res) => {
  const users = readJson(FILES.users).map(({ password, ...u }) => u);
  res.json(users);
});

app.delete("/api/users/:id", (req, res) => {
  let users = readJson(FILES.users);
  users = users.filter(u => u.id !== req.params.id);
  writeJson(FILES.users, users);
  res.json({ success: true });
});

app.patch("/api/users/:id/status", (req, res) => {
  const users = readJson(FILES.users);
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  users[idx].isActive = req.body.isActive;
  writeJson(FILES.users, users);
  res.json({ success: true });
});

// ═══════════════════════════════════════
//  PROFESSIONALS
// ═══════════════════════════════════════

app.get("/api/professionals", (req, res) => {
  let pros = readJson(FILES.professionals);
  const { search, location, profession, minRating, verified } = req.query;

  if (search) {
    const q = (search as string).toLowerCase();
    pros = pros.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.profession?.toLowerCase().includes(q) ||
      p.specialization?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q)
    );
  }
  if (location) {
    pros = pros.filter(p => p.location?.toLowerCase().includes((location as string).toLowerCase()));
  }
  if (profession) {
    pros = pros.filter(p => p.profession?.toLowerCase() === (profession as string).toLowerCase());
  }
  if (minRating) {
    pros = pros.filter(p => (p.rating || 0) >= parseFloat(minRating as string));
  }
  if (verified === "true") {
    pros = pros.filter(p => p.isVerified);
  }

  res.json(pros);
});

app.get("/api/professionals/:id", (req, res) => {
  const pros = readJson(FILES.professionals);
  const pro = pros.find(p => p.id === req.params.id || p.userId === req.params.id);
  if (!pro) return res.status(404).json({ error: "Professional not found" });

  // Increment profile views
  pros.find(p => p.id === pro.id).profileViews = (pro.profileViews || 0) + 1;
  writeJson(FILES.professionals, pros);

  // Attach reviews
  const reviews = readJson(FILES.reviews).filter(r => r.professionalId === pro.id);
  res.json({ ...pro, reviews });
});

// Create / Update professional profile (with portfolio upload)
app.post("/api/professionals", upload.array("images", 10), (req, res) => {
  try {
    const pros = readJson(FILES.professionals);
    const { userId, name, profession, specialization, location, experience, bio, phoneNumber } = req.body;

    const existingIdx = pros.findIndex(p => p.userId === userId || p.id === userId);
    const uploadedImages = (req.files || []).map(f => `/uploads/${f.filename}`);

    if (existingIdx !== -1) {
      const existing = pros[existingIdx];
      pros[existingIdx] = {
        ...existing,
        name: name || existing.name,
        profession: profession || existing.profession,
        specialization: specialization || existing.specialization,
        location: location || existing.location,
        experience: parseInt(experience) || existing.experience,
        bio: bio || existing.bio,
        phoneNumber: phoneNumber || existing.phoneNumber,
        portfolio: [...(existing.portfolio || []), ...uploadedImages],
        updatedAt: new Date().toISOString(),
      };
      writeJson(FILES.professionals, pros);
      return res.json(pros[existingIdx]);
    }

    const newPro = {
      id: userId || uuidv4(),
      userId: userId || uuidv4(),
      name: name || "",
      profession: profession || "Architect",
      specialization: specialization || "",
      location: location || "",
      experience: parseInt(experience) || 0,
      bio: bio || "",
      phoneNumber: phoneNumber || "",
      avatar: "",
      portfolio: uploadedImages,
      rating: 0,
      reviewCount: 0,
      projectsCompleted: 0,
      isVerified: false,
      verificationStatus: "pending",
      profileViews: 0,
      leadsCount: 0,
      isAvailable: true,
      createdAt: new Date().toISOString(),
    };

    pros.push(newPro);
    writeJson(FILES.professionals, pros);
    res.status(201).json(newPro);
  } catch (err) {
    console.error("Professional create error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update professional profile (PUT)
app.put("/api/professionals/:id", upload.array("images", 10), (req, res) => {
  try {
    const pros = readJson(FILES.professionals);
    const idx = pros.findIndex(p => p.id === req.params.id || p.userId === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Professional not found" });

    const uploadedImages = (req.files || []).map(f => `/uploads/${f.filename}`);
    const { name, profession, specialization, location, experience, bio, phoneNumber, isAvailable } = req.body;

    pros[idx] = {
      ...pros[idx],
      ...(name !== undefined && { name }),
      ...(profession !== undefined && { profession }),
      ...(specialization !== undefined && { specialization }),
      ...(location !== undefined && { location }),
      ...(experience !== undefined && { experience: parseInt(experience) }),
      ...(bio !== undefined && { bio }),
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(isAvailable !== undefined && { isAvailable: isAvailable === "true" || isAvailable === true }),
      portfolio: [...(pros[idx].portfolio || []), ...uploadedImages],
      updatedAt: new Date().toISOString(),
    };

    writeJson(FILES.professionals, pros);
    res.json(pros[idx]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Upload avatar
app.post("/api/professionals/:id/avatar", upload.single("avatar"), (req, res) => {
  const pros = readJson(FILES.professionals);
  const idx = pros.findIndex(p => p.id === req.params.id || p.userId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  pros[idx].avatar = `/uploads/${req.file.filename}`;
  writeJson(FILES.professionals, pros);
  res.json({ avatar: pros[idx].avatar });
});

// Remove portfolio image
app.delete("/api/professionals/:id/portfolio/:imageIndex", (req, res) => {
  const pros = readJson(FILES.professionals);
  const idx = pros.findIndex(p => p.id === req.params.id || p.userId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const imgIdx = parseInt(req.params.imageIndex);
  pros[idx].portfolio.splice(imgIdx, 1);
  writeJson(FILES.professionals, pros);
  res.json({ success: true });
});

// Admin: verify or reject professional
app.patch("/api/professionals/:id/verify", (req, res) => {
  const pros = readJson(FILES.professionals);
  const idx = pros.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const { action } = req.body; // "approve" | "reject"
  pros[idx].isVerified = action === "approve";
  pros[idx].verificationStatus = action === "approve" ? "approved" : "rejected";
  writeJson(FILES.professionals, pros);
  res.json(pros[idx]);
});

// ═══════════════════════════════════════
//  QUOTES
// ═══════════════════════════════════════

app.get("/api/quotes", (req, res) => {
  let quotes = readJson(FILES.quotes);
  const { userId, professionalId } = req.query;
  if (userId) quotes = quotes.filter(q => q.userId === userId);
  if (professionalId) quotes = quotes.filter(q => q.professionalId === professionalId);
  res.json(quotes);
});

app.post("/api/quotes", (req, res) => {
  try {
    const { userId, professionalId, projectType, description, budget, timeline, phone, area } = req.body;
    if (!userId || !professionalId) return res.status(400).json({ error: "userId and professionalId required" });

    const quotes = readJson(FILES.quotes);
    const newQuote = {
      id: uuidv4(),
      userId,
      professionalId,
      projectType: projectType || "",
      description: description || "",
      budget: budget || "",
      timeline: timeline || "",
      phone: phone || "",
      area: area || "",
      status: "pending", // pending | accepted | rejected | completed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    quotes.push(newQuote);
    writeJson(FILES.quotes, quotes);

    // Track lead for professional
    const pros = readJson(FILES.professionals);
    const idx = pros.findIndex(p => p.id === professionalId || p.userId === professionalId);
    if (idx !== -1) { pros[idx].leadsCount = (pros[idx].leadsCount || 0) + 1; writeJson(FILES.professionals, pros); }

    // Add notification for professional
    const notifs = readJson(FILES.notifications);
    notifs.push({
      id: uuidv4(),
      userId: professionalId,
      type: "quote",
      message: "You received a new quote request!",
      read: false,
      relatedId: newQuote.id,
      createdAt: new Date().toISOString(),
    });
    writeJson(FILES.notifications, notifs);

    res.status(201).json(newQuote);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.patch("/api/quotes/:id", (req, res) => {
  const quotes = readJson(FILES.quotes);
  const idx = quotes.findIndex(q => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Quote not found" });
  quotes[idx] = { ...quotes[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeJson(FILES.quotes, quotes);

  // Notify the user about status change
  if (req.body.status) {
    const notifs = readJson(FILES.notifications);
    notifs.push({
      id: uuidv4(),
      userId: quotes[idx].userId,
      type: "quote_status",
      message: `Your quote request has been ${req.body.status}.`,
      read: false,
      relatedId: quotes[idx].id,
      createdAt: new Date().toISOString(),
    });
    writeJson(FILES.notifications, notifs);
  }

  res.json(quotes[idx]);
});

app.delete("/api/quotes/:id", (req, res) => {
  let quotes = readJson(FILES.quotes);
  quotes = quotes.filter(q => q.id !== req.params.id);
  writeJson(FILES.quotes, quotes);
  res.json({ success: true });
});

// ═══════════════════════════════════════
//  ENQUIRIES
// ═══════════════════════════════════════

app.get("/api/enquiries", (req, res) => {
  let enquiries = readJson(FILES.enquiries);
  const { userId, professionalId } = req.query;
  if (userId) enquiries = enquiries.filter(e => e.userId === userId);
  if (professionalId) enquiries = enquiries.filter(e => e.professionalId === professionalId);
  res.json(enquiries);
});

app.post("/api/enquiries", (req, res) => {
  const { userId, professionalId, message, projectType } = req.body;
  if (!userId || !professionalId || !message) return res.status(400).json({ error: "Required fields missing" });
  const enquiries = readJson(FILES.enquiries);
  const newEnq = {
    id: uuidv4(),
    userId,
    professionalId,
    message,
    projectType: projectType || "",
    status: "open",
    createdAt: new Date().toISOString(),
  };
  enquiries.push(newEnq);
  writeJson(FILES.enquiries, enquiries);
  res.status(201).json(newEnq);
});

app.patch("/api/enquiries/:id", (req, res) => {
  const enquiries = readJson(FILES.enquiries);
  const idx = enquiries.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  enquiries[idx] = { ...enquiries[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeJson(FILES.enquiries, enquiries);
  res.json(enquiries[idx]);
});

// ═══════════════════════════════════════
//  CHAT
// ═══════════════════════════════════════

// Get messages between two participants
app.get("/api/chat/:participantA/:participantB", (req, res) => {
  const { participantA, participantB } = req.params;
  const chats = readJson(FILES.chats);
  const msgs = chats.filter(m =>
    (m.from === participantA && m.to === participantB) ||
    (m.from === participantB && m.to === participantA)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  res.json(msgs);
});

// Get all chat threads for a user
app.get("/api/chat/threads/:userId", (req, res) => {
  const { userId } = req.params;
  const chats = readJson(FILES.chats);
  const users = readJson(FILES.users);
  const pros = readJson(FILES.professionals);

  // Find all unique conversation partners
  const partners = new Set();
  chats.forEach(m => {
    if (m.from === userId) partners.add(m.to);
    if (m.to === userId) partners.add(m.from);
  });

  const threads = Array.from(partners).map(partnerId => {
    const msgs = chats.filter(m =>
      (m.from === userId && m.to === partnerId) ||
      (m.from === partnerId && m.to === userId)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const lastMsg = msgs[0];
    const unread = msgs.filter(m => m.to === userId && !m.read).length;

    // Find partner info
    const partnerUser = users.find(u => u.id === partnerId);
    const partnerPro = pros.find(p => p.id === partnerId || p.userId === partnerId);
    const partnerName = partnerPro?.name || partnerUser?.name || partnerUser?.username || "Unknown";
    const partnerAvatar = partnerPro?.avatar || "";

    return {
      partnerId,
      partnerName,
      partnerAvatar,
      lastMessage: lastMsg?.message || "",
      lastMessageTime: lastMsg?.timestamp || "",
      unreadCount: unread,
    };
  });

  res.json(threads);
});

// Send a message
app.post("/api/chat/send", (req, res) => {
  const { from, to, message } = req.body;
  if (!from || !to || !message) return res.status(400).json({ error: "from, to, message required" });

  const chats = readJson(FILES.chats);
  const newMsg = {
    id: uuidv4(),
    from,
    to,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  };
  chats.push(newMsg);
  writeJson(FILES.chats, chats);

  // Add notification
  const notifs = readJson(FILES.notifications);
  notifs.push({
    id: uuidv4(),
    userId: to,
    type: "message",
    message: "You have a new message!",
    read: false,
    relatedId: newMsg.id,
    createdAt: new Date().toISOString(),
  });
  writeJson(FILES.notifications, notifs);

  res.status(201).json(newMsg);
});

// Mark messages as read
app.patch("/api/chat/read", (req, res) => {
  const { from, to } = req.body;
  const chats = readJson(FILES.chats);
  chats.forEach(m => {
    if (m.from === from && m.to === to) m.read = true;
  });
  writeJson(FILES.chats, chats);
  res.json({ success: true });
});

// ═══════════════════════════════════════
//  REVIEWS
// ═══════════════════════════════════════

app.get("/api/reviews/:professionalId", (req, res) => {
  const reviews = readJson(FILES.reviews).filter(r => r.professionalId === req.params.professionalId);
  res.json(reviews);
});

app.post("/api/reviews", (req, res) => {
  const { userId, professionalId, rating, comment, userName } = req.body;
  if (!userId || !professionalId || !rating) return res.status(400).json({ error: "Required fields missing" });

  const reviews = readJson(FILES.reviews);
  const newReview = {
    id: uuidv4(),
    userId,
    professionalId,
    rating: parseFloat(rating),
    comment: comment || "",
    userName: userName || "Anonymous",
    createdAt: new Date().toISOString(),
  };
  reviews.push(newReview);
  writeJson(FILES.reviews, reviews);

  // Update professional's average rating
  const pros = readJson(FILES.professionals);
  const idx = pros.findIndex(p => p.id === professionalId || p.userId === professionalId);
  if (idx !== -1) {
    const proReviews = reviews.filter(r => r.professionalId === professionalId);
    const avgRating = proReviews.reduce((acc, r) => acc + r.rating, 0) / proReviews.length;
    pros[idx].rating = Math.round(avgRating * 10) / 10;
    pros[idx].reviewCount = proReviews.length;
    writeJson(FILES.professionals, pros);
  }

  res.status(201).json(newReview);
});

// ═══════════════════════════════════════
//  FAVOURITES
// ═══════════════════════════════════════

app.get("/api/favourites/:userId", (req, res) => {
  const favs = readJson(FILES.favourites).filter(f => f.userId === req.params.userId);
  res.json(favs);
});

app.post("/api/favourites", (req, res) => {
  const { userId, professionalId } = req.body;
  const favs = readJson(FILES.favourites);
  const exists = favs.find(f => f.userId === userId && f.professionalId === professionalId);
  if (exists) return res.status(400).json({ error: "Already in favourites" });
  const newFav = { id: uuidv4(), userId, professionalId, createdAt: new Date().toISOString() };
  favs.push(newFav);
  writeJson(FILES.favourites, favs);
  res.status(201).json(newFav);
});

app.delete("/api/favourites/:userId/:professionalId", (req, res) => {
  let favs = readJson(FILES.favourites);
  favs = favs.filter(f => !(f.userId === req.params.userId && f.professionalId === req.params.professionalId));
  writeJson(FILES.favourites, favs);
  res.json({ success: true });
});

// ═══════════════════════════════════════
//  NOTIFICATIONS
// ═══════════════════════════════════════

app.get("/api/notifications/:userId", (req, res) => {
  const notifs = readJson(FILES.notifications)
    .filter(n => n.userId === req.params.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(notifs);
});

app.patch("/api/notifications/:id/read", (req, res) => {
  const notifs = readJson(FILES.notifications);
  const idx = notifs.findIndex(n => n.id === req.params.id);
  if (idx !== -1) { notifs[idx].read = true; writeJson(FILES.notifications, notifs); }
  res.json({ success: true });
});

app.patch("/api/notifications/read-all/:userId", (req, res) => {
  const notifs = readJson(FILES.notifications);
  notifs.forEach(n => { if (n.userId === req.params.userId) n.read = true; });
  writeJson(FILES.notifications, notifs);
  res.json({ success: true });
});

// ═══════════════════════════════════════
//  ADMIN STATS
// ═══════════════════════════════════════

app.get("/api/admin/stats", (req, res) => {
  const users = readJson(FILES.users);
  const pros = readJson(FILES.professionals);
  const quotes = readJson(FILES.quotes);
  const chats = readJson(FILES.chats);

  res.json({
    totalUsers: users.filter(u => u.role === "user").length,
    totalProfessionals: pros.length,
    pendingVerifications: pros.filter(p => p.verificationStatus === "pending" || !p.isVerified).length,
    activeChats: [...new Set(chats.map(c => `${c.from}-${c.to}`))].length,
    totalQuotes: quotes.length,
    pendingQuotes: quotes.filter(q => q.status === "pending").length,
  });
});

// Professional stats
app.get("/api/professionals/:id/stats", (req, res) => {
  const pros = readJson(FILES.professionals);
  const pro = pros.find(p => p.id === req.params.id || p.userId === req.params.id);
  if (!pro) return res.status(404).json({ error: "Not found" });

  const quotes = readJson(FILES.quotes).filter(q => q.professionalId === pro.id);
  const reviews = readJson(FILES.reviews).filter(r => r.professionalId === pro.id);
  const accepted = quotes.filter(q => q.status === "accepted").length;
  const conversionRate = quotes.length > 0 ? Math.round((accepted / quotes.length) * 100) : 0;

  res.json({
    profileViews: pro.profileViews || 0,
    leadsCount: pro.leadsCount || 0,
    conversionRate,
    totalQuotes: quotes.length,
    acceptedQuotes: accepted,
    rating: pro.rating || 0,
    reviewCount: reviews.length,
    projectsCompleted: pro.projectsCompleted || 0,
  });
});

// ═══════════════════════════════════════
//  START
// ═══════════════════════════════════════

app.listen(PORT, () => {
  console.log(`✅ ArchiFind backend running on http://localhost:${PORT}`);
  console.log(`📁 Data stored in: ${DATA_DIR}`);
});