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

// ================= CORS =================
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

// ================= BODY PARSER =================
app.use(express.json());

// ================= SESSION (FIXED) =================
app.use(
  session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // localhost only
      sameSite: "lax",
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
mongoose
  .connect("mongodb://127.0.0.1:27017/authDB")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("Server running");
});

// ================= START SERVER =================
app.listen(8080, () => {
  console.log("Server running on port 8080");
});