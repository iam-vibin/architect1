const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "archifind_production_jwt_secret_2026_secure";

// ---------------- MIDDLEWARE ----------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    credentials: true,
  })
);

// Serve uploads directory
const UPLOADS_DIR = path.join(__dirname, "uploads");
const PORTFOLIO_DIR = path.join(UPLOADS_DIR, "portfolio");
const VERIFICATION_DIR = path.join(UPLOADS_DIR, "verification");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(PORTFOLIO_DIR)) fs.mkdirSync(PORTFOLIO_DIR, { recursive: true });
if (!fs.existsSync(VERIFICATION_DIR)) fs.mkdirSync(VERIFICATION_DIR, { recursive: true });

app.use("/uploads", express.static(UPLOADS_DIR));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ---------------- MULTER UPLOADS CONFIG ----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.originalUrl.includes("verify") || req.originalUrl.includes("verification")) {
      cb(null, VERIFICATION_DIR);
    } else {
      cb(null, PORTFOLIO_DIR);
    }
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// ---------------- FILE STORAGE & PERSISTENCE ----------------
const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const USERS_FILE = path.join(DATA_DIR, "users.json");
const PROFESSIONALS_FILE = path.join(DATA_DIR, "professionals.json");
const QUOTATIONS_FILE = path.join(DATA_DIR, "quotations.json");
const ENQUIRIES_FILE = path.join(DATA_DIR, "enquiries.json");
const CHATS_FILE = path.join(DATA_DIR, "chats.json");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");
const NOTIFICATIONS_FILE = path.join(DATA_DIR, "notifications.json");
const PAYMENTS_FILE = path.join(DATA_DIR, "payments.json");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");
const REPORTS_FILE = path.join(DATA_DIR, "reports.json");

function readJson(file, defaultVal = []) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultVal, null, 2), "utf8");
      return defaultVal;
    }
    const content = fs.readFileSync(file, "utf8");
    return JSON.parse(content || "[]");
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return defaultVal;
  }
}

function writeJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

