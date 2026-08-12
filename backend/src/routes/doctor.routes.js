import { Router } from "express";

import * as doctorController from "../controllers/doctor.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

// GET all doctors
router.get("/", doctorController.getDoctors);

// GET doctor by ID
router.get("/:id", doctorController.getDoctorById);

// CREATE doctor
router.post(
  "/",
  protect,
  authorize("CLINIC_ADMIN"),
  doctorController.createDoctor,
);

// UPDATE doctor
router.put(
  "/:id",
  protect,
  authorize("CLINIC_ADMIN"),
  doctorController.updateDoctor,
);

// DELETE doctor
router.delete(
  "/:id",
  protect,
  authorize("CLINIC_ADMIN"),
  doctorController.deleteDoctor,
);

export const doctorRouter = router;
