const express = require("express");
const app = express();
const cors = require("cors");
const { DBconnection } = require("./database/db.js");
require("dotenv").config();

// DB Connection
DBconnection();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
}));

// Routers
const authRouter = require("./routers/auth.js");
const userRouter = require("./routers/users.js");
// const historyRouter = require("./routers/history.js");
const resumeRouter = require("./routers/resume.js");
const interviewRouter = require("./routers/interview.js");
const metricsRouter = require("./routers/metrics.js");

// API Endpoints
app.use("/api", authRouter); // Handles /api/signup and /api/login
app.use("/api/user", userRouter); // Handles /api/user/me
// app.use("/api/history", historyRouter); // Handles /api/history/resumes and /api/history/interviews
app.use("/api/resume", resumeRouter); // Handles /api/resume/analyze and /api/resume/history
app.use("/api/interview", interviewRouter); // Handles /api/interview/generate and /api/interview/history
app.use("/api/metrics", metricsRouter); // Handles /api/metrics

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "PrepMate AI Server is running" });
});

// Test authentication endpoint
app.get("/api/test-auth", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Auth test endpoint",
    headers: req.headers.authorization ? "Authorization header present" : "No authorization header"
  });
});

app.get("/home", (req, res) => {
  res.send("PrepMate AI Home Page");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error"
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 