// ---------------- INITIAL SEEDING ----------------
function seedInitialData() {
  // 1. Users
  let users = readJson(USERS_FILE, []);
  let usersUpdated = false;

  const defaultUsers = [
    {
      id: "b481e30e-b6cb-40e6-9b72-7886a11de2a4",
      username: "user1",
      fullName: "Priya Sharma",
      password: "1234",
      role: "user",
      email: "user1@archifind.local",
      phone: "+91 98765 43210",
      location: "Chennai",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      bio: "Homeowner planning a contemporary residential renovation.",
      savedProfessionals: ["prof-1", "prof-2"],
      status: "active",
      createdAt: new Date().toISOString(),
    },
    {
      id: "fa4c1c9c-6527-444c-bea7-db35ffc8b710",
      username: "pro1",
      fullName: "Arun Kumar",
      password: "1234",
      role: "professional",
      email: "arun.architect@archifind.local",
      phone: "+91 94440 12345",
      location: "Chennai",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      bio: "Award-winning architect with 8+ years of expertise in sustainable design and modern residential homes.",
      status: "active",
      createdAt: new Date().toISOString(),
    },
    {
      id: "88eba6ad-43d6-4050-a00b-21d2044eaedc",
      username: "admin",
      fullName: "ArchiFind Admin",
      password: "admin123",
      role: "admin",
      email: "admin@archifind.local",
      phone: "+91 90000 00000",
      location: "Bangalore",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      bio: "Platform Administrator & Operations Manager.",
      status: "active",
      createdAt: new Date().toISOString(),
    },
  ];

  defaultUsers.forEach((def) => {
    if (!users.find((u) => u.username === def.username)) {
      users.push(def);
      usersUpdated = true;
    }
  });

  if (usersUpdated || users.length === 0) {
    writeJson(USERS_FILE, users);
  }

  // 2. Professionals
  let professionals = readJson(PROFESSIONALS_FILE, []);
  if (!professionals || professionals.length === 0) {
    professionals = [
      {
        id: "prof-1",
        userId: "fa4c1c9c-6527-444c-bea7-db35ffc8b710",
        name: "Arun Kumar",
        username: "pro1",
        profession: "Architect",
        category: "Architect",
        experience: 8,
        location: "Chennai",
        specialization: "Residential & Commercial Architecture",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        isVerified: true,
        verificationStatus: "approved",
        verificationDocs: ["Council of Architecture License #CA/2018/4561", "Degree Certificate - Anna University"],
        rating: 4.8,
        reviewsCount: 18,
        projectsCompleted: 45,
        budgetRange: "₹50,000 - ₹5,00,000",
        hourlyRate: "₹2,500/hr",
        phone: "+91 94440 12345",
        email: "arun.architect@archifind.local",
        isAvailable: true,
        about: "Award-winning registered architect with expertise in eco-friendly sustainable design, passive cooling, and modern luxury architecture.",
        portfolio: [
          {
            id: "p1-1",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
            title: "Modern Minimalist Villa",
            description: "4-bedroom luxury villa with double-height ceiling and courtyard garden in ECR Chennai.",
            category: "Residential",
            cost: "₹85,00,000",
          },
          {
            id: "p1-2",
            image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
            title: "Boutique Corporate Office",
            description: "Sustainable glass-facade corporate workspace with solar integration in OMR Chennai.",
            category: "Commercial",
            cost: "₹1,20,00,000",
          },
          {
            id: "p1-3",
            image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800",
            title: "Contemporary Penthouse Design",
            description: "Open-plan penthouse elevation with panoramic deck and rainwater harvesting.",
            category: "Residential",
            cost: "₹65,00,000",
          },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: "prof-2",
        userId: "uuid-pro-priya",
        name: "Priya Interior Studio",
        username: "priyadesigns",
        profession: "Interior Designer",
        category: "Interior Designer",
        experience: 6,
        location: "Coimbatore",
        specialization: "Modular Kitchens & Luxury Living Spaces",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
        isVerified: true,
        verificationStatus: "approved",
        verificationDocs: ["IIID Registered Designer #ID-9821", "GST Certificate"],
        rating: 4.9,
        reviewsCount: 24,
        projectsCompleted: 62,
        budgetRange: "₹1,00,000 - ₹8,00,000",
        hourlyRate: "₹1,800/hr",
        phone: "+91 98888 22222",
        email: "priya@interiors.local",
        isAvailable: true,
        about: "Transforming residential and boutique hospitality spaces into functional, warm and breathtaking environments.",
        portfolio: [
          {
            id: "p2-1",
            image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800",
            title: "Italian Acrylic Modular Kitchen",
            description: "Quartz countertop with soft-close Blum hardware and integrated breakfast island.",
            category: "Interior",
            cost: "₹4,50,000",
          },
          {
            id: "p2-2",
            image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
            title: "Nordic Warm Living Room",
            description: "Custom fluted oak wall paneling, ambient LED lighting and bespoke upholstery.",
            category: "Interior",
            cost: "₹7,00,000",
          },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: "prof-3",
        userId: "uuid-pro-ravi",
        name: "Ravi Builders & Contractors",
        username: "ravibuilders",
        profession: "Builder",
        category: "Builder",
        experience: 10,
        location: "Madurai",
        specialization: "Turnkey Civil Construction & Structural Engineering",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
        isVerified: true,
        verificationStatus: "approved",
        verificationDocs: ["PWD Class-1 Contractor License", "ISO 9001:2015 Quality Certification"],
        rating: 4.7,
        reviewsCount: 31,
        projectsCompleted: 28,
        budgetRange: "₹20,00,000 - ₹2,50,00,000",
        hourlyRate: "₹3,000/hr",
        phone: "+91 97777 33333",
        email: "ravi@ravibuilders.local",
        isAvailable: true,
        about: "Premier general contractor delivering on-time, earthquake-resistant residential and commercial complexes with transparent cost estimates.",
        portfolio: [
          {
            id: "p3-1",
            image: "https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=800",
            title: "Royal Palm Residential Gated Villa",
            description: "3200 sq.ft RCC framed independent duplex with premium Italian marble flooring.",
            category: "Construction",
            cost: "₹92,00,000",
          },
          {
            id: "p3-2",
            image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
            title: "Commercial Multi-Storey Complex",
            description: "G+4 floor commercial landmark with basement parking and advanced HVAC.",
            category: "Commercial",
            cost: "₹2,10,00,000",
          },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: "prof-4",
        userId: "uuid-pro-meera",
        name: "Meera Designs & Landscape",
        username: "meeradesigns",
        profession: "Interior Designer",
        category: "Interior Designer",
        experience: 5,
        location: "Trichy",
        specialization: "Minimalist Scandinavian & Biophilic Design",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
        isVerified: false,
        verificationStatus: "pending",
        verificationDocs: ["Bachelor of Design Degree", "National Design Registration"],
        rating: 4.6,
        reviewsCount: 11,
        projectsCompleted: 34,
        budgetRange: "₹80,000 - ₹6,00,000",
        hourlyRate: "₹1,500/hr",
        phone: "+91 96666 44444",
        email: "meera@meeradesigns.local",
        isAvailable: true,
        about: "Passionate about creating clutter-free, serene living spaces with natural woods, indoor greens, and soft earthy palettes.",
        portfolio: [
          {
            id: "p4-1",
            image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
            title: "Minimalist Zen Master Suite",
            description: "Low-profile platform bed, cane accents, and concealed storage.",
            category: "Interior",
            cost: "₹3,80,000",
          },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: "prof-5",
        userId: "uuid-pro-karthik",
        name: "Karthik Urban Architecture",
        username: "karthikarch",
        profession: "Architect",
        category: "Architect",
        experience: 12,
        location: "Bangalore",
        specialization: "Smart Homes & High-Rise Apartments",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        isVerified: true,
        verificationStatus: "approved",
        verificationDocs: ["CoA License CA/2012/1234", "LEED AP Accredited"],
        rating: 4.95,
        reviewsCount: 42,
        projectsCompleted: 80,
        budgetRange: "₹75,000 - ₹10,00,000",
        hourlyRate: "₹3,500/hr",
        phone: "+91 95555 55555",
        email: "karthik@urbanarch.local",
        isAvailable: false,
        about: "Top-tier architect specializing in automated smart homes, green architectural certifications, and high-density luxury residential projects.",
        portfolio: [
          {
            id: "p5-1",
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            title: "High-Tech Suburban Mansion",
            description: "Full KNX home automation, infinity pool and cantilevered master terrace.",
            category: "Residential",
            cost: "₹1,80,00,000",
          },
        ],
        createdAt: new Date().toISOString(),
      },
    ];
    writeJson(PROFESSIONALS_FILE, professionals);
  }

  // 3. Categories
  let categories = readJson(CATEGORIES_FILE, []);
  if (!categories || categories.length === 0) {
    categories = [
      { id: "cat-1", name: "Architect", description: "Residential, commercial, and landscape architects", count: 2 },
      { id: "cat-2", name: "Interior Designer", description: "Modular kitchen, living, and false ceiling experts", count: 2 },
      { id: "cat-3", name: "Builder", description: "Civil contractors and turnkey house construction", count: 1 },
      { id: "cat-4", name: "Landscape Architect", description: "Terrace gardens, swimming pools and lawns", count: 0 },
      { id: "cat-5", name: "Structural Engineer", description: "Building structural safety and plan approvals", count: 0 },
    ];
    writeJson(CATEGORIES_FILE, categories);
  }

  // 4. Quotations
  let quotations = readJson(QUOTATIONS_FILE, []);
  if (!quotations || quotations.length === 0) {
    quotations = [
      {
        id: "quote-1",
        quoteNumber: "AF-QT-1001",
        userId: "b481e30e-b6cb-40e6-9b72-7886a11de2a4",
        userName: "Priya Sharma",
        userEmail: "user1@archifind.local",
        userPhone: "+91 98765 43210",
        professionalId: "prof-1",
        professionalName: "Arun Kumar",
        projectType: "Full House Architecture Design",
        description: "Need architectural plan, 3D elevations and structural drawings for a 3-storey villa on 2400 sq.ft plot in OMR Chennai.",
        location: "Chennai",
        clientBudget: "₹1,50,000 - ₹2,00,000",
        timeline: "2 Months",
        status: "quoted",
        quoteAmount: 185000,
        quoteNotes: "Includes preliminary 3D modeling, floor plans, municipal submission drawings, structural design, and 5 site visits.",
        estimatedDays: 45,
        escrowStatus: "unfunded",
        escrowAmount: 0,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "quote-2",
        quoteNumber: "AF-QT-1002",
        userId: "b481e30e-b6cb-40e6-9b72-7886a11de2a4",
        userName: "Priya Sharma",
        userEmail: "user1@archifind.local",
        userPhone: "+91 98765 43210",
        professionalId: "prof-2",
        professionalName: "Priya Interior Studio",
        projectType: "Modular Kitchen & Wardrobes",
        description: "L-shaped modular kitchen with pantry unit and master bedroom sliding wardrobes in Coimbatore.",
        location: "Coimbatore",
        clientBudget: "₹3,50,000",
        timeline: "1 Month",
        status: "accepted",
        quoteAmount: 320000,
        quoteNotes: "Full Marine ply BWR grade, Merino acrylic finish, Hafele soft-close fittings included.",
        estimatedDays: 30,
        escrowStatus: "held_in_escrow",
        escrowAmount: 320000,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ];
    writeJson(QUOTATIONS_FILE, quotations);
  }

  // 5. Reviews
  let reviews = readJson(REVIEWS_FILE, []);
  if (!reviews || reviews.length === 0) {
    reviews = [
      {
        id: "rev-1",
        professionalId: "prof-1",
        userId: "b481e30e-b6cb-40e6-9b72-7886a11de2a4",
        userName: "Priya Sharma",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        rating: 5,
        comment: "Arun delivered beyond our expectations! His modern house plan had superb cross-ventilation and natural lighting. Highly recommended!",
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
      {
        id: "rev-2",
        professionalId: "prof-2",
        userId: "b481e30e-b6cb-40e6-9b72-7886a11de2a4",
        userName: "Karthik R.",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
        rating: 5,
        comment: "Excellent finish on the kitchen cabinets and top quality hardware. Finished the interior project within 25 days.",
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      },
      {
        id: "rev-3",
        professionalId: "prof-3",
        userId: "b481e30e-b6cb-40e6-9b72-7886a11de2a4",
        userName: "Senthil Nathan",
        userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        rating: 5,
        comment: "Ravi Builders is very professional and honest with material costs. Civil construction was completed on schedule.",
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      },
    ];
    writeJson(REVIEWS_FILE, reviews);
  }

  // 6. Chats
  let chats = readJson(CHATS_FILE, []);
  if (!chats || chats.length === 0) {
    chats = [
      {
        id: "msg-1",
        from: "b481e30e-b6cb-40e6-9b72-7886a11de2a4",
        to: "prof-1",
        senderName: "Priya Sharma",
        senderRole: "user",
        message: "Hello Arun, I reviewed your portfolio. We have a 2400 sq.ft plot in OMR and would like to discuss a duplex design.",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isRead: true,
      },
      {
        id: "msg-2",
        from: "prof-1",
        to: "b481e30e-b6cb-40e6-9b72-7886a11de2a4",
        senderName: "Arun Kumar",
        senderRole: "professional",
        message: "Hi Priya! Thank you for reaching out. I'd love to help. Could you share the plot frontage and orientation (North/East facing)?",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
      },
      {
        id: "msg-3",
        from: "b481e30e-b6cb-40e6-9b72-7886a11de2a4",
        to: "prof-1",
        senderName: "Priya Sharma",
        senderRole: "user",
        message: "It is East-facing with 40 feet frontage. I have submitted a quotation request with details as well.",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isRead: false,
      },
    ];
    writeJson(CHATS_FILE, chats);
  }

  // 7. Notifications
  let notifications = readJson(NOTIFICATIONS_FILE, []);
  if (!notifications || notifications.length === 0) {
    notifications = [
      {
        id: "notif-1",
        userId: "b481e30e-b6cb-40e6-9b72-7886a11de2a4",
        title: "Quotation Received",
        message: "Arun Kumar has submitted an estimate for your Villa project.",
        type: "quote",
        link: "/user-dashboard",
        isRead: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "notif-2",
        userId: "fa4c1c9c-6527-444c-bea7-db35ffc8b710",
        title: "New Quote Request",
        message: "You have received a new quotation request from Priya Sharma.",
        type: "quote",
        link: "/professional-dashboard",
        isRead: false,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "notif-3",
        userId: "b481e30e-b6cb-40e6-9b72-7886a11de2a4",
        title: "Escrow Deposit Confirmed",
        message: "₹3,20,000 is safely held in escrow for Priya Interior Studio.",
        type: "payment",
        link: "/user-dashboard",
        isRead: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
    ];
    writeJson(NOTIFICATIONS_FILE, notifications);
  }

  // 8. Escrow Payments
  let payments = readJson(PAYMENTS_FILE, []);
  if (!payments || payments.length === 0) {
    payments = [
      {
        id: "pay-101",
        quoteId: "quote-2",
        quoteNumber: "AF-QT-1002",
        userId: "b481e30e-b6cb-40e6-9b72-7886a11de2a4",
        userName: "Priya Sharma",
        professionalId: "prof-2",
        professionalName: "Priya Interior Studio",
        amount: 320000,
        platformFee: 6400,
        status: "held_in_escrow",
        paymentMethod: "test_card",
        cardLast4: "4242",
        transactionRef: "ESCROW-TX-" + Math.random().toString(36).slice(2, 9).toUpperCase(),
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
    ];
    writeJson(PAYMENTS_FILE, payments);
  }

  // 9. Enquiries
  readJson(ENQUIRIES_FILE, []);

  // 10. Reports
  let reports = readJson(REPORTS_FILE, []);
  if (!reports || reports.length === 0) {
    reports = [
      {
        id: "rep-1",
        reporterId: "b481e30e-b6cb-40e6-9b72-7886a11de2a4",
        reporterName: "Priya Sharma",
        targetId: "prof-4",
        targetName: "Meera Designs & Landscape",
        targetType: "professional",
        reason: "Delayed response to quotation enquiry",
        details: "Requested quote 5 days ago, awaiting confirmation.",
        status: "pending",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ];
    writeJson(REPORTS_FILE, reports);
  }

  console.log("✅ Initial persistent data seeded successfully");
}

seedInitialData();

// ---------------- AUTH MIDDLEWARE & HELPERS ----------------
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"] || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Authentication token missing" });
    }
    const token = authHeader.slice(7);
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, error: "Invalid or expired session token" });
      }
      req.user = decoded;
      next();
    });
  } catch (err) {
    return res.status(401).json({ success: false, error: "Unauthorized access" });
  }
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: `Access forbidden. Required role: ${allowedRoles.join(" or ")}` });
    }
    next();
  };
}

