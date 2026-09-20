import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { initGemini } from "../src/utils/gemini.js";
import projectRoutes from "./routes/projects.js";
import { initWebSocket } from "./ws/handler.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
// ─── Express App ─────────────────────────────────────────────
const app = express();
// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
// Request logging
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    console.log(`   ${req.method} ${req.path}`);
  }
  next();
});
// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    version: "1.0.0",
    gemini: !!process.env.GEMINI_API_KEY,
    timestamp: Date.now(),
  });
});
// Project routes
app.use("/api/projects", projectRoutes);
// Serve static frontend build if dist folder exists
const distPath = path.join(__dirname, "../dashboard/dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/ws")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}
// ─── HTTP + WebSocket Server ─────────────────────────────────
const server = createServer(app);
// WebSocket server — shares the same HTTP server
const wss = new WebSocketServer({
  server,
  path: "/ws",
});
initWebSocket(wss);
// ─── Startup ─────────────────────────────────────────────────
async function start() {
  console.log("");
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║                                                          ║");
  console.log("║   🤖  WEBAI — Mission Control Server                    ║");
  console.log("║   Multi-Agent Cloud & Local Deployment                   ║");
  console.log("║                                                          ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log("");
  // 1. Initialize Gemini
  try {
    initGemini(process.env.GEMINI_API_KEY);
    console.log(`   ✅ Gemini initialized (model: ${process.env.GEMINI_MODEL || "gemini-3.6-flash"})`);
  } catch (error) {
    console.warn(`   ⚠️  Gemini not available: ${error.message}`);
    console.warn("      Set GEMINI_API_KEY in .env for full functionality");
  }
  // 2. Start server
  server.listen(PORT, () => {
    console.log(`   ✅ REST API:    http://localhost:${PORT}/api`);
    console.log(`   ✅ WebSocket:   ws://localhost:${PORT}/ws`);
    console.log(`   ✅ Frontend:    ${fs.existsSync(distPath) ? `http://localhost:${PORT}` : FRONTEND_URL}`);
    console.log("");
    console.log("   Waiting for connections...");
    console.log("");
  });
}
start().catch((error) => {
  console.error("   ❌ Server failed to start:", error);
  process.exit(1);
});
