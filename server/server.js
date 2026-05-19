const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");

// Routes
const authRoutes = require("./routes/authRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const holidayRoutes = require("./routes/holidayRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// ================= CORS (BULLETPROOF & DYNAMIC) =================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL
].map(url => url ? url.trim().replace(/\/$/, "") : null).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      const cleanOrigin = origin.trim().replace(/\/$/, "");
      
      // Check if it matches config list, or is a Vercel deployment, or a local host port
      const isAllowed = 
        allowedOrigins.some(allowed => {
          const cleanAllowed = allowed.replace(/\/$/, "");
          return cleanOrigin === cleanAllowed || cleanOrigin.startsWith(cleanAllowed) || cleanAllowed.startsWith(cleanOrigin);
        }) ||
        cleanOrigin.endsWith(".vercel.app") || // Auto-allow all Vercel domains for simplicity
        cleanOrigin.includes("localhost");     // Auto-allow all localhost ports

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, false); // Deny CORS cleanly without throwing 500 errors
      }
    },
    credentials: true,
  })
);

// ================= BODY PARSER =================
app.use(express.json());

// ================= SESSION (PRODUCTION READY) =================
const isProd = process.env.NODE_ENV === "production";
if (isProd) {
  app.set("trust proxy", 1); // Trust first proxy for secure cookies
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd, // True on HTTPS production environment
      sameSite: isProd ? "none" : "lax", // Cross-site support required for Vercel/Render
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
  })
);

// ================= STATIC FILES (FIXED ORDER) =================
app.use("/uploads", express.static("uploads"));

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/holiday", holidayRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));

// ================= DB CONNECTION =================
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/authDB";
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully to cloud database cluster"))
  .catch((err) => console.log("MongoDB connection error:", err));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("NexusHR ERP Server API running successfully!");
});

// ================= START SERVER =================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});