import { Router } from "express";
import * as appointmentController from "../controllers/appointment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

// CREATE APPOINTMENT
router.post(
  "/",
  protect,
  authorize("PATIENT"),
  appointmentController.createAppointment,
);

// GET ALL APPOINTMENTS
router.get(
  "/",
  protect,
  authorize("PATIENT", "DOCTOR", "CLINIC_ADMIN", "SUPER_ADMIN"),
  appointmentController.getAppointments,
);

// GET AVAILABLE SLOTS
router.get(
  "/slots",
  protect,
  authorize("PATIENT", "DOCTOR", "CLINIC_ADMIN", "SUPER_ADMIN"),
  appointmentController.getAvailableSlots,
);

// getQueue
router.get(
  "/queue",
  protect,
  authorize("DOCTOR", "CLINIC_ADMIN", "SUPER_ADMIN"),
  appointmentController.getQueue,
);

// getDoctorQueue
router.get(
  "/queue",
  protect,
  authorize("DOCTOR"),
  appointmentController.getDoctorQueue,
);

// GET ONE APPOINTMENT
router.get(
  "/:id",
  protect,
  authorize("PATIENT", "DOCTOR", "CLINIC_ADMIN", "SUPER_ADMIN"),
  appointmentController.getAppointmentById,
);

// UPDATE APPOINTMENT
router.put(
  "/:id",
  protect,
  authorize("PATIENT", "DOCTOR", "CLINIC_ADMIN", "SUPER_ADMIN"),
  appointmentController.updateAppointment,
);

// DELETE APPOINTMENT
router.delete(
  "/:id",
  protect,
  authorize("CLINIC_ADMIN", "SUPER_ADMIN"),
  appointmentController.deleteAppointment,
);

export const appointmentRouter = router;
