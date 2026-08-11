import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { clinicRouter } from "./routes/clinic.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Clinic routes are working",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/clinics", clinicRouter);

// Root route

export default app;
