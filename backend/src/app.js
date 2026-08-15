import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { clinicRouter } from "./routes/clinic.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { doctorRouter } from "./routes/doctor.routes.js";
import { appointmentRouter } from "./routes/appointment.routes.js";
import queueRouter from "./routes/queue.routes.js";

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
app.use("/api/doctors", doctorRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/queue", queueRouter);

// Root route

export default app;
