import express from "express";
import cors from "cors";
import connectToMongoDB from "./db/connectToMongoDB.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRouter from "./routers/auth.router.js";
import resumeRouter from "./routers/resume.router.js";
import interviewRouter from "./routers/interview.router.js";
import metricsRouter from "./routers/metrics.router.js";

dotenv.config();

// Initialize Express
// This creates an Express application instance.
const app = express();


// DB Connection
connectToMongoDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        "https://prep-mateai.vercel.app",
        "http://localhost:5173",
    ],
    credentials: true,
}));



// Routers
app.use("/api/auth", authRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/interview", interviewRouter); 
app.use("/api/metrics", metricsRouter);




// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "PrepMate AI Server is running" });
});
// A simple endpoint that monitoring services can hit to confirm the server is running.



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error"
  });
});

//This is a global "catch-all" for any errors that occur in your route handlers. If a database query fails, for instance, this middleware catches the error and sends a standardized JSON response, preventing the server from crashing.



// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});
// Any request that hasn't been matched by a previous route will be caught here, and a 404 Not Found error will be sent.



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 