import { Router } from "express";

import * as appointmentController from "../controllers/appointment.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

// Patient creates appointment
// CREATE
router.post(
  "/",
  protect,
  authorize("PATIENT"),
  appointmentController.createAppointment,
);

// GET ALL
router.get(
  "/",
  protect,
  authorize("PATIENT", "DOCTOR", "CLINIC_ADMIN", "SUPER_ADMIN"),
  appointmentController.getAppointments,
);

// GET ONE
router.get(
  "/:id",
  protect,
  authorize("PATIENT", "DOCTOR", "CLINIC_ADMIN", "SUPER_ADMIN"),
  appointmentController.getAppointmentById,
);

// UPDATE
router.put(
  "/:id",
  protect,
  authorize("PATIENT", "DOCTOR", "CLINIC_ADMIN", "SUPER_ADMIN"),
  appointmentController.updateAppointment,
);

// DELETE
router.delete(
  "/:id",
  protect,
  authorize("CLINIC_ADMIN", "SUPER_ADMIN"),
  appointmentController.deleteAppointment,
);

export const appointmentRouter = router;