// ---------------- HEALTH CHECK ----------------
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", platform: "ArchiFind API v2.0", timestamp: new Date().toISOString() });
});

// ---------------- AUTH CONTROLLER ----------------

// Register
app.post(["/api/auth/register", "/register"], async (req, res) => {
  try {
    const { name, fullName, username, password, role } = req.body || {};
    const displayName = (fullName || name || username || "").trim();
    const cleanUsername = (username || "").trim();

    if (!cleanUsername || !password) {
      return res.status(400).json({ success: false, error: "Username and password are required" });
    }

    const allowedRoles = ["user", "professional", "admin"];
    const userRole = role && allowedRoles.includes(role) ? role : "user";

    const users = readJson(USERS_FILE, []);
    if (users.find((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return res.status(409).json({ success: false, error: "Username already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const newUser = {
      id: userId,
      username: cleanUsername,
      fullName: displayName || cleanUsername,
      password: hashedPassword,
      role: userRole,
      email: `${cleanUsername}@archifind.local`,
      phone: "",
      location: "",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${cleanUsername}`,
      bio: "",
      savedProfessionals: [],
      status: "active",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeJson(USERS_FILE, users);

    // If professional role, automatically create a placeholder professional entry
    if (userRole === "professional") {
      const professionals = readJson(PROFESSIONALS_FILE, []);
      const newProf = {
        id: `prof-${userId.slice(0, 8)}`,
        userId: userId,
        name: displayName || cleanUsername,
        username: cleanUsername,
        profession: "Architect",
        category: "Architect",
        experience: 0,
        location: "Chennai",
        specialization: "General Architecture & Design",
        avatar: newUser.avatar,
        isVerified: false,
        verificationStatus: "pending",
        verificationDocs: [],
        rating: 5.0,
        reviewsCount: 0,
        projectsCompleted: 0,
        budgetRange: "₹50,000 - ₹5,00,000",
        hourlyRate: "₹1,500/hr",
        phone: "",
        email: newUser.email,
        isAvailable: true,
        about: "New professional on ArchiFind. Specializing in architecture and modern construction.",
        portfolio: [],
        createdAt: new Date().toISOString(),
      };
      professionals.push(newProf);
      writeJson(PROFESSIONALS_FILE, professionals);
    }

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role, fullName: newUser.fullName },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...safeUser } = newUser;
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: safeUser,
      token,
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error during registration" });
  }
});

// Login
app.post(["/api/auth/login", "/login"], async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const cleanUsername = (username || "").trim();

    if (!cleanUsername || !password) {
      return res.status(400).json({ success: false, error: "Username and password are required" });
    }

    const users = readJson(USERS_FILE, []);
    const user = users.find((u) => u.username.toLowerCase() === cleanUsername.toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid username or password" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ success: false, error: "Account has been suspended by platform admin" });
    }

    // Support bcrypt hash and legacy plain text fallback
    let isMatch = false;
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = user.password === password;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, fullName: user.fullName || user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...safeUser } = user;
    return res.json({
      success: true,
      message: "Signed in successfully",
      ...safeUser,
      user: safeUser,
      token,
      role: user.role,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error during login" });
  }
});

// Get current profile
app.get("/api/auth/me", authenticateToken, (req, res) => {
  const users = readJson(USERS_FILE, []);
  const user = users.find((u) => u.id === req.user.id || u.username === req.user.username);
  if (!user) return res.status(404).json({ success: false, error: "User not found" });
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// Update profile
app.put("/api/auth/profile", authenticateToken, (req, res) => {
  try {
    const { fullName, phone, bio, location, avatar } = req.body || {};
    const users = readJson(USERS_FILE, []);
    const userIndex = users.findIndex((u) => u.id === req.user.id || u.username === req.user.username);

    if (userIndex === -1) return res.status(404).json({ success: false, error: "User not found" });

    if (fullName) users[userIndex].fullName = fullName;
    if (phone !== undefined) users[userIndex].phone = phone;
    if (bio !== undefined) users[userIndex].bio = bio;
    if (location !== undefined) users[userIndex].location = location;
    if (avatar) users[userIndex].avatar = avatar;

    writeJson(USERS_FILE, users);

    // If professional, update professional profile as well
    if (users[userIndex].role === "professional") {
      const professionals = readJson(PROFESSIONALS_FILE, []);
      const profIndex = professionals.findIndex(
        (p) => p.userId === users[userIndex].id || p.username === users[userIndex].username
      );
      if (profIndex !== -1) {
        if (fullName) professionals[profIndex].name = fullName;
        if (phone) professionals[profIndex].phone = phone;
        if (bio) professionals[profIndex].about = bio;
        if (location) professionals[profIndex].location = location;
        if (avatar) professionals[profIndex].avatar = avatar;
        writeJson(PROFESSIONALS_FILE, professionals);
      }
    }

    const { password: _, ...safeUser } = users[userIndex];
    return res.json({ success: true, message: "Profile updated successfully", user: safeUser });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to update profile" });
  }
});

// ---------------- PROFESSIONALS CONTROLLER ----------------

// List professionals with search & advanced filters
app.get("/api/professionals", (req, res) => {
  try {
    let list = readJson(PROFESSIONALS_FILE, []);
    const { search, category, location, verified, available, minRating, minExp } = req.query;

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.profession.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.specialization.toLowerCase().includes(q) ||
          (p.about && p.about.toLowerCase().includes(q))
      );
    }

    if (category && category !== "All") {
      list = list.filter((p) => p.profession.toLowerCase() === String(category).toLowerCase());
    }

    if (location && location !== "All") {
      list = list.filter((p) => p.location.toLowerCase().includes(String(location).toLowerCase()));
    }

    if (verified === "true") {
      list = list.filter((p) => p.isVerified);
    }

    if (available === "true") {
      list = list.filter((p) => p.isAvailable);
    }

    if (minRating) {
      list = list.filter((p) => p.rating >= Number(minRating));
    }

    if (minExp) {
      list = list.filter((p) => p.experience >= Number(minExp));
    }

    return res.json({ success: true, count: list.length, professionals: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch professionals" });
  }
});

// Get professional by id
app.get("/api/professionals/:id", (req, res) => {
  try {
    const list = readJson(PROFESSIONALS_FILE, []);
    const prof = list.find((p) => p.id === req.params.id || p.username === req.params.id);
    if (!prof) return res.status(404).json({ success: false, error: "Professional not found" });

    // Attach real reviews
    const reviews = readJson(REVIEWS_FILE, []).filter((r) => r.professionalId === prof.id);
    const avg = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : prof.rating;

    return res.json({
      success: true,
      professional: {
        ...prof,
        rating: Number(avg.toFixed(1)),
        reviewsCount: reviews.length,
        reviews,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to load professional" });
  }
});

// Create / update professional profile (for logged-in professional)
app.post("/api/professionals", upload.array("images", 5), (req, res) => {
  try {
    const list = readJson(PROFESSIONALS_FILE, []);
    const { name, profession, phoneNumber, location, experience, bio, budgetRange, specialization, hourlyRate } =
      req.body || {};

    let prof = list.find((p) => p.name === name || (req.user && p.userId === req.user.id));

    const uploadedImages = (req.files || []).map((f) => `/uploads/portfolio/${f.filename}`);

    if (prof) {
      if (name) prof.name = name;
      if (profession) prof.profession = profession;
      if (phoneNumber) prof.phone = phoneNumber;
      if (location) prof.location = location;
      if (experience !== undefined) prof.experience = Number(experience);
      if (bio) prof.about = bio;
      if (budgetRange) prof.budgetRange = budgetRange;
      if (specialization) prof.specialization = specialization;
      if (hourlyRate) prof.hourlyRate = hourlyRate;

      if (uploadedImages.length > 0) {
        uploadedImages.forEach((url, i) => {
          prof.portfolio.push({
            id: `p-${Date.now()}-${i}`,
            image: url,
            title: `Project Showcase ${prof.portfolio.length + 1}`,
            description: "Uploaded portfolio project",
            category: prof.profession,
            cost: "Custom",
          });
        });
      }
    } else {
      prof = {
        id: `prof-${Date.now()}`,
        userId: (req.user && req.user.id) || uuidv4(),
        name: name || "New Professional",
        username: (req.user && req.user.username) || "pro",
        profession: profession || "Architect",
        category: profession || "Architect",
        experience: Number(experience) || 0,
        location: location || "Chennai",
        specialization: specialization || "Architecture & Construction",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        isVerified: false,
        verificationStatus: "pending",
        verificationDocs: [],
        rating: 5.0,
        reviewsCount: 0,
        projectsCompleted: 0,
        budgetRange: budgetRange || "₹50,000 - ₹5,00,000",
        hourlyRate: hourlyRate || "₹2,000/hr",
        phone: phoneNumber || "",
        email: (req.user && req.user.email) || "",
        isAvailable: true,
        about: bio || "Professional architect on ArchiFind.",
        portfolio: uploadedImages.map((url, i) => ({
          id: `p-${Date.now()}-${i}`,
          image: url,
          title: `Project ${i + 1}`,
          description: "Portfolio project",
          category: profession || "Architect",
          cost: "Custom",
        })),
        createdAt: new Date().toISOString(),
      };
      list.push(prof);
    }

    writeJson(PROFESSIONALS_FILE, list);
    return res.status(201).json({ success: true, message: "Profile saved successfully", professional: prof });
  } catch (err) {
    console.error("Save Professional Error:", err);
    return res.status(500).json({ success: false, error: "Failed to save professional profile" });
  }
});

// Toggle availability
app.put("/api/professionals/:id/availability", authenticateToken, (req, res) => {
  try {
    const list = readJson(PROFESSIONALS_FILE, []);
    const prof = list.find((p) => p.id === req.params.id || p.userId === req.user.id);
    if (!prof) return res.status(404).json({ success: false, error: "Professional not found" });

    prof.isAvailable = typeof req.body.isAvailable === "boolean" ? req.body.isAvailable : !prof.isAvailable;
    writeJson(PROFESSIONALS_FILE, list);

    return res.json({ success: true, message: "Availability updated", isAvailable: prof.isAvailable });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to update availability" });
  }
});

// Add portfolio project
app.post("/api/professionals/:id/portfolio", upload.single("image"), (req, res) => {
  try {
    const list = readJson(PROFESSIONALS_FILE, []);
    const prof = list.find((p) => p.id === req.params.id);
    if (!prof) return res.status(404).json({ success: false, error: "Professional not found" });

    const { title, description, category, cost, imageUrl } = req.body;
    const finalImage = req.file ? `/uploads/portfolio/${req.file.filename}` : imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800";

    const newItem = {
      id: `p-${Date.now()}`,
      title: title || "New Project",
      description: description || "Project description",
      category: category || prof.profession,
      cost: cost || "₹10,00,000",
      image: finalImage,
    };

    prof.portfolio.push(newItem);
    prof.projectsCompleted = (prof.projectsCompleted || 0) + 1;
    writeJson(PROFESSIONALS_FILE, list);

    return res.status(201).json({ success: true, message: "Project added to portfolio", item: newItem, portfolio: prof.portfolio });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to upload project" });
  }
});

// Delete portfolio project
app.delete("/api/professionals/:id/portfolio/:portfolioId", authenticateToken, (req, res) => {
  try {
    const list = readJson(PROFESSIONALS_FILE, []);
    const prof = list.find((p) => p.id === req.params.id);
    if (!prof) return res.status(404).json({ success: false, error: "Professional not found" });

    prof.portfolio = prof.portfolio.filter((p) => p.id !== req.params.portfolioId);
    writeJson(PROFESSIONALS_FILE, list);

    return res.json({ success: true, message: "Project removed", portfolio: prof.portfolio });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to delete project" });
  }
});

// Submit verification request with documents
app.post("/api/professionals/verify-request", authenticateToken, upload.array("documents", 3), (req, res) => {
  try {
    const list = readJson(PROFESSIONALS_FILE, []);
    const prof = list.find((p) => p.userId === req.user.id || p.username === req.user.username);
    if (!prof) return res.status(404).json({ success: false, error: "Professional record not found" });

    const uploadedDocs = (req.files || []).map((f) => `/uploads/verification/${f.filename}`);
    const docNames = req.body.docNames ? (Array.isArray(req.body.docNames) ? req.body.docNames : [req.body.docNames]) : ["License Document", "Registration Certificate"];

    prof.verificationDocs = [...(prof.verificationDocs || []), ...uploadedDocs, ...docNames];
    prof.verificationStatus = "pending";
    writeJson(PROFESSIONALS_FILE, list);

    // Notify admin
    const notifications = readJson(NOTIFICATIONS_FILE, []);
    notifications.push({
      id: `notif-${Date.now()}`,
      userId: "88eba6ad-43d6-4050-a00b-21d2044eaedc", // admin id
      title: "New Verification Request",
      message: `${prof.name} has submitted verification documents for review.`,
      type: "verification",
      link: "/admin-dashboard",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    writeJson(NOTIFICATIONS_FILE, notifications);

    return res.json({ success: true, message: "Verification request submitted for admin review", professional: prof });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to submit verification request" });
  }
});

// ---------------- FAVORITES CONTROLLER ----------------

// Get user's favorites
app.get("/api/user/favorites", authenticateToken, (req, res) => {
  const users = readJson(USERS_FILE, []);
  const user = users.find((u) => u.id === req.user.id);
  const favIds = (user && user.savedProfessionals) || [];

  const professionals = readJson(PROFESSIONALS_FILE, []);
  const favPros = professionals.filter((p) => favIds.includes(p.id));

  res.json({ success: true, favorites: favPros, favoriteIds: favIds });
});

// Toggle favorite
app.post("/api/user/favorites/:professionalId", authenticateToken, (req, res) => {
  const users = readJson(USERS_FILE, []);
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, error: "User not found" });

  user.savedProfessionals = user.savedProfessionals || [];
  const targetId = req.params.professionalId;
  const exists = user.savedProfessionals.includes(targetId);

  if (exists) {
    user.savedProfessionals = user.savedProfessionals.filter((id) => id !== targetId);
  } else {
    user.savedProfessionals.push(targetId);
  }

  writeJson(USERS_FILE, users);
  res.json({
    success: true,
    saved: !exists,
    message: !exists ? "Added to favorites" : "Removed from favorites",
    favoriteIds: user.savedProfessionals,
  });
});

// ---------------- QUOTATIONS & ESTIMATES CONTROLLER ----------------

// Request quote
app.post("/api/quotes/request", (req, res) => {
  try {
    const { userId, userName, userEmail, userPhone, professionalId, projectType, description, location, budget, timeline } =
      req.body;

    if (!professionalId || !projectType || !description) {
      return res.status(400).json({ success: false, error: "Professional, project type, and description are required" });
    }

    const professionals = readJson(PROFESSIONALS_FILE, []);
    const prof = professionals.find((p) => p.id === professionalId);

    const quotations = readJson(QUOTATIONS_FILE, []);
    const newQuote = {
      id: `quote-${Date.now()}`,
      quoteNumber: `AF-QT-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: userId || (req.user && req.user.id) || "guest-user",
      userName: userName || (req.user && req.user.fullName) || "Client",
      userEmail: userEmail || (req.user && req.user.email) || "",
      userPhone: userPhone || "",
      professionalId,
      professionalName: (prof && prof.name) || "Professional",
      projectType,
      description,
      location: location || (prof && prof.location) || "Chennai",
      clientBudget: budget || "Flexible",
      timeline: timeline || "1-2 Months",
      status: "requested",
      quoteAmount: 0,
      quoteNotes: "",
      estimatedDays: 0,
      escrowStatus: "unfunded",
      escrowAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    quotations.unshift(newQuote);
    writeJson(QUOTATIONS_FILE, quotations);

    // Notify professional
    if (prof) {
      const notifications = readJson(NOTIFICATIONS_FILE, []);
      notifications.push({
        id: `notif-${Date.now()}`,
        userId: prof.userId,
        title: "New Quotation Request",
        message: `${newQuote.userName} requested a quotation for ${projectType}`,
        type: "quote",
        link: "/professional-dashboard",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      writeJson(NOTIFICATIONS_FILE, notifications);
    }

    return res.status(201).json({ success: true, message: "Quote request sent successfully", quote: newQuote });
  } catch (err) {
    console.error("Quote Request Error:", err);
    return res.status(500).json({ success: false, error: "Failed to submit quotation request" });
  }
});

// List quotations (filtered by current user or professional)
app.get("/api/quotes", authenticateToken, (req, res) => {
  try {
    const quotations = readJson(QUOTATIONS_FILE, []);
    const currentId = req.user.id;
    const currentUsername = req.user.username;

    let filtered = [];
    if (req.user.role === "admin") {
      filtered = quotations;
    } else if (req.user.role === "professional") {
      // Find professional id
      const profs = readJson(PROFESSIONALS_FILE, []);
      const prof = profs.find((p) => p.userId === currentId || p.username === currentUsername);
      const profId = prof ? prof.id : null;
      filtered = quotations.filter((q) => q.professionalId === profId || q.professionalId === currentId);
    } else {
      filtered = quotations.filter((q) => q.userId === currentId || q.userEmail === req.user.email);
    }

    return res.json({ success: true, count: filtered.length, quotes: filtered });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to load quotations" });
  }
});

// Professional responds with quote / pricing
app.put("/api/quotes/:id/respond", authenticateToken, (req, res) => {
  try {
    const { quoteAmount, quoteNotes, estimatedDays, action } = req.body;
    const quotations = readJson(QUOTATIONS_FILE, []);
    const quote = quotations.find((q) => q.id === req.params.id);

    if (!quote) return res.status(404).json({ success: false, error: "Quotation not found" });

    if (action === "reject") {
      quote.status = "rejected";
      quote.updatedAt = new Date().toISOString();
    } else {
      quote.status = "quoted";
      quote.quoteAmount = Number(quoteAmount) || 0;
      quote.quoteNotes = quoteNotes || "";
      quote.estimatedDays = Number(estimatedDays) || 30;
      quote.updatedAt = new Date().toISOString();
    }

    writeJson(QUOTATIONS_FILE, quotations);

    // Notify user
    const notifications = readJson(NOTIFICATIONS_FILE, []);
    notifications.push({
      id: `notif-${Date.now()}`,
      userId: quote.userId,
      title: action === "reject" ? "Quote Request Declined" : "Quotation Ready!",
      message: `${quote.professionalName} has ${action === "reject" ? "declined" : "sent an estimate of ₹" + quote.quoteAmount.toLocaleString()} for your project.`,
      type: "quote",
      link: "/user-dashboard",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    writeJson(NOTIFICATIONS_FILE, notifications);

    return res.json({ success: true, message: "Response saved successfully", quote });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to respond to quote" });
  }
});

// User accepts quote or updates status
app.put("/api/quotes/:id/status", authenticateToken, (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["accepted", "rejected", "in_progress", "completed"];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, error: "Invalid status" });

    const quotations = readJson(QUOTATIONS_FILE, []);
    const quote = quotations.find((q) => q.id === req.params.id);

    if (!quote) return res.status(404).json({ success: false, error: "Quotation not found" });

    quote.status = status;
    quote.updatedAt = new Date().toISOString();

    writeJson(QUOTATIONS_FILE, quotations);

    return res.json({ success: true, message: `Quotation status updated to ${status}`, quote });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to update quotation status" });
  }
});

// ---------------- ESCROW & TEST PAYMENTS CONTROLLER ----------------

// Deposit quote amount into escrow
app.post("/api/payments/escrow/deposit", authenticateToken, (req, res) => {
  try {
    const { quoteId, cardNumber, cardExpiry, cardCvc, amount } = req.body;
    const quotations = readJson(QUOTATIONS_FILE, []);
    const quote = quotations.find((q) => q.id === quoteId);

    if (!quote) return res.status(404).json({ success: false, error: "Quotation not found" });

    // Validate test payment mode
    const depositAmount = Number(amount) || quote.quoteAmount || 50000;
    const platformFee = Math.round(depositAmount * 0.02); // 2% platform fee

    // Record payment
    const payments = readJson(PAYMENTS_FILE, []);
    const last4 = cardNumber ? String(cardNumber).slice(-4) : "4242";

    const newPayment = {
      id: `pay-${Date.now()}`,
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      userId: req.user.id,
      userName: req.user.fullName || req.user.username,
      professionalId: quote.professionalId,
      professionalName: quote.professionalName,
      amount: depositAmount,
      platformFee,
      status: "held_in_escrow",
      paymentMethod: "test_card",
      cardLast4: last4,
      transactionRef: "ESCROW-TX-" + Math.random().toString(36).slice(2, 9).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    payments.unshift(newPayment);
    writeJson(PAYMENTS_FILE, payments);

    // Update quote
    quote.status = "in_progress";
    quote.escrowStatus = "held_in_escrow";
    quote.escrowAmount = depositAmount;
    quote.updatedAt = new Date().toISOString();
    writeJson(QUOTATIONS_FILE, quotations);

    // Notify professional
    const notifications = readJson(NOTIFICATIONS_FILE, []);
    notifications.push({
      id: `notif-${Date.now()}`,
      userId: quote.professionalId,
      title: "Escrow Payment Funded!",
      message: `₹${depositAmount.toLocaleString()} has been safely deposited in escrow for Project ${quote.quoteNumber}. You can now start work!`,
      type: "payment",
      link: "/professional-dashboard",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    writeJson(NOTIFICATIONS_FILE, notifications);

    return res.status(201).json({
      success: true,
      message: `₹${depositAmount.toLocaleString()} successfully deposited into ArchiFind Escrow`,
      payment: newPayment,
      quote,
    });
  } catch (err) {
    console.error("Escrow Deposit Error:", err);
    return res.status(500).json({ success: false, error: "Failed to process escrow deposit" });
  }
});

// Release escrow payment to professional
app.post("/api/payments/escrow/release", authenticateToken, (req, res) => {
  try {
    const { quoteId } = req.body;
    const quotations = readJson(QUOTATIONS_FILE, []);
    const quote = quotations.find((q) => q.id === quoteId);

    if (!quote) return res.status(404).json({ success: false, error: "Quotation not found" });

    const payments = readJson(PAYMENTS_FILE, []);
    const payment = payments.find((p) => p.quoteId === quote.id && p.status === "held_in_escrow");

    if (payment) {
      payment.status = "released_to_professional";
      payment.releasedAt = new Date().toISOString();
      writeJson(PAYMENTS_FILE, payments);
    }

    quote.escrowStatus = "released";
    quote.status = "completed";
    quote.updatedAt = new Date().toISOString();
    writeJson(QUOTATIONS_FILE, quotations);

    // Notify professional
    const notifications = readJson(NOTIFICATIONS_FILE, []);
    notifications.push({
      id: `notif-${Date.now()}`,
      userId: quote.professionalId,
      title: "Funds Released!",
      message: `Client has approved project completion. ₹${(quote.escrowAmount || 0).toLocaleString()} has been released to your account.`,
      type: "payment",
      link: "/professional-dashboard",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    writeJson(NOTIFICATIONS_FILE, notifications);

    return res.json({ success: true, message: "Escrow funds released to professional successfully", quote, payment });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to release escrow funds" });
  }
});

// List user/professional payment transactions
app.get("/api/payments", authenticateToken, (req, res) => {
  try {
    const payments = readJson(PAYMENTS_FILE, []);
    let list = [];
    if (req.user.role === "admin") {
      list = payments;
    } else if (req.user.role === "professional") {
      const profs = readJson(PROFESSIONALS_FILE, []);
      const prof = profs.find((p) => p.userId === req.user.id);
      const profId = prof ? prof.id : req.user.id;
      list = payments.filter((p) => p.professionalId === profId);
    } else {
      list = payments.filter((p) => p.userId === req.user.id);
    }
    return res.json({ success: true, payments: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to load payments" });
  }
});

// ---------------- REVIEWS CONTROLLER ----------------

// Get reviews for professional
app.get(["/api/reviews/:professionalId", "/reviews/:professionalId"], (req, res) => {
  try {
    const profId = req.params.professionalId;
    const allReviews = readJson(REVIEWS_FILE, []);
    const list = allReviews.filter((r) => r.professionalId === profId);
    const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;

    return res.json({
      success: true,
      average: Number(avg.toFixed(1)),
      count: list.length,
      reviews: list,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to load reviews" });
  }
});

// Submit review
app.post(["/api/reviews", "/reviews"], authenticateToken, (req, res) => {
  try {
    const { professional, professionalId, rating, comment } = req.body;
    const targetProfId = professionalId || professional;

    if (!targetProfId || !rating) {
      return res.status(400).json({ success: false, error: "Professional and rating (1-5) are required" });
    }

    const r = Number(rating);
    if (r < 1 || r > 5) {
      return res.status(400).json({ success: false, error: "Rating must be an integer between 1 and 5" });
    }

    const allReviews = readJson(REVIEWS_FILE, []);
    const already = allReviews.find((rv) => rv.professionalId === targetProfId && rv.userId === req.user.id);

    if (already) {
      return res.status(409).json({ success: false, error: "You have already reviewed this professional" });
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      professionalId: targetProfId,
      userId: req.user.id,
      userName: req.user.fullName || req.user.username,
      userAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${req.user.username}`,
      rating: r,
      comment: comment || "",
      createdAt: new Date().toISOString(),
    };

    allReviews.unshift(newReview);
    writeJson(REVIEWS_FILE, allReviews);

    // Update professional computed rating
    const professionals = readJson(PROFESSIONALS_FILE, []);
    const prof = professionals.find((p) => p.id === targetProfId);
    if (prof) {
      const pReviews = allReviews.filter((rv) => rv.professionalId === targetProfId);
      const avg = pReviews.reduce((sum, rev) => sum + rev.rating, 0) / pReviews.length;
      prof.rating = Number(avg.toFixed(1));
      prof.reviewsCount = pReviews.length;
      writeJson(PROFESSIONALS_FILE, professionals);
    }

    return res.status(201).json({ success: true, message: "Review submitted successfully", review: newReview });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to submit review" });
  }
});

// ---------------- CHAT & MESSAGING CONTROLLER ----------------

// Get user's conversation threads
app.get("/api/chat/threads", authenticateToken, (req, res) => {
  try {
    const currentId = req.user.id;
    const currentUsername = req.user.username;
    const chats = readJson(CHATS_FILE, []);
    const professionals = readJson(PROFESSIONALS_FILE, []);
    const users = readJson(USERS_FILE, []);

    // Also check if current user is professional
    const myProf = professionals.find((p) => p.userId === currentId || p.username === currentUsername);
    const myProfId = myProf ? myProf.id : null;

    // Collect all unique conversation partners
    const partnerIds = new Set();
    chats.forEach((m) => {
      if (m.from === currentId || (myProfId && m.from === myProfId)) {
        partnerIds.add(m.to);
      } else if (m.to === currentId || (myProfId && m.to === myProfId)) {
        partnerIds.add(m.from);
      }
    });

    const threads = Array.from(partnerIds).map((partnerId) => {
      // Find partner details
      const prof = professionals.find((p) => p.id === partnerId || p.userId === partnerId);
      const usr = users.find((u) => u.id === partnerId);

      const name = (prof && prof.name) || (usr && usr.fullName) || (usr && usr.username) || `User ${partnerId.slice(0, 6)}`;
      const avatar = (prof && prof.avatar) || (usr && usr.avatar) || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;

      const threadMessages = chats.filter(
        (m) =>
          ((m.from === currentId || (myProfId && m.from === myProfId)) && m.to === partnerId) ||
          ((m.to === currentId || (myProfId && m.to === myProfId)) && m.from === partnerId)
      );

      threadMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const lastMsg = threadMessages[threadMessages.length - 1];

      const unreadCount = threadMessages.filter(
        (m) => (m.to === currentId || (myProfId && m.to === myProfId)) && !m.isRead
      ).length;

      return {
        id: `thread-${partnerId}`,
        participantId: partnerId,
        participantName: name,
        participantAvatar: avatar,
        participantRole: prof ? "professional" : "user",
        lastMessage: lastMsg ? lastMsg.message : "No messages yet",
        lastMessageTime: lastMsg ? lastMsg.timestamp : new Date().toISOString(),
        unreadCount,
      };
    });

    threads.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
    return res.json({ success: true, threads });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to load chat threads" });
  }
});

// Get conversation messages between two users
app.get("/api/chat/:userId/:professionalId", (req, res) => {
  try {
    const { userId, professionalId } = req.params;
    const chats = readJson(CHATS_FILE, []);

    const thread = chats.filter(
      (m) =>
        (m.from === userId && m.to === professionalId) ||
        (m.from === professionalId && m.to === userId) ||
        (m.from === userId && m.to === userId)
    );

    thread.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return res.json(thread);
  } catch (err) {
    return res.status(500).json({ error: "Failed to load messages" });
  }
});

// Send message
app.post("/api/chat/send", (req, res) => {
  try {
    const { from, to, message } = req.body;
    if (!from || !to || !message || !message.trim()) {
      return res.status(400).json({ error: "Sender, recipient, and message text are required" });
    }

    const chats = readJson(CHATS_FILE, []);
    const users = readJson(USERS_FILE, []);
    const profs = readJson(PROFESSIONALS_FILE, []);

    const senderUser = users.find((u) => u.id === from);
    const senderProf = profs.find((p) => p.id === from || p.userId === from);

    const newMessage = {
      id: uuidv4(),
      from,
      to,
      senderName: (senderProf && senderProf.name) || (senderUser && senderUser.fullName) || "User",
      senderRole: senderProf ? "professional" : "user",
      message: message.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    chats.push(newMessage);
    writeJson(CHATS_FILE, chats);

    // Create notification for receiver
    const notifications = readJson(NOTIFICATIONS_FILE, []);
    notifications.push({
      id: `notif-${Date.now()}`,
      userId: to,
      title: "New Message",
      message: `${newMessage.senderName}: ${newMessage.message.slice(0, 60)}...`,
      type: "message",
      link: `/chat/${from}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    writeJson(NOTIFICATIONS_FILE, notifications);

    return res.status(201).json(newMessage);
  } catch (err) {
    return res.status(500).json({ error: "Failed to send message" });
  }
});

// Mark messages read
app.put("/api/chat/mark-read", authenticateToken, (req, res) => {
  try {
    const { partnerId } = req.body;
    const currentId = req.user.id;
    const chats = readJson(CHATS_FILE, []);

    chats.forEach((m) => {
      if (m.to === currentId && m.from === partnerId) {
        m.isRead = true;
      }
    });

    writeJson(CHATS_FILE, chats);
    return res.json({ success: true, message: "Marked as read" });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to mark as read" });
  }
});

// ---------------- NOTIFICATIONS CONTROLLER ----------------

// Get notifications
app.get("/api/notifications", authenticateToken, (req, res) => {
  try {
    const notifications = readJson(NOTIFICATIONS_FILE, []);
    const myNotifs = notifications.filter((n) => n.userId === req.user.id || n.userId === req.user.username);
    myNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = myNotifs.filter((n) => !n.isRead).length;
    return res.json({ success: true, count: myNotifs.length, unreadCount, notifications: myNotifs });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to load notifications" });
  }
});

// Mark single notification as read
app.put("/api/notifications/:id/read", authenticateToken, (req, res) => {
  try {
    const notifications = readJson(NOTIFICATIONS_FILE, []);
    const n = notifications.find((item) => item.id === req.params.id);
    if (n) {
      n.isRead = true;
      writeJson(NOTIFICATIONS_FILE, notifications);
    }
    return res.json({ success: true, message: "Notification marked read" });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to update notification" });
  }
});

// Mark all as read
app.put("/api/notifications/read-all", authenticateToken, (req, res) => {
  try {
    const notifications = readJson(NOTIFICATIONS_FILE, []);
    notifications.forEach((n) => {
      if (n.userId === req.user.id || n.userId === req.user.username) {
        n.isRead = true;
      }
    });
    writeJson(NOTIFICATIONS_FILE, notifications);
    return res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to update notifications" });
  }
});

// ---------------- ADMIN CONTROLLER ----------------

// Dashboard platform statistics
app.get("/api/admin/stats", authenticateToken, requireRole(["admin"]), (req, res) => {
  try {
    const users = readJson(USERS_FILE, []);
    const professionals = readJson(PROFESSIONALS_FILE, []);
    const quotations = readJson(QUOTATIONS_FILE, []);
    const chats = readJson(CHATS_FILE, []);
    const payments = readJson(PAYMENTS_FILE, []);
    const reports = readJson(REPORTS_FILE, []);

    const totalUsers = users.filter((u) => u.role === "user").length;
    const totalProfessionals = professionals.length;
    const pendingVerifications = professionals.filter((p) => p.verificationStatus === "pending" || !p.isVerified).length;
    const verifiedProfessionals = professionals.filter((p) => p.isVerified).length;
    const activeChats = chats.length;
    const totalQuotes = quotations.length;
    const escrowVolume = payments
      .filter((p) => p.status === "held_in_escrow" || p.status === "released_to_professional")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const activeEscrowAmount = payments
      .filter((p) => p.status === "held_in_escrow")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalProfessionals,
        verifiedProfessionals,
        pendingVerifications,
        activeChats,
        totalQuotes,
        escrowVolume,
        activeEscrowAmount,
        pendingReports: reports.filter((r) => r.status === "pending").length,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to load admin stats" });
  }
});

// List users for admin
app.get("/api/admin/users", authenticateToken, requireRole(["admin"]), (req, res) => {
  try {
    const users = readJson(USERS_FILE, []);
    const safeList = users.map(({ password, ...u }) => u);
    return res.json({ success: true, count: safeList.length, users: safeList });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to load users" });
  }
});

// Toggle user status (suspend/activate)
app.put("/api/admin/users/:id/status", authenticateToken, requireRole(["admin"]), (req, res) => {
  try {
    const { status } = req.body;
    const users = readJson(USERS_FILE, []);
    const user = users.find((u) => u.id === req.params.id);

    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    user.status = status || (user.status === "active" ? "suspended" : "active");
    writeJson(USERS_FILE, users);

    return res.json({ success: true, message: `User status changed to ${user.status}`, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to update user status" });
  }
});

// Delete user
app.delete("/api/admin/users/:id", authenticateToken, requireRole(["admin"]), (req, res) => {
  try {
    let users = readJson(USERS_FILE, []);
    const user = users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    users = users.filter((u) => u.id !== req.params.id);
    writeJson(USERS_FILE, users);

    return res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to delete user" });
  }
});

// List professionals for admin
app.get("/api/admin/professionals", authenticateToken, requireRole(["admin"]), (req, res) => {
  try {
    const professionals = readJson(PROFESSIONALS_FILE, []);
    return res.json({ success: true, count: professionals.length, professionals });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to load professionals" });
  }
});

// Approve or reject professional verification
app.put("/api/admin/professionals/:id/verify", authenticateToken, requireRole(["admin"]), (req, res) => {
  try {
    const { action } = req.body; // 'approved' or 'rejected'
    const professionals = readJson(PROFESSIONALS_FILE, []);
    const prof = professionals.find((p) => p.id === req.params.id);

    if (!prof) return res.status(404).json({ success: false, error: "Professional not found" });

    prof.isVerified = action === "approved";
    prof.verificationStatus = action === "approved" ? "approved" : "rejected";
    writeJson(PROFESSIONALS_FILE, professionals);

    // Notify professional
    const notifications = readJson(NOTIFICATIONS_FILE, []);
    notifications.push({
      id: `notif-${Date.now()}`,
      userId: prof.userId,
      title: action === "approved" ? "Verification Approved!" : "Verification Update",
      message:
        action === "approved"
          ? "Congratulations! Your professional credentials have been verified by ArchiFind administration."
          : "Your verification request could not be approved at this time. Please update your documents.",
      type: "verification",
      link: "/professional-dashboard",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    writeJson(NOTIFICATIONS_FILE, notifications);

    return res.json({
      success: true,
      message: `Professional verification ${action}`,
      professional: prof,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to verify professional" });
  }
});

// Categories management
app.get("/api/admin/categories", (req, res) => {
  const categories = readJson(CATEGORIES_FILE, []);
  res.json({ success: true, categories });
});

app.post("/api/admin/categories", authenticateToken, requireRole(["admin"]), (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, error: "Category name required" });

  const categories = readJson(CATEGORIES_FILE, []);
  const newCat = {
    id: `cat-${Date.now()}`,
    name,
    description: description || "",
    count: 0,
  };
  categories.push(newCat);
  writeJson(CATEGORIES_FILE, categories);

  res.status(201).json({ success: true, message: "Category added", category: newCat });
});

app.delete("/api/admin/categories/:id", authenticateToken, requireRole(["admin"]), (req, res) => {
  let categories = readJson(CATEGORIES_FILE, []);
  categories = categories.filter((c) => c.id !== req.params.id);
  writeJson(CATEGORIES_FILE, categories);
  res.json({ success: true, message: "Category removed" });
});

// Reports management
app.get("/api/admin/reports", authenticateToken, requireRole(["admin"]), (req, res) => {
  const reports = readJson(REPORTS_FILE, []);
  res.json({ success: true, reports });
});

app.put("/api/admin/reports/:id/resolve", authenticateToken, requireRole(["admin"]), (req, res) => {
  const { resolution } = req.body;
  const reports = readJson(REPORTS_FILE, []);
  const rep = reports.find((r) => r.id === req.params.id);
  if (!rep) return res.status(404).json({ success: false, error: "Report not found" });

  rep.status = "resolved";
  rep.resolution = resolution || "Resolved by administrator";
  rep.resolvedAt = new Date().toISOString();
  writeJson(REPORTS_FILE, reports);

  res.json({ success: true, message: "Report resolved", report: rep });
});

// Submit a new report
app.post("/api/reports", authenticateToken, (req, res) => {
  const { targetId, targetName, targetType, reason, details } = req.body;
  if (!targetId || !reason) return res.status(400).json({ success: false, error: "Target and reason are required" });

  const reports = readJson(REPORTS_FILE, []);
  const newReport = {
    id: `rep-${Date.now()}`,
    reporterId: req.user.id,
    reporterName: req.user.fullName || req.user.username,
    targetId,
    targetName: targetName || "Account",
    targetType: targetType || "professional",
    reason,
    details: details || "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  reports.unshift(newReport);
  writeJson(REPORTS_FILE, reports);

  res.status(201).json({ success: true, message: "Report submitted to admin for investigation", report: newReport });
});

// ---------------- GLOBAL ERROR HANDLING ----------------
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.url} not found` });
});

app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🏛️  ARCHIFIND BACKEND RUNNING ON http://localhost:${PORT}`);
  console.log(`   Connected endpoints: Auth, Professionals, Quotes, Escrow, Chats, Reviews, Notifications, Admin`);
  console.log(`======================================================\n`);
});
