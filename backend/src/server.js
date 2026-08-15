import "dotenv/config";
import mongoose from "mongoose";
import http from "http";

import app from "./app.js";
import { initSocket } from "./socket/socket.js";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully");

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    initSocket(server);

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`ClinicFlow server running on port: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